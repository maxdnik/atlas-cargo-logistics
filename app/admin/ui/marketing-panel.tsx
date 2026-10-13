"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Mail,
  Users,
  Settings2,
  ArrowUpRight,
  LogOut,
  Plus,
  ArrowLeft,
  Send,
  Save,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  defaultCampaign,
  renderCampaign,
  type CampaignContent,
} from "@/lib/marketing/schema";

type View = "campaigns" | "contacts" | "settings";
type Campaign = {
  revision?: string;
  id: string;
  name: string;
  subject?: string;
  status: string;
  created_at: string;
  sent_at?: string;
  content?: CampaignContent | null;
};
type Contact = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  unsubscribed: boolean;
};
type Setup = {
  configured: boolean;
  segmentConfigured: boolean;
  verified: boolean;
  domainStatus: string;
  from: string;
  replyTo: string;
  records: { name: string; type: string; value: string; status: string }[];
};
async function api(path: string, body?: unknown) {
  const r = await fetch(
    `/api/admin/${path}`,
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : { cache: "no-store" },
  );
  const d = await r.json();
  if (r.status === 401) {
    window.location.assign("/admin/login");
    throw Error("Tu sesión venció.");
  }
  if (!r.ok) throw Error(d.error || "No pudimos completar la operación.");
  return d;
}
function date(value: string) {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
const statuses: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviada",
  queued: "En cola",
  sending: "Enviando",
  scheduled: "Programada",
  failed: "Falló",
  canceled: "Cancelada",
};

