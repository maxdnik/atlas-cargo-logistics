import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

// The destination stays on the server and never comes from the form payload.
const contactEmail = "maximo.dimnik@atlas-cargo-logistics.com";
const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(50).optional().default(""),
  service: z.string().trim().min(1).max(100).refine((value) => !/[\r\n]/.test(value)),
  message: z.string().trim().min(1).max(5000),
  submissionId: z.string().uuid().optional(),
});

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
    let raw: unknown;
    try {
      const text = await request.text();
      if (text.length > 20000) return NextResponse.json({ success: false, message: "La consulta es demasiado larga." }, { status: 413 });
      raw = JSON.parse(text);
    } catch {
      return NextResponse.json({ success: false, message: "Revisá los datos de la consulta." }, { status: 400 });
    }
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ success: false, message: "Revisá los campos obligatorios y el email." }, { status: 400 });
    const { name, company, email, phone, service, message, submissionId } = parsed.data;

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

    const mail = {
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
    };

    if (process.env.RESEND_API_KEY) {
      const result = await new Resend(process.env.RESEND_API_KEY).emails.send(
        { ...mail, from: `Atlas Cargo Web <${contactEmail}>` },
        { idempotencyKey: `atlas-contact/${submissionId || randomUUID()}` },
      );
      if (result.error || !result.data?.id) {
        console.error("CONTACT_FORM_RESEND", result.error?.name || "empty_response");
        return NextResponse.json({ success: false, message: "No pudimos confirmar el envío. Intentá nuevamente." }, { status: 502 });
      }
    } else {
      const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.error("CONTACT_FORM_NOT_CONFIGURED");
        return NextResponse.json({ success: false, message: "El envío no está disponible temporalmente." }, { status: 503 });
      }
      const port = Number(process.env.SMTP_PORT || 587);
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
      });
      const result = await transporter.sendMail({ ...mail, from: `"Atlas Cargo Web" <${SMTP_USER}>` });
      if (!result.accepted?.some((recipient) => String(recipient).toLowerCase() === contactEmail)) throw new Error("RecipientNotAccepted");
    }

    return NextResponse.json({
      success: true,
      message: "Consulta enviada correctamente.",
    });
  } catch (error) {
    console.error("CONTACT_FORM_ERROR", error instanceof Error ? error.name : "unknown");

    return NextResponse.json(
      {
        success: false,
        message: "Error enviando consulta.",
      },
      { status: 500 }
    );
  }
}
