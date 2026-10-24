import db from "@/db/drizzle";
import { reservations, products } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lista as reservas (somente admin)
export async function GET(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const data = await db
      .select({
        id: reservations.id,
        customerName: reservations.customerName,
        customerEmail: reservations.customerEmail,
        customerPhone: reservations.customerPhone,
        reservedAt: reservations.reservedAt,
        product: { name: products.name },
      })
      .from(reservations)
      .leftJoin(products, eq(reservations.productId, products.id))
      .orderBy(desc(reservations.reservedAt));

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao carregar reservas" },
      { status: 500 },
    );
  }
}

// Cria novas reservas (usado no carrinho, público)
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const rawIds: unknown[] = Array.isArray(body?.productIds)
    ? body.productIds
    : [];
  const ids = [
    ...new Set(
      rawIds.filter(
        (id): id is string => typeof id === "string" && UUID.test(id),
      ),
    ),
  ];
  const customerName =
    typeof body?.customerName === "string" ? body.customerName.trim() : "";
  const customerEmail =
    typeof body?.customerEmail === "string" ? body.customerEmail.trim() : "";
  const customerPhone =
    typeof body?.customerPhone === "string" ? body.customerPhone.trim() : "";
  const phoneDigits = customerPhone.replace(/\D/g, "");

  if (rawIds.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
  }
  if (ids.length !== rawIds.length || ids.length > 20) {
    return NextResponse.json({ error: "Itens inválidos" }, { status: 400 });
  }
  if (customerName.length < 2 || customerName.length > 120) {
    return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
  }
  if (!EMAIL.test(customerEmail) || customerEmail.length > 160) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }
  if (phoneDigits.length < 8 || phoneDigits.length > 15) {
    return NextResponse.json({ error: "Telefone inválido" }, { status: 400 });
  }

  try {
    // 1) Reserva só o que ainda está disponível (a checagem e a troca são uma operação só)
    const reserved = await db
      .update(products)
      .set({ status: "reserved", updatedAt: new Date() })
      .where(and(inArray(products.id, ids), eq(products.status, "available")))
      .returning({ id: products.id });

    if (reserved.length !== ids.length) {
      // Desfaz o que conseguiu reservar e avisa o cliente
      if (reserved.length > 0) {
        await db
          .update(products)
          .set({ status: "available" })
          .where(
            inArray(
              products.id,
              reserved.map((r) => r.id),
            ),
          );
      }
      return NextResponse.json(
        {
          error:
            "Alguns itens já foram reservados por outra pessoa. Atualize a página.",
        },
        { status: 409 },
      );
    }

    // 2) Registra as reservas
    try {
      await db
        .insert(reservations)
        .values(
          ids.map((productId) => ({
            productId,
            customerName,
            customerEmail,
            customerPhone,
          })),
        );
    } catch (insertError) {
      await db
        .update(products)
        .set({ status: "available" })
        .where(inArray(products.id, ids));
      throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na reserva:", error);
    return NextResponse.json(
      { error: "Erro ao processar reserva" },
      { status: 500 },
    );
  }
}
