import db from "@/db/drizzle";
import { reservations, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Busca as reservas e faz o "join" com a tabela de produtos para saber o nome do item
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
    return NextResponse.json({ error: "Erro ao carregar reservas" }, { status: 500 });
  }
}