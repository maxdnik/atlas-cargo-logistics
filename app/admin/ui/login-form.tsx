"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function LoginForm({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError("");
        setMessage("");
        try {
          const r = await fetch("/api/admin/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "login", email }),
          });
          const d = await r.json();
          if (!r.ok) throw Error(d.error);
          setMessage(d.message);
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "No se pudo enviar el acceso.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      {!configured && (
        <div className="admin-notice">
          El panel está instalado. Falta conectar Resend para habilitar el
          acceso por email y las campañas.
        </div>
      )}
      <label>
        Email de administrador
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          disabled={!configured}
        />
      </label>
      <button
        className="admin-button primary"
        disabled={pending || !configured}
      >
        {pending ? "Enviando acceso…" : "Recibir enlace de acceso →"}
      </button>
      {message && (
        <p className="admin-success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
export function VerifyForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <button
        className="admin-button primary"
        disabled={pending || !token}
        onClick={async () => {
          setPending(true);
          try {
            const r = await fetch("/api/admin/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "verify", token }),
            });
            const d = await r.json();
            if (!r.ok) throw Error(d.error);
            router.replace("/admin/marketing");
            router.refresh();
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : "No pudimos verificar el acceso.",
            );
            setPending(false);
          }
        }}
      >
        {pending ? "Verificando…" : "Ingresar al administrador"}
      </button>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      <p>
        <a className="admin-text-link" href="/admin/login">
          Solicitar otro enlace
        </a>
      </p>
    </div>
  );
}
