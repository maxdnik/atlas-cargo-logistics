import Image from "next/image";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, FileText, FolderOpen, Radar, Ship, UserRound } from "lucide-react";

const benefits = [
  { icon: Radar, title: "Cada embarque, en contexto", description: "Estado, ruta e hitos de la operación, desde la reserva hasta la entrega." },
  { icon: CalendarDays, title: "Fechas y reservas a mano", description: "Bookings, salidas y fechas estimadas de arribo para organizar los próximos pasos." },
  { icon: FolderOpen, title: "Documentación centralizada", description: "Factura comercial, packing list y documentos de transporte vinculados a cada carga." },
  { icon: UserRound, title: "Una vista para tu empresa", description: "Un espacio de consulta pensado para los embarques de cada importador o exportador." },
];

export default function PlatformShowcase() {
  return (
    <section className="platform section-space" id="plataforma" aria-labelledby="platform-title">
      <div className="container">
        <div className="platform-heading">
          <p className="eyebrow"><span /> PLATAFORMA ATLAS CARGO</p>
        </div>
        <div className="platform-grid">
          <div className="platform-copy">
            <h2 id="platform-title">Tus embarques.<br /><span>Toda la información,<br />en un solo lugar.</span></h2>
            <p className="platform-description">Un portal pensado para que importadores y exportadores consulten sus operaciones, fechas y documentación desde un mismo espacio.</p>
            <ul className="platform-benefits">
              {benefits.map(({ icon: Icon, title, description }) => (
                <li key={title}><Icon size={23} strokeWidth={1.5} aria-hidden="true" /><div><h3>{title}</h3><p>{description}</p></div></li>
              ))}
            </ul>
            <a className="button button-red" href="#contacto">Solicitar una presentación <ArrowUpRight size={19} aria-hidden="true" /></a>
            <p className="platform-note">Atlas coordina la operación. Vos consultás lo que necesitás.</p>
          </div>

          <figure className="portal-preview" aria-labelledby="portal-preview-caption">
            <div className="portal-window">
              <div className="portal-topbar">
                <Image src="/brand/atlas-cargo-logo.png" alt="Atlas Cargo" width={1464} height={426} sizes="138px" className="portal-logo" />
                <span><UserRound size={14} aria-hidden="true" /> Vista cliente</span>
              </div>
              <div className="portal-content">
                <div className="portal-title"><div><p>PORTAL DE CLIENTES</p><h3>Mis embarques</h3></div><span className="portal-example">Ejemplo</span></div>
                <div className="portal-summary"><div><span>En tránsito</span><strong>02</strong></div><div><span>En aduana</span><strong>01</strong></div><div><span>Entregados</span><strong>04</strong></div></div>
                <div className="portal-shipment">
                  <div className="portal-shipment-heading"><span><Ship size={16} aria-hidden="true" /> AT-260038</span><span className="portal-badge">En tránsito</span></div>
                  <div className="portal-route"><div><span>ORIGEN</span><strong>Shanghai</strong><small>China</small></div><ArrowRight size={22} aria-hidden="true" /><div><span>DESTINO</span><strong>Buenos Aires</strong><small>Argentina</small></div></div>
                  <div className="portal-detail-row"><span>Importación · Marítimo · 40 HC</span><strong>ETA 14 nov.</strong></div>
                  <ol className="portal-timeline" aria-label="Hitos del embarque de ejemplo"><li className="complete"><span><Check size={11} aria-hidden="true" /></span>Reserva</li><li className="complete"><span><Check size={11} aria-hidden="true" /></span>Salida</li><li className="current"><span />Arribo</li><li><span />Entrega</li></ol>
                </div>
                <div className="portal-documents"><div className="portal-documents-title"><FolderOpen size={16} aria-hidden="true" /><h4>Documentos del embarque</h4></div>{["Factura comercial", "Packing list", "Documento de transporte"].map((document) => <div className="portal-document" key={document}><FileText size={15} aria-hidden="true" /><span>{document}</span><span className="portal-file-type">PDF</span></div>)}</div>
              </div>
            </div>
            <figcaption id="portal-preview-caption">Vista ilustrativa con datos de ejemplo.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
