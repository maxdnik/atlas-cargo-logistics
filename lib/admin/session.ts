import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION = "atlas_admin_session";
export const CHALLENGE = "atlas_admin_challenge";
export const ADMIN_EMAIL = () =>
  (process.env.ATLAS_ADMIN_EMAIL || "maxidimnik@gmail.com")
    .trim()
    .toLowerCase();
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
function secret() {
  const value = process.env.ATLAS_SESSION_SECRET;
  if (!value || value.length < 32)
    throw new Error("El acceso privado todavía no está configurado.");
  return new TextEncoder().encode(value);
}
export function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
export function equal(a: string, b: string) {
  return (
    a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))
  );
}
export async function sign(
  purpose: "login" | "session",
  email: string,
  now = Math.floor(Date.now() / 1000),
) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("atlas-admin")
    .setAudience(purpose)
    .setIssuedAt(now)
    .setExpirationTime(now + (purpose === "login" ? 600 : 28800))
    .sign(secret());
}
export async function verify(token: string, purpose: "login" | "session") {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: "atlas-admin",
      audience: purpose,
      algorithms: ["HS256"],
    });
    if (payload.email !== ADMIN_EMAIL()) return null;
    return { email: payload.email as string };
  } catch {
    return null;
  }
}
export async function getAdmin() {
  return verify((await cookies()).get(SESSION)?.value || "", "session");
}
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(request.url).origin;
  if (!origin || origin !== expected)
    throw new Error("Origen de la solicitud inválido.");
}
