import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import StructuredData from "@/app/components/structured-data";
import { getService, services } from "@/lib/services";
import { breadcrumbs, organization, pageMetadata, SITE_URL } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() { return services.map(({ slug }) => ({ slug })); }

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const service = getService((await params).slug);
  if (!service) notFound();
  return pageMetadata(service.title, service.description, `/servicios/${service.slug}`);
}

export default async function ServicePage({ params }: Props) {
  const service = getService((await params).slug);
  if (!service) notFound();
  const path = `/servicios/${service.slug}`;
  const url = `${SITE_URL}${path}`;
  return <>
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [organization,
      { "@type": "WebPage", "@id": `${url}#webpage`, url, name: service.title, description: service.description, inLanguage: "es-AR", mainEntity: { "@id": `${url}#service` }, publisher: { "@id": organization["@id"] } },
      { "@type": "Service", "@id": `${url}#service`, name: service.name, serviceType: service.heading, url, description: service.intro, provider: { "@id": organization["@id"] }, areaServed: { "@type": "Country", name: "Argentina" } },
      breadcrumbs([{ name: "Inicio", path: "/" }, { name: "Servicios", path: "/servicios" }, { name: service.name, path }]),
    ] }} />
    <section className="service-hero"><div className="container service-hero-grid"><div>
      <nav className="breadcrumbs" aria-label="Ruta de navegación"><a href="/">Inicio</a><span aria-hidden="true">/</span><a href="/servicios">Servicios</a><span aria-hidden="true">/</span><span aria-current="page">{service.name}</span></nav>
      <p className="eyebrow light"><span /> {service.name.toUpperCase()}</p>
      <h1>{service.heading}</h1><p>{service.intro}</p>
      <a className="button button-red" href="#cotizar">Cotizar este servicio <ArrowUpRight size={20} aria-hidden="true" /></a>
    </div><div className="service-hero-image"><Image src={service.image} alt={service.imageAlt} fill sizes="(max-width: 850px) 100vw, 40vw" loading="eager" fetchPriority="high" /></div></div></section>
    <div className="container service-content section-space"><article className="service-article" aria-label={`Detalle de ${service.name.toLowerCase()}`}>
      {service.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2><p>{section.text}</p></section>)}
      <section className="service-faq"><h2>Preguntas frecuentes</h2>{service.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
    </article><aside className="quote-checklist" id="cotizar"><p className="eyebrow"><span /> PREPARÁ TU CONSULTA</p><h2>Qué necesitamos para cotizar</h2><ul>{service.checklist.map((item) => <li key={item}><Check size={18} aria-hidden="true" /><span>{item}</span></li>)}</ul><a className="button button-red" href="/#contacto">Enviar una consulta <ArrowUpRight size={19} aria-hidden="true" /></a></aside></div>
    <section className="related-services section-space"><div className="container"><p className="eyebrow"><span /> TU OPERACIÓN, CONECTADA</p><h2>Servicios relacionados</h2><div className="related-grid">{service.related.map((slug) => { const related = getService(slug); return related ? <a key={slug} href={`/servicios/${slug}`}><span>{related.name}</span><ArrowUpRight size={22} aria-hidden="true" /></a> : null; })}</div><a className="all-services" href="/servicios">Ver todos los servicios</a></div></section>
  </>;
}
