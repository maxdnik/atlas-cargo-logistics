import assert from "node:assert/strict";
import { mock } from "node:test";

const jar = new Map<string, string>();
mock.module("next/headers", {
  namedExports: {
    cookies: async () => ({
      get: (key: string) =>
        jar.has(key) ? { value: jar.get(key) } : undefined,
      set: (key: string, value: string) => jar.set(key, value),
      delete: (key: string) => jar.delete(key),
    }),
  },
});
mock.module("next/navigation", {
  namedExports: {
    redirect: (url: string) => {
      throw new Error(`redirect:${url}`);
    },
  },
});
process.env.ATLAS_SESSION_SECRET = "local-test-secret-".repeat(4);
process.env.ATLAS_ADMIN_EMAIL = "maxidimnik@gmail.com";
process.env.RESEND_API_KEY = "re_test_fixture_not_a_real_key";
process.env.ATLAS_RESEND_SEGMENT_ID = "11111111-1111-4111-8111-111111111111";
const auth = await import("../lib/admin/session");
const template = await import("../lib/marketing/schema");
const provider = await import("../lib/marketing/resend");
const campaignRoute = await import(
  "../app/api/admin/marketing/campaigns/[id]/route"
);
const campaignsRoute = await import(
  "../app/api/admin/marketing/campaigns/route"
);
const contactsRoute = await import("../app/api/admin/marketing/contacts/route");
const loginRoute = await import("../app/api/admin/auth/route");
const id = "22222222-2222-4222-8222-222222222222";
const calls: {
  path: string;
  method: string;
  body: Record<string, unknown>;
  headers: Headers;
}[] = [];
let domainVerified = true,
  unsubscribed = false;
