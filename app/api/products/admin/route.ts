import db from "@/db/drizzle";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// POST: Criar novo produto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newItem = await db
      .insert(products)
      .values({
        name: body.name,
        description: body.description,
        price: Number(body.price), // Garante que vire número para o banco
        category: body.category,
        imageUrl: body.imageUrl,
        status: body.status || "available",
      })
      .returning();

    return NextResponse.json(newItem[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 },
    );
  }
}

// PUT: Editar produto existente
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = await db
      .update(products)
      .set({
        name: body.name,
        description: body.description,
        price: Number(body.price),
        category: body.category,
        imageUrl: body.imageUrl,
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(products.id, body.id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

// DELETE: Remover produto
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "ID necessário" }, { status: 400 });

    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
