import SiteHeader from "@/app/components/site-header";
import SiteFooter from "@/app/components/site-footer";

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <><a className="skip-link" href="#contenido">Ir al contenido</a><SiteHeader /><main id="contenido">{children}</main><SiteFooter /></>;
}
