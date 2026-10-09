"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [{ href: "#inicio", label: "Inicio" }, { href: "#servicios", label: "Servicios" }, { href: "#nosotros", label: "Nosotros" }, { href: "#contacto", label: "Contacto" }];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return <header className="site-header" onKeyDown={(event) => { if (event.key === "Escape" && open) { setOpen(false); toggle.current?.focus(); } }}>
    <div className="container header-inner">
      <a className="brand" href="#inicio" aria-label="Atlas Cargo SRL, inicio" onClick={() => setOpen(false)}><Image src="/images/atlas-cargo-logo.webp" alt="Atlas Cargo SRL" width={1000} height={151} loading="eager" /></a>
      <button ref={toggle} className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? "Cerrar menú" : "Abrir menú"} onClick={() => setOpen(!open)}>{open ? <X size={25} /> : <Menu size={25} />}</button>
      <nav id="site-navigation" className={`site-navigation${open ? " is-open" : ""}`} aria-label="Navegación principal">
        {links.map(({ href, label }) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        <a className="button button-red nav-cta" href="#contacto" onClick={() => setOpen(false)}>Cotizar un envío <ArrowUpRight size={18} aria-hidden="true" /></a>
      </nav>
    </div>
  </header>;
}
