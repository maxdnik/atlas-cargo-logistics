"use client";

import { FormEvent, useState } from "react";
import { Plane, Ship, Truck, FileCheck, Cog, Radar } from "lucide-react";

const services = [
  {
    title: "Carga aérea",
    icon: Plane,
    text: "Soluciones ágiles para cargas urgentes, muestras, repuestos y operaciones sensibles al tiempo.",
  },
  {
    title: "Carga marítima",
    icon: Ship,
    text: "FCL, LCL, consolidados y proyectos especiales desde los principales orígenes del mundo.",
  },
  {
    title: "Transporte terrestre",
    icon: Truck,
    text: "Coordinación nacional e internacional para completar la operación de punta a punta.",
  },
  {
    title: "Despacho y gestión aduanera",
    icon: FileCheck,
    text: "Acompañamiento documental, operativo y normativo para importaciones y exportaciones.",
  },
  {
    title: "Operaciones especiales",
    icon: Cog,
    text: "Diseño logístico a medida para cargas sobredimensionadas, proyectos industriales y envíos críticos.",
  },
  {
    title: "Seguimiento operativo",
    icon: Radar,
    text: "Comunicación clara, visibilidad y control durante cada etapa del proceso logístico.",
  },
];

const stats = ["Aéreo", "Marítimo", "Terrestre", "Aduana"];

export default function Home() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("nombre") || ""),
      company: String(formData.get("empresa") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("telefono") || ""),
      service: String(formData.get("servicio") || ""),
      message: String(formData.get("mensaje") || ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "No se pudo enviar la consulta.");
      }

      form.reset();
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <main>
      <header className="navbar">
        <a href="#inicio" className="brand" aria-label="Atlas Cargo Logistics">
          <span className="brandMark">A</span>
          <span>
            <strong>ATLAS</strong>
            <small>CARGO LOGISTICS</small>
          </span>
        </a>
        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#servicios">Servicios</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </header>

      <section id="inicio" className="hero sectionShell">
        <div className="heroOverlay" />
        <div className="routeLine" />
        <div className="heroContent">
          <p className="eyebrow">Freight Forwarder · Argentina</p>
          <h1>Soluciones logísticas que trascienden fronteras</h1>
          <p>
            Coordinamos operaciones aéreas, marítimas y terrestres con gestión personalizada,
            respuesta ágil y seguimiento constante de principio a fin.
          </p>
          <div className="heroActions">
            <a href="#contacto" className="primaryBtn">Solicitar cotización</a>
            <a href="#servicios" className="secondaryBtn">Ver servicios</a>
          </div>
        </div>
      </section>

      <section id="nosotros" className="about wrapper">
        <div className="sectionTitle">
          <p className="eyebrow">Quiénes somos</p>
          <h2>Un equipo cercano para operaciones complejas</h2>
        </div>
        <div className="aboutGrid">
          <div className="aboutCard dark">
            <h3>Gestión integral</h3>
            <p>
              Atlas Cargo Logistics nace con una visión clara: simplificar el comercio exterior
              para empresas que necesitan mover carga con seguridad, eficiencia y criterio operativo.
            </p>
          </div>
          <div className="aboutCard">
            <h3>Know-how operativo</h3>
            <p>
              Trabajamos cada embarque como una operación única: analizamos origen, destino,
              tiempos, costos, documentación y alternativas para diseñar la mejor ruta posible.
            </p>
          </div>
          <div className="aboutCard">
            <h3>Comunicación clara</h3>
            <p>
              Priorizamos la atención personalizada, el seguimiento permanente y la anticipación
              de posibles desvíos para que cada cliente tenga control real sobre su carga.
            </p>
          </div>
        </div>
      </section>

      <section id="servicios" className="services wrapper">
        <div className="sectionTitle centered">
          <p className="eyebrow">Servicios</p>
          <h2>Operaciones internacionales de punta a punta</h2>
          <p className="sectionIntro">
            Importaciones, exportaciones, cargas generales, proyectos especiales y coordinación
            multimodal con una mirada comercial y operativa.
          </p>
        </div>
        <div className="serviceGrid">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article className="serviceCard" key={service.title}>
                <span className="serviceIcon">
                  <Icon size={40} strokeWidth={2.2} />
                </span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="banner sectionShell">
        <div>
          <p className="eyebrow">Cobertura operativa</p>
          <h2>Acompañamos tu carga desde el origen hasta el destino final</h2>
        </div>
        <div className="statRow">
          {stats.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <section id="contacto" className="contact wrapper">
        <div className="contactPanel">
          <div>
            <p className="eyebrow">Contacto</p>
            <h2>Conversemos sobre tu próxima operación</h2>
            <p>
              Envianos los datos principales de tu carga y nuestro equipo comercial te responderá
              con una propuesta logística adaptada a tu necesidad.
            </p>
            <div className="contactData">
              <a href="mailto:contactok@atlas-cargo-logistics.com">
                contacto@atlas-cargo-logistics.com
              </a>
              <span>Buenos Aires, Argentina</span>
              <span>www.atlas-cargo-logistics.com</span>
            </div>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <input name="nombre" placeholder="Nombre y apellido" required />
            <input name="empresa" placeholder="Empresa" />
            <input name="email" type="email" placeholder="Email" required />
            <input name="telefono" placeholder="Teléfono" />
            <select name="servicio" defaultValue="" required>
              <option value="" disabled>Servicio de interés</option>
              <option value="Carga aérea">Carga aérea</option>
              <option value="Carga marítima">Carga marítima</option>
              <option value="Transporte terrestre">Transporte terrestre</option>
              <option value="Despacho y gestión aduanera">Despacho y gestión aduanera</option>
              <option value="Operación especial">Operación especial</option>
              <option value="Seguimiento operativo">Seguimiento operativo</option>
            </select>
            <textarea
              name="mensaje"
              placeholder="Contanos origen, destino, tipo de carga, volumen y fechas estimadas"
              rows={5}
              required
            />
            <button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Enviando..." : "Enviar consulta"}
            </button>

            {status === "success" && (
              <p className="formStatus success">
                Consulta enviada correctamente. Te vamos a responder a la brevedad.
              </p>
            )}

            {status === "error" && (
              <p className="formStatus error">
                No pudimos enviar la consulta. Revisá las variables SMTP o intentá nuevamente.
              </p>
            )}
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="brand footerBrand">
          <span className="brandMark">A</span>
          <span>
            <strong>ATLAS</strong>
            <small>CARGO LOGISTICS</small>
          </span>
        </div>
        <p>© 2026 Atlas Cargo Logistics. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
