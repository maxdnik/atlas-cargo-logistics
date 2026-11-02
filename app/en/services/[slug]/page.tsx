import { notFound } from "next/navigation";
import { getEnglishService, englishServices } from "@/lib/services-en";
import { pageMetadata } from "@/lib/seo";
import ServiceContent from "@/app/components/service-content";
export const dynamicParams = false;
export function generateStaticParams() { return englishServices.map(({ slug }) => ({ slug })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const service = getEnglishService((await params).slug);
  if (!service) notFound();
  return pageMetadata(service.title, service.description, `/en/services/${service.slug}`);
}
export default async function Page({ params }: Props) {
  const service = getEnglishService((await params).slug);
  if (!service) notFound();
  return <ServiceContent service={service} locale="en" />;
}
