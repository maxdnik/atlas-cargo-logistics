import assert from "node:assert/strict";
import { mock } from "node:test";

const destination = "maximo.dimnik@atlas-cargo-logistics.com";
let smtpCalls = 0;
let smtpAccepts = true;
mock.module("nodemailer", {
  defaultExport: {
    createTransport: () => ({
      sendMail: async (mail: Record<string, unknown>) => {
        smtpCalls++;
        assert.equal(mail.to, destination);
        return { accepted: smtpAccepts ? [destination] : [], rejected: smtpAccepts ? [] : [destination] };
      },
    }),
  },
});
const { POST } = await import("../app/api/contact/route");
const calls: { body: Record<string, unknown>; headers: Headers }[] = [];
let providerFails = false;
globalThis.fetch = async (input, options) => {
  assert.equal(String(input), "https://api.resend.com/emails");
  calls.push({ body: JSON.parse(String(options?.body)), headers: new Headers(options?.headers) });
  return new Response(JSON.stringify(providerFails ? { name: "validation_error", message: "Provider rejected email" } : { id: "mail-test-id" }), {
    status: providerFails ? 422 : 200,
    headers: { "Content-Type": "application/json" },
  });
};
const valid = {
  name: "Cliente de prueba",
  company: "Empresa",
  email: "cliente@example.com",
  phone: "",
  service: "Carga marítima",
  message: "Consulta <script> & documentación\nSegunda línea",
  submissionId: "6d4ec7f1-a86c-4c97-a648-4f3b8b866139",
};
async function send(body: unknown) {
  return POST(new Request("https://www.atlas-cargo-logistics.com/api/contact", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  }));
}
process.env.RESEND_API_KEY = "re_test_not_a_real_key";
process.env.CONTACT_EMAIL = "not-the-destination@example.com";
let response = await send({ ...valid, to: "not-the-destination@example.com" });
assert.equal(response.status, 200);
assert.equal((await response.json()).success, true);
assert.equal(calls[0].body.to, destination);
assert.equal(calls[0].body.reply_to, valid.email);
assert.match(String(calls[0].body.html), /&lt;script&gt; &amp;/);
assert.equal(calls[0].headers.get("Idempotency-Key"), `atlas-contact/${valid.submissionId}`);
await send(valid);
assert.equal(calls[1].headers.get("Idempotency-Key"), calls[0].headers.get("Idempotency-Key"));

for (const bad of [{ ...valid, email: "not-an-email" }, { ...valid, service: "Carga\r\nBcc: another@example.com" }, { ...valid, message: "" }, { ...valid, name: "x".repeat(121) }, null]) {
  assert.equal((await send(bad)).status, 400);
}
assert.equal(calls.length, 2);
assert.equal((await POST(new Request("https://example.com/api/contact", { method: "POST", body: "{" }))).status, 400);

providerFails = true;
process.env.SMTP_HOST = "smtp.example.com";
process.env.SMTP_USER = "sender@example.com";
process.env.SMTP_PASS = "test-only";
response = await send(valid);
assert.equal(response.status, 502);
assert.equal((await response.json()).success, false);
assert.equal(smtpCalls, 0, "An uncertain Resend send must not trigger a second SMTP send");

delete process.env.RESEND_API_KEY;
assert.equal((await send(valid)).status, 200);
assert.equal(smtpCalls, 1);
smtpAccepts = false;
assert.equal((await send(valid)).status, 500);
delete process.env.SMTP_HOST;
response = await send(valid);
assert.equal(response.status, 503);
assert.doesNotMatch(await response.text(), /SMTP|RESEND|@atlas-cargo/);
console.log("Contact checks passed: fixed destination, reply-to, escaping, validation, retry key, provider errors and SMTP acceptance.");
