import { notFound } from "next/navigation";
import { getService, services } from "@/lib/services";
import { pageMetadata } from "@/lib/seo";
import ServiceContent from "@/app/components/service-content";
export const dynamicParams = false;
export function generateStaticParams() { return services.map(({ slug }) => ({ slug })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const service = getService((await params).slug);
  if (!service) notFound();
  return pageMetadata(service.title, service.description, `/servicios/${service.slug}`);
}
export default async function Page({ params }: Props) {
  const service = getService((await params).slug);
  if (!service) notFound();
  return <ServiceContent service={service} locale="es" />;
}
