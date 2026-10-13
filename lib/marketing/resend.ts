import "server-only";
import {
  Resend,
  type ErrorResponse,
  type GetBroadcastResponseSuccess,
  type Response as ResendResponse,
} from "resend";
import {
  campaignSchema,
  renderCampaign,
  type CampaignContent,
  FROM,
  ATLAS_EMAIL,
} from "./schema";

export class MarketingError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
let queue = Promise.resolve();
let nextSlot = 0;
class AtlasResend extends Resend {
  async fetchRequest<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<ResendResponse<T>> {
    const slot = queue.then(async () => {
      const wait = Math.max(0, nextSlot - Date.now());
      if (wait) await new Promise((r) => setTimeout(r, wait));
      nextSlot = Date.now() + 600;
    });
    queue = slot.catch(() => {});
    await slot;
    const result = await super.fetchRequest<T>(path, options);
    // Only retry reads. A mutation with an unknown result must be reviewed, never repeated here.
    if (
      result.error?.name === "rate_limit_exceeded" &&
      (!options.method || options.method === "GET")
    ) {
      await new Promise((r) => setTimeout(r, 1100));
      return super.fetchRequest<T>(path, options);
    }
    return result;
  }
}
export function resend() {
  if (!process.env.RESEND_API_KEY)
    throw new MarketingError("Falta conectar la cuenta de Resend.", 503);
  return new AtlasResend(process.env.RESEND_API_KEY);
}
export async function segmentId() {
  if (process.env.ATLAS_RESEND_SEGMENT_ID)
    return process.env.ATLAS_RESEND_SEGMENT_ID;
  // Resolve only the uniquely named Atlas segment; never use an account-wide list.
  const client = resend();
  let after: string | undefined;
  let selected: string | undefined;
  do {
    const page = unwrap(await client.segments.list({ limit: 100, after }));
    for (const candidate of page.data.filter((item) => item.name === "Atlas Cargo Logistics")) {
      if (selected)
        throw new MarketingError("Hay más de una lista de Atlas. Configurá su identificador antes de continuar.", 503);
      selected = candidate.id;
    }
    after = page.has_more ? page.data.at(-1)?.id : undefined;
    if (page.has_more && !after)
      throw new MarketingError("No se pudo comprobar la lista de Atlas.", 503);
  } while (after);
  if (!selected)
    throw new MarketingError("Falta configurar la lista de contactos de Atlas.", 503);
  return selected;
}
export function unwrap<T>(result: {
  data: T | null;
  error: ErrorResponse | null;
}): T {
  if (result.error || !result.data) {
    const name = result.error?.name;
    const message =
      name === "rate_limit_exceeded"
        ? "Resend está limitando las solicitudes. Esperá unos segundos y volvé a intentar."
        : name === "restricted_api_key" || name === "invalid_api_key"
          ? "La conexión con Resend necesita una clave con acceso a campañas y contactos."
          : "Resend no pudo completar la operación. Revisá la conexión y el estado de la campaña antes de volver a intentar.";
    console.error("ATLAS_RESEND", name || "empty_response");
    throw new MarketingError(
      message,
      name === "rate_limit_exceeded" ? 429 : 502,
    );
  }
  return result.data;
}
export function encodedCampaign(content: CampaignContent) {
  return `<!--atlas-content:${Buffer.from(JSON.stringify(content)).toString("base64")}-->${renderCampaign(content)}`;
}
export function decodeCampaign(html: string) {
  const match = html.match(/<!--atlas-content:([A-Za-z0-9+/=]+)-->/);
  if (!match) return null;
  try {
    return campaignSchema.parse(
      JSON.parse(Buffer.from(match[1], "base64").toString("utf8")),
    );
  } catch {
    return null;
  }
}
export function assertAtlasCampaign(
  c: Pick<GetBroadcastResponseSuccess, "segment_id" | "audience_id" | "from">,
  segment: string,
) {
  if ((c.segment_id || c.audience_id) !== segment || c.from !== FROM)
    throw new MarketingError("La campaña no pertenece a Atlas.", 404);
}
export async function getCampaign(id: string) {
  if (!/^[a-f0-9-]{36}$/i.test(id))
    throw new MarketingError("Campaña inválida.", 404);
  const campaign = unwrap(await resend().broadcasts.get(id));
  assertAtlasCampaign(campaign, await segmentId());
  return campaign;
}
export async function broadcastPayload(content: CampaignContent) {
  return {
    name: `[Atlas] ${content.name}`,
    subject: content.subject,
    previewText: content.preview,
    from: FROM,
    replyTo: [ATLAS_EMAIL],
    segmentId: await segmentId(),
    html: encodedCampaign(content),
  };
}
export async function senderStatus() {
  const configured = Boolean(process.env.RESEND_API_KEY);
  const segmentConfigured = configured ? Boolean(await segmentId()) : false;
  if (!configured)
    return {
      configured,
      segmentConfigured,
      verified: false,
      domainStatus: "Sin conectar",
      records: [],
    };
  const domains = unwrap(await resend().domains.list({ limit: 100 }));
  const domain = domains.data.find(
    (d) => d.name === "atlas-cargo-logistics.com",
  );
  if (!domain)
    return {
      configured,
      segmentConfigured,
      verified: false,
      domainStatus: "Dominio pendiente",
      records: [],
    };
  const details = unwrap(await resend().domains.get(domain.id));
  return {
    configured,
    segmentConfigured,
    verified: details.status === "verified",
    domainStatus: details.status,
    records: details.records,
  };
}
export async function requireVerifiedSender() {
  const state = await senderStatus();
  if (!state.verified)
    throw new MarketingError(
      "Verificá el dominio de Atlas en Resend antes de enviar. SPF y DKIM deben estar aprobados.",
      409,
    );
}
