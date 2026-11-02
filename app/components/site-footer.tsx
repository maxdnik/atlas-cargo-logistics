import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/services";
import { englishServices } from "@/lib/services-en";
import { localizedPath, textFor, type Locale } from "@/lib/i18n";
import { INSTAGRAM_URL } from "@/lib/seo";
export default function SiteFooter({ locale = "es" }: {
    locale?: Locale;
}) {
    const t = textFor(locale);
    const items = locale === "en" ? englishServices : services;
    return <footer className="footer"><div className="container">
    <div className="footer-main">
      <a href={localizedPath("/", locale)} aria-label={t("Atlas Cargo, inicio", "Atlas Cargo, home")}><Image className="footer-logo" src="/brand/atlas-cargo-logo-dark.png" alt="Atlas Cargo" width={1000} height={251} sizes="(max-width: 700px) 200px, 260px"/></a>
      <p>{t("Tu carga. Nuestro compromiso.", "Your cargo. Our commitment.")}</p>
      <a href={localizedPath("/#contacto", locale)} className="back-top">{t("Cotizar carga ", "Get a quote ")}<ArrowUpRight size={18} aria-hidden="true"/></a>
    </div>
    <div className="footer-services"><div><h2>{t("Logística internacional", "International logistics")}</h2><nav aria-label={t("Servicios de Atlas Cargo", "Atlas Cargo services")}>{items.map((service) => <a key={service.slug} href={`${locale === "en" ? "/en/services" : "/servicios"}/${service.slug}`}>{service.name}</a>)}</nav></div>
      <div><h2>Atlas Cargo SRL</h2><p>{t("Freight forwarder en Buenos Aires, Argentina.", "Freight forwarder in Buenos Aires, Argentina.")}</p><a className="footer-contact" href={localizedPath("/#contacto", locale)}>{t("Contactar al equipo", "Contact our team")}</a><a href={localizedPath("/servicios", locale)}>{t("Todos los servicios", "All services")}</a></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()}{t(" Atlas Cargo SRL. Todos los derechos reservados.", " Atlas Cargo SRL. All rights reserved.")}</span><a href={INSTAGRAM_URL} className="footer-instagram" target="_blank" rel="noopener noreferrer" aria-label={t("Instagram de Atlas Cargo: @atlas.cargo.argentina (abre en una nueva pestaña)", "Atlas Cargo on Instagram: @atlas.cargo.argentina (opens in a new tab)")}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg><span>@atlas.cargo.argentina</span></a><span>{t("LOGÍSTICA INTERNACIONAL", "INTERNATIONAL LOGISTICS")}</span></div>
  </div></footer>;
}
