import SiteHeader from "@/app/components/site-header";
import SiteFooter from "@/app/components/site-footer";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <><a className="skip-link" href="#contenido">Skip to content</a><SiteHeader locale="en" /><main id="contenido">{children}</main><SiteFooter locale="en" /></>;
}
