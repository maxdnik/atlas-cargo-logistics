import { z } from "zod";
import { authorize, apiError, json } from "@/lib/admin/http";
import { getCampaign, resend, unwrap } from "@/lib/marketing/resend";
export const maxDuration = 60;
const querySchema = z.object({
  type: z.enum(["sent", "delivered", "opened", "clicked", "bounced", "complained", "unsubscribed", "suppressed", "links"]).default("delivered"),
  after: z.string().min(1).max(200).optional(),
  email: z.string().max(254).optional(),
  bounceType: z.enum(["permanent", "transient", "undetermined"]).optional(),
});
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await authorize(request);
    const { id } = await context.params;
    const query = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    await getCampaign(id);
    const client = resend();
    const result = query.type === "links"
      ? unwrap(await client.broadcasts.clickedLinks(id, { limit: 100, after: query.after }))
      : unwrap(await client.broadcasts.recipients(id, { type: query.type, limit: 100, after: query.after, email: query.email, ...(query.type === "bounced" ? { bounceType: query.bounceType } : {}) }));
    return json({ data: result.data, hasMore: result.has_more, nextCursor: result.data.at(-1)?.id });
  } catch (error) { return apiError(error); }
}
