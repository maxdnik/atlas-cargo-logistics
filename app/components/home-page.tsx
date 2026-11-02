import Image from "next/image";
import { ArrowDown, ArrowUpRight, Check, Cog, FileCheck2, Globe2, MapPin, Plane, Radar, Ship, Truck } from "lucide-react";
import SiteHeader from "@/app/components/site-header";
import ContactForm from "@/app/components/contact-form";
import PlatformShowcase from "@/app/components/platform-showcase";
import SiteFooter from "@/app/components/site-footer";
import StructuredData from "@/app/components/structured-data";
import { HOME_DESCRIPTION, HOME_TITLE, localizedOrganization, SITE_URL } from "@/lib/seo";
import { localizedPath, textFor, type Locale } from "@/lib/i18n";
const instagramUrl = "https://www.instagram.com/atlas.cargo.argentina/";
function InstagramIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
}
export default function HomePage({ locale = "es" }: {
    locale?: Locale;
}) {
    const t = textFor(locale);
    const home = localizedPath("/", locale);
    const organization = localizedOrganization(locale);
    const title = locale === "en" ? "Freight Forwarder in Argentina | Atlas Cargo" : HOME_TITLE;
    const description = locale === "en" ? "International logistics for businesses in Argentina. Ocean FCL and LCL, air and road freight, customs coordination and shipment tracking. Request a quote." : HOME_DESCRIPTION;
    const transportServices = [
        { number: "01", href: localizedPath("/servicios/transporte-maritimo", locale), title: t("Transporte marítimo", "Ocean freight"), claim: t("Conectamos tu negocio con el mundo.", "Connecting your business to the world."), description: t("Coordinación de importaciones y exportaciones. Contenedores completos (FCL), carga consolidada (LCL) y seguimiento de cada embarque.", "Import and export coordination. Full container loads (FCL), less-than-container loads (LCL) and tracking for every shipment."), image: "/images/port.webp", alt: t("Buque portacontenedores junto a las grúas de un puerto al atardecer", "Container ship alongside port cranes at sunset"), icon: Ship },
        { number: "02", href: localizedPath("/servicios/carga-aerea", locale), title: t("Transporte aéreo", "Air freight"), claim: t("Cada hora cuenta.", "Every hour counts."), description: t("Envíos para cargas con plazos exigentes. Repuestos, equipos y mercadería, con coordinación documental y operativa.", "Time-sensitive shipping for spare parts, equipment and goods, with documentation and operational coordination."), image: "/images/air.webp", alt: t("Avión de carga y pallets en una plataforma de carga aeroportuaria", "Cargo aircraft and pallets on an airport apron"), icon: Plane },
        { number: "03", href: localizedPath("/servicios/transporte-terrestre", locale), title: t("Transporte terrestre", "Road freight"), claim: t("Conectamos cada tramo.", "Connecting every leg of the journey."), description: t("Coordinación de retiros y entregas. Conectamos puertos, aeropuertos, depósitos y plantas con tu destino final.", "Pickup and delivery coordination. We connect ports, airports, warehouses and plants with your final destination."), image: "/images/ground.webp", alt: t("Camión de carga junto a un centro logístico", "Freight truck beside a logistics center"), icon: Truck },
    ];
    const complementaryServices = [
        { href: localizedPath("/servicios/gestion-aduanera", locale), title: t("Coordinación aduanera", "Customs coordination"), description: t("Acompañamiento documental y coordinación para tus operaciones de importación y exportación.", "Documentation support and coordination for your import and export operations."), icon: FileCheck2 },
        { href: localizedPath("/servicios/cargas-proyecto", locale), title: t("Maquinaria y cargas de proyecto", "Machinery and project cargo"), description: t("Logística a la medida de tu proyecto: maquinaria, equipos y cargas con requerimientos particulares.", "Logistics tailored to your project: machinery, equipment and cargo with specific handling requirements."), icon: Cog },
        { href: "#plataforma", title: t("Seguimiento operativo", "Shipment tracking"), description: t("Comunicación directa, coordinación entre las partes y visibilidad durante cada etapa de tu operación.", "Direct communication, coordination between all parties and visibility at every stage of your shipment."), icon: Radar },
    ];
    return <>
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [organization,
                { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: "Atlas Cargo", alternateName: "Atlas Cargo Logistics", inLanguage: ["es-AR", "en"], publisher: { "@id": organization["@id"] } },
                { "@type": "WebPage", "@id": `${SITE_URL}${home}#webpage`, url: `${SITE_URL}${home}`, name: title, description, inLanguage: locale === "en" ? "en" : "es-AR", isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": organization["@id"] } },
            ] }}/>
    <a className="skip-link" href="#contenido">{t("Ir al contenido", "Skip to content")}</a>
    <SiteHeader locale={locale}/>
    <main id="contenido">
      <section className="hero" id="inicio" aria-labelledby="hero-title">
        <Image className="hero-image" src="/images/port.webp" alt="" fill sizes="100vw" loading="eager" fetchPriority="high"/>
        <div className="hero-shade"/>
        <div className="container hero-content">
          <p className="eyebrow light"><span />{t(" TU CARGA. NUESTRO COMPROMISO.", " YOUR CARGO. OUR COMMITMENT.")}</p>
          <h1 id="hero-title" className="seo-hero-title">Freight forwarder<br /><span>{t("en Argentina.", "in Argentina.")}</span></h1>
          <p className="hero-description">{t("Atlas Cargo SRL: logística internacional para empresas. Coordinamos importaciones y exportaciones por vía marítima, aérea y terrestre desde Buenos Aires, con seguimiento de origen a destino.", "Atlas Cargo SRL: international logistics for businesses. From Buenos Aires, we coordinate imports and exports by sea, air and road, with shipment tracking from origin to destination.")}</p>
          <div className="hero-actions">
            <a className="button button-red" href="#contacto">{t("Conversemos sobre tu carga ", "Let's talk about your cargo ")}<ArrowUpRight size={20} aria-hidden="true"/></a>
            <a className="hero-link" href="#plataforma">{t("Conocé nuestra plataforma ", "Explore our platform ")}<ArrowDown size={18} aria-hidden="true"/></a>
          </div>
        </div>
        <div className="hero-bottom container"><div className="transport-modes"><span>{t("Aéreo", "Air")}</span><i /><span>{t("Marítimo", "Ocean")}</span><i /><span>{t("Terrestre", "Road")}</span></div><span className="hero-location">BUENOS AIRES, ARGENTINA <Globe2 size={17} aria-hidden="true"/></span></div>
      </section>

      <section className="services section-space" id="servicios" aria-labelledby="services-title">
        <div className="container">
          <div className="section-intro"><div><p className="eyebrow"><span />{t(" NUESTROS SERVICIOS", " OUR SERVICES")}</p><h2 id="services-title">{t("Transporte internacional.", "International freight.")}<br /><span className="muted-heading">{t("Cada carga, una solución.", "A solution for every shipment.")}</span></h2></div><p>{t("Integramos transporte, documentación y seguimiento para que tu operación avance con claridad.", "We bring together transport, documentation and tracking to keep your shipment moving with clarity.")}</p></div>
          <div className="transport-grid">
            {transportServices.map(({ number, href, title, claim, description, image, alt, icon: Icon }) => <article className="transport-card" key={number}>
              <div className="service-image"><Image src={image} alt={alt} fill sizes="(max-width: 700px) 100vw, 33vw"/><span className="service-number">{number} /</span><span className="service-icon"><Icon size={25} strokeWidth={1.5} aria-hidden="true"/></span></div>
              <div className="service-body"><p className="service-label">{claim}</p><h3><a href={href}>{title}</a></h3><p>{description}</p><a href={href} className="text-link" aria-label={`${t("Conocer", "Explore")} ${title.toLowerCase()}`}>{t("Conocer el servicio ", "Explore this service ")}<ArrowUpRight size={19} aria-hidden="true"/></a></div>
            </article>)}
          </div>
          <div className="complementary-grid">{complementaryServices.map(({ href, title, description, icon: Icon }) => <article className="complementary-service" key={title}><Icon size={29} strokeWidth={1.4} aria-hidden="true"/><div><h3><a href={href}>{title}</a></h3><p>{description}</p></div></article>)}</div>
        </div>
      </section>

      <section className="trade-route"><div className="container"><div><p className="eyebrow"><span />{t(" IMPORTACIONES PARA EMPRESAS", " IMPORTS FOR BUSINESSES")}</p><h2>{t("Tu carga de China a Argentina.", "Your cargo from China to Argentina.")}</h2><p>{t("Evaluamos FCL y LCL, los gastos de origen y destino y la conexión hasta tu depósito. Prepará los datos de tu proveedor y consultá por tu próximo embarque.", "We assess FCL and LCL options, origin and destination charges, and delivery to your warehouse. Share your supplier's details and ask us about your next shipment.")}</p></div><a className="button button-red" href={localizedPath("/servicios/flete-china-argentina", locale)}>{t("Ver fletes desde China ", "Explore freight from China ")}<ArrowUpRight size={19} aria-hidden="true"/></a></div></section>
      <PlatformShowcase locale={locale}/>

      <section className="about section-space" id="nosotros" aria-labelledby="about-title">
        <div className="container about-grid">
          <div className="about-heading"><p className="eyebrow light"><span />{t(" SOMOS ATLAS CARGO SRL", " WE ARE ATLAS CARGO SRL")}</p><h2 id="about-title">{t("El mundo se mueve.", "The world keeps moving.")}<br />{t("Nosotros estamos", "We stay")}<br /><span>{t("cerca.", "close.")}</span></h2><p>{t("Un equipo cercano para operaciones complejas. Entendemos lo que necesita tu negocio y coordinamos cada detalle para acompañar tu carga de principio a fin.", "A dedicated team for complex operations. We understand your business needs and coordinate every detail to support your cargo from start to finish.")}</p><a href="#contacto" className="text-link light-link">{t("Hablemos de tu operación ", "Let's talk about your shipment ")}<ArrowUpRight size={20} aria-hidden="true"/></a></div>
          <div className="about-values">
            <div><span className="value-number">01</span><div><h3>{t("Gestión integral", "End-to-end coordination")}</h3><p>{t("Conectamos las etapas de tu operación y coordinamos con los actores involucrados, desde el origen hasta el destino.", "We connect every stage of your shipment and coordinate with all parties involved, from origin to destination.")}</p></div></div>
            <div><span className="value-number">02</span><div><h3>{t("Criterio operativo", "Practical expertise")}</h3><p>{t("Cada carga tiene sus particularidades. Evaluamos alternativas de transporte según tiempos, dimensiones y necesidades.", "Every shipment is different. We assess transport options based on timing, dimensions and your specific requirements.")}</p></div></div>
            <div><span className="value-number">03</span><div><h3>{t("Comunicación clara", "Clear communication")}</h3><p>{t("Un contacto directo, información oportuna y seguimiento para que sepas cómo avanza tu operación.", "A direct point of contact, timely information and tracking so you know how your shipment is progressing.")}</p></div></div>
          </div>
        </div>
      </section>

      <section className="process section-space" aria-labelledby="process-title">
        <div className="container"><div className="section-intro"><div><p className="eyebrow"><span />{t(" ASÍ TRABAJAMOS", " HOW WE WORK")}</p><h2 id="process-title">{t("Tu operación, conectada", "Your shipment, connected")}<br />{t("de principio a fin.", "from start to finish.")}</h2></div><p>{t("Escuchamos, planificamos y coordinamos.", "We listen, plan and coordinate.")}<br />{t("Vos nos contás qué necesitás mover.", "Tell us what you need to move.")}</p></div>
          <ol className="process-grid"><li><span>01</span><h3>{t("Entendemos tu carga", "We understand your cargo")}</h3><p>{t("Origen, destino, tipo de mercadería y plazos. Partimos de lo que tu operación necesita.", "Origin, destination, type of goods and deadlines. We start with what your shipment needs.")}</p></li><li><span>02</span><h3>{t("Definimos el camino", "We plan the route")}</h3><p>{t("Evaluamos alternativas y coordinamos una solución acorde a tu embarque.", "We assess the options and coordinate a solution tailored to your shipment.")}</p></li><li><span>03</span><h3>{t("Acompañamos cada etapa", "We support every stage")}</h3><p>{t("Articulamos transporte y documentación, con comunicación durante el recorrido.", "We coordinate transport and documentation, keeping you informed along the way.")}</p></li></ol>
        </div>
      </section>

      <section className="contact section-space" id="contacto" aria-labelledby="contact-title">
        <div className="container contact-grid">
          <div className="contact-intro"><p className="eyebrow"><span />{t(" EMPECEMOS A CONECTAR", " LET'S GET CONNECTED")}</p><h2 id="contact-title">{t("Tu próximo", "Your next")}<br />{t("embarque", "shipment")}<br /><span>{t("empieza acá.", "starts here.")}</span></h2><p>{t("Contanos qué necesitás transportar.", "Tell us what you need to ship.")}<br />{t("Te ayudamos a encontrar el camino.", "We'll help you find the way.")}</p><div className="contact-details"><div><MapPin size={20} aria-hidden="true"/><span>{t("Desde Argentina, conectados al mundo", "From Argentina, connected to the world")}<strong>Buenos Aires, Argentina</strong></span></div><a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={t("Seguinos en Instagram: @atlas.cargo.argentina (abre en una nueva pestaña)", "Follow us on Instagram: @atlas.cargo.argentina (opens in a new tab)")}><InstagramIcon /><span>{t("Seguinos en Instagram", "Follow us on Instagram")}<strong>@atlas.cargo.argentina</strong></span></a></div><p className="contact-note"><Check size={15} aria-hidden="true"/>{t(" Atención directa de nuestro equipo.", " Personal support from our team.")}</p></div>
          <ContactForm locale={locale}/>
        </div>
      </section>
    </main>
    <SiteFooter locale={locale}/>
  </>;
}
