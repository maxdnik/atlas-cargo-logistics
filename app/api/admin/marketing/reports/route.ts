import { authorize, apiError, json } from "@/lib/admin/http";
import { report, reportQuery } from "@/lib/marketing/reporting";
export const maxDuration = 60;
export async function GET(request: Request) {
  try {
    await authorize(request);
    const query = Object.fromEntries(new URL(request.url).searchParams);
    return json(await report(reportQuery.parse(query)));
  } catch (error) { return apiError(error); }
}
