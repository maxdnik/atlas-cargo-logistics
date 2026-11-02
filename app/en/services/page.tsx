import ServicesDirectory from "@/app/components/services-directory";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("International Logistics Services in Argentina | Atlas Cargo", "Explore Atlas Cargo services: ocean, air and road freight, customs coordination, machinery logistics and freight from China to Argentina for businesses.", "/en/services");
export default function Page() { return <ServicesDirectory locale="en" />; }
