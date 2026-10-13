import { z } from "zod";
import { authorize, apiError, json } from "@/lib/admin/http";
import { MarketingError } from "@/lib/marketing/resend";
import { parseMailrelayCsv } from "@/lib/marketing/mailrelay-csv";
import { continueImport, startImport } from "@/lib/marketing/contact-import";
export const maxDuration = 300;
const schema = z.object({ action: z.enum(["preview", "start", "continue"]), csv: z.string().max(3000000), receipt: z.string().max(800000).optional() });
export async function POST(request: Request) {
  try {
    await authorize(request);
    if (!request.headers.get("content-type")?.includes("application/json")) throw new MarketingError("Formato inválido.", 415);
    if (Number(request.headers.get("content-length") || 0) > 4000000) throw new MarketingError("El archivo es demasiado grande. El máximo es 3 MB.", 413);
    const raw = await request.text(); if (raw.length > 4000000) throw new MarketingError("El archivo es demasiado grande.", 413);
    const body = schema.parse(JSON.parse(raw));
    if (body.action === "preview") {
      const { summary, rejected, contacts } = parseMailrelayCsv(body.csv);
      return json({ summary, rejected: rejected.slice(0, 50), sample: contacts.slice(0, 8) });
    }
    if (body.action === "start") return json(await startImport(body.csv));
    if (!body.receipt) throw new MarketingError("Falta la referencia de importación.");
    return json(await continueImport(body.csv, body.receipt));
  } catch (error) {
    if (error instanceof Error && !(error instanceof MarketingError) && error.name === "Error") return apiError(new MarketingError(error.message));
    return apiError(error);
  }
}
