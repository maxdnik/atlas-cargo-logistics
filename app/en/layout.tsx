import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Freight Forwarder in Argentina | Atlas Cargo",
  description: "International logistics for businesses in Argentina. Ocean, air and road freight, customs coordination and shipment tracking.",
};
export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
