import { authorize, apiError, json } from "@/lib/admin/http";
import { senderStatus } from "@/lib/marketing/resend";
import { FROM, ATLAS_EMAIL } from "@/lib/marketing/schema";
export async function GET(request: Request) {
  try {
    await authorize(request);
    return json({
      ...(await senderStatus()),
      from: FROM,
      replyTo: ATLAS_EMAIL,
    });
  } catch (e) {
    return apiError(e);
  }
}
