import ServicesDirectory from "@/app/components/services-directory";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Servicios de logística internacional en Argentina | Atlas Cargo", "Conocé los servicios de Atlas Cargo: transporte marítimo, aéreo y terrestre, coordinación aduanera, maquinaria y fletes de China a Argentina para empresas.", "/servicios");
export default function Page() { return <ServicesDirectory locale="es" />; }
