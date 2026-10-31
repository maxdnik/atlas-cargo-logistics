import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <><a className="skip-link" href="#contenido">Ir al contenido</a><SiteHeader /><main id="contenido">{children}</main><SiteFooter /></>;
}
