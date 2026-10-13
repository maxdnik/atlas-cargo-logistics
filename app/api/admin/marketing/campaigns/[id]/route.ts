import { z } from "zod";
import { authorize, readBody, apiError, json } from "@/lib/admin/http";
import {
  broadcastPayload,
  decodeCampaign,
  getCampaign,
  resend,
  unwrap,
  requireVerifiedSender,
  MarketingError,
  segmentId,
} from "@/lib/marketing/resend";
import {
  campaignSchema,
  renderCampaign,
  FROM,
  ATLAS_EMAIL,
} from "@/lib/marketing/schema";
import { ADMIN_EMAIL, digest } from "@/lib/admin/session";
export const maxDuration = 60;
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  try {
    await authorize(request);
    const c = await getCampaign((await context.params).id);
    return json({
      id: c.id,
      name: c.name,
      subject: c.subject,
      status: c.status,
      created_at: c.created_at,
      sent_at: c.sent_at,
      scheduled_at: c.scheduled_at,
      revision: digest(c.html || ""),
      content: decodeCampaign(c.html || ""),
    });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(request: Request, context: Context) {
  let isSending = false;
  let sendRequestStarted = false;
  try {
    await authorize(request);
    const body = await readBody(request);
    isSending = body.action === "send";
    const id = (await context.params).id;
    const campaign = await getCampaign(id);
    if (body.action === "save") {
      if (campaign.status !== "draft")
        throw new MarketingError("Solo se pueden editar los borradores.", 409);
      const content = campaignSchema.parse(body.content);
      const payload = await broadcastPayload(content);
      return json({
        ...unwrap(await resend().broadcasts.update(id, payload)),
        revision: digest(payload.html),
      });
    }
    if (body.action === "test") {
      await requireVerifiedSender();
      const content = decodeCampaign(campaign.html || "");
      if (!content)
        throw new MarketingError("Este borrador no tiene el formato de Atlas.");
      const requestId = z.string().uuid().parse(body.requestId);
      // Test recipient cannot be changed by the client or used as an open relay.
      return json(
        unwrap(
          await resend().emails.send(
            {
              from: FROM,
              to: ADMIN_EMAIL(),
              replyTo: ATLAS_EMAIL,
              subject: `[PRUEBA] ${content.subject}`,
              html: renderCampaign(content, true),
            },
            { idempotencyKey: `atlas-test/${id}/${requestId}` },
          ),
        ),
      );
    }
    if (body.action === "send") {
      if (campaign.status !== "draft")
        throw new MarketingError(
          "La campaña ya fue enviada o programada. Revisá su estado.",
          409,
        );
      if (body.confirm !== campaign.subject)
        throw new MarketingError(
          "El asunto cambió. Abrí nuevamente la campaña antes de enviar.",
          409,
        );
      if (body.revision !== digest(campaign.html || ""))
        throw new MarketingError(
          "La campaña cambió. Abrila nuevamente y revisá el contenido antes de enviar.",
          409,
        );
      const sender = await requireVerifiedSender();
      if (sender.contactCapacity?.exceeded) {
        const { used, limit } = sender.contactCapacity;
        throw new MarketingError(
          `El plan de Resend permite ${limit.toLocaleString("es-AR")} contactos y la cuenta tiene ${used.toLocaleString("es-AR")}. Ampliá el plan de contactos en Resend para enviar esta campaña.`,
          409,
          "not_sent",
        );
      }
      const content = decodeCampaign(campaign.html || "");
      if (!content)
        throw new MarketingError("No se puede enviar este formato de campaña.");
      const contacts = unwrap(
        await resend().contacts.list({ segmentId: await segmentId(), limit: 1 }),
      );
      if (!contacts.data.length)
        throw new MarketingError(
          "La lista de Atlas está vacía. Agregá contactos antes de enviar.",
          409,
        );
      // Send this existing broadcast exactly once; never clone it or retry a mutation automatically.
      sendRequestStarted = true;
      const result = await resend().broadcasts.send(id);
      if (result.error?.statusCode && result.error.statusCode >= 400 && result.error.statusCode < 500 && ![408, 409].includes(result.error.statusCode))
        sendRequestStarted = false;
      return json(unwrap(result));
    }
    throw new MarketingError("Acción inválida.");
  } catch (e) {
    if (isSending && !sendRequestStarted && e instanceof MarketingError) e.sendState = "not_sent";
    return apiError(e);
  }
}
