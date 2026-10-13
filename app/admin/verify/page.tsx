import Link from "next/link";
import { VerifyForm } from "../ui/login-form";
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  return (
    <main className="admin-verify">
      <Link href="/" className="admin-wordmark">
        ATLAS <span>CARGO</span>
        <small>LOGISTICS</small>
      </Link>
      <h1>Tu panel de Atlas Cargo</h1>
      <p>Confirmá el acceso desde el navegador donde lo solicitaste.</p>
      <VerifyForm token={token} />
    </main>
  );
}
