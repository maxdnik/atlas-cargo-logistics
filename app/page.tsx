import Image from "next/image";
import { ArrowDown, ArrowUpRight, Check, Cog, FileCheck2, Globe2, MapPin, Plane, Radar, Ship, Truck } from "lucide-react";
import SiteHeader from "./components/site-header";
import ContactForm from "./components/contact-form";
import PlatformShowcase from "./components/platform-showcase";

const instagramUrl = "https://www.instagram.com/atlas.cargo.argentina/";

function InstagramIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
}

const transportServices = [
  { number: "01", title: "Transporte marítimo", claim: "Conectamos tu negocio con el mundo.", description: "Coordinación de importaciones y exportaciones. Contenedores completos (FCL), carga consolidada (LCL) y seguimiento de cada embarque.", image: "/images/port.webp", alt: "Buque portacontenedores junto a las grúas de un puerto al atardecer", icon: Ship },
  { number: "02", title: "Transporte aéreo", claim: "Cada hora cuenta.", description: "Envíos para cargas con plazos exigentes. Repuestos, equipos y mercadería, con coordinación documental y operativa.", image: "/images/air.webp", alt: "Avión de carga y pallets en una plataforma de carga aeroportuaria", icon: Plane },
  { number: "03", title: "Transporte terrestre", claim: "Conectamos cada tramo.", description: "Coordinación de retiros y entregas. Conectamos puertos, aeropuertos, depósitos y plantas con tu destino final.", image: "/images/ground.webp", alt: "Camión de carga junto a un centro logístico", icon: Truck },
];
const complementaryServices = [
  { title: "Gestión aduanera", description: "Acompañamiento documental y coordinación para tus operaciones de importación y exportación.", icon: FileCheck2 },
  { title: "Operaciones especiales", description: "Logística a la medida de tu proyecto: maquinaria, equipos y cargas con requerimientos particulares.", icon: Cog },
  { title: "Seguimiento operativo", description: "Comunicación directa, coordinación entre las partes y visibilidad durante cada etapa de tu operación.", icon: Radar },
];

