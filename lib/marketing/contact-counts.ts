import "server-only";
import { atlasSegments } from "./contact-import";
import { MarketingError, resend, unwrap } from "./resend";
export async function contactTotals() {
  const segments = await atlasSegments();
  const client = resend();
  const metrics = await client.get<{ data: { id: string; all_contacts: number; subscribers: number }[] }>("/segments/metrics?dimensions=segment&metrics=all_contacts,subscribers,unsubscribers");
  let byId: Map<string, { all_contacts: number; subscribers: number }>;
  if (metrics.data?.data) byId = new Map(metrics.data.data.map((row) => [row.id, row]));
  else {
    // Segment metrics is beta. The stable contacts API provides exact counts as a fallback.
    byId = new Map();
    for (const id of new Set([segments.crm || segments.send, segments.send, segments.blocked].filter(Boolean) as string[])) {
      let after: string | undefined; let all = 0, subscribers = 0;
      do {
        const page = unwrap(await client.contacts.list({ segmentId: id, limit: 100, after }));
        all += page.data.length; subscribers += page.data.filter((contact) => !contact.unsubscribed).length;
        after = page.has_more ? page.data.at(-1)?.id : undefined;
        if (page.has_more && !after) throw new MarketingError("No se pudo contar la base completa.", 502);
      } while (after);
      byId.set(id, { all_contacts: all, subscribers });
    }
  }
  return { all: byId.get(segments.crm || segments.send)?.all_contacts || 0, send: byId.get(segments.send)?.subscribers || 0, blocked: segments.blocked ? byId.get(segments.blocked)?.all_contacts || 0 : 0 };
}
