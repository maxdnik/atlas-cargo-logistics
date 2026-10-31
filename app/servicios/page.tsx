import { ArrowUpRight } from "lucide-react";
import StructuredData from "../components/structured-data";
import { services } from "@/lib/services";
import { breadcrumbs, organization, pageMetadata, SITE_URL } from "@/lib/seo";

const title = "Servicios de logística internacional en Argentina | Atlas Cargo";
const description = "Conocé los servicios de Atlas Cargo: transporte marítimo, aéreo y terrestre, coordinación aduanera, maquinaria y fletes de China a Argentina para empresas.";
export const metadata = pageMetadata(title, description, "/servicios");

export default function ServicesPage() {
  return <>
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [organization,
      breadcrumbs([{ name: "Inicio", path: "/" }, { name: "Servicios", path: "/servicios" }]),
      { "@type": "CollectionPage", "@id": `${SITE_URL}/servicios#webpage`, url: `${SITE_URL}/servicios`, name: title, description, inLanguage: "es-AR", publisher: { "@id": organization["@id"] }, mainEntity: { "@type": "ItemList", itemListElement: services.map((service, index) => ({ "@type": "ListItem", position: index + 1, name: service.name, url: `${SITE_URL}/servicios/${service.slug}` })) } },
    ] }} />
    <section className="service-hero"><div className="container">
      <nav className="breadcrumbs" aria-label="Ruta de navegación"><a href="/">Inicio</a><span aria-hidden="true">/</span><span aria-current="page">Servicios</span></nav>
      <p className="eyebrow light"><span /> ATLAS CARGO · ARGENTINA</p>
      <h1>Servicios de logística internacional para empresas</h1>
      <p>Conectamos transporte, documentación y seguimiento para tus importaciones y exportaciones. Explorá cada servicio y encontrá la información necesaria para preparar tu próxima operación.</p>
      <a className="button button-red" href="/#contacto">Cotizar una operación <ArrowUpRight size={20} aria-hidden="true" /></a>
    </div></section>
    <section className="section-space"><div className="container"><h2>Una solución para cada tipo de carga</h2>
      <div className="service-directory">{services.map((service, index) => <article key={service.slug}><span className="directory-number">0{index + 1} /</span><h3><a href={`/servicios/${service.slug}`}>{service.name}</a></h3><p>{service.intro}</p><a className="text-link" href={`/servicios/${service.slug}`}>Conocer {service.name.toLowerCase()} <ArrowUpRight size={18} aria-hidden="true" /></a></article>)}</div>
    </div></section>
    <section className="quote-band"><div className="container"><div><h2>¿Por dónde empezar?</h2><p>Contanos origen, destino, mercadería, peso, medidas y fecha prevista. Con esa información podemos evaluar las alternativas para tu carga.</p></div><a className="button button-red" href="/#contacto">Hablar con Atlas <ArrowUpRight size={20} aria-hidden="true" /></a></div></section>
  </>;
}
