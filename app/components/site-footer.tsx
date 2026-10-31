import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/services";
import { INSTAGRAM_URL } from "@/lib/seo";

export default function SiteFooter() {
  return <footer className="footer"><div className="container">
    <div className="footer-main">
      <a href="/" aria-label="Atlas Cargo, inicio"><Image className="footer-logo" src="/brand/atlas-cargo-logo-dark.png" alt="Atlas Cargo" width={1000} height={251} sizes="(max-width: 700px) 200px, 260px" /></a>
      <p>Tu carga. Nuestro compromiso.</p>
      <a href="/#contacto" className="back-top">Cotizar carga <ArrowUpRight size={18} aria-hidden="true" /></a>
    </div>
    <div className="footer-services"><div><h2>Logística internacional</h2><nav aria-label="Servicios de Atlas Cargo">{services.map((service) => <a key={service.slug} href={`/servicios/${service.slug}`}>{service.name}</a>)}</nav></div>
      <div><h2>Atlas Cargo SRL</h2><p>Freight forwarder en Buenos Aires, Argentina.</p><a className="footer-contact" href="/#contacto">Contactar al equipo</a><a href="/servicios">Todos los servicios</a></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Atlas Cargo SRL. Todos los derechos reservados.</span><a href={INSTAGRAM_URL} className="footer-instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Atlas Cargo: @atlas.cargo.argentina (abre en una nueva pestaña)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg><span>@atlas.cargo.argentina</span></a><span>LOGÍSTICA INTERNACIONAL</span></div>
  </div></footer>;
}
