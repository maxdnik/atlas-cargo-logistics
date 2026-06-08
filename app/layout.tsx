import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas Cargo Logistics",
  description: "Soluciones logísticas internacionales: carga aérea, marítima, terrestre, aduana y operaciones especiales.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
