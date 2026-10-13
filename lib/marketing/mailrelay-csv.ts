export type ImportedContact = { email: string; name: string; status: string; sourceId: string; groups: string; subscribedAt: string; bounce: string; eligible: boolean };
const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
function rows(text: string, delimiter: string) {
  const result: string[][] = []; let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else if (quoted || cell === "") quoted = !quoted;
      else throw Error("El CSV tiene comillas mal formadas.");
    } else if (char === delimiter && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); if (row.some((v) => v.trim())) result.push(row); row = []; cell = "";
    } else cell += char;
  }
  if (quoted) throw Error("El CSV tiene una celda sin cerrar.");
  row.push(cell); if (row.some((v) => v.trim())) result.push(row);
  return result;
}
export function parseMailrelayCsv(raw: string) {
  const text = raw.replace(/^\ufeff/, "");
  if (text.includes("\u0000") || text.includes("\ufffd")) throw Error("Exportá el archivo en CSV UTF-8.");
  const first = text.split(/\r?\n/)[0];
  const delimiter = [",", ";", "\t"].sort((a, b) => first.split(b).length - first.split(a).length)[0];
  const data = rows(text, delimiter); const headers = (data.shift() || []).map(normalize);
  const index = (...names: string[]) => headers.findIndex((v) => names.includes(v));
  const emailIndex = index("email", "e mail", "correo", "correo electronico");
  const statusIndex = index("status", "estado");
  if (emailIndex < 0 || statusIndex < 0) throw Error("El CSV debe incluir los encabezados Email y Status (Estado). Exportá todos los estados desde Mailrelay.");
  if (!data.length || data.length > 50000) throw Error("El archivo debe contener entre 1 y 50.000 contactos.");
  const nameIndex = index("name", "nombre"); const idIndex = index("id");
  const groupIndex = index("groups names", "group names", "groups", "grupos", "nombres de grupos");
  const subscribedIndex = index("subscribed at", "suscrito en", "fecha de suscripcion");
  const bounceIndex = index("bounce category", "categoria de rebote");
  const spamIndex = index("spam report campaign id");
  const contacts = new Map<string, ImportedContact>(); let duplicates = 0, deleted = 0;
  const rejected: { row: number; reason: string }[] = [];
  const statuses: Record<string, number> = {};
  data.forEach((row, i) => {
    if (row.length !== headers.length) { rejected.push({ row: i + 2, reason: "Cantidad de columnas diferente al encabezado" }); return; }
    const email = row[emailIndex]?.trim().toLowerCase(); const status = row[statusIndex]?.trim() || "Sin estado";
    if (["deleted", "eliminado", "eliminados"].includes(normalize(status))) { deleted++; return; }
    if (!email || email.length > 254 || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email)) { rejected.push({ row: i + 2, reason: "Email inválido" }); return; }
    const field = (idx: number) => idx >= 0 ? row[idx].trim() : "";
    const bounce = field(bounceIndex); const spam = field(spamIndex);
    const eligible = ["active", "activo", "activos"].includes(normalize(status)) && (!bounce || ["none", "null", "n/a", "0", "sin rebote"].includes(normalize(bounce))) && (!spam || ["0", "null"].includes(normalize(spam)));
    const contact = { email, name: field(nameIndex), status, sourceId: field(idIndex), groups: field(groupIndex), subscribedAt: field(subscribedIndex), bounce, eligible };
    if ([contact.name, contact.status, contact.sourceId, contact.groups, contact.subscribedAt, contact.bounce].some((value) => value.length > 1000)) { rejected.push({ row: i + 2, reason: "Un campo supera los 1.000 caracteres" }); return; }
    const previous = contacts.get(email);
    if (previous) { duplicates++; if (!previous.eligible) return; }
    contacts.set(email, contact);
  });
  const items = [...contacts.values()]; for (const c of items) statuses[c.status] = (statuses[c.status] || 0) + 1;
  return { contacts: items, summary: { rows: data.length, unique: items.length, eligible: items.filter((c) => c.eligible).length, excluded: items.filter((c) => !c.eligible).length, duplicates, deleted, invalid: rejected.length, statuses }, rejected };
}
export function contactsCsv(contacts: ImportedContact[]) {
  const cell = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  return [["email", "name", "unsubscribed", "atlas_source_id", "atlas_source_status", "atlas_groups", "atlas_subscribed_at", "atlas_bounce"], ...contacts.map((c) => [c.email, c.name, !c.eligible, c.sourceId, c.status, c.groups, c.subscribedAt, c.bounce])].map((row) => row.map(cell).join(",")).join("\r\n");
}
