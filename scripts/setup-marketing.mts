/** Explicit operator command; never called by the normal build or a public route. */
import { resend, unwrap, broadcastPayload, getCampaign, segmentId } from "../lib/marketing/resend";
import { ATLAS_EMAIL, FROM, defaultCampaign, renderCampaign } from "../lib/marketing/schema";

const SEGMENT_NAME = "Atlas Cargo Logistics";
const EXPECTED_DOMAIN_ID = "05f77bdf-8633-429d-805b-1938bdc5b561";
const RECIPIENT = "maxidimnik@gmail.com";
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const check = args.includes("--check");
const testOperation = args.find((arg) => arg.startsWith("--send-test="))?.split("=")[1];
let step = "configuration";

async function main() {
  if (apply === check || (check && testOperation))
    throw new Error("Choose --check (read-only) or an explicitly authorized --apply.");
  if (process.env.ATLAS_ADMIN_EMAIL !== RECIPIENT)
    throw new Error("The configured administrator does not match the authorized test recipient.");
  if (testOperation && !/^[a-z0-9-]{12,100}$/.test(testOperation))
    throw new Error("Invalid test operation identifier.");

  const client = resend();
  step = "domain";
  const domain = unwrap(await client.domains.get(EXPECTED_DOMAIN_ID));
  if (domain.name !== "atlas-cargo-logistics.com" || domain.status !== "verified" || domain.capabilities.sending !== "enabled")
    throw new Error("The expected Atlas domain must be verified and enabled for sending.");
  console.log("ATLAS_SETUP_DOMAIN", JSON.stringify({ id: domain.id, name: domain.name, status: domain.status }));

  step = "segment";
  let segment: { id: string; name: string } | undefined;
  if (process.env.ATLAS_RESEND_SEGMENT_ID) {
    segment = unwrap(await client.segments.get(process.env.ATLAS_RESEND_SEGMENT_ID));
    if (segment.name !== SEGMENT_NAME) throw new Error("Configured segment does not belong to this setup.");
  } else {
    let after: string | undefined;
    do {
      const page = unwrap(await client.segments.list({ limit: 100, after }));
      for (const candidate of page.data.filter((item) => item.name === SEGMENT_NAME)) {
        if (segment) throw new Error("Multiple Atlas segments exist; review before selecting one.");
        segment = candidate;
      }
      after = page.has_more ? page.data.at(-1)?.id : undefined;
      if (page.has_more && !after) throw new Error("Incomplete segment pagination.");
    } while (after);
    // Never retry a creation with an unknown result. A later run lists first.
    if (!segment) {
      if (check) throw new Error("Atlas segment has not been provisioned.");
      segment = unwrap(await client.segments.create({ name: SEGMENT_NAME }));
    }
  }
  if (await segmentId() !== segment.id) throw new Error("Atlas segment resolution mismatch.");
  process.env.ATLAS_RESEND_SEGMENT_ID = segment.id;
  console.log("ATLAS_SETUP_SEGMENT", JSON.stringify(segment));
  unwrap(await client.contacts.list({ segmentId: segment.id, limit: 1 }));

  step = "draft";
  const payload = await broadcastPayload(defaultCampaign);
  let draftId: string | undefined;
  let after: string | undefined;
  do {
    const page = unwrap(await client.broadcasts.list({ limit: 100, after }));
    const matches = page.data.filter((item) => (item.segment_id || item.audience_id) === segment.id && item.name === payload.name);
    for (const candidate of matches) {
      if (draftId) throw new Error("Multiple presentation campaigns exist; review before continuing.");
      draftId = candidate.id;
    }
    after = page.has_more ? page.data.at(-1)?.id : undefined;
    if (page.has_more && !after) throw new Error("Incomplete campaign pagination.");
  } while (after);
  if (!draftId) {
    if (check) throw new Error("Atlas presentation draft has not been provisioned.");
    draftId = unwrap(await client.broadcasts.create({ ...payload, send: false })).id;
  }
  const draft = await getCampaign(draftId);
  console.log("ATLAS_SETUP_DRAFT", JSON.stringify({ id: draft.id, status: draft.status, segmentId: segment.id }));

  if (testOperation) {
    step = "test_email";
    const email = unwrap(await client.emails.send({
      from: FROM,
      to: [RECIPIENT],
      replyTo: ATLAS_EMAIL,
      subject: `[PRUEBA RESEND] ${defaultCampaign.subject}`,
      html: renderCampaign(defaultCampaign, true),
      text: `${defaultCampaign.title}\n\n${defaultCampaign.message}\n\nTransporte marítimo, aéreo y terrestre.\n${defaultCampaign.url}\n\nInstagram: https://www.instagram.com/atlas.cargo.argentina/\n\nMáximo Dimnik\nAtlas Cargo Logistics\n${ATLAS_EMAIL}\n\nVista de prueba. Este envío no modifica tu suscripción.`,
      tags: [{ name: "project", value: "atlas-cargo-logistics" }, { name: "kind", value: "setup-test" }],
    }, { idempotencyKey: testOperation }));
    console.log("ATLAS_SETUP_TEST", JSON.stringify({ id: email.id, to: RECIPIENT }));
    const delivery = unwrap(await client.emails.get(email.id));
    console.log("ATLAS_SETUP_DELIVERY", JSON.stringify({ id: delivery.id, event: delivery.last_event }));
  }
  console.log("ATLAS_SETUP_COMPLETE");
}

main().catch(() => {
  // No raw provider errors, headers, request bodies or environment values in logs.
  console.error("ATLAS_SETUP_FAILED", step, "Review provider state before retrying mutations.");
  process.exitCode = 1;
});
