import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const company = String(body.company || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const service = String(body.service || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !service || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan campos obligatorios.",
        },
        { status: 400 }
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const contactEmail =
      process.env.CONTACT_EMAIL || "maximo.dimnik@atlas-cargo-logistics.com";

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan variables SMTP en el servidor.",
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const html = `
      <div style="font-family: Arial, sans-serif; color: #09264a; padding: 24px;">
        <h2 style="margin: 0 0 18px; color: #09264a;">
          Nueva consulta desde Atlas Cargo Logistics
        </h2>

        <table cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 680px;">
          <tr>
            <td style="font-weight: 700; border-bottom: 1px solid #e7eaf0;">Nombre</td>
            <td style="border-bottom: 1px solid #e7eaf0;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; border-bottom: 1px solid #e7eaf0;">Empresa</td>
            <td style="border-bottom: 1px solid #e7eaf0;">${escapeHtml(company || "-")}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; border-bottom: 1px solid #e7eaf0;">Email</td>
            <td style="border-bottom: 1px solid #e7eaf0;">${escapeHtml(email)}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; border-bottom: 1px solid #e7eaf0;">Teléfono</td>
            <td style="border-bottom: 1px solid #e7eaf0;">${escapeHtml(phone || "-")}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; border-bottom: 1px solid #e7eaf0;">Servicio</td>
            <td style="border-bottom: 1px solid #e7eaf0;">${escapeHtml(service)}</td>
          </tr>
        </table>

        <div style="margin-top: 22px;">
          <strong>Mensaje</strong>
          <div style="margin-top: 10px; padding: 16px; background: #f4f6f8; border-radius: 12px; line-height: 1.6;">
            ${escapeHtml(message).replaceAll("\n", "<br />")}
          </div>
        </div>

        <p style="margin-top: 28px; color: #6d7684;">
          Atlas Cargo Logistics · www.atlas-cargo-logistics.com
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Atlas Cargo Logistics" <${smtpUser}>`,
      to: contactEmail,
      replyTo: email,
      subject: `Nueva consulta comercial - ${service}`,
      html,
      text: `
Nueva consulta desde Atlas Cargo Logistics

Nombre: ${name}
Empresa: ${company || "-"}
Email: ${email}
Teléfono: ${phone || "-"}
Servicio: ${service}

Mensaje:
${message}
      `.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Consulta enviada correctamente.",
    });
  } catch (error) {
    console.error("CONTACT_FORM_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error enviando consulta.",
      },
      { status: 500 }
    );
  }
}
