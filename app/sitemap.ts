import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { services } from "@/lib/services";
import { localizedPath } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/servicios", ...services.map((service) => `/servicios/${service.slug}`)]
    .flatMap((path) => {
      const es = `${SITE_URL}${path}`;
      const en = `${SITE_URL}${localizedPath(path, "en")}`;
      return [es, en].map((url) => ({ url, alternates: { languages: { "es-AR": es, en, "x-default": es } } }));
    });
}
