import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { localizedPath, serviceSlugs } from "../lib/i18n";
import { services } from "../lib/services";
import { englishServices } from "../lib/services-en";
import { pageMetadata, SITE_URL } from "../lib/seo";

const normalize = (url: string) => new URL(url).href;
const pages = ["/", "/servicios", ...services.map(s => `/servicios/${s.slug}`)];
assert.equal(services.length, englishServices.length);
for (const [es, en] of serviceSlugs) {
  const source = services.find(s => s.slug === es)!;
  const translation = englishServices.find(s => s.slug === en)!;
  assert.ok(source && translation);
  for (const key of ["sections", "checklist", "faqs", "related"] as const) assert.equal(source[key].length, translation[key].length);
  assert.ok(translation.related.every(slug => englishServices.some(s => s.slug === slug)));
}
const allPaths = pages.flatMap(es => [es, localizedPath(es, "en")]);
const rendered = new Map<string, string>();
for (const path of allPaths) {
  const html = await readFile(`.next/server/app/${path === "/" ? "index" : path.slice(1)}.html`, "utf8");
  rendered.set(path, html);
  const en = path.startsWith("/en");
  assert.ok(html.includes(`<html lang="${en ? "en" : "es-AR"}"`), `HTML language: ${path}`);
  assert.equal(normalize(html.match(/<link rel="canonical" href="([^"]+)"/)![1]), normalize(SITE_URL + path), `Canonical: ${path}`);
  for (const locale of ["es", "en"] as const) {
    const href = `${SITE_URL}${localizedPath(path, locale)}`;
    const alternate = html.match(new RegExp(`hrefLang="${locale === "es" ? "es-AR" : "en"}" href="([^\"]+)"`));
    assert.equal(normalize(alternate![1]), normalize(href), `Alternate: ${path} ${locale}`);
  }
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.ok(!html.includes("maximo.dimnik@atlas-cargo-logistics.com"), `Private email in ${path}`);
  assert.ok(!html.includes('href="mailto:'), `Mailto in ${path}`);
  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<[^>]*>/g, " ");
  if (en) assert.doesNotMatch(visible, /Conocé|Cotizar|Contanos|Preguntas frecuentes|En desarrollo|Mis embarques|Enviar consulta/);
  const meta = pageMetadata("Example", "Description", path);
  assert.equal(meta.alternates?.canonical, `${SITE_URL}${path}`);
}
for (const [path, html] of rendered) {
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>/g)];
  for (const [, href] of links) {
    if (!href.startsWith("/") && !href.startsWith("#")) continue;
    const [target, fragment] = href.split("#");
    const targetPath = target || path;
    const targetHtml = rendered.get(targetPath);
    assert.ok(targetHtml, `Broken link ${path} -> ${href}`);
    if (fragment) assert.ok(targetHtml.includes(`id="${fragment}"`), `Missing anchor ${path} -> ${href}`);
  }
}
for (const es of pages) {
  const en = localizedPath(es, "en");
  assert.equal(localizedPath(en, "es"), es);
  assert.equal(localizedPath(`${es}#contacto`, "en"), `${en}#contacto`);
}
const sitemapXml = await readFile(".next/server/app/sitemap.xml.body", "utf8");
const entries = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert.equal(entries.length, allPaths.length);
assert.deepEqual(new Set(entries), new Set(allPaths.map(p => SITE_URL + p)));
console.log(`Verified ${allPaths.length} bilingual pages: language, canonical, hreflang, privacy, internal links, anchors, service coverage and sitemap.`);
