import Link from "next/link";
import { getAdmin } from "@/lib/admin/session";
import { redirect } from "next/navigation";
import { LoginForm } from "../ui/login-form";
export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin/marketing");
  const configured = Boolean(
    process.env.RESEND_API_KEY && process.env.ATLAS_SESSION_SECRET,
  );
  return (
    <div className="admin-login">
      <div className="admin-login-art">
        <Link href="/" className="admin-wordmark">
          ATLAS <span>CARGO</span>
          <small>LOGISTICS</small>
        </Link>
        <div>
          <p className="admin-kicker">TU PRÓXIMA OPERACIÓN EMPIEZA ACÁ</p>
          <h1>
            Más cerca de
            <br />
            tus clientes.
          </h1>
          <p>
            Campañas, contactos y oportunidades.
            <br />
            Todo desde Atlas Cargo.
          </p>
        </div>
        <small>BUENOS AIRES · ARGENTINA</small>
      </div>
      <main className="admin-login-panel">
        <span className="admin-badge">ACCESO PRIVADO</span>
        <h2>Bienvenido a Atlas.</h2>
        <p>
          Ingresá con tu email de administrador. Te enviaremos un enlace de
          acceso seguro.
        </p>
        <LoginForm configured={configured} />
        <Link href="/" className="admin-text-link">
          ← Volver al sitio
        </Link>
      </main>
    </div>
  );
}
