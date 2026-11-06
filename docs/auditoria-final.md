# Auditoría final — 6 de noviembre de 2026

## Resultado de la revisión local

La portada de Restaurantes utiliza la imagen exacta elegida por el cliente, convertida a WebP para la web. Se usa una URL nueva para evitar la caché de la portada anterior. Las otras nueve portadas y los documentos PDF no se modifican en esta entrega.

- Catálogo: 482 referencias originales y 9 ilustrativas. Esquemas, rutas locales e integridad de 553 archivos públicos comprobados.
- JavaScript: sintaxis y pruebas de validación, tiempos máximos, reintentos y fallos de imágenes aprobadas.
- Introducción: alternancia entre logo y frases, diez escenas, pausa en segundo plano, movimiento reducido y cambio a color por toque con regreso a blanco aprobados en pruebas.
- Recuperación: una fuente de catálogo fallida conserva la otra; reintentar recupera el total. Una imagen detenida o fallida no borra la imagen visible.
- Contacto: validación de campos y precarga desde URL sin interpretar HTML; se prepara el correo localmente sin afirmar que fue enviado.
- Seguridad: escaneo por patrones de archivos e historial sin hallazgos. Esto no demuestra ausencia absoluta de secretos o vulnerabilidades.
- Cambios limitados a la portada elegida, su referencia HTML y el manifiesto. El resto de las funciones e imágenes se conserva mediante comparación con la versión anterior.

## Límites pendientes para producción

El teléfono de Contacto sigue siendo ficticio y está marcado como provisional: debe sustituirse antes de entregar el sitio como canal telefónico real. El correo publicado es manuel.agosto@blusolutions.com.mx; no se ha verificado la recepción de ese buzón enviando mensajes.

El formulario prepara una solicitud para correo o para copiar; no hay receptor automático, confirmación de entrega, CAPTCHA ni límite de peticiones de servidor. Si se conecta un receptor, deben implementarse allí esas protecciones.

GitHub Pages no aplica las cabeceras HTTP preparadas para otros alojamientos. La protección administrativa de main, 2FA y una copia independiente de recuperación siguen requiriendo comprobación de la cuenta. No se ha hecho una prueba de carga y no se garantiza una cantidad de visitantes simultáneos.

El detalle de los veinte controles y las configuraciones de alojamiento está en [seguridad-y-lanzamiento.md](seguridad-y-lanzamiento.md).
