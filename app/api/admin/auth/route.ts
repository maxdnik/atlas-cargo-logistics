import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_EMAIL,
  CHALLENGE,
  SESSION,
  checkOrigin,
  cookieOptions,
  digest,
  equal,
  sign,
  verify,
} from "@/lib/admin/session";
import { readBody, apiError, json } from "@/lib/admin/http";
import { resend, unwrap, MarketingError } from "@/lib/marketing/resend";
import { FROM, SITE, escapeHtml } from "@/lib/marketing/schema";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    try {
      checkOrigin(request);
    } catch {
      throw new MarketingError("Solicitud no permitida.", 403);
    }
    const body = await readBody(request);
    const jar = await cookies();
    if (body.action === "logout") {
      jar.delete(SESSION);
      jar.delete(CHALLENGE);
      return json({ ok: true });
    }
    if (body.action === "verify") {
      const token = typeof body.token === "string" ? body.token : "";
      const challenge = jar.get(CHALLENGE)?.value;
      const payload = await verify(token, "login");
      if (!payload || !challenge || !equal(challenge, digest(token)))
        throw new MarketingError(
          "El enlace venció o se abrió en otro navegador. Solicitá un nuevo acceso.",
          401,
        );
      jar.delete(CHALLENGE);
      jar.set(SESSION, await sign("session", payload.email), {
        ...cookieOptions,
        maxAge: 28800,
      });
      return json({ ok: true });
    }
    if (body.action !== "login" || typeof body.email !== "string")
      throw new MarketingError("Ingresá tu email.");
    const email = body.email.trim().toLowerCase();
    const message =
      "Si el email tiene acceso, vas a recibir un enlace. Abrilo en este mismo navegador.";
    if (email !== ADMIN_EMAIL()) return json({ ok: true, message });
    const now = Math.floor(Date.now() / 1000);
    // Same payload per five-minute window + provider idempotency limit email abuse across instances.
    const windowStart = Math.floor(now / 300) * 300;
    const token = await sign("login", email, windowStart);
    const origin =
      process.env.NODE_ENV === "production"
        ? SITE
        : new URL(request.url).origin;
    const url = `${origin}/admin/verify?token=${encodeURIComponent(token)}`;
    const result = await resend().emails.send(
      {
        from: process.env.ATLAS_ADMIN_LOGIN_FROM || FROM,
        to: email,
        subject: "Tu acceso privado a Atlas Cargo",
        html: `<div style="font-family:Arial;color:#102345;padding:30px"><h1>Atlas Cargo</h1><p>Abrí tu panel de administración desde el mismo navegador donde solicitaste el acceso.</p><p><a href="${escapeHtml(url)}">Ingresar al administrador</a></p><p>El enlace vence en unos minutos. Si no lo solicitaste, ignorá este correo.</p></div>`,
        text: `Ingresá al administrador de Atlas Cargo desde el mismo navegador: ${url}\nEl enlace vence en unos minutos.`,
      },
      { idempotencyKey: `atlas-login/${digest(email)}/${windowStart}` },
    );
    unwrap(result);
    jar.set(CHALLENGE, digest(token), { ...cookieOptions, maxAge: 600 });
    return json({ ok: true, message });
  } catch (error) {
    return apiError(error);
  }
}
export async function GET() {
  return NextResponse.json({ error: "Método no permitido." }, { status: 405 });
}
