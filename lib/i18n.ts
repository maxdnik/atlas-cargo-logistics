export type Locale = "es" | "en";

export const serviceSlugs = [
  ["transporte-maritimo", "ocean-freight"],
  ["carga-aerea", "air-freight"],
  ["transporte-terrestre", "road-freight"],
  ["gestion-aduanera", "customs-coordination"],
  ["cargas-proyecto", "project-cargo"],
  ["flete-china-argentina", "china-to-argentina-freight"],
] as const;

export function localizedPath(path: string, locale: Locale): string {
  const [pathname, hash] = path.split("#");
  const spanish = pathname === "/en" || pathname === "/en/" ? "/"
    : pathname === "/en/services" ? "/servicios"
    : pathname.startsWith("/en/services/")
      ? `/servicios/${serviceSlugs.find(([, en]) => en === pathname.split("/").at(-1))?.[0] || ""}`
      : pathname;
  let result = spanish;
  if (locale === "en") {
    if (spanish === "/") result = "/en";
    else if (spanish === "/servicios") result = "/en/services";
    else if (spanish.startsWith("/servicios/")) result = `/en/services/${serviceSlugs.find(([es]) => es === spanish.split("/").at(-1))?.[1] || ""}`;
  }
  return `${result}${hash ? `#${hash}` : ""}`;
}

export function textFor(locale: Locale) {
  return (spanish: string, english: string) => locale === "en" ? english : spanish;
}
