import type { Metadata } from "next";
import "@/app/globals.css";
import "./admin.css";
export const metadata: Metadata = {
  title: "Administración | Atlas Cargo",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <html lang="es-AR"><body><div className="atlas-admin">{children}</div></body></html>;
}