export default function MarketingPanel({ testEmail }: { testEmail: string }) {
  const [view, setView] = useState<View>("campaigns");
  const [setup, setSetup] = useState<Setup | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editor, setEditor] = useState<Campaign | null>(null);
  const [content, setContent] = useState<CampaignContent>(defaultCampaign);
  const [saved, setSaved] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [preview, setPreview] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [query, setQuery] = useState("");
  const operation = useRef<{
    kind: string;
    key: string;
    payload: string;
  } | null>(null);
  const dirty = Boolean(editor) && JSON.stringify(content) !== saved;
  const editable = editor?.status === "draft";
  const load = useCallback(async (tab: View, after?: string) => {
    setLoading(true);
    setError("");
    try {
      if (tab === "settings") {
        setSetup(await api("marketing/status"));
        setMore(false);
      } else {
        const d = await api(
          `marketing/${tab}${after ? `?after=${encodeURIComponent(after)}` : ""}`,
        );
        if (tab === "campaigns")
          setCampaigns((p) => (after ? [...p, ...d.data] : d.data));
        else setContacts((p) => (after ? [...p, ...d.data] : d.data));
        setCursor(d.nextCursor);
        setMore(d.hasMore);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await api("marketing/status");
        if (active) setSetup(d);
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : "Error de conexión.");
      }
      await load("campaigns");
    })();
    return () => {
      active = false;
    };
  }, [load]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function keyFor(kind: string, payload: string) {
    if (
      operation.current?.kind !== kind ||
      operation.current.payload !== payload
    )
      operation.current = { kind, payload, key: crypto.randomUUID() };
    return operation.current.key;
  }
  async function task(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos completar la operación.",
      );
    } finally {
      setBusy(false);
    }
  }
  function navigate(next: View) {
    if (
      dirty &&
      !window.confirm("Tenés cambios sin guardar. ¿Querés salir del editor?")
    )
      return;
    setEditor(null);
    setConfirm(false);
    setUncertain(false);
    setView(next);
    setMessage("");
    setQuery("");
    void load(next);
  }
  function newCampaign() {
    setUncertain(false);
    setContent({ ...defaultCampaign });
    setEditor({
      id: "new",
      name: defaultCampaign.name,
      status: "draft",
      created_at: new Date().toISOString(),
    });
    setSaved("");
    setConfirm(false);
    setMessage("");
    setError("");
  }
  async function openCampaign(id: string) {
    await task(async () => {
      const d = await api(`marketing/campaigns/${id}`);
      if (!d.content)
        throw Error("Esta campaña no tiene contenido editable de Atlas.");
      setUncertain(false);
      setEditor(d);
      setContent(d.content);
      setSaved(JSON.stringify(d.content));
      setConfirm(false);
    });
  }
  async function save() {
    await task(async () => {
      if (!editor) return;
      const raw = JSON.stringify(content);
      if (editor.id === "new") setUncertain(true);
      const d =
        editor.id === "new"
          ? await api("marketing/campaigns", {
              content,
              requestId: keyFor("create", raw),
            })
          : await api(`marketing/campaigns/${editor.id}`, {
              action: "save",
              content,
            });
      setUncertain(false);
      setEditor({
        ...editor,
        id: d.id,
        name: content.name,
        subject: content.subject,
        revision: d.revision,
      });
      setSaved(raw);
      operation.current = null;
      setMessage("Borrador guardado en Resend.");
    });
  }
  async function test() {
    await task(async () => {
      if (!editor || editor.id === "new" || dirty)
        throw Error("Guardá los cambios antes de enviar la prueba.");
      await api(`marketing/campaigns/${editor.id}`, {
        action: "test",
        requestId: keyFor("test", editor.id + saved),
      });
      operation.current = null;
      setMessage(
        `Prueba aceptada por Resend para ${testEmail}. Revisá la bandeja de entrada y Spam.`,
      );
    });
  }
  const filtered = contacts.filter((c) =>
    `${c.email} ${c.first_name} ${c.last_name}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  let emailPreview = "";
  try {
    emailPreview = renderCampaign(content, true);
  } catch {
    emailPreview =
      '<p style="font-family:Arial;padding:24px">Completá los campos para ver el email.</p>';
  }
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/admin" className="admin-wordmark">
          ATLAS <span>CARGO</span>
          <small>LOGISTICS</small>
        </a>
        <p className="admin-section-label">ESPACIO DE TRABAJO</p>
        <nav aria-label="Administración">
          {(
            [
              ["campaigns", Mail, "Campañas"],
              ["contacts", Users, "Contactos"],
              ["settings", Settings2, "Configuración"],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              disabled={busy}
              className={view === id ? "selected" : ""}
              onClick={() => navigate(id)}
            >
              <Icon size={18} />
              {label}
              {id === "campaigns" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/" target="_blank" rel="noopener">
            Ver sitio de Atlas <ArrowUpRight size={16} />
          </a>
          <button
            onClick={() => {
              if (dirty && !window.confirm("¿Salir sin guardar los cambios?"))
                return;
              void task(async () => {
                await api("auth", { action: "logout" });
                window.location.assign("/admin/login");
              });
            }}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <span>
            ADMINISTRACIÓN <span>/</span> MARKETING
          </span>
          <div>
            <span
              className={`connection-dot ${setup?.verified ? "online" : ""}`}
            />
            {setup?.verified ? "Resend conectado" : "Configuración pendiente"}
          </div>
        </header>
        <main className="admin-main">
          <div className="admin-page-heading">
            <div>
              <p className="admin-kicker">ATLAS CARGO LOGISTICS</p>
              <h1>
                {editor
                  ? "Prepará tu próxima campaña"
                  : view === "campaigns"
                    ? "Conectá con tus clientes."
                    : view === "contacts"
                      ? "Tu red de contactos."
                      : "Todo listo para enviar."}
              </h1>
              <p>
                {editor
                  ? "Un mensaje claro. La identidad de Atlas. Una nueva oportunidad."
                  : view === "campaigns"
                    ? "Creá y administrá tus campañas de email desde un solo lugar."
                    : view === "contacts"
                      ? "Una lista exclusiva para las comunicaciones de Atlas Cargo."
                      : "Revisá el remitente y la autenticación del dominio."}
              </p>
            </div>
            {!editor && view === "campaigns" && (
              <button className="admin-button primary" onClick={newCampaign}>
                <Plus size={18} />
                Nueva campaña
              </button>
            )}
          </div>
          {error && (
            <div className="admin-error" role="alert">
              {error}
            </div>
          )}
          {message && (
            <div className="admin-success" role="status">
              {message}
            </div>
          )}
          {setup && !setup.verified && view !== "settings" && (
            <div className="admin-notice">
              <div>
                <strong>Terminemos de conectar tu dominio.</strong>
                <p>
                  Podés preparar campañas. Los envíos se habilitan cuando Resend
                  verifique Atlas.
                </p>
              </div>
              <button
                className="admin-text-link"
                onClick={() => navigate("settings")}
              >
                Ver configuración →
              </button>
            </div>
          )}
          {editor ? (
            <>
              <div className="editor-toolbar">
                <button
                  className="admin-text-link"
                  onClick={() => navigate("campaigns")}
                >
                  <ArrowLeft size={16} />
                  Campañas
                </button>
                <div>
                  <span className={`admin-status ${editor.status}`}>
                    {statuses[editor.status] || editor.status}
                  </span>
                  <button
                    className="admin-button"
                    onClick={() => setPreview(!preview)}
                  >
                    <Eye size={16} />
                    {preview ? "Volver al editor" : "Vista previa"}
                  </button>
                  {editable && (
                    <button
                      className="admin-button primary"
                      disabled={busy || !dirty || uncertain}
                      onClick={save}
                    >
                      <Save size={16} />
                      {busy ? "Guardando…" : "Guardar borrador"}
                    </button>
                  )}
                </div>
              </div>
              {uncertain && (
                <div className="admin-notice">
                  El resultado requiere revisión. Volvé a Campañas y actualizá
                  la lista antes de repetir la operación.
                </div>
              )}
              <div
                className={`admin-composer ${preview ? "preview-only" : ""}`}
              >
                {!preview && (
                  <section className="admin-card editor-fields">
                    <h2>El mensaje</h2>
                    <p className="admin-muted">
                      Editá el contenido. El diseño se adapta automáticamente.
                    </p>
                    <fieldset disabled={!editable || busy}>
                      {(
                        [
                          ["name", "Nombre interno"],
                          ["subject", "Asunto"],
                          ["preview", "Texto de vista previa"],
                          ["title", "Título del email"],
                        ] as const
                      ).map(([key, label]) => (
                        <label key={key}>
                          {label}
                          <input
                            value={content[key]}
                            maxLength={
                              key === "name"
                                ? 60
                                : key === "subject"
                                  ? 150
                                  : key === "title"
                                    ? 120
                                    : 180
                            }
                            onChange={(e) =>
                              setContent({ ...content, [key]: e.target.value })
                            }
                          />
                        </label>
                      ))}
                      <label>
                        Mensaje
                        <textarea
                          rows={8}
                          maxLength={6000}
                          value={content.message}
                          onChange={(e) =>
                            setContent({ ...content, message: e.target.value })
                          }
                        />
                      </label>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={content.services}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              services: e.target.checked,
                            })
                          }
                        />
                        Incluir servicios marítimos, aéreos y terrestres
                      </label>
                      <label>
                        Texto del botón
                        <input
                          value={content.cta}
                          maxLength={50}
                          onChange={(e) =>
                            setContent({ ...content, cta: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Enlace del botón
                        <input
                          type="url"
                          value={content.url}
                          onChange={(e) =>
                            setContent({ ...content, url: e.target.value })
                          }
                        />
                      </label>
                    </fieldset>
                  </section>
                )}
                <section className="admin-card editor-preview">
                  <div className="preview-label">
                    <span className="connection-dot online" />
                    VISTA PREVIA DEL EMAIL
                  </div>
                  <iframe
                    title="Vista previa de la campaña"
                    sandbox=""
                    srcDoc={emailPreview}
                  />
                </section>
              </div>
              <section className="admin-card send-panel">
                <div>
                  <h2>Primero, una prueba.</h2>
                  <p>
                    Revisá cómo llega a <strong>{testEmail}</strong> antes de
                    enviar a tus contactos.
                  </p>
                  {dirty && (
                    <small>
                      Guardá los cambios para enviar la versión actual.
                    </small>
                  )}
                </div>
                <button
                  className="admin-button"
                  disabled={
                    busy || dirty || editor.id === "new" || !setup?.verified
                  }
                  onClick={test}
                >
                  <Mail size={17} />
                  Enviar prueba
                </button>
              </section>
              {editable && (
                <section className="admin-card send-panel">
                  <div>
                    <h2>Enviar a la lista de Atlas</h2>
                    <p>
                      Se respetarán las bajas y exclusiones registradas en
                      Resend.
                    </p>
                  </div>
                  <button
                    className="admin-button primary"
                    disabled={
                      busy ||
                      dirty ||
                      uncertain ||
                      editor.id === "new" ||
                      !setup?.verified
                    }
                    onClick={() => {
                      setConfirmation("");
                      setConfirm(true);
                    }}
                  >
                    <Send size={17} />
                    Revisar envío
                  </button>
                </section>
              )}
              {confirm && (
                <div className="admin-modal-backdrop">
                  <section
                    className="admin-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="send-title"
                  >
                    <h2 id="send-title">Confirmar campaña</h2>
                    <p>
                      Se enviará <strong>{content.subject}</strong> a los
                      contactos suscriptos de la lista de Atlas Cargo. El envío
                      no se puede deshacer.
                    </p>
                    <label>
                      Escribí el asunto para confirmar
                      <input
                        autoFocus
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                      />
                    </label>
                    <div className="admin-actions">
                      <button
                        className="admin-button"
                        disabled={busy}
                        onClick={() => setConfirm(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        className="admin-button primary"
                        disabled={busy || confirmation !== content.subject}
                        onClick={() =>
                          void task(async () => {
                            setUncertain(true);
                            setConfirm(false);
                            await api(`marketing/campaigns/${editor.id}`, {
                              action: "send",
                              confirm: confirmation,
                              revision: editor.revision,
                            });
                            setUncertain(false);
                            setConfirm(false);
                            setEditor({ ...editor, status: "queued" });
                            setMessage(
                              "Resend aceptó la campaña. Actualizá el estado para consultar el avance.",
                            );
                          })
                        }
                      >
                        {busy ? "Procesando…" : "Enviar campaña"}
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </>
          ) : (
            <>
              {view === "campaigns" && (
                <>
                  <div className="admin-metrics">
                    <div>
                      <span>CAMPAÑAS CARGADAS</span>
                      <strong>{campaigns.length}</strong>
                      <small>
                        {more
                          ? "Hay más campañas para cargar"
                          : "En tu lista de Atlas"}
                      </small>
                    </div>
                    <div>
                      <span>LISTAS PARA EDITAR</span>
                      <strong>
                        {campaigns.filter((c) => c.status === "draft").length}
                      </strong>
                      <small>Borradores cargados</small>
                    </div>
                    <div className="metric-brand">
                      <span>UNA MARCA. CADA CONTACTO.</span>
                      <strong>Atlas Cargo.</strong>
                      <small>Tu carga. Nuestro compromiso.</small>
                    </div>
                  </div>
                  <section className="admin-card">
                    <div className="card-title">
                      <h2>Tus campañas</h2>
                      <button
                        aria-label="Actualizar campañas"
                        className="admin-icon-button"
                        onClick={() => void load(view)}
                        disabled={loading}
                      >
                        <RefreshCw size={17} />
                      </button>
                    </div>
                    {loading && !campaigns.length ? (
                      <p className="admin-empty">Cargando campañas…</p>
                    ) : !campaigns.length ? (
                      <div className="admin-empty">
                        <Mail size={32} />
                        <h3>Tu próximo cliente puede estar a un email.</h3>
                        <p>
                          Empezá con la presentación de servicios de Atlas y
                          adaptala a tu propuesta.
                        </p>
                        <button
                          className="admin-button primary"
                          onClick={newCampaign}
                        >
                          Crear primera campaña
                        </button>
                      </div>
                    ) : (
                      <div className="admin-table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>CAMPAÑA</th>
                              <th>ESTADO</th>
                              <th>CREADA</th>
                              <th />
                            </tr>
                          </thead>
                          <tbody>
                            {campaigns.map((c) => (
                              <tr key={c.id}>
                                <td>
                                  <strong>
                                    {c.name?.replace(/^\[Atlas\] /, "") ||
                                      "Sin título"}
                                  </strong>
                                </td>
                                <td>
                                  <span className={`admin-status ${c.status}`}>
                                    {statuses[c.status] || c.status}
                                  </span>
                                </td>
                                <td>{date(c.created_at)}</td>
                                <td>
                                  <button
                                    className="admin-text-link"
                                    disabled={busy}
                                    onClick={() => openCampaign(c.id)}
                                  >
                                    {c.status === "draft" ? "Editar" : "Ver"} →
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {more && (
                      <button
                        className="admin-button load-more"
                        disabled={loading}
                        onClick={() => void load(view, cursor)}
                      >
                        Cargar más
                      </button>
                    )}
                  </section>
                </>
              )}
              {view === "contacts" && (
                <>
                  <section className="admin-card">
                    <div className="card-title">
                      <h2>Contactos de Atlas</h2>
                      <button
                        className="admin-icon-button"
                        aria-label="Actualizar contactos"
                        onClick={() => void load(view)}
                        disabled={loading}
                      >
                        <RefreshCw size={17} />
                      </button>
                    </div>
                    <input
                      className="contact-search"
                      aria-label="Buscar entre contactos cargados"
                      placeholder="Buscar entre los contactos cargados…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    {loading && !contacts.length ? (
                      <p className="admin-empty">Cargando contactos…</p>
                    ) : !filtered.length ? (
                      <div className="admin-empty">
                        <Users size={30} />
                        <h3>
                          {contacts.length
                            ? "Sin coincidencias"
                            : "Tu lista está lista para crecer."}
                        </h3>
                        <p>
                          {contacts.length
                            ? "Probá con otro nombre o email."
                            : "Agregá tu primer contacto. La base de Mailrelay todavía no se importó."}
                        </p>
                      </div>
                    ) : (
                      <div className="admin-table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>CONTACTO</th>
                              <th>EMAIL</th>
                              <th>SUSCRIPCIÓN</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((c) => (
                              <tr key={c.id}>
                                <td>
                                  {`${c.first_name || ""} ${c.last_name || ""}`.trim() ||
                                    "Sin nombre"}
                                </td>
                                <td>{c.email}</td>
                                <td>
                                  <span
                                    className={`admin-status ${c.unsubscribed ? "failed" : "sent"}`}
                                  >
                                    {c.unsubscribed ? "De baja" : "Suscripto"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {more && (
                      <button
                        className="admin-button load-more"
                        disabled={loading}
                        onClick={() => void load(view, cursor)}
                      >
                        Cargar más contactos
                      </button>
                    )}
                  </section>
                  <section className="admin-card add-contact">
                    <h2>Agregar un contacto</h2>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const fd = new FormData(form);
                        void task(async () => {
                          await api("marketing/contacts", {
                            email: fd.get("email"),
                            firstName: fd.get("firstName"),
                            lastName: fd.get("lastName"),
                            consent: fd.get("consent") === "on",
                          });
                          form.reset();
                          setMessage("Contacto agregado a la lista de Atlas.");
                          await load("contacts");
                        });
                      }}
                    >
                      <div className="admin-form-row">
                        <label>
                          Nombre
                          <input name="firstName" maxLength={80} />
                        </label>
                        <label>
                          Apellido
                          <input name="lastName" maxLength={80} />
                        </label>
                        <label>
                          Email
                          <input
                            name="email"
                            type="email"
                            required
                            maxLength={254}
                          />
                        </label>
                      </div>
                      <label className="admin-checkbox">
                        <input name="consent" type="checkbox" required />
                        Este contacto autorizó recibir comunicaciones
                        comerciales de Atlas.
                      </label>
                      <button
                        className="admin-button primary"
                        disabled={busy || !setup?.segmentConfigured}
                      >
                        Agregar contacto
                      </button>
                    </form>
                  </section>
                </>
              )}
              {view === "settings" && (
                <>
                  <section className="admin-card settings-card">
                    <div className="card-title">
                      <h2>Conexión de email</h2>
                      <button
                        className="admin-button"
                        disabled={loading}
                        onClick={() => void load("settings")}
                      >
                        <RefreshCw size={16} />
                        Comprobar
                      </button>
                    </div>
                    <dl>
                      <div>
                        <dt>Proveedor</dt>
                        <dd>Resend</dd>
                      </div>
                      <div>
                        <dt>Remitente</dt>
                        <dd>{setup?.from || "Atlas Cargo Logistics"}</dd>
                      </div>
                      <div>
                        <dt>Respuestas</dt>
                        <dd>
                          {setup?.replyTo ||
                            "maximo.dimnik@atlas-cargo-logistics.com"}
                        </dd>
                      </div>
                      <div>
                        <dt>Dominio</dt>
                        <dd>
                          <span
                            className={`admin-status ${setup?.verified ? "sent" : "draft"}`}
                          >
                            {setup?.verified
                              ? "Verificado"
                              : setup?.domainStatus || "Pendiente"}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt>Lista de contactos</dt>
                        <dd>
                          {setup?.segmentConfigured
                            ? "Atlas · Configurada"
                            : "Pendiente de conexión"}
                        </dd>
                      </div>
                    </dl>
                  </section>
                  {!setup?.verified && (
                    <section className="admin-card settings-card">
                      <h2>Verificación del dominio</h2>
                      <p>
                        Para enviar como Atlas, Resend debe comprobar los
                        registros de su dominio. Esto ayuda a que los servidores
                        de correo reconozcan al remitente.
                      </p>
                      {Boolean(setup?.records.length) && (
                        <div className="admin-table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>TIPO</th>
                                <th>NOMBRE</th>
                                <th>VALOR</th>
                                <th>ESTADO</th>
                              </tr>
                            </thead>
                            <tbody>
                              {setup?.records.map((r, i) => (
                                <tr key={i}>
                                  <td>{r.type}</td>
                                  <td>{r.name}</td>
                                  <td className="dns-value">{r.value}</td>
                                  <td>{r.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <p className="admin-muted">
                        La verificación no garantiza llegar a la bandeja
                        principal. También influyen la calidad de la lista, las
                        bajas y la reputación del remitente.
                      </p>
                    </section>
                  )}
                </>
              )}
            </>
          )}
        </main>
        <footer className="admin-footer">
          ATLAS CARGO LOGISTICS <span>Tu carga. Nuestro compromiso.</span>
        </footer>
      </div>
    </div>
  );
}
