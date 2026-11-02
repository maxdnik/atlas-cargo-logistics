"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { localizedPath, textFor, type Locale } from "@/lib/i18n";

export default function SiteHeader({ locale = "es" }: { locale?: Locale }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const t = textFor(locale);
  const links = [
    { href: "/", label: t("Inicio", "Home") },
    { href: "/servicios", label: t("Servicios", "Services") },
    { href: "/#plataforma", label: t("Plataforma", "Platform") },
    { href: "/#nosotros", label: t("Nosotros", "About us") },
    { href: "/#contacto", label: t("Contacto", "Contact") },
  ];
  return <header className="site-header" onKeyDown={(event) => { if (event.key === "Escape" && open) { setOpen(false); toggle.current?.focus(); } }}>
    <div className="container header-inner">
      <a className="brand" href={localizedPath("/", locale)} aria-label={t("Atlas Cargo, inicio", "Atlas Cargo, home")} onClick={() => setOpen(false)}><Image src="/brand/atlas-cargo-logo.png" alt="Atlas Cargo" width={1464} height={426} sizes="(max-width: 700px) 160px, (max-width: 1100px) 210px, 224px" loading="eager" /></a>
      <nav id="site-navigation" className={`site-navigation${open ? " is-open" : ""}`} aria-label={t("Navegación principal", "Main navigation")}>
        {links.map(({ href, label }) => <a key={href} href={localizedPath(href, locale)} onClick={() => setOpen(false)}>{label}</a>)}
        <a className="button button-red nav-cta" href={localizedPath("/#contacto", locale)} onClick={() => setOpen(false)}>{t("Cotizar un envío", "Get a quote")} <ArrowUpRight size={18} aria-hidden="true" /></a>
      </nav>
      <nav className="language-switch" aria-label={t("Idioma", "Language")}>
        {(["es", "en"] as const).map((language) => <a key={language} href={localizedPath(pathname, language)} hrefLang={language} lang={language} aria-current={language === locale ? "page" : undefined} aria-label={language === "es" ? "Leer en español" : "Read in English"} onClick={(event) => {
          // Keep the reader at the same section when switching languages.
          const destination = new URL(event.currentTarget.href);
          destination.hash = window.location.hash;
          event.currentTarget.href = destination.href;
        }}><span className="language-full">{language === "es" ? "Español" : "English"}</span><span className="language-short">{language.toUpperCase()}</span></a>)}
      </nav>
      <button ref={toggle} className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? t("Cerrar menú", "Close menu") : t("Abrir menú", "Open menu")} onClick={() => setOpen(!open)}>{open ? <X size={25} /> : <Menu size={25} />}</button>
    </div>
  </header>;
}
