import HomePage from "@/app/components/home-page";
import { HOME_TITLE, HOME_DESCRIPTION, pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(HOME_TITLE, HOME_DESCRIPTION, "/");
export default function Page() { return <HomePage locale="es" />; }