const broadcast = {
  id,
  name: "[Atlas] Presentación",
  from: template.FROM,
  subject: template.defaultCampaign.subject,
  status: "draft",
  segment_id: process.env.ATLAS_RESEND_SEGMENT_ID,
  html: provider.encodedCampaign(template.defaultCampaign),
  created_at: new Date().toISOString(),
};
globalThis.fetch = async (input: RequestInfo | URL, options?: RequestInit) => {
  const url = new URL(String(input));
  assert.equal(url.hostname, "api.resend.com");
  const method = options?.method || "GET";
  const body = JSON.parse(String(options?.body || "{}"));
  calls.push({
    path: url.pathname,
    method,
    body,
    headers: new Headers(options?.headers),
  });
  let data: unknown;
  if (url.pathname === "/domains")
    data = {
      data: [
        {
          id: "domain-atlas",
          name: "atlas-cargo-logistics.com",
          status: domainVerified ? "verified" : "pending",
        },
      ],
    };
  else if (url.pathname === "/domains/domain-atlas")
    data = {
      id: "domain-atlas",
      name: "atlas-cargo-logistics.com",
      status: domainVerified ? "verified" : "pending",
      records: [],
    };
  else if (url.pathname === `/broadcasts/${id}` && method === "GET")
    data = broadcast;
  else if (url.pathname === `/broadcasts/${id}/send`) data = { id };
  else if (url.pathname === "/broadcasts" && method === "POST") data = { id };
  else if (url.pathname === "/segments") data = { data: [], has_more: false };
  else if (url.pathname.startsWith("/contacts/") && method === "GET")
    data = { id: "contact-1", email: "person@example.com", unsubscribed };
  else if (
    url.pathname.startsWith("/audiences/") ||
    url.pathname.startsWith("/segments/") ||
    url.pathname === "/contacts"
  )
    data = {
      data: [
        { id: "contact-1", email: "person@example.com", unsubscribed: false },
      ],
      has_more: false,
    };
  else if (url.pathname === "/emails") data = { id: "mail-1" };
  else data = { id: "contact-1" };
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
const request = (body: unknown, origin = template.SITE) =>
  new Request(`${template.SITE}/api/admin/marketing/campaigns/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", origin },
    body: JSON.stringify(body),
  });
const context = { params: Promise.resolve({ id }) };

const token = await auth.sign("session", "maxidimnik@gmail.com");
assert.ok(await auth.verify(token, "session"));
assert.equal(await auth.verify(token + "x", "session"), null);
assert.equal(await auth.verify(token, "login"), null);
assert.equal(
  await auth.verify(
    await auth.sign("session", "intruder@example.com"),
    "session",
  ),
  null,
);
assert.equal(
  await auth.verify(
    await auth.sign("login", "maxidimnik@gmail.com", 1),
    "login",
  ),
  null,
);
const originalSecret = process.env.ATLAS_SESSION_SECRET;
process.env.ATLAS_SESSION_SECRET = "another-secret-".repeat(4);
assert.equal(await auth.verify(token, "session"), null);
process.env.ATLAS_SESSION_SECRET = originalSecret;
console.log(
  "PASS: signed sessions, tampering, expiry, purpose, allowlist and key rotation",
);

const malicious = template.renderCampaign({
  ...template.defaultCampaign,
  title: "<script>alert(1)</script>",
  message: "Hello <img src=x onerror=alert(1)> & welcome",
});
assert.ok(!malicious.includes("<script>"));
assert.ok(malicious.includes("&lt;script&gt;"));
assert.ok(malicious.includes(template.UNSUBSCRIBE));
assert.throws(() =>
  template.campaignSchema.parse({
    ...template.defaultCampaign,
    url: "javascript:alert(1)",
  }),
);
assert.throws(() =>
  template.campaignSchema.parse({
    ...template.defaultCampaign,
    subject: "Hello\r\nBcc: x@example.com",
  }),
);
assert.deepEqual(
  provider.decodeCampaign(provider.encodedCampaign(template.defaultCampaign)),
  template.defaultCampaign,
);
assert.ok(
  !template
    .renderCampaign(template.defaultCampaign)
    .toLowerCase()
    .includes("tlc"),
);
assert.ok(
  !template
    .renderCampaign(template.defaultCampaign, true)
    .includes(template.UNSUBSCRIBE),
);
console.log(
  "PASS: escaped HTML, safe URLs, header injection, metadata round-trip and Atlas links",
);

assert.equal(
  (await campaignRoute.POST(request({ action: "send" }), context)).status,
  401,
);
assert.equal(calls.length, 0);
jar.set(auth.SESSION, token);
assert.equal(
  (
    await campaignRoute.POST(
      request({ action: "send" }, "https://attacker.example"),
      context,
    )
  ).status,
  403,
);
assert.equal(calls.length, 0);
broadcast.segment_id = "foreign-segment";
assert.equal(
  (await campaignRoute.GET(new Request(template.SITE), context)).status,
  404,
);
broadcast.segment_id = process.env.ATLAS_RESEND_SEGMENT_ID;
const priorFrom = broadcast.from;
broadcast.from = "Another brand <other@example.com>";
assert.equal(
  (await campaignRoute.GET(new Request(template.SITE), context)).status,
  404,
);
broadcast.from = priorFrom;
console.log("PASS: authentication, CSRF and cross-brand ownership checks");

domainVerified = false;
let result = await campaignRoute.POST(
  request({
    action: "test",
    requestId: crypto.randomUUID(),
    to: "intruder@example.com",
  }),
  context,
);
assert.equal(result.status, 409);
assert.ok(!calls.some((c) => c.path === "/emails"));
domainVerified = true;
result = await campaignRoute.POST(
  request({
    action: "test",
    requestId: "33333333-3333-4333-8333-333333333333",
    to: "intruder@example.com",
  }),
  context,
);
assert.equal(result.status, 200);
const testCall = calls.find((c) => c.path === "/emails")!;
assert.equal(testCall.body.to, "maxidimnik@gmail.com");
assert.equal(testCall.body.from, template.FROM);
assert.ok(testCall.headers.get("Idempotency-Key")?.startsWith("atlas-test/"));
console.log(
  "PASS: unverified domain blocks sends and test recipient is enforced server-side",
);

result = await campaignsRoute.POST(
  request({ content: template.defaultCampaign }),
);
assert.equal(result.status, 200);
assert.equal(
  calls.find((c) => c.path === "/broadcasts" && c.method === "POST")!.body.send,
  false,
);
result = await campaignRoute.POST(
  request({ action: "send", confirm: "wrong" }),
  context,
);
assert.equal(result.status, 409);
result = await campaignRoute.POST(
  request({ action: "send", confirm: broadcast.subject, revision: "stale" }),
  context,
);
assert.equal(result.status, 409);
result = await campaignRoute.POST(
  request({
    action: "send",
    confirm: broadcast.subject,
    revision: auth.digest(broadcast.html),
  }),
  context,
);
assert.equal(result.status, 200);
broadcast.status = "sent";
result = await campaignRoute.POST(
  request({
    action: "send",
    confirm: broadcast.subject,
    revision: auth.digest(broadcast.html),
  }),
  context,
);
assert.equal(result.status, 409);
assert.equal(calls.filter((c) => c.path.endsWith("/send")).length, 1);
console.log(
  "PASS: drafts never send, explicit confirmation, stale revisions and duplicate sends blocked",
);

unsubscribed = true;
const before = calls.length;
result = await contactsRoute.POST(
  request({
    email: "person@example.com",
    firstName: "Person",
    lastName: "Test",
    consent: true,
  }),
);
assert.equal(result.status, 409);
assert.ok(!calls.slice(before).some((c) => c.method !== "GET"));
console.log(
  "PASS: existing unsubscribes cannot be reactivated by contact addition",
);

jar.delete(auth.SESSION);
const count = calls.length;
result = await loginRoute.POST(
  request({ action: "login", email: "intruder@example.com" }),
);
assert.equal(result.status, 200);
assert.equal(calls.length, count);
const loginToken = await auth.sign("login", "maxidimnik@gmail.com");
result = await loginRoute.POST(
  request({ action: "verify", token: loginToken }),
);
assert.equal(result.status, 401);
jar.set(auth.CHALLENGE, auth.digest(loginToken));
result = await loginRoute.POST(
  request({ action: "verify", token: loginToken }),
);
assert.equal(result.status, 200);
assert.ok(jar.has(auth.SESSION));
assert.ok(!jar.has(auth.CHALLENGE));
result = await loginRoute.POST(
  request({ action: "verify", token: loginToken }),
);
assert.equal(result.status, 401);
console.log(
  "PASS: no email enumeration send, browser-bound login and challenge consumption",
);

// Resolution must scan every page and refuse ambiguity instead of selecting another brand.
const pinnedSegment = process.env.ATLAS_RESEND_SEGMENT_ID;
delete process.env.ATLAS_RESEND_SEGMENT_ID;
let segmentMode = "paged";
globalThis.fetch = async (input: RequestInfo | URL) => {
  const url = new URL(String(input));
  assert.equal(url.pathname, "/segments");
  const atlas = { id: pinnedSegment, name: "Atlas Cargo Logistics" };
  const data = segmentMode === "duplicate"
    ? { data: [atlas, { ...atlas, id: "duplicate" }], has_more: false }
    : segmentMode === "missing"
      ? { data: [{ id: "shopx", name: "ShopX" }], has_more: false }
      : url.searchParams.get("after")
        ? { data: [atlas], has_more: false }
        : { data: [{ id: "other-brand", name: "Another brand" }], has_more: true };
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
};
assert.equal(await provider.segmentId(), pinnedSegment);
segmentMode = "duplicate";
await assert.rejects(() => provider.segmentId(), /más de una lista/);
segmentMode = "missing";
await assert.rejects(() => provider.segmentId(), /Falta configurar/);
process.env.ATLAS_RESEND_SEGMENT_ID = pinnedSegment;
console.log("PASS: paginated Atlas segment resolution refuses missing or ambiguous matches");