export default function Home() {
  return <>
    <a className="skip-link" href="#contenido">Ir al contenido</a>
    <SiteHeader />
    <main id="contenido">
      <section className="hero" id="inicio" aria-labelledby="hero-title">
        <Image className="hero-image" src="/images/port.webp" alt="" fill sizes="100vw" loading="eager" fetchPriority="high" />
        <div className="hero-shade" />
        <div className="container hero-content">
          <p className="eyebrow light"><span /> LOGÍSTICA INTERNACIONAL</p>
          <h1 id="hero-title">Tu carga.<br /><span>Nuestro<br className="hero-break" /> compromiso.</span></h1>
          <p className="hero-description">Soluciones de transporte y coordinación logística para empresas. De origen a destino, con un equipo cerca.</p>
          <div className="hero-actions">
            <a className="button button-red" href="#contacto">Conversemos sobre tu carga <ArrowUpRight size={20} aria-hidden="true" /></a>
            <a className="hero-link" href="#plataforma">Conocé nuestra plataforma <ArrowDown size={18} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="hero-bottom container"><div className="transport-modes"><span>Aéreo</span><i /><span>Marítimo</span><i /><span>Terrestre</span></div><span className="hero-location">BUENOS AIRES, ARGENTINA <Globe2 size={17} aria-hidden="true" /></span></div>
      </section>

      <section className="services section-space" id="servicios" aria-labelledby="services-title">
        <div className="container">
          <div className="section-intro"><div><p className="eyebrow"><span /> NUESTROS SERVICIOS</p><h2 id="services-title">Cada carga, una solución.<br /><span className="muted-heading">Cada etapa, un equipo.</span></h2></div><p>Integramos transporte, documentación y seguimiento para que tu operación avance con claridad.</p></div>
          <div className="transport-grid">
            {transportServices.map(({ number, title, claim, description, image, alt, icon: Icon }) => <article className="transport-card" key={number}>
              <div className="service-image"><Image src={image} alt={alt} fill sizes="(max-width: 700px) 100vw, 33vw" /><span className="service-number">{number} /</span><span className="service-icon"><Icon size={25} strokeWidth={1.5} aria-hidden="true" /></span></div>
              <div className="service-body"><p className="service-label">{title}</p><h3>{claim}</h3><p>{description}</p><a href="#contacto" className="text-link" aria-label={`Consultar por ${title.toLowerCase()}`}>Consultar servicio <ArrowUpRight size={19} aria-hidden="true" /></a></div>
            </article>)}
          </div>
          <div className="complementary-grid">{complementaryServices.map(({ title, description, icon: Icon }) => <article className="complementary-service" key={title}><Icon size={29} strokeWidth={1.4} aria-hidden="true" /><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
        </div>
      </section>

      <PlatformShowcase />

      <section className="about section-space" id="nosotros" aria-labelledby="about-title">
        <div className="container about-grid">
          <div className="about-heading"><p className="eyebrow light"><span /> SOMOS ATLAS CARGO SRL</p><h2 id="about-title">El mundo se mueve.<br />Nosotros estamos<br /><span>cerca.</span></h2><p>Un equipo cercano para operaciones complejas. Entendemos lo que necesita tu negocio y coordinamos cada detalle para acompañar tu carga de principio a fin.</p><a href="#contacto" className="text-link light-link">Hablemos de tu operación <ArrowUpRight size={20} aria-hidden="true" /></a></div>
          <div className="about-values">
            <div><span className="value-number">01</span><div><h3>Gestión integral</h3><p>Conectamos las etapas de tu operación y coordinamos con los actores involucrados, desde el origen hasta el destino.</p></div></div>
            <div><span className="value-number">02</span><div><h3>Criterio operativo</h3><p>Cada carga tiene sus particularidades. Evaluamos alternativas de transporte según tiempos, dimensiones y necesidades.</p></div></div>
            <div><span className="value-number">03</span><div><h3>Comunicación clara</h3><p>Un contacto directo, información oportuna y seguimiento para que sepas cómo avanza tu operación.</p></div></div>
          </div>
        </div>
      </section>

      <section className="process section-space" aria-labelledby="process-title">
        <div className="container"><div className="section-intro"><div><p className="eyebrow"><span /> ASÍ TRABAJAMOS</p><h2 id="process-title">Tu operación, conectada<br />de principio a fin.</h2></div><p>Escuchamos, planificamos y coordinamos.<br />Vos nos contás qué necesitás mover.</p></div>
          <ol className="process-grid"><li><span>01</span><h3>Entendemos tu carga</h3><p>Origen, destino, tipo de mercadería y plazos. Partimos de lo que tu operación necesita.</p></li><li><span>02</span><h3>Definimos el camino</h3><p>Evaluamos alternativas y coordinamos una solución acorde a tu embarque.</p></li><li><span>03</span><h3>Acompañamos cada etapa</h3><p>Articulamos transporte y documentación, con comunicación durante el recorrido.</p></li></ol>
        </div>
      </section>

      <section className="contact section-space" id="contacto" aria-labelledby="contact-title">
        <div className="container contact-grid">
          <div className="contact-intro"><p className="eyebrow"><span /> EMPECEMOS A CONECTAR</p><h2 id="contact-title">Tu próximo<br />embarque<br /><span>empieza acá.</span></h2><p>Contanos qué necesitás transportar.<br />Te ayudamos a encontrar el camino.</p><div className="contact-details"><div><MapPin size={20} aria-hidden="true" /><span>Desde Argentina, conectados al mundo<strong>Buenos Aires, Argentina</strong></span></div><a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Seguinos en Instagram: @atlas.cargo.argentina (abre en una nueva pestaña)"><InstagramIcon /><span>Seguinos en Instagram<strong>@atlas.cargo.argentina</strong></span></a></div><p className="contact-note"><Check size={15} aria-hidden="true" /> Atención directa de nuestro equipo.</p></div>
          <ContactForm />
        </div>
      </section>
    </main>
    <footer className="footer"><div className="container"><div className="footer-main"><a href="#inicio" aria-label="Atlas Cargo, volver al inicio"><Image className="footer-logo" src="/brand/atlas-cargo-logo-dark.png" alt="Atlas Cargo" width={1000} height={251} sizes="(max-width: 700px) 200px, 260px" /></a><p>Tu carga. Nuestro compromiso.</p><a href="#inicio" className="back-top">Volver arriba <ArrowUpRight size={18} aria-hidden="true" /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Atlas Cargo SRL. Todos los derechos reservados.</span><a href={instagramUrl} className="footer-instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Atlas Cargo: @atlas.cargo.argentina (abre en una nueva pestaña)"><InstagramIcon /><span>@atlas.cargo.argentina</span></a><span>LOGÍSTICA INTERNACIONAL</span></div></div></footer>
  </>;
}
