import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminToken,
  isAdminRequest,
} from "@/lib/admin-session";

export const dynamic = "force-dynamic";

const hash = (value: string) => createHash("sha256").update(value).digest();

// Verifica se já existe sessão (usado ao recarregar a página)
export async function GET(req: Request) {
  return NextResponse.json({ authenticated: isAdminRequest(req) });
}

// Login
export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "Senha do admin não configurada" },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const password = typeof body?.password === "string" ? body.password : "";

  if (!timingSafeEqual(hash(password), hash(expected))) {
    await new Promise((r) => setTimeout(r, 800)); // atrasa tentativas erradas
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, createAdminToken(), adminCookieOptions);
  return res;
}

// Logout
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", { ...adminCookieOptions, maxAge: 0 });
  return res;
}
