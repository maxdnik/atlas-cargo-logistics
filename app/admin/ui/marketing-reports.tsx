"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, RefreshCw, TrendingUp } from "lucide-react";
import type { EmailMetricsDataRow, EmailMetricsTotals } from "resend";

type Report = {
  totals: EmailMetricsTotals; data: EmailMetricsDataRow[]; campaigns: EmailMetricsDataRow[];
  start_date: string; end_date: string; fetchedAt: string;
  tracking: { opens: boolean; clicks: boolean };
  campaign: { id: string; name: string; subject: string; status: string; sent_at?: string } | null;
};
type Recipient = { id: string; email?: string; count?: number; bounce_type?: string; url?: string; clicks?: number; unique_clicks?: number; clicked_links?: { url: string; clicks: number }[] };
const n = (value: number | undefined) => value === undefined ? "—" : value.toLocaleString("es-AR", { maximumFractionDigits: 1 });
const iso = (days = 0) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(Date.now() - days * 86400000));
async function read(path: string, signal?: AbortSignal) {
  const response = await fetch(`/api/admin/marketing/${path}`, { cache: "no-store", signal });
  const data = await response.json();
  if (response.status === 401) window.location.assign("/admin/login");
  if (!response.ok) throw Error(data.error || "No se pudieron consultar los resultados.");
  return data;
}
function exportCsv(name: string, rows: unknown[][]) {
  const escape = (value: unknown) => `"${String(value ?? "").replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""')}"`;
  const url = URL.createObjectURL(new Blob(["\ufeff", rows.map((row) => row.map(escape).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url);
}
const mainMetrics = [
  ["sent", "Enviados", "Correos enviados por Resend"],
  ["delivered", "Entregados", "Aceptados por el servidor de destino"],
  ["unique_opened", "Aperturas únicas", "Emails con al menos una apertura registrada"],
  ["unique_clicked", "Clics únicos", "Emails con al menos un clic registrado"],
  ["bounced", "Rebotados", "Entregas rechazadas"],
  ["unsubscribed", "Bajas", "Bajas registradas en los envíos"],
] as const;
const rates = [["delivery_rate", "Entrega"], ["open_rate", "Apertura"], ["click_rate", "Clics"], ["bounce_rate", "Rebotes"], ["complaint_rate", "Quejas"], ["unsubscribe_rate", "Bajas"]] as const;
const events = [["delivered", "Entregados"], ["sent", "Enviados"], ["opened", "Abiertos"], ["clicked", "Con clics"], ["bounced", "Rebotados"], ["complained", "Quejas de spam"], ["unsubscribed", "Bajas"], ["suppressed", "Suprimidos"], ["links", "Enlaces clicados"]] as const;

export default function MarketingReports({ initialCampaign = "" }: { initialCampaign?: string }) {
  const [start, setStart] = useState(() => iso(29)); const [end, setEnd] = useState(() => iso());
  const [campaign, setCampaign] = useState(initialCampaign);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const [type, setType] = useState<string>("delivered");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientError, setRecipientError] = useState(""); const [recipientLoading, setRecipientLoading] = useState(false);
  const [cursor, setCursor] = useState<string>(); const [more, setMore] = useState(false);
  const recipientGeneration = useRef(0);
  const [email, setEmail] = useState(""); const [search, setSearch] = useState("");
  const [choices, setChoices] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      let after: string | undefined; const items: { id: string; name: string }[] = [];
      do {
        const page = await read(`campaigns${after ? `?after=${after}` : ""}`, controller.signal);
        items.push(...page.data); after = page.hasMore ? page.nextCursor : undefined;
      } while (after && !controller.signal.aborted);
      setChoices(items);
    })().catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ start, end }); if (campaign) params.set("campaign", campaign);
    // Reset the remote request state; abort below prevents stale filters replacing results.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true); setError(""); setReport(null);
    read(`reports?${params}`, controller.signal).then(setReport).catch((e) => { if (!controller.signal.aborted) setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [start, end, campaign, revision]);
  const loadRecipients = useCallback(async (after?: string) => {
    if (!campaign) return;
    const generation = ++recipientGeneration.current;
    setRecipientLoading(true); setRecipientError("");
    if (!after) { setRecipients([]); setMore(false); }
    try {
      const params = new URLSearchParams({ type }); if (after) params.set("after", after); if (search && type !== "links") params.set("email", search);
      const result = await read(`campaigns/${campaign}/results?${params}`);
      if (generation !== recipientGeneration.current) return;
      setRecipients((old) => after ? [...old, ...result.data] : result.data); setMore(result.hasMore); setCursor(result.nextCursor);
    } catch (e) { if (generation === recipientGeneration.current) setRecipientError(e instanceof Error ? e.message : "Error de conexión."); }
    finally { if (generation === recipientGeneration.current) setRecipientLoading(false); }
  }, [campaign, type, search]);
  useEffect(() => {
    const generation = recipientGeneration;
    // This effect owns the asynchronous recipient request and its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRecipients();
    return () => { generation.current++; };
  }, [loadRecipients, revision]);
  const totals = report?.totals || {};
  const trend = report?.data || [];
  const max = Math.max(1, ...trend.map((row) => Math.max(row.sent || 0, row.delivered || 0, row.unique_opened || 0)));
  return <div className="marketing-reports">
    <section className="admin-card report-filters">
      <label>Resultados de<select value={campaign} onChange={(e) => { setCampaign(e.target.value); setSearch(""); setEmail(""); }}><option value="">Todo el dominio Atlas</option>{choices.map((c) => <option key={c.id} value={c.id}>{c.name.replace(/^\[Atlas\] /, "")}</option>)}</select></label>
      <label>Desde<input type="date" value={start} max={end} onChange={(e) => e.target.value && setStart(e.target.value)} /></label>
      <label>Hasta<input type="date" value={end} min={start} onChange={(e) => e.target.value && setEnd(e.target.value)} /></label>
      <button className="admin-button" onClick={() => { setStart(iso(6)); setEnd(iso()); }}>7 días</button>
      <button className="admin-icon-button" aria-label="Actualizar resultados" disabled={loading} onClick={() => setRevision((v) => v + 1)}><RefreshCw size={18} /></button>
    </section>
    {error && <div className="admin-error" role="alert">{error}</div>}
    {loading && <p role="status" className="admin-muted">Consultando resultados de Resend…</p>}
    {report && <>
      <div className="report-context"><div><strong>{report.campaign?.subject || "Actividad del dominio Atlas"}</strong><p>{campaign ? "Resultados de la campaña seleccionada." : "Incluye campañas, pruebas y correos de acceso enviados desde Atlas."}</p></div><button className="admin-button" onClick={() => exportCsv("atlas-resultados.csv", [["Métrica", "Valor", "Desde", "Hasta"], ...Object.entries(totals).map(([key, value]) => [key, value, report.start_date, report.end_date])])}><Download size={16} />Exportar resumen</button></div>
      {(!report.tracking.opens || !report.tracking.clicks) && <div className="admin-notice">Seguimiento de aperturas: {report.tracking.opens ? "activo" : "inactivo"}. Seguimiento de clics: {report.tracking.clicks ? "activo" : "inactivo"}. Solo se pueden medir los envíos realizados con seguimiento habilitado.</div>}
      <div className="report-kpis">{mainMetrics.map(([key, label, hint]) => <div className={`admin-card report-kpi ${key === "sent" ? "report-kpi-featured" : ""}`} key={key}><span>{label}</span><strong>{n(totals[key])}</strong><small>{hint}</small></div>)}</div>
      <div className="report-columns"><section className="admin-card"><div className="card-title"><h2>Evolución diaria</h2><TrendingUp size={20} /></div>
        {!trend.length ? <p className="admin-empty">Sin actividad registrada en este período.</p> : <><div className="report-chart"><svg viewBox="0 0 720 210" role="img" aria-label="Evolución diaria de enviados, entregados y aperturas únicas"><title>Enviados, entregados y aperturas únicas por día</title>{[0, .5, 1].map((fraction) => <g key={fraction}><line x1="45" x2="705" y1={175 - fraction * 150} y2={175 - fraction * 150} stroke="#e4e9ef" /><text x="0" y={180 - fraction * 150} fill="#6c7d91" fontSize="11">{n(max * fraction)}</text></g>)}{(["sent", "delivered", "unique_opened"] as const).map((key, k) => <g key={key}><polyline fill="none" stroke={["#183861", "#00a08a", "#ed4854"][k]} strokeWidth="2.5" points={trend.map((row, i) => `${45 + i * 660 / Math.max(1, trend.length - 1)},${175 - (row[key] || 0) / max * 150}`).join(" ")} />{trend.length === 1 && <circle cx="45" cy={175 - (trend[0][key] || 0) / max * 150} r="4" fill={["#183861", "#00a08a", "#ed4854"][k]} />}</g>)}<text x="45" y="203" fontSize="11" fill="#6c7d91">{trend[0]?.period?.slice(0, 10)}</text><text x="705" textAnchor="end" y="203" fontSize="11" fill="#6c7d91">{trend.at(-1)?.period?.slice(0, 10)}</text></svg></div><div className="report-legend"><span>● Enviados</span><span>● Entregados</span><span>● Aperturas únicas</span></div><details className="report-daily"><summary>Ver tabla diaria y descargar</summary><button className="admin-text-link" onClick={() => exportCsv("atlas-evolucion.csv", [["Fecha", "Enviados", "Entregados", "Aperturas únicas", "Clics únicos", "Rebotes"], ...trend.map((r) => [r.period, r.sent, r.delivered, r.unique_opened, r.unique_clicked, r.bounced])])}>Descargar CSV</button><div className="admin-table-wrap"><table><thead><tr><th>Día</th><th>Enviados</th><th>Entregados</th><th>Abiertos</th><th>Clics</th><th>Rebotes</th></tr></thead><tbody>{trend.map((r) => <tr key={r.period}><td>{r.period?.slice(0, 10)}</td><td>{n(r.sent)}</td><td>{n(r.delivered)}</td><td>{n(r.unique_opened)}</td><td>{n(r.unique_clicked)}</td><td>{n(r.bounced)}</td></tr>)}</tbody></table></div></details></>}
      </section><section className="admin-card"><h2>Tasas de rendimiento</h2><p className="admin-muted">Porcentajes calculados por Resend.</p><div className="report-rates">{rates.map(([key, label]) => <div key={key}><div><span>{label}</span><strong>{n(totals[key])}{totals[key] === undefined ? "" : "%"}</strong></div><progress aria-label={`Tasa de ${label}`} max="100" value={Math.min(100, Math.max(0, totals[key] || 0))} /></div>)}</div></section></div>
      <section className="admin-card"><h2>Diagnóstico de entrega</h2><div className="report-diagnostics">{([["received", "Aceptados por Resend"], ["opened", "Aperturas totales"], ["clicked", "Clics totales"], ["delivery_delayed", "Con demora"], ["failed", "Fallidos"], ["suppressed", "Suprimidos"], ["bounced_permanent", "Rebotes permanentes"], ["bounced_transient", "Rebotes temporales"], ["bounced_undetermined", "Rebotes sin clasificar"], ["complained", "Quejas de spam"]] as const).map(([key, label]) => <div key={key}><span>{label}</span><strong>{n(totals[key])}</strong></div>)}</div></section>
      {!campaign && <section className="admin-card"><h2>Comparar campañas</h2>{!report.campaigns.length ? <p className="admin-empty">Todavía no hay campañas enviadas con actividad en este período.</p> : <div className="admin-table-wrap"><table><thead><tr><th>Campaña</th><th>Enviados</th><th>Entregados</th><th>Apertura</th><th>Clics</th><th>Rebotes</th></tr></thead><tbody>{report.campaigns.map((r) => <tr key={r.broadcast_id}><td><button className="admin-text-link" onClick={() => setCampaign(r.broadcast_id || "")}>{r.broadcast_name?.replace(/^\[Atlas\] /, "") || "Ver campaña"}</button></td><td>{n(r.sent)}</td><td>{n(r.delivered)}</td><td>{n(r.open_rate)}%</td><td>{n(r.click_rate)}%</td><td>{n(r.bounced)}</td></tr>)}</tbody></table></div>}</section>}
      <p className="report-footnote">Consultado: {new Date(report.fetchedAt).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })} · Hora de Argentina. Resend puede demorar hasta 15 minutos en actualizar sus métricas. Período devuelto por el proveedor: {report.start_date.slice(0, 10)} a {report.end_date.slice(0, 10)}; los informes generales están sujetos a la retención del plan.</p>
    </>}
    {campaign && <section className="admin-card"><div className="card-title"><h2>Detalle de la campaña</h2><button disabled={!recipients.length} className="admin-button" onClick={() => exportCsv(`atlas-${type}.csv`, [["Email / URL", "Eventos", "Tipo de rebote", "Clics únicos"], ...recipients.map((r) => [r.email || r.url, r.count ?? r.clicks, r.bounce_type, r.unique_clicks])])}><Download size={16} />Exportar filas cargadas</button></div><div className="report-detail-filters"><label>Resultado<select value={type} onChange={(e) => setType(e.target.value)}>{events.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>{type !== "links" && <form onSubmit={(e) => { e.preventDefault(); setSearch(email); }}><label>Buscar email<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email del destinatario" /></label><button className="admin-button">Buscar</button></form>}</div><p className="admin-muted">Detalle de toda la vida de la campaña, independientemente del filtro de fechas.</p>{recipientError && <div className="admin-error" role="alert">{recipientError}</div>}{recipientLoading && <p role="status">Cargando resultados…</p>}{!recipientLoading && !recipientError && !recipients.length ? <p className="admin-empty">No hay eventos de este tipo registrados.</p> : <div className="admin-table-wrap"><table><thead><tr><th>{type === "links" ? "Enlace" : "Destinatario"}</th><th>{type === "links" ? "Clics / únicos" : "Detalle"}</th></tr></thead><tbody>{recipients.map((r) => <tr key={r.id}><td className="report-url">{r.email || r.url}</td><td>{type === "links" ? `${n(r.clicks)} / ${n(r.unique_clicks)}` : r.bounce_type ? ({ permanent: "Permanente", transient: "Temporal", undetermined: "Sin clasificar" }[r.bounce_type] || r.bounce_type) : r.count ? `${n(r.count)} eventos` : "Registrado"}{r.clicked_links?.map((link) => <p className="report-url" key={link.url}>{link.url} · {n(link.clicks)} clics</p>)}</td></tr>)}</tbody></table></div>}{more && <button className="admin-button load-more" disabled={recipientLoading} onClick={() => void loadRecipients(cursor)}>Cargar más resultados</button>}</section>}
    <details className="admin-card report-glossary"><summary>Cómo interpretar estos datos</summary><p><strong>Entregados:</strong> el servidor del destinatario aceptó el email. No confirma que esté en la bandeja principal ni que haya sido leído.</p><p><strong>Aperturas y clics:</strong> son eventos de seguimiento. Los bloqueos de imágenes, la protección de privacidad y los escáneres de seguridad pueden afectar los números. Los valores únicos cuentan emails con al menos un evento; los totales incluyen repeticiones.</p><p><strong>Aceptados por Resend:</strong> solicitudes que el proveedor recibió para procesar. No son respuestas de clientes. Este panel no accede a tu bandeja de correo.</p><p><strong>Historia:</strong> los resultados corresponden a envíos de Resend. Importar contactos de Mailrelay no recrea sus métricas anteriores. Un guion indica que el proveedor no devolvió ese dato.</p></details>
  </div>;
}
