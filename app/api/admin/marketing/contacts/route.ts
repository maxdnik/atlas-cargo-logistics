import { z } from "zod";
import { authorize, readBody, apiError, json } from "@/lib/admin/http";
import {
  resend,
  unwrap,
  segmentId,
  MarketingError,
} from "@/lib/marketing/resend";
export const maxDuration = 60;
export async function GET(request: Request) {
  try {
    await authorize(request);
    const after = new URL(request.url).searchParams.get("after") || undefined;
    if (after) z.string().uuid().parse(after);
    const result = unwrap(
      await resend().contacts.list({
        segmentId: segmentId(),
        limit: 50,
        after,
      }),
    );
    return json({
      data: result.data,
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
    const data = z
      .object({
        email: z
          .string()
          .email()
          .max(254)
          .transform((v) => v.toLowerCase()),
        firstName: z.string().trim().max(80),
        lastName: z.string().trim().max(80),
        consent: z.literal(true),
      })
      .parse(body);
    const client = resend();
    const existing = await client.contacts.get({ email: data.email });
    if (existing.data) {
      if (existing.data.unsubscribed)
        throw new MarketingError(
          "Este contacto está dado de baja. Su baja se conserva.",
          409,
        );
      return json(
        unwrap(
          await client.contacts.segments.add({
            contactId: existing.data.id,
            segmentId: segmentId(),
          }),
        ),
      );
    }
    if (existing.error && existing.error.name !== "not_found") unwrap(existing);
    return json(
      unwrap(
        await client.contacts.create({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          segments: [{ id: segmentId() }],
        }),
      ),
    );
  } catch (e) {
    return apiError(e);
  }
}
