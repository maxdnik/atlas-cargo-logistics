import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { services } from "@/lib/services";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/servicios", ...services.map((service) => `/servicios/${service.slug}`)]
    .map((path) => ({ url: `${SITE_URL}${path}` }));
}
