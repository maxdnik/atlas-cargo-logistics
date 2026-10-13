"use client";
import { useEffect, useRef, useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import type { ImportedContact } from "@/lib/marketing/mailrelay-csv";
type Preview = { summary: { rows: number; unique: number; eligible: number; excluded: number; duplicates: number; deleted: number; invalid: number; statuses: Record<string, number> }; rejected: { row: number; reason: string }[]; sample: ImportedContact[] };
type Progress = { receipt: string; processedExisting: number; totalExisting: number; done: boolean; failed: boolean; skipped: number; jobs: { id: string; status: string; counts: { total: number; created: number; skipped: number; failed: number } }[] };
async function request(body: unknown) {
  const response = await fetch("/api/admin/marketing/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (response.status === 401) window.location.assign("/admin/login");
  if (!response.ok) throw Error(data.error || "No se pudo completar la importación.");
  return data;
}
export default function ContactImporter({ onImported, onBusyChange }: { onImported: () => void; onBusyChange: (busy: boolean) => void }) {
  const [csv, setCsv] = useState(""); const [name, setName] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null); const [receipt, setReceipt] = useState("");
  const [progress, setProgress] = useState<Progress | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const receiptRef = useRef("");
  const storageKey = useRef("");
  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);
  function remember(token: string) {
    receiptRef.current = token; setReceipt(token);
    try { if (storageKey.current) localStorage.setItem(storageKey.current, token); } catch {}
  }
  async function run() {
    setBusy(true); onBusyChange(true); setError("");
    try {
      let current = receiptRef.current;
      if (!current) { const result = await request({ action: "start", csv }); current = result.receipt; remember(current); }
      let result: Progress;
      do {
        result = await request({ action: "continue", csv, receipt: current }); current = result.receipt;
        remember(current); setProgress(result);
        if (result.failed) throw Error("Resend informó errores. Revisá los contadores; los contactos ya importados se conservan. No se enviaron campañas.");
        if (!result.done) await new Promise((resolve) => setTimeout(resolve, 2500));
      } while (!result.done);
      onImported();
      try { localStorage.removeItem(storageKey.current); } catch {}
    } catch (e) { setError(e instanceof Error ? e.message : "Error de importación."); }
    finally { setBusy(false); onBusyChange(false); }
  }
  return <section className="admin-card contact-importer"><div className="card-title"><div><h2>Importar desde Mailrelay</h2><p className="admin-muted">Cargá el CSV completo, incluidos Email, Status, nombres y grupos.</p></div><Upload size={22} /></div>
    <label className="import-file">Archivo CSV · máximo 3 MB<input type="file" accept=".csv,text/csv" disabled={busy} onChange={async (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      setPreview(null); setProgress(null); setReceipt(""); receiptRef.current = ""; setError(""); setName(file.name);
      if (file.size > 3000000) { setError("El archivo supera los 3 MB."); return; }
      setBusy(true); onBusyChange(true);
      try {
        const contents = await file.text(); setCsv(contents); setPreview(await request({ action: "preview", csv: contents }));
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(contents));
        storageKey.current = `atlas-import-v1-${Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")}`;
        try { const saved = localStorage.getItem(storageKey.current); if (saved) remember(saved); } catch {}
      }
      catch (err) { setError(err instanceof Error ? err.message : "No se pudo leer el archivo."); }
      finally { setBusy(false); onBusyChange(false); }
    }} /></label>
    {error && <div className="admin-error" role="alert">{error}</div>}
    {preview && <><h3>{name}</h3><div className="report-diagnostics"><div><span>Contactos únicos</span><strong>{preview.summary.unique.toLocaleString("es-AR")}</strong></div><div><span>Activos en el archivo</span><strong>{preview.summary.eligible.toLocaleString("es-AR")}</strong></div><div><span>Excluidos del envío</span><strong>{preview.summary.excluded.toLocaleString("es-AR")}</strong></div><div><span>Duplicados unificados</span><strong>{preview.summary.duplicates}</strong></div><div><span>Filas inválidas</span><strong>{preview.summary.invalid}</strong></div><div><span>Eliminados omitidos</span><strong>{preview.summary.deleted}</strong></div></div><p>Todos los contactos válidos quedan en el CRM. Solo los activos pueden entrar en la lista de envío. Las bajas y exclusiones anteriores se conservan; los datos de otras marcas no se modifican.</p><details><summary>Revisar estados y primeras filas</summary><p>{Object.entries(preview.summary.statuses).map(([status, count]) => `${status}: ${count}`).join(" · ")}</p><div className="admin-table-wrap"><table><thead><tr><th>Email</th><th>Nombre</th><th>Estado de origen</th><th>Grupos</th></tr></thead><tbody>{preview.sample.map((c) => <tr key={c.email}><td>{c.email}</td><td>{c.name}</td><td>{c.status}</td><td>{c.groups || "—"}</td></tr>)}</tbody></table></div>{preview.rejected.map((r) => <p key={r.row}>Fila {r.row}: {r.reason}</p>)}</details>
      {progress && <div className={progress.done && !progress.failed ? "admin-success" : "admin-notice"} role="status"><div>{progress.done && !progress.failed ? <strong><CheckCircle2 size={17} /> Procesamiento finalizado</strong> : <strong>Importación en curso</strong>}<p>Existentes procesados: {progress.processedExisting} de {progress.totalExisting}.</p>{progress.jobs.map((j, index) => <p key={j.id}>Lote {index + 1}: {j.status} · creados {j.counts.created} · omitidos {j.counts.skipped} · fallidos {j.counts.failed} / {j.counts.total} filas.</p>)}{progress.skipped > 0 && <p>Hay contactos omitidos por coincidencias existentes. Volvé a importar el mismo archivo para completar sus asociaciones, conservando las bajas.</p>}</div></div>}
      <button className="admin-button primary" disabled={busy || !preview.summary.unique || Boolean(progress?.done && !progress.failed)} onClick={() => void run()}><Upload size={16} />{busy ? "Procesando… mantené esta página abierta" : receipt ? "Reanudar importación" : "Importar contactos"}</button>
    </>}
    <p className="report-footnote">La importación no envía emails. Los registros sin estado activo reconocido quedan excluidos. Si se interrumpe la conexión, podés reanudar o volver a cargar el archivo: nunca se reactiva una baja automáticamente.</p>
  </section>;
}
