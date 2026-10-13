/** Explicit deployment gate. Only Atlas tracking settings may be changed. Never sends email. */
import { ATLAS_DOMAIN_ID, report } from "../lib/marketing/reporting";
import { resend, unwrap } from "../lib/marketing/resend";
import { contactTotals } from "../lib/marketing/contact-counts";
const args = process.argv.slice(2);
let step = "domain";
try {
  if (args.some((arg) => arg !== "--enable-tracking")) throw Error("Unknown operator argument");
  const client = resend();
  const domain = unwrap(await client.domains.get(ATLAS_DOMAIN_ID));
  if (domain.name !== "atlas-cargo-logistics.com" || domain.status !== "verified") throw Error("Atlas domain mismatch");
  if (args.includes("--enable-tracking") && (!domain.open_tracking || !domain.click_tracking)) {
    step = "tracking";
    if (domain.id !== ATLAS_DOMAIN_ID) throw Error("Unexpected domain identifier");
    const updated = await fetch(`https://api.resend.com/domains/${ATLAS_DOMAIN_ID}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ open_tracking: true, click_tracking: true }),
    });
    if (!updated.ok || (await updated.json()).id !== ATLAS_DOMAIN_ID) throw Error("Tracking update was not acknowledged");
  }
  step = "metrics";
  const today = new Date().toISOString().slice(0, 10);
  const probe = await client.emails.metrics({ startDate: today, endDate: today, domainId: [ATLAS_DOMAIN_ID], dimensions: ["period"] });
  if (probe.error) {
    const codes: Record<string, number> = { validation_error: 31, not_found: 32, restricted_api_key: 33, invalid_access: 34, invalid_parameter: 35, rate_limit_exceeded: 36, application_error: 37, internal_server_error: 38 };
    process.exit(codes[probe.error.name] || 39);
  }
  const result = await report({ start: today, end: today });
  // Delivery reporting remains usable while domain engagement tracking is disabled.
  // The admin shows the live flags and a visible setup warning; never synthesize opens/clicks.
  if (!result.tracking.opens || !result.tracking.clicks) console.warn("ATLAS_TRACKING_REQUIRES_DASHBOARD_REVIEW");
  if (typeof result.totals.sent !== "number") process.exit(41);
  step = "contacts_metrics";
  const contacts = await contactTotals();
  if (typeof contacts.all !== "number") throw Error("Contact metrics unavailable");
  step = "contact_imports";
  const availableImports = unwrap(await client.contacts.imports.list({ limit: 1 }));
  if (!Array.isArray(availableImports.data)) throw Error("Contact imports unavailable");
  console.log("ATLAS_REPORTING_VERIFIED", JSON.stringify({ tracking: result.tracking, metrics: Object.keys(result.totals), at: result.fetchedAt }));
} catch {
  console.error("ATLAS_REPORTING_FAILED", step);
  // The deployment API returns the exit code even when build-log retrieval is unavailable.
  // These fixed codes contain only the failed capability, never secrets or contact data.
  process.exitCode = { domain: 21, tracking: 22, metrics: 23, contacts_metrics: 24, contact_imports: 26 }[step] || 25;
}
