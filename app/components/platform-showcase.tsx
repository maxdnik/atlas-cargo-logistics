import Image from "next/image";
import { textFor, type Locale } from "@/lib/i18n";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, FileText, FolderOpen, Radar, Ship, UserRound } from "lucide-react";
export default function PlatformShowcase({ locale = "es" }: {
    locale?: Locale;
}) {
    const t = textFor(locale);
    const benefits = [
        { icon: Radar, title: t("Cada embarque, en contexto", "Every shipment, at a glance"), description: t("Estado, ruta e hitos de la operación, desde la reserva hasta la entrega.", "Status, route and shipment milestones, from booking to delivery.") },
        { icon: CalendarDays, title: t("Fechas y reservas a mano", "Dates and bookings at hand"), description: t("Bookings, salidas y fechas estimadas de arribo para organizar los próximos pasos.", "Bookings, departures and estimated arrival dates to help plan your next steps.") },
        { icon: FolderOpen, title: t("Documentación centralizada", "Documents in one place"), description: t("Factura comercial, packing list y documentos de transporte vinculados a cada carga.", "Commercial invoices, packing lists and transport documents linked to each shipment.") },
        { icon: UserRound, title: t("Una vista para tu empresa", "A view for your business"), description: t("Un espacio de consulta pensado para los embarques de cada importador o exportador.", "A dedicated space for each importer's or exporter's shipments.") },
    ];
    return (<section className="platform section-space" id="plataforma" aria-labelledby="platform-title">
      <div className="container">
        <div className="platform-heading">
          <p className="eyebrow"><span />{t(" PLATAFORMA ATLAS CARGO", " ATLAS CARGO PLATFORM")}</p>
        </div>
        <div className="platform-grid">
          <div className="platform-copy">
            <h2 id="platform-title">{t("Tus embarques.", "Your shipments.")}<br /><span>{t("Toda la información,", "All the information,")}<br />{t("en un solo lugar.", "in one place.")}</span></h2>
            <p className="platform-description">{t("Un portal pensado para que importadores y exportadores consulten sus operaciones, fechas y documentación desde un mismo espacio.", "A portal designed for importers and exporters to view their shipments, dates and documents in one place.")}</p>
            <ul className="platform-benefits">
              {benefits.map(({ icon: Icon, title, description }) => (<li key={title}><Icon size={23} strokeWidth={1.5} aria-hidden="true"/><div><h3>{title}</h3><p>{description}</p></div></li>))}
            </ul>
            <a className="button button-red" href="#contacto">{t("Solicitar una presentación ", "Request a demo ")}<ArrowUpRight size={19} aria-hidden="true"/></a>
            <p className="platform-note">{t("Atlas coordina la operación. Vos consultás lo que necesitás.", "Atlas coordinates your shipment. You access the information you need.")}</p>
          </div>

          <figure className="portal-preview" aria-labelledby="portal-preview-caption">
            <div className="portal-window">
              <div className="portal-topbar">
                <Image src="/brand/atlas-cargo-logo.png" alt="Atlas Cargo" width={1464} height={426} sizes="138px" className="portal-logo"/>
                <span><UserRound size={14} aria-hidden="true"/>{t(" Vista cliente", " Client view")}</span>
              </div>
              <div className="portal-content">
                <div className="portal-title"><div><p>{t("PORTAL DE CLIENTES", "CLIENT PORTAL")}</p><h3>{t("Mis embarques", "My shipments")}</h3></div><span className="portal-example">{t("Ejemplo", "Example")}</span></div>
                <div className="portal-summary"><div><span>{t("En tránsito", "In transit")}</span><strong>02</strong></div><div><span>{t("En aduana", "At customs")}</span><strong>01</strong></div><div><span>{t("Entregados", "Delivered")}</span><strong>04</strong></div></div>
                <div className="portal-shipment">
                  <div className="portal-shipment-heading"><span><Ship size={16} aria-hidden="true"/> AT-260038</span><span className="portal-badge">{t("En tránsito", "In transit")}</span></div>
                  <div className="portal-route"><div><span>{t("ORIGEN", "ORIGIN")}</span><strong>Shanghai</strong><small>China</small></div><ArrowRight size={22} aria-hidden="true"/><div><span>{t("DESTINO", "DESTINATION")}</span><strong>Buenos Aires</strong><small>Argentina</small></div></div>
                  <div className="portal-detail-row"><span>{t("Importación · Marítimo · 40 HC", "Import · Ocean · 40 HC")}</span><strong>{t("ETA 14 nov.", "ETA Nov 14")}</strong></div>
                  <ol className="portal-timeline" aria-label={t("Hitos del embarque de ejemplo", "Example shipment milestones")}><li className="complete"><span><Check size={11} aria-hidden="true"/></span>{t("Reserva", "Booking")}</li><li className="complete"><span><Check size={11} aria-hidden="true"/></span>{t("Salida", "Departure")}</li><li className="current"><span />{t("Arribo", "Arrival")}</li><li><span />{t("Entrega", "Delivery")}</li></ol>
                </div>
                <div className="portal-documents"><div className="portal-documents-title"><FolderOpen size={16} aria-hidden="true"/><h4>{t("Documentos del embarque", "Shipment documents")}</h4></div>{[t("Factura comercial", "Commercial invoice"), "Packing list", t("Documento de transporte", "Transport document")].map((document) => <div className="portal-document" key={document}><FileText size={15} aria-hidden="true"/><span>{document}</span><span className="portal-file-type">PDF</span></div>)}</div>
              </div>
            </div>
            <figcaption id="portal-preview-caption">{t("Vista ilustrativa con datos de ejemplo.", "Illustrative view with sample data.")}</figcaption>
          </figure>
        </div>
      </div>
    </section>);
}
