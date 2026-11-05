# BLU Solutions

Sitio y catálogo comercial de BLU Solutions. Incluye 482 referencias de habitaciones, restaurantes, gimnasios, mobiliario Outdoor y señalamientos.

## Estructura

- `dist/index.html`: página principal y catálogo.
- `dist/contacto.html`: formulario de contacto.
- `dist/site.js` y `dist/style.css`: interacciones y presentación.
- `dist/assets/catalog.json`: fichas de productos.
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

Con Node.js 20 o posterior, ejecutar `npm run check`. No requiere instalar dependencias. La comprobación revisa sintaxis JavaScript, 482 fichas, imágenes, enlaces locales y las huellas SHA-256 de los 515 archivos del sitio. También se ejecuta en GitHub Actions con cada cambio.

`docs/asset-manifest.json` registra tamaños, huellas y procedencia de la versión 5 publicada en Sites, commit `e6814d07d25cad235433f8c6c84ae77bcf0b2531`. El respaldo contiene 494 imágenes WebP y 15 PDF. Los archivos de `dist/` se conservan completos y los atributos de Git preservan sus bytes al descargarlos.

`.openai/hosting.json` conserva la configuración del alojamiento original; no contiene credenciales. Para otros proveedores, la carpeta pública sigue siendo `dist/`.

## Contenido

Las fotografías y catálogos de fabricantes conservan los derechos de sus respectivos titulares. Este repositorio no concede una licencia para reutilizarlos. Los materiales de los señalamientos deben confirmarse para cada proyecto; sus nombres describen los acabados visibles en las referencias.
