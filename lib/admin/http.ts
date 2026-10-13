import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAdmin, checkOrigin } from "./session";
import { MarketingError } from "../marketing/resend";

export async function authorize(request: Request) {
  if (!(await getAdmin()))
    throw new MarketingError("Iniciá sesión para continuar.", 401);
  if (!["GET", "HEAD"].includes(request.method)) {
    try {
      checkOrigin(request);
    } catch {
      throw new MarketingError("Solicitud no permitida.", 403);
    }
  }
}
export async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new MarketingError("Formato inválido.", 415);
  if (Number(request.headers.get("content-length") || 0) > 50000)
    throw new MarketingError("El contenido es demasiado largo.", 413);
  const raw = await request.text();
  if (raw.length > 50000)
    throw new MarketingError("El contenido es demasiado largo.", 413);
  try {
    return JSON.parse(raw);
  } catch {
    throw new MarketingError("Formato inválido.");
  }
}
export function apiError(error: unknown) {
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues[0]?.message || "Revisá los datos ingresados." },
      { status: 400 },
    );
  if (error instanceof MarketingError)
    return NextResponse.json(
      { error: error.message, ...(error.sendState ? { sendState: error.sendState } : {}) },
      { status: error.status },
    );
  console.error("ATLAS_ADMIN", error instanceof Error ? error.name : "unknown");
  return NextResponse.json(
    {
      error:
        "No pudimos completar la operación. Revisá el estado antes de volver a intentar.",
    },
    { status: 500 },
  );
}
export function json(data: unknown) {
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
