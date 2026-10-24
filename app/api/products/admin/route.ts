import db from "@/db/drizzle";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";

const CATEGORIES = [
  "roupas",
  "calcados",
  "brinquedos",
  "livros",
  "acessorios",
  "outros",
] as const;
const STATUSES = ["available", "reserved"] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const unauthorized = () =>
  NextResponse.json({ error: "Não autorizado" }, { status: 401 });
const invalid = (msg = "Dados inválidos") =>
  NextResponse.json({ error: msg }, { status: 400 });

type Body = Record<string, unknown>;

function parseProduct(body: Body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const price = Number(body.price);
  const category = body.category as (typeof CATEGORIES)[number];

  if (!name || name.length > 120) return null;
  if (!Number.isFinite(price) || price < 0) return null;
  if (!CATEGORIES.includes(category)) return null;

  return {
    name,
    description:
      typeof body.description === "string"
        ? body.description.slice(0, 1000)
        : null,
    price,
    category,
    size: typeof body.size === "string" ? body.size.slice(0, 40) : null,
    imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : null,
  };
}

// 1. Criar produto
export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();

  const body = await req.json().catch(() => null);
  const data = body && parseProduct(body);
  if (!data) return invalid();

  try {
    const [created] = await db
      .insert(products)
      .values({ ...data, status: "available" })
      .returning();
    return NextResponse.json(created);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 },
    );
  }
}

// 2. Editar produto
export async function PUT(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();

  const body = await req.json().catch(() => null);
  const data = body && parseProduct(body);
  const id = body?.id;
  const status = body?.status;

  if (!data || typeof id !== "string" || !UUID.test(id)) return invalid();
  if (!STATUSES.includes(status)) return invalid();

  try {
    const [updated] = await db
      .update(products)
      .set({ ...data, status, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

// 3. Remover produto
export async function DELETE(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();

  const id = new URL(req.url).searchParams.get("id");
  if (!id || !UUID.test(id)) return invalid("ID necessário");

  try {
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return NextResponse.json(
      { error: "Erro ao deletar produto" },
      { status: 500 },
    );
  }
}
