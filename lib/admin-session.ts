import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "eco_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 horas

const secret = () => {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET ausente ou curto (mínimo 32 caracteres)",
    );
  }
  return s;
};

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

export function createAdminToken(): string {
  const payload = String(Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS);
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return false;
  }
  return Number(payload) > Math.floor(Date.now() / 1000);
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export function isAdminRequest(req: Request): boolean {
  try {
    return verifyAdminToken(
      readCookie(req.headers.get("cookie"), ADMIN_COOKIE),
    );
  } catch {
    return false;
  }
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
