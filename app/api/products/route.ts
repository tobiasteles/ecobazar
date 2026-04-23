// app/api/products/route.ts
import db from "@/db/drizzle";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
    return NextResponse.json(allProducts);
  } catch (error) {
    console.error("Erro na API de produtos:", error);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}