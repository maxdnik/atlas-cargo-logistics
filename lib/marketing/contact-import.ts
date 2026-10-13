import "server-only";
import { createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import type { ContactProperty } from "resend";
import { contactsCsv, parseMailrelayCsv, type ImportedContact } from "./mailrelay-csv";
import { MarketingError, resend, segmentId, unwrap } from "./resend";
export const CRM_NAME = "Atlas Cargo Logistics · CRM";
export const BLOCKED_NAME = "Atlas Cargo Logistics · Excluidos";
const propertyKeys = ["atlas_source_id", "atlas_source_status", "atlas_groups", "atlas_subscribed_at", "atlas_bounce"];
const receiptSchema = z.object({ hash: z.string(), jobs: z.array(z.string().uuid()), existing: z.array(z.number().int().nonnegative()), offset: z.number().int().nonnegative(), crm: z.string().uuid(), blocked: z.string().uuid(), send: z.string().uuid() });
type Receipt = z.infer<typeof receiptSchema>;
function secret() { const key = process.env.ATLAS_SESSION_SECRET; if (!key) throw new MarketingError("Falta configurar la sesión.", 503); return new TextEncoder().encode(key); }
const hash = (csv: string) => createHash("sha256").update(csv).digest("hex");
async function seal(data: Receipt) { return new SignJWT(data).setProtectedHeader({ alg: "HS256" }).setIssuer("atlas-marketing").setAudience("contact-import").setIssuedAt().setExpirationTime("24h").sign(secret()); }
async function open(token: string, csv: string) {
  let receipt: Receipt;
  try { receipt = receiptSchema.parse((await jwtVerify(token, secret(), { issuer: "atlas-marketing", audience: "contact-import", algorithms: ["HS256"] })).payload); }
  catch { throw new MarketingError("La importación venció o no es válida. Volvé a seleccionar el archivo.", 409); }
  if (receipt.hash !== hash(csv) || receipt.send !== await segmentId()) throw new MarketingError("El archivo no corresponde a esta importación.", 409);
  return receipt;
}
export async function atlasSegments(create = false) {
  const client = resend(); let after: string | undefined;
  let crm: string | undefined, blocked: string | undefined;
  do {
    const page = unwrap(await client.segments.list({ limit: 100, after }));
    for (const item of page.data) {
      if (item.name === CRM_NAME) { if (crm) throw new MarketingError("La lista CRM está duplicada.", 503); crm = item.id; }
      if (item.name === BLOCKED_NAME) { if (blocked) throw new MarketingError("La lista de excluidos está duplicada.", 503); blocked = item.id; }
    }
    after = page.has_more ? page.data.at(-1)?.id : undefined;
    if (page.has_more && !after) throw new MarketingError("No se pudieron comprobar todas las listas.", 502);
  } while (after);
  if (create) {
    if (!crm) crm = unwrap(await client.segments.create({ name: CRM_NAME })).id;
    if (!blocked) blocked = unwrap(await client.segments.create({ name: BLOCKED_NAME })).id;
  }
  return { crm, blocked, send: await segmentId() };
}
export async function startImport(csv: string) {
  const parsed = parseMailrelayCsv(csv); if (!parsed.contacts.length) throw new MarketingError("No hay contactos válidos para importar.");
  const segments = await atlasSegments(true); const crm = segments.crm!, blocked = segments.blocked!;
  const client = resend(); const existingEmails = new Set<string>(); let after: string | undefined;
  do {
    const page = unwrap(await client.contacts.list({ limit: 100, after }));
    for (const item of page.data) existingEmails.add(item.email.toLowerCase());
    after = page.has_more ? page.data.at(-1)?.id : undefined;
    if ((page.has_more && !after) || existingEmails.size > 35000) throw new MarketingError("La cuenta requiere una importación por lotes más pequeños.", 409);
  } while (after);
  const properties = new Set<string>(); after = undefined;
  do {
    const page: { data: ContactProperty[]; has_more: boolean } = unwrap(await client.contactProperties.list({ limit: 100, after }));
    page.data.forEach((p) => properties.add(p.key)); after = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (after);
  for (const key of propertyKeys) if (!properties.has(key)) unwrap(await client.contactProperties.create({ key, type: "string" }));
  const existing: number[] = [], active: ImportedContact[] = [], inactive: ImportedContact[] = [];
  parsed.contacts.forEach((c, i) => { if (existingEmails.has(c.email)) existing.push(i); else (c.eligible ? active : inactive).push(c); });
  const jobs: string[] = [];
  for (const [items, target] of [[inactive, blocked], [active, segments.send]] as const) {
    if (!items.length) continue;
    const job = unwrap(await client.contacts.imports.create({
      file: new Blob([contactsCsv(items)], { type: "text/csv" }), onConflict: "skip",
      columnMap: { email: "email", firstName: "name", unsubscribed: "unsubscribed", properties: Object.fromEntries(propertyKeys.map((key) => [key, { column: key, type: "string" as const }])) },
      segments: [{ id: crm }, { id: target }],
    }));
    jobs.push(job.id);
  }
  const receipt = await seal({ hash: hash(csv), jobs, existing, offset: 0, crm, blocked, send: segments.send });
  return { receipt, summary: parsed.summary, existing: existing.length, jobs: jobs.length };
}
export async function continueImport(csv: string, token: string) {
  const receipt = await open(token, csv); const parsed = parseMailrelayCsv(csv); const client = resend();
  // Only explicit properties are patched; never reset an existing global unsubscribe.
  const batch = receipt.existing.slice(receipt.offset, receipt.offset + 8);
  for (const index of batch) {
    const source = parsed.contacts[index]; if (!source) throw new MarketingError("La importación no coincide con el archivo.", 409);
    const contact = unwrap(await client.contacts.get({ email: source.email }));
    const memberships = new Set<string>(); let after: string | undefined;
    do { const page = unwrap(await client.contacts.segments.list({ contactId: contact.id, limit: 100, after })); page.data.forEach((s) => memberships.add(s.id)); after = page.has_more ? page.data.at(-1)?.id : undefined; } while (after);
    const eligible = source.eligible && !contact.unsubscribed && !memberships.has(receipt.blocked);
    if (!eligible && memberships.has(receipt.send)) unwrap(await client.contacts.segments.remove({ contactId: contact.id, segmentId: receipt.send }));
    for (const id of [receipt.crm, eligible ? receipt.send : receipt.blocked]) if (!memberships.has(id)) unwrap(await client.contacts.segments.add({ contactId: contact.id, segmentId: id }));
    unwrap(await client.contacts.update({ id: contact.id, properties: { atlas_source_id: source.sourceId, atlas_source_status: source.status, atlas_groups: source.groups, atlas_subscribed_at: source.subscribedAt, atlas_bounce: source.bounce } }));
  }
  receipt.offset += batch.length;
  const jobs = [];
  for (const id of receipt.jobs) jobs.push(unwrap(await client.contacts.imports.get(id)));
  return { receipt: await seal(receipt), processedExisting: receipt.offset, totalExisting: receipt.existing.length, jobs, done: receipt.offset === receipt.existing.length && jobs.every((j) => j.status === "completed"), failed: jobs.some((j) => j.status === "failed" || j.counts.failed > 0), skipped: jobs.reduce((sum, j) => sum + j.counts.skipped, 0) };
}
