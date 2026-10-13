# Atlas Cargo marketing

The private panel is `/admin`; campaigns live at `/admin/marketing`. Next.js route handlers use the Resend SDK server-side. Resend is the durable store and delivery queue for drafts, broadcasts and contacts. No contacts are imported automatically from Mailrelay or other projects.

## Production configuration

Configure only on the Atlas Vercel project:

- `RESEND_API_KEY`: a dedicated key with access to domains, broadcasts and contacts. Sending-only keys cannot operate this panel. Never use a `NEXT_PUBLIC_` prefix.
- `ATLAS_RESEND_SEGMENT_ID`: ID of a dedicated **Atlas Cargo** segment. Never select ShopX or DePerritos segments.
- `ATLAS_SESSION_SECRET`: at least 32 random characters; rotating this revokes all login links and sessions.
- `ATLAS_ADMIN_EMAIL`: the sole administrator and test recipient, initially `maxidimnik@gmail.com`.
- `ATLAS_ADMIN_LOGIN_FROM`: optional verified sender used only for private login links; defaults to the Atlas sender.

Verify `atlas-cargo-logistics.com` in Resend and add its exact DNS records at the authoritative DNS provider. Do not overwrite MX records for the existing mailbox or weaken DMARC. Resend's sending subdomain records are separate from mailbox MX. All campaign send/test routes check live verification before submission. The public contact form remains on its existing SMTP configuration.

## Access

Login links are signed, expire after at most ten minutes and are bound to an HttpOnly cookie in the requesting browser. GET does not create a session (protects against email link scanners); the user confirms with a same-origin POST. Sessions expire after eight hours. Login sends use deterministic payloads and Resend idempotency to cap sends at one per five-minute bucket for the allowlisted address. An email-only allowlist is not authentication; the server always verifies both the signed token and browser challenge.

## Campaign workflow

1. Create a draft using the Atlas template; preview HTML is escaped and sandboxed.
2. Save to Resend. Test emails use stable idempotency keys. Broadcast create/send requests are not retried automatically; an ambiguous result locks the corresponding action until the user returns to the list and reviews provider state.
3. Send a test only to the server-configured admin email.
4. Review and explicitly confirm the exact subject before broadcasting to Atlas's segment. A content revision check rejects stale previews.
5. Resend handles the durable send, throttling, unsubscribes and suppressions; saving a draft never sends it.

Campaign lookups enforce segment and sender ownership. The listing filters by Atlas segment. Contact additions preserve existing unsubscribe status; no mass reactivation or global updates. Contact/campaign pagination exposes cursors and does not present page counts as totals. Resend API errors remain visible, and sending is blocked when configuration is missing.

## Explicit operator setup

`node --conditions=react-server --import tsx scripts/setup-marketing.mts --apply`
uses the server-side Resend key to check the expected verified Atlas domain,
find/create its dedicated segment, and save the presentation as an unsent draft.
It prints only resource IDs and status. Set the returned segment ID as
`ATLAS_RESEND_SEGMENT_ID` in production and redeploy normally.

Only append `--send-test=<unique-operation-id>` for an authorized test to the
fixed administrator address. The operation ID is Resend's 24-hour email
idempotency key. Review logs/provider state before any rerun; do not reuse this
as a permanent build command. No contacts are imported or broadcasts sent.

## Next phase

CSV import and a richer CRM are intentionally separate. Export and review Mailrelay's active, unsubscribed and bounced lists before importing; carry over suppressions, deduplicate and record consent/source. No automatic migration is included in this release.

## Checks

Run `npm run lint`, `npm run test:marketing`, `npm run build`. The test suite covers auth signatures, expiry/audience checks, escaped templates and guarded API calls with a mocked Resend transport; live delivery still requires a configured key and verified DNS.
