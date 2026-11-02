import { ArrowUpRight } from "lucide-react";
import StructuredData from "@/app/components/structured-data";
import { services as spanishServices } from "@/lib/services";
import { englishServices } from "@/lib/services-en";
import { localizedPath, textFor, type Locale } from "@/lib/i18n";
import { breadcrumbs, localizedOrganization, SITE_URL } from "@/lib/seo";
export default function ServicesDirectory({ locale = "es" }: {
    locale?: Locale;
}) {
    const t = textFor(locale);
    const services = locale === "en" ? englishServices : spanishServices;
    const organization = localizedOrganization(locale);
    const base = localizedPath("/servicios", locale);
    const title = t("Servicios de logística internacional en Argentina | Atlas Cargo", "International Logistics Services in Argentina | Atlas Cargo");
    const description = t("Conocé los servicios de Atlas Cargo: transporte marítimo, aéreo y terrestre, coordinación aduanera, maquinaria y fletes de China a Argentina para empresas.", "Explore Atlas Cargo services: ocean, air and road freight, customs coordination, machinery logistics and freight from China to Argentina for businesses.");
    return <>
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [organization,
                breadcrumbs([{ name: t("Inicio", "Home"), path: localizedPath("/", locale) }, { name: t("Servicios", "Services"), path: base }]),
                { "@type": "CollectionPage", "@id": `${SITE_URL}${base}#webpage`, url: `${SITE_URL}${base}`, name: title, description, inLanguage: locale === "en" ? "en" : "es-AR", publisher: { "@id": organization["@id"] }, mainEntity: { "@type": "ItemList", itemListElement: services.map((service, index) => ({ "@type": "ListItem", position: index + 1, name: service.name, url: `${SITE_URL}${base}/${service.slug}` })) } },] }}/>
    <section className="service-hero"><div className="container">
      <nav className="breadcrumbs" aria-label={t("Ruta de navegación", "Breadcrumbs")}><a href={localizedPath("/", locale)}>{t("Inicio", "Home")}</a><span aria-hidden="true">/</span><span aria-current="page">{t("Servicios", "Services")}</span></nav>
      <p className="eyebrow light"><span /> ATLAS CARGO · ARGENTINA</p>
      <h1>{t("Servicios de logística internacional para empresas", "International logistics services for businesses")}</h1>
      <p>{t("Conectamos transporte, documentación y seguimiento para tus importaciones y exportaciones. Explorá cada servicio y encontrá la información necesaria para preparar tu próxima operación.", "We connect transport, documentation and tracking for your imports and exports. Explore each service and find the information you need to prepare your next shipment.")}</p>
      <a className="button button-red" href={localizedPath("/#contacto", locale)}>{t("Cotizar una operación ", "Request a quote ")}<ArrowUpRight size={20} aria-hidden="true"/></a>
    </div></section>
    <section className="section-space"><div className="container"><h2>{t("Una solución para cada tipo de carga", "A solution for every type of cargo")}</h2>
      <div className="service-directory">{services.map((service, index) => <article key={service.slug}><span className="directory-number">0{index + 1} /</span><h3><a href={`${base}/${service.slug}`}>{service.name}</a></h3><p>{service.intro}</p><a className="text-link" href={`${base}/${service.slug}`}>{t("Conocer ", "Explore ")}{service.name.toLowerCase()} <ArrowUpRight size={18} aria-hidden="true"/></a></article>)}</div>
    </div></section>
    <section className="quote-band"><div className="container"><div><h2>{t("¿Por dónde empezar?", "Where should you start?")}</h2><p>{t("Contanos origen, destino, mercadería, peso, medidas y fecha prevista. Con esa información podemos evaluar las alternativas para tu carga.", "Tell us the origin, destination, type of goods, weight, dimensions and planned date. With that information, we can assess the options for your cargo.")}</p></div><a className="button button-red" href={localizedPath("/#contacto", locale)}>{t("Hablar con Atlas ", "Talk to Atlas ")}<ArrowUpRight size={20} aria-hidden="true"/></a></div></section>
  </>;
}
