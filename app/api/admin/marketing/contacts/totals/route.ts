import { authorize, apiError, json } from "@/lib/admin/http";
import { contactTotals } from "@/lib/marketing/contact-counts";
export const maxDuration = 300;
export async function GET(request: Request) {
  try { await authorize(request); return json(await contactTotals()); }
  catch (error) { return apiError(error); }
}
