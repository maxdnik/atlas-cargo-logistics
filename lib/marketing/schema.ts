import { z } from "zod";

export const SITE = "https://www.atlas-cargo-logistics.com";
export const ATLAS_EMAIL = "maximo.dimnik@atlas-cargo-logistics.com";
export const FROM = `Atlas Cargo Logistics <${ATLAS_EMAIL}>`;
export const UNSUBSCRIBE = "{{{RESEND_UNSUBSCRIBE_URL}}}";
const httpsUrl = z
  .string()
  .url()
  .max(500)
  .refine(
    (value) => new URL(value).protocol === "https:",
    "Usá un enlace https.",
  );
export const campaignSchema = z.object({
  name: z.string().trim().min(1).max(60),
  subject: z
    .string()
    .trim()
    .min(3)
    .max(150)
    .refine((v) => !/[\r\n]/.test(v)),
  preview: z.string().trim().max(180),
  title: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(6000),
  services: z.boolean(),
  cta: z.string().trim().min(2).max(50),
  url: httpsUrl,
});
export type CampaignContent = z.infer<typeof campaignSchema>;
export const defaultCampaign: CampaignContent = {
  name: "Presentación de Atlas Cargo",
  subject: "Cada carga, una solución | Atlas Cargo Logistics",
  preview:
    "Transporte marítimo, aéreo y terrestre para tu próxima importación o exportación.",
  title: "Cada carga, una solución.",
  message:
    "Un contenedor completo, una carga consolidada o un repuesto urgente. Cada operación necesita su propio plan.\n\nEn Atlas Cargo Logistics coordinamos el transporte y la gestión de tu mercadería, con atención directa y seguimiento desde el origen hasta el destino.",
  services: true,
  cta: "Hablemos de tu próxima carga",
  url: `${SITE}/#contacto`,
};
export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export function renderCampaign(content: CampaignContent, test = false) {
  const c = campaignSchema.parse(content);
  const services = [
    [
      "Transporte marítimo",
      "Contenedores completos (FCL) y carga consolidada (LCL).",
    ],
    [
      "Transporte aéreo",
      "Alternativas para repuestos, muestras y cargas con plazos exigentes.",
    ],
    [
      "Transporte terrestre",
      "Retiros y entregas que conectan puertos, aeropuertos, depósitos y plantas.",
    ],
  ];
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(c.subject)}</title></head><body style="margin:0;background:#edf1f5;color:#102345;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(c.preview)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff;border-top:4px solid #ee3d2e"><tr><td style="padding:26px 30px"><a href="${SITE}" style="text-decoration:none;color:#102345;font-size:24px;letter-spacing:1px"><strong>ATLAS</strong> CARGO</a><div style="font-size:10px;letter-spacing:4px;margin-top:6px">LOGISTICS</div></td></tr><tr><td><a href="${SITE}"><img src="${SITE}/images/social-cover.jpg" width="600" alt="Atlas Cargo. Tu carga. Nuestro compromiso." style="display:block;width:100%;height:auto;border:0"></a></td></tr><tr><td style="padding:32px 30px"><p style="font-size:10px;letter-spacing:2px;color:#cb332a;font-weight:bold">IMPORTACIONES Y EXPORTACIONES</p><h1 style="font-size:30px;line-height:1.2;margin:16px 0 24px">${escapeHtml(c.title)}</h1>${c.message
    .split(/\n\s*\n/)
    .map(
      (p) =>
        `<p style="font-size:16px;line-height:1.7;color:#4c586a;margin:0 0 18px">${escapeHtml(p).replaceAll("\n", "<br>")}</p>`,
    )
    .join(
      "",
    )}${c.services ? services.map(([title, body], i) => `<div style="border-top:1px solid #e0e5ed;padding:22px 0"><strong style="font-size:17px">0${i + 1}&nbsp; ${title}</strong><p style="color:#586274;line-height:1.6;font-size:14px;margin:10px 0 0">${body}</p></div>`).join("") + '<p style="font-size:14px;line-height:1.7;color:#586274">Gestión aduanera · Operaciones especiales · Seguimiento operativo</p>' : ""}<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0"><tr><td bgcolor="#d33225" style="padding:17px 22px"><a href="${escapeHtml(c.url)}" style="color:#fff;text-decoration:none;font-weight:bold;font-size:15px">${escapeHtml(c.cta)} →</a></td></tr></table><p style="font-size:14px;line-height:1.7;color:#586274">También podés responder este email y conversar directamente con Máximo.</p><p style="font-size:14px;line-height:1.7"><strong>Máximo Dimnik</strong><br>Atlas Cargo Logistics<br><a href="mailto:${ATLAS_EMAIL}" style="color:#102345">${ATLAS_EMAIL}</a></p></td></tr><tr><td style="background:#102345;color:#fff;padding:28px 30px;font-size:12px;line-height:1.9"><a href="${SITE}" style="color:#fff">Conocé nuestra web</a> &nbsp; | &nbsp; <a href="https://www.instagram.com/atlas.cargo.argentina/" style="color:#fff">Seguinos en Instagram</a><p style="margin:18px 0 8px;color:#d5dfea">Atlas Cargo Logistics · Atlas Cargo SRL<br>Buenos Aires, Argentina</p>${test ? '<p style="color:#d5dfea">Vista de prueba. Este envío no modifica tu suscripción.</p>' : `<a href="${UNSUBSCRIBE}" style="color:#d5dfea">Dejar de recibir novedades</a>`}</td></tr></table></td></tr></table></body></html>`;
}
