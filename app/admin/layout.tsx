import type { Metadata } from "next";
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
  return <div className="atlas-admin">{children}</div>;
}
