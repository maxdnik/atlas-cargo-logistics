import "server-only";
import { z } from "zod";
import { getCampaign, MarketingError, resend, unwrap } from "./resend";

export const ATLAS_DOMAIN_ID = "05f77bdf-8633-429d-805b-1938bdc5b561";
export const reportQuery = z.object({
  start: z.iso.date(),
  end: z.iso.date(),
  campaign: z.string().uuid().optional(),
});
export async function report(input: z.infer<typeof reportQuery>) {
  const parsed = reportQuery.parse(input);
  const start = new Date(`${parsed.start}T00:00:00-03:00`);
  const end = new Date(`${parsed.end}T23:59:59.999-03:00`);
  if (end < start || end.getTime() - start.getTime() > 366 * 86400000)
    throw new MarketingError("Elegí un período de hasta un año, con inicio anterior al final.");
  const campaign = parsed.campaign ? await getCampaign(parsed.campaign) : null;
  const client = resend();
  const options = {
    startDate: start.toISOString(), endDate: end.toISOString(),
    domainId: [ATLAS_DOMAIN_ID],
    ...(campaign ? { broadcastId: [campaign.id] } : {}),
    timezone: "America/Argentina/Buenos_Aires",
    granularity: "daily" as const,
  };
  const [timeline, comparison, domain] = await Promise.all([
    client.emails.metrics({ ...options, dimensions: ["period"] }).then(unwrap),
    client.emails.metrics({ ...options, dimensions: ["broadcast"] }).then(unwrap),
    client.domains.get(ATLAS_DOMAIN_ID).then(unwrap),
  ]);
  if (domain.name !== "atlas-cargo-logistics.com") throw new MarketingError("Dominio de informes incorrecto.", 503);
  return {
    ...timeline,
    campaigns: (comparison.data || []).filter((row) => row.broadcast_id),
    campaign: campaign ? { id: campaign.id, name: campaign.name, subject: campaign.subject, status: campaign.status, sent_at: campaign.sent_at } : null,
    tracking: { opens: domain.open_tracking, clicks: domain.click_tracking },
    fetchedAt: new Date().toISOString(),
    requestedStart: parsed.start, requestedEnd: parsed.end,
  };
}
