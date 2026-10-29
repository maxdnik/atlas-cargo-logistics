import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.atlas-cargo-logistics.com"),
  title: "Atlas Cargo SRL | Tu carga. Nuestro compromiso.",
  description: "Transporte aéreo, marítimo y terrestre. Coordinación logística, gestión aduanera y seguimiento de tus operaciones con un equipo cerca. Buenos Aires, Argentina.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Atlas Cargo SRL | Tu carga. Nuestro compromiso.",
    description: "Soluciones de transporte y coordinación logística para empresas. Aéreo, marítimo y terrestre.",
    url: "/", siteName: "Atlas Cargo SRL", locale: "es_AR", type: "website",
    images: [{ url: "/brand/atlas-cargo-social.png", width: 1200, height: 630, alt: "Atlas Cargo: logotipo azul marino y rojo." }],
  },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR"><body>{children}</body></html>;
}
