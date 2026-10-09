# Atlas Cargo SRL

Sitio institucional de Atlas Cargo: transporte marítimo, aéreo y terrestre, gestión aduanera, operaciones especiales y seguimiento operativo.

## Desarrollo

```bash
npm ci
npm run dev
```

```bash
npm run lint
npm run build
npm run start
```

## Identidad visual

La web utiliza azul marino `#102345`, rojo `#EE3D2E` y blanco. Los recursos optimizados están en `public/images/`: el logo aprobado, fotografías adaptadas de las piezas de marca y la portada para compartir enlaces. El contenido permanece como HTML accesible; las imágenes no contienen los textos de la web.

La página se renderiza en el servidor. Solamente el menú móvil y el formulario requieren componentes de cliente.

## Formulario

`POST /api/contact` conserva la integración SMTP existente. La configuración se administra en Vercel: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y `CONTACT_EMAIL`. No incluir credenciales en el repositorio.

La interfaz muestra estados de envío, confirmación y error, y ofrece contacto directo por email. No enviar consultas reales durante verificaciones visuales; utilizar respuestas simuladas y solicitudes incompletas para probar la validación.

## Publicación

Repositorio: `maxdnik/atlas-cargo-logistics`. Proyecto Vercel: `atlas-cargo-logistics`. Dominio: https://www.atlas-cargo-logistics.com. La rama de producción es `main`.
