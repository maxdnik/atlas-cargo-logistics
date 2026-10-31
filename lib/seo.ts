import type { Metadata } from "next";

export const SITE_URL = "https://www.atlas-cargo-logistics.com";
export const SITE_NAME = "Atlas Cargo";
export const INSTAGRAM_URL = "https://www.instagram.com/atlas.cargo.argentina/";
export const HOME_TITLE = "Freight forwarder en Argentina | Atlas Cargo";
export const HOME_DESCRIPTION = "Logística internacional para empresas en Argentina. Transporte marítimo FCL y LCL, carga aérea y terrestre, coordinación aduanera y seguimiento. Cotizá tu carga.";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title, description, url, siteName: SITE_NAME, locale: "es_AR", type: "website",
      images: [{ url: `${SITE_URL}/brand/atlas-cargo-social.png`, width: 1200, height: 630, alt: "Atlas Cargo · Logística internacional en Argentina" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${SITE_URL}/brand/atlas-cargo-social.png`] },
  };
}

export const organization = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: "Atlas Cargo SRL",
  alternateName: "Atlas Cargo Logistics",
  url: `${SITE_URL}/`,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/atlas-cargo-logo.png`, width: 1464, height: 426 },
  description: "Freight forwarder en Buenos Aires, Argentina. Coordinación de transporte internacional marítimo, aéreo y terrestre para empresas.",
  sameAs: [INSTAGRAM_URL],
  address: { "@type": "PostalAddress", addressLocality: "Buenos Aires", addressCountry: "AR" },
  contactPoint: { "@type": "ContactPoint", url: `${SITE_URL}/#contacto`, contactType: "sales", availableLanguage: "es" },
};

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem", position: index + 1, name: item.name, item: `${SITE_URL}${item.path}`,
    })),
  };
}
