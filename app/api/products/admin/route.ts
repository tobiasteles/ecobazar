import db from "@/db/drizzle";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// 1. Criar Produto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newItem = await db.insert(products).values({
      name: body.name,
      description: body.description,
      price: Number(body.price),
      category: body.category,
      size: body.size,
      imageUrl: body.imageUrl,
      status: "available",
    }).returning();
    return NextResponse.json(newItem[0]);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}

// 2. Editar Produto
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = await db.update(products).set({
      name: body.name,
      description: body.description,
      price: Number(body.price),
      category: body.category,
      size: body.size,
      imageUrl: body.imageUrl,
      status: body.status,
      updatedAt: new Date(),
    }).where(eq(products.id, body.id)).returning();
    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

// 3. ADICIONE ISSO AQUI: Remover Produto
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID necessário" }, { status: 400 });
    }

    // Executa a deleção no banco
    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return NextResponse.json({ error: "Erro ao deletar produto" }, { status: 500 });
  }
}