# BLU Solutions

Sitio y catálogo comercial de BLU Solutions. Incluye 482 referencias originales y nueve ejemplos ilustrativos de mantelería, cristalería y cubertería. OS&E y FF&E encabezan las áreas con listas de familias de productos y solicitudes a medida.

## Estructura

- `dist/index.html`: página principal y catálogo.
- `dist/contacto.html`: formulario de contacto.
- `dist/site.js` y `dist/style.css`: interacciones y presentación.
- `dist/hero.js`, `dist/hero.css` y `dist/assets/hero/`: portada de diez escenas con transición continua y alternancia del logo (12.5 segundos) y tres frases (8.5 segundos cada una). Cada elemento se desvanece antes de revelar suavemente el siguiente, sin ampliaciones ni desplazamientos. Logo de cristal blanco en escritorio y móvil. Respeta movimiento reducido y detiene la reproducción cuando la pestaña está oculta.
- `dist/assets/catalog.json`: fichas de productos.
- `dist/assets/sourcing-products.json`: nueve ejemplos ilustrativos, tres por nueva categoría; no representan modelos en stock. Los botones y el recuadro de abastecimiento llevan al formulario con el interés precargado.
- `dist/assets/`: imágenes, tipografías y catálogos PDF.

## Vista local

Con Python instalado, ejecutar desde la raíz:

```sh
python3 -m http.server 8080 --directory dist
```

Abrir http://localhost:8080. Debe servirse por HTTP para que el catálogo JSON se cargue correctamente.

## Publicación

Publicar el contenido de `dist` como sitio estático. No requiere instalación ni compilación. El formulario abre un borrador en la aplicación de correo del visitante; no envía mensajes desde un servidor.

La publicación actual en ChatGPT Sites se administra por separado. Subir cambios a este repositorio no actualiza automáticamente ese alojamiento.

## Verificación del respaldo

Con Node.js 20 o posterior, ejecutar `npm run check`. No requiere instalar dependencias. La comprobación revisa sintaxis JavaScript, el ciclo y las transiciones de la portada, las 482 fichas originales y las nueve referencias ilustrativas, imágenes, enlaces locales y huellas SHA-256. También se ejecuta en GitHub Actions con cada cambio. Tras modificar archivos de `dist`, ejecutar `node scripts/update-manifest.mjs` y después `npm run check`.

`docs/asset-manifest.json` registra tamaños y huellas de los archivos actuales, conservando la procedencia de la versión 5 publicada en Sites, commit `e6814d07d25cad235433f8c6c84ae77bcf0b2531`.

`.openai/hosting.json` conserva la configuración del alojamiento original; no contiene credenciales. Para otros proveedores, la carpeta pública sigue siendo `dist/`.

## Contenido

Las fotografías y catálogos de fabricantes conservan los derechos de sus respectivos titulares. Este repositorio no concede una licencia para reutilizarlos. Los materiales de los señalamientos deben confirmarse para cada proyecto; sus nombres describen los acabados visibles en las referencias.

Las cinco nuevas portadas y las nueve referencias de abastecimiento son imágenes generadas, utilizadas como ilustraciones. Las especificaciones y la disponibilidad se confirman con el equipo comercial. Los PDF completos de cristalería y cubertería quedan pendientes de recibir; no se publican enlaces de descarga hasta disponer de esos archivos.

El bloque visible de contacto personal se retiró para ampliar las escenas debajo de «Hablemos de tu proyecto». El destinatario del formulario y los datos del aviso de privacidad conservan su función.

## Refuerzo de seguridad y lanzamiento

Ver [la revisión de los 20 puntos y los pendientes externos](docs/seguridad-y-lanzamiento.md). El catálogo tiene recuperación independiente por fuente, validación de JSON y reintentos. Las imágenes tienen tiempos máximos y conservan el fotograma actual ante fallos. La publicación de Pages depende de las verificaciones, con acciones directas fijadas a SHA y escaneo de secretos en el historial alcanzable. No hay dependencias npm.

El formulario prepara una solicitud validada que puede copiarse o abrirse en correo; no es un servicio de envío ni confirma entregas. Se incorpora `dist/404.html`, autónoma para rutas inexistentes anidadas. `dist/_headers`, `netlify.toml` y `vercel.json` preparan un alojamiento compatible; no cambian las cabeceras de GitHub Pages ni migran el sitio por sí solos. La protección administrativa de `main`, 2FA, un receptor de formularios y la activación de cabeceras requieren configuración externa.

Las portadas muestran únicamente sus títulos. Los controles de acción usan liquid glass y texto sin flechas decorativas. El bloque «¿Buscas algo específico?» se ubica después del catálogo y antes de la historia: reutiliza la fotografía existente de alberca y vegetación de Nardi (`assets/nardi-outdoor.webp`) con una capa oscura y el botón «Solicita tu producto». Una luz tenue recorre el borde del botón y se detiene con movimiento reducido. OS&E y FF&E presentan las familias que conseguimos y cierran con un único botón de solicitud. Mantelería, cristalería y cubertería mantienen el aviso de imágenes ilustrativas junto a su botón de cotización, sin repetir el título del bloque fotográfico.
