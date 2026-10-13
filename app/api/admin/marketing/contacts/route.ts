import { z } from "zod";
import { authorize, readBody, apiError, json } from "@/lib/admin/http";
import {
  resend,
  unwrap,
  segmentId,
  MarketingError,
} from "@/lib/marketing/resend";
import { atlasSegments } from "@/lib/marketing/contact-import";
export const maxDuration = 60;
export async function GET(request: Request) {
  try {
    await authorize(request);
    const after = new URL(request.url).searchParams.get("after") || undefined;
    if (after) z.string().uuid().parse(after);
    const list = z.enum(["crm", "send", "blocked"]).parse(new URL(request.url).searchParams.get("list") || "crm");
    const segments = await atlasSegments();
    const selected = list === "send" ? segments.send : list === "blocked" ? segments.blocked : segments.crm || segments.send;
    const result = selected ? unwrap(
      await resend().contacts.list({
        segmentId: selected,
        limit: 50,
        after,
      }),
    ) : { data: [], has_more: false };
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
    const segments = await atlasSegments();
    const existing = await client.contacts.get({ email: data.email });
    if (existing.data) {
      if (existing.data.unsubscribed)
        throw new MarketingError(
          "Este contacto está dado de baja. Su baja se conserva.",
          409,
        );
      if (segments.blocked) {
        let after: string | undefined;
        do {
          const memberships = unwrap(await client.contacts.segments.list({ contactId: existing.data.id, limit: 100, after }));
          if (memberships.data.some((item) => item.id === segments.blocked)) throw new MarketingError("Este contacto está excluido de las campañas de Atlas. Su exclusión se conserva.", 409);
          after = memberships.has_more ? memberships.data.at(-1)?.id : undefined;
        } while (after);
      }
      if (segments.crm) unwrap(await client.contacts.segments.add({ contactId: existing.data.id, segmentId: segments.crm }));
      return json(
        unwrap(
          await client.contacts.segments.add({
            contactId: existing.data.id,
            segmentId: await segmentId(),
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
          segments: [{ id: segments.send }, ...(segments.crm ? [{ id: segments.crm }] : [])],
        }),
      ),
    );
  } catch (e) {
    return apiError(e);
  }
}
