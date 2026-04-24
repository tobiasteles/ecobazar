import db from "@/db/drizzle";
import { reservations, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Lista as reservas (Usado no Admin)
export async function GET() {
  try {
    const data = await db
      .select({
        id: reservations.id,
        customerName: reservations.customerName,
        customerEmail: reservations.customerEmail,
        customerPhone: reservations.customerPhone,
        reservedAt: reservations.reservedAt,
        product: {
          name: products.name,
        },
      })
      .from(reservations)
      .leftJoin(products, eq(reservations.productId, products.id))
      .orderBy(desc(reservations.reservedAt));

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao carregar reservas" }, { status: 500 });
  }
}

// Cria novas reservas (Usado no Carrinho)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productIds, customerName, customerPhone, customerEmail } = body;

    if (!productIds || productIds.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    // Processa cada produto do carrinho
    for (const id of productIds) {
      // 1. Insere a reserva
      await db.insert(reservations).values({
        productId: id,
        customerName,
        customerEmail,
        customerPhone,
      });

      // 2. Marca o produto como reservado para sumir da vitrine
      await db
        .update(products)
        .set({ status: "reserved" })
        .where(eq(products.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na reserva:", error);
    return NextResponse.json({ error: "Erro ao processar reserva" }, { status: 500 });
  }
}