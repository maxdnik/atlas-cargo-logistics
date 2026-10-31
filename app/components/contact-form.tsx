"use client";
import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const submitting = useRef(false);
  const submission = useRef<{ payload: string; id: string } | null>(null);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = JSON.stringify({ name: data.get("name"), company: data.get("company"), email: data.get("email"), phone: data.get("phone"), service: data.get("service"), message: data.get("message") });
    if (submission.current?.payload !== payload) submission.current = { payload, id: crypto.randomUUID() };
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...JSON.parse(payload), submissionId: submission.current.id }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error("Contact request failed");
      form.reset();
      submission.current = null;
      setStatus("success");
    } catch { setStatus("error"); }
    finally { submitting.current = false; }
  }
  return <form className="contact-form" onSubmit={handleSubmit} aria-label="Consulta comercial" aria-busy={status === "sending"}>
    <h3>Hablemos de tu operación</h3><p className="form-caption">Completá tus datos y el equipo se pondrá en contacto.</p>
    <div className="form-grid">
      <label htmlFor="name">Nombre y apellido <span>*</span><input id="name" name="name" autoComplete="name" placeholder="Tu nombre" required maxLength={120} /></label>
      <label htmlFor="company">Empresa<input id="company" name="company" autoComplete="organization" placeholder="Nombre de tu empresa" maxLength={160} /></label>
      <label htmlFor="email">Email <span>*</span><input id="email" name="email" type="email" autoComplete="email" placeholder="nombre@empresa.com" required maxLength={254} /></label>
      <label htmlFor="phone">Teléfono<input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Código de área + número" maxLength={50} /></label>
      <label className="full-width" htmlFor="service">¿Qué servicio necesitás? <span>*</span><select id="service" name="service" defaultValue="" required><option value="" disabled>Seleccioná un servicio</option><option>Carga marítima</option><option>Carga aérea</option><option>Transporte terrestre</option><option>Despacho y gestión aduanera</option><option>Operaciones especiales</option><option>Seguimiento operativo</option><option>Asesoramiento integral</option></select></label>
      <label className="full-width" htmlFor="message">Contanos sobre tu carga <span>*</span><textarea id="message" name="message" rows={4} placeholder="Origen, destino, tipo de carga y fecha estimada…" required maxLength={5000} /></label>
    </div>
    <div className="form-bottom"><span>* Campos obligatorios</span><button type="submit" className="button button-red" disabled={status === "sending"}>{status === "sending" ? <>Enviando <LoaderCircle size={19} className="spinner" aria-hidden="true" /></> : <>Enviar consulta <ArrowUpRight size={19} aria-hidden="true" /></>}</button></div>
    <div aria-live="polite" aria-atomic="true">{status === "success" && <p className="form-message success"><CheckCircle2 size={19} aria-hidden="true" /> Recibimos tu consulta. Nuestro equipo se pondrá en contacto con vos.</p>}{status === "error" && <p className="form-message error">No pudimos confirmar el envío. Tus datos siguen en el formulario; intentá nuevamente en unos momentos.</p>}</div>
  </form>;
}
