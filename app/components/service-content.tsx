import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import StructuredData from "@/app/components/structured-data";
import { getService as getSpanishService, type Service } from "@/lib/services";
import { getEnglishService } from "@/lib/services-en";
import { localizedPath, textFor, type Locale } from "@/lib/i18n";
import { breadcrumbs, localizedOrganization, SITE_URL } from "@/lib/seo";
export default function ServiceContent({ service, locale = "es" }: {
    service: Service;
    locale?: Locale;
}) {
    const t = textFor(locale);
    const organization = localizedOrganization(locale);
    const getService = locale === "en" ? getEnglishService : getSpanishService;
    const base = locale === "en" ? "/en/services" : "/servicios";
    const path = `${base}/${service.slug}`;
    const url = `${SITE_URL}${path}`;
    return <>
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [organization,
                { "@type": "WebPage", "@id": `${url}#webpage`, url, name: service.title, description: service.description, inLanguage: locale === "en" ? "en" : "es-AR", mainEntity: { "@id": `${url}#service` }, publisher: { "@id": organization["@id"] } },
                { "@type": "Service", "@id": `${url}#service`, name: service.name, serviceType: service.heading, url, description: service.intro, provider: { "@id": organization["@id"] }, areaServed: { "@type": "Country", name: "Argentina" } },
                breadcrumbs([{ name: t("Inicio", "Home"), path: localizedPath("/", locale) }, { name: t("Servicios", "Services"), path: localizedPath("/servicios", locale) }, { name: service.name, path }]),
            ] }}/>
    <section className="service-hero"><div className="container service-hero-grid"><div>
      <nav className="breadcrumbs" aria-label={t("Ruta de navegación", "Breadcrumbs")}><a href={localizedPath("/", locale)}>{t("Inicio", "Home")}</a><span aria-hidden="true">/</span><a href={localizedPath("/servicios", locale)}>{t("Servicios", "Services")}</a><span aria-hidden="true">/</span><span aria-current="page">{service.name}</span></nav>
      <p className="eyebrow light"><span /> {service.name.toUpperCase()}</p>
      <h1>{service.heading}</h1><p>{service.intro}</p>
      <a className="button button-red" href="#cotizar">{t("Cotizar este servicio ", "Request a quote ")}<ArrowUpRight size={20} aria-hidden="true"/></a>
    </div><div className="service-hero-image"><Image src={service.image} alt={service.imageAlt} fill sizes="(max-width: 850px) 100vw, 40vw" loading="eager" fetchPriority="high"/></div></div></section>
    <div className="container service-content section-space"><article className="service-article" aria-label={`${t("Detalle de", "Details for")} ${service.name.toLowerCase()}`}>
      {service.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2><p>{section.text}</p></section>)}
      <section className="service-faq"><h2>{t("Preguntas frecuentes", "Frequently asked questions")}</h2>{service.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
    </article><aside className="quote-checklist" id="cotizar"><p className="eyebrow"><span />{t(" PREPARÁ TU CONSULTA", " PREPARE YOUR INQUIRY")}</p><h2>{t("Qué necesitamos para cotizar", "What we need for your quote")}</h2><ul>{service.checklist.map((item) => <li key={item}><Check size={18} aria-hidden="true"/><span>{item}</span></li>)}</ul><a className="button button-red" href={localizedPath("/#contacto", locale)}>{t("Enviar una consulta ", "Send an inquiry ")}<ArrowUpRight size={19} aria-hidden="true"/></a></aside></div>
    <section className="related-services section-space"><div className="container"><p className="eyebrow"><span />{t(" TU OPERACIÓN, CONECTADA", " YOUR SHIPMENT, CONNECTED")}</p><h2>{t("Servicios relacionados", "Related services")}</h2><div className="related-grid">{service.related.map((slug) => { const related = getService(slug); return related ? <a key={slug} href={`${base}/${slug}`}><span>{related.name}</span><ArrowUpRight size={22} aria-hidden="true"/></a> : null; })}</div><a className="all-services" href={localizedPath("/servicios", locale)}>{t("Ver todos los servicios", "View all services")}</a></div></section>
  </>;
}
