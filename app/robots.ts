import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Admin pages remain crawlable so their existing noindex directives can be read.
  // Authentication, rather than robots.txt, protects private operations.
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/"] }, sitemap: `${SITE_URL}/sitemap.xml` };
}
