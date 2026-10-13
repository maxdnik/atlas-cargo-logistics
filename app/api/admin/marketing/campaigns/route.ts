import { z } from "zod";
import { authorize, readBody, apiError, json } from "@/lib/admin/http";
import {
  broadcastPayload,
  resend,
  unwrap,
  segmentId,
} from "@/lib/marketing/resend";
import { campaignSchema } from "@/lib/marketing/schema";
import { digest } from "@/lib/admin/session";
export async function GET(request: Request) {
  try {
    await authorize(request);
    const after = new URL(request.url).searchParams.get("after") || undefined;
    if (after) z.string().uuid().parse(after);
    const result = unwrap(await resend().broadcasts.list({ limit: 50, after }));
    const segment = await segmentId();
    return json({
      data: result.data.filter(
        (c) => (c.segment_id || c.audience_id) === segment,
      ),
      hasMore: result.has_more,
      nextCursor: result.data.at(-1)?.id,
    });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(request: Request) {
  try {
    await authorize(request);
    const body = await readBody(request);
    const content = campaignSchema.parse(body.content);
    const payload = await broadcastPayload(content);
    const result = unwrap(
      await resend().broadcasts.create({ ...payload, send: false }),
    );
    return json({ ...result, revision: digest(payload.html) });
  } catch (e) {
    return apiError(e);
  }
}
