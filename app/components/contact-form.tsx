"use client";
import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { textFor, type Locale } from "@/lib/i18n";
export default function ContactForm({ locale = "es" }: {
    locale?: Locale;
}) {
    const t = textFor(locale);
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const submitting = useRef(false);
    const submission = useRef<{
        payload: string;
        id: string;
    } | null>(null);
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting.current)
            return;
        submitting.current = true;
        const form = event.currentTarget;
        const data = new FormData(form);
        const payload = JSON.stringify({ name: data.get("name"), company: data.get("company"), email: data.get("email"), phone: data.get("phone"), service: data.get("service"), message: data.get("message") });
        if (submission.current?.payload !== payload)
            submission.current = { payload, id: crypto.randomUUID() };
        setStatus("sending");
        try {
            const response = await fetch("/api/contact", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...JSON.parse(payload), submissionId: submission.current.id }),
                signal: AbortSignal.timeout(20000),
            });
            const result = await response.json();
            if (!response.ok || !result.success)
                throw new Error("Contact request failed");
            form.reset();
            submission.current = null;
            setStatus("success");
        }
        catch {
            setStatus("error");
        }
        finally {
            submitting.current = false;
        }
    }
    return <form className="contact-form" onSubmit={handleSubmit} aria-label={t("Consulta comercial", "Business inquiry")} aria-busy={status === "sending"}>
    <h3>{t("Hablemos de tu operación", "Let's talk about your shipment")}</h3><p className="form-caption">{t("Completá tus datos y el equipo se pondrá en contacto.", "Fill in your details and our team will get in touch.")}</p>
    <div className="form-grid">
      <label htmlFor="name">{t("Nombre y apellido ", "Full name ")}<span>*</span><input id="name" name="name" autoComplete="name" placeholder={t("Tu nombre", "Your name")} required maxLength={120}/></label>
      <label htmlFor="company">{t("Empresa", "Company")}<input id="company" name="company" autoComplete="organization" placeholder={t("Nombre de tu empresa", "Your company name")} maxLength={160}/></label>
      <label htmlFor="email">Email <span>*</span><input id="email" name="email" type="email" autoComplete="email" placeholder={t("nombre@empresa.com", "name@company.com")} required maxLength={254}/></label>
      <label htmlFor="phone">{t("Teléfono", "Phone")}<input id="phone" name="phone" type="tel" autoComplete="tel" placeholder={t("Código de área + número", "Country code + number")} maxLength={50}/></label>
      <label className="full-width" htmlFor="service">{t("¿Qué servicio necesitás? ", "Which service do you need? ")}<span>*</span><select id="service" name="service" defaultValue="" required><option value="" disabled>{t("Seleccioná un servicio", "Select a service")}</option><option>{t("Carga marítima", "Ocean freight")}</option><option>{t("Carga aérea", "Air freight")}</option><option>{t("Transporte terrestre", "Road freight")}</option><option>{t("Despacho y gestión aduanera", "Customs coordination")}</option><option>{t("Operaciones especiales", "Project cargo")}</option><option>{t("Seguimiento operativo", "Shipment tracking")}</option><option>{t("Asesoramiento integral", "Logistics advice")}</option></select></label>
      <label className="full-width" htmlFor="message">{t("Contanos sobre tu carga ", "Tell us about your cargo ")}<span>*</span><textarea id="message" name="message" rows={4} placeholder={t("Origen, destino, tipo de carga y fecha estimada…", "Origin, destination, type of cargo and estimated date…")} required maxLength={5000}/></label>
    </div>
    <div className="form-bottom"><span>{t("* Campos obligatorios", "* Required fields")}</span><button type="submit" className="button button-red" disabled={status === "sending"}>{status === "sending" ? <>{t("Enviando ", "Sending ")}<LoaderCircle size={19} className="spinner" aria-hidden="true"/></> : <>{t("Enviar consulta ", "Send inquiry ")}<ArrowUpRight size={19} aria-hidden="true"/></>}</button></div>
    <div aria-live="polite" aria-atomic="true">{status === "success" && <p className="form-message success"><CheckCircle2 size={19} aria-hidden="true"/>{t(" Recibimos tu consulta. Nuestro equipo se pondrá en contacto con vos.", " We have received your inquiry. Our team will get in touch with you.")}</p>}{status === "error" && <p className="form-message error">{t("No pudimos confirmar el envío. Tus datos siguen en el formulario; intentá nuevamente en unos momentos.", "We couldn't confirm your submission. Your details are still in the form; please try again in a moment.")}</p>}</div>
  </form>;
}
