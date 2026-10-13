import { requireAdmin, ADMIN_EMAIL } from "@/lib/admin/session";
import MarketingPanel from "../ui/marketing-panel";
export default async function MarketingPage() {
  await requireAdmin();
  return <MarketingPanel testEmail={ADMIN_EMAIL()} />;
}
