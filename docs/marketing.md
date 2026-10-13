# Atlas Cargo marketing

The private panel is `/admin`; campaigns live at `/admin/marketing`. Next.js route handlers use the Resend SDK server-side. Resend is the durable store and delivery queue for drafts, broadcasts and contacts. No contacts are imported automatically from Mailrelay or other projects.

## Production configuration

Configure only on the Atlas Vercel project:

- `RESEND_API_KEY`: a dedicated key with access to domains, broadcasts and contacts. Sending-only keys cannot operate this panel. Never use a `NEXT_PUBLIC_` prefix.
- `ATLAS_RESEND_SEGMENT_ID`: optional explicit ID of the dedicated **Atlas Cargo Logistics** segment. Without it, the server resolves that exact name and refuses missing or duplicate matches. Never select ShopX or DePerritos segments.
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
4. Click **Enviar campaña** on a saved draft to broadcast directly to Atlas's segment, without a modal or typing the subject. The client blocks duplicate clicks; server-side subject and content revision checks reject stale previews.
5. Resend handles the durable send, throttling, unsubscribes and suppressions; saving a draft never sends it.

The panel reads live Resend contact usage and shows the account's contact limit, an upgrade link, and a refresh button when over quota. A known contact overage blocks broadcasts before a send request is submitted; test emails remain available. Known pre-send failures return `sendState: not_sent` so the UI does not incorrectly show an ambiguous result. Network errors and uncertain provider outcomes still require checking campaign state before retrying.

Campaign lookups enforce segment and sender ownership. The listing filters by Atlas segment. Contact additions preserve existing unsubscribe status; no mass reactivation or global updates. Contact/campaign pagination exposes cursors and does not present page counts as totals. Resend API errors remain visible, and sending is blocked when configuration is missing.

## Explicit operator setup

`node --conditions=react-server --import tsx scripts/setup-marketing.mts --apply`
uses the server-side Resend key to check the expected verified Atlas domain,
find/create its dedicated segment, and save the presentation as an unsent draft.
It prints only resource IDs and status. The panel resolves the uniquely named
segment; optionally pin its ID with `ATLAS_RESEND_SEGMENT_ID` in production.

Only append `--send-test=<unique-operation-id>` for an authorized test to the
fixed administrator address. The operation ID is Resend's 24-hour email
idempotency key. Review logs/provider state before any rerun; do not reuse this
as a permanent build command. No contacts are imported or broadcasts sent.

Use `--check` instead of `--apply` to verify the live domain, segment resolution,
contact access and saved draft without creating resources or sending emails.

## Next phase

CSV import and a richer CRM are intentionally separate. Export and review Mailrelay's active, unsubscribed and bounced lists before importing; carry over suppressions, deduplicate and record consent/source. No automatic migration is included in this release.

## Checks

Run `npm run lint`, `npm run test:marketing`, `npm run build`. The test suite covers auth signatures, expiry/audience checks, escaped templates and guarded API calls with a mocked Resend transport; live delivery still requires a configured key and verified DNS.
## Informes y migración de Mailrelay

El apartado **Resultados** consulta la API de métricas de Resend restringida al dominio de Atlas. Permite filtrar fechas o campaña, comparar campañas, consultar evolución diaria, tasas, rebotes, quejas, bajas, supresiones, fallos y demoras. El detalle por campaña permite paginar destinatarios y enlaces y exportar las filas cargadas. El resumen general incluye pruebas y correos de acceso; el detalle de destinatarios representa toda la vida de una campaña. Las métricas pueden tener 15 minutos de demora y el resumen general está sujeto a la retención del plan. “Received” significa aceptados por Resend para procesar; no son respuestas entrantes ni confirmaciones de lectura.

`scripts/check-reporting.mts --enable-tracking` es una operación explícita: comprueba el dominio fijo de Atlas, solicita habilitar seguimiento de aperturas y clics y verifica las APIs de métricas e importaciones. No envía emails, no toca otros dominios ni modifica DNS. Sin el argumento solo comprueba. Si el proveedor acepta el cambio pero sigue devolviendo flags desactivados, no se declara el seguimiento activo: Configuración y Resultados muestran el estado real y el paso pendiente en el dashboard de Resend. Los informes de entrega siguen disponibles.

En **Contactos**, el importador acepta el CSV UTF-8 completo de Mailrelay (máximo 3 MB / 50.000 filas), con encabezados Email y Status. Primero muestra una revisión. Normaliza emails, unifica duplicados conservando el estado más restrictivo, descarta emails inválidos y registros eliminados, y excluye estados desconocidos. Solo `active`/`activo` sin rebote o queja se considera activo de origen. La exportación original debe conservarse de forma privada, fuera del repositorio público.

Las listas son exclusivas de Atlas: `Atlas Cargo Logistics` para enviar, `Atlas Cargo Logistics · CRM` para la base completa y `Atlas Cargo Logistics · Excluidos` para conservar bajas/rebotes/inactivos. Resend conserva además sus propias supresiones. Los contactos nuevos se importan en lotes nativos con `onConflict: skip`; las coincidencias existentes se reconcilian en lotes pequeños sin modificar jamás su estado global de suscripción. Se preservan las propiedades de origen `atlas_source_id`, `atlas_source_status`, `atlas_groups`, `atlas_subscribed_at` y `atlas_bounce`. Los nombres y datos globales de otras marcas no se sobrescriben.

La importación no manda campañas. La continuación exige sesión admin, origen válido y recibo firmado vinculado al hash del CSV y a las listas de Atlas. El navegador guarda únicamente ese recibo, no la base, para reanudar al seleccionar el mismo archivo durante 24 horas. Si el proveedor devuelve omisiones por concurrencia, el panel pide repetir la importación para reconciliar esas coincidencias. Los cambios ya realizados son seguros de repetir. No se reactiva automáticamente una exclusión, aun si otro archivo presenta ese contacto como activo.

Validación: `npm run test:reporting`, además de los tests de marketing, lint y build. Cubre autenticación, CSRF, aislamiento del dominio/campañas, CSV, bajas, conflictos, recibos alterados y ausencia de envíos durante la importación.
