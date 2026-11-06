# Seguridad y lanzamiento de BLU Solutions

Esta revisión corresponde a un catálogo público estático. No hay cuentas de clientes, base de datos, sesiones, pagos ni una API que reciba formularios. No se deben introducir esas funciones sin una revisión adicional de servidor, almacenamiento y permisos.

## Cambios incluidos

- Los dos catálogos se cargan de forma independiente, con validación de estructura y rutas de imagen, tiempos máximos, un reintento automático y recuperación manual. Una fuente fallida conserva las referencias disponibles de la otra.
- Las imágenes nuevas se precargan con un tiempo máximo. La imagen visible de contacto se mantiene ante errores o descargas detenidas. La portada limita las imágenes retenidas por JavaScript y reduce la precarga; la imagen de mayor peso y la primera escena se optimizaron conservando los originales en Git.
- El formulario valida longitudes, campos obligatorios, correo y opciones permitidas. Las entradas se usan como texto, nunca como HTML ejecutable. La solicitud se prepara localmente y puede abrirse en correo o copiarse; no se muestra una confirmación falsa de envío.
- La publicación tiene un trabajo de validación obligatorio: `deploy` depende de `verify`. Las acciones directas están fijadas a SHA de commits verificados en sus repositorios oficiales. Dependabot propone actualizaciones semanales de GitHub Actions; no se habilita fusión automática.
- La comprobación incluye sintaxis, catálogos, integridad SHA-256, pruebas de seguridad, pruebas de portada, credenciales reconocibles en archivos e historial Git alcanzable y tipos de archivos públicos. Un escáner por patrones no identifica todos los formatos posibles de secretos ni sustituye la rotación si apareciera una credencial real.
- La 404 es autónoma, no carga scripts ni refleja la ruta solicitada. Sus enlaces funcionan desde rutas inexistentes anidadas en GitHub Pages.
- Se conserva CSP en HTML y `no-referrer`. Se preparan cabeceras HTTP para un alojamiento que permita configurarlas: `dist/_headers` para Netlify/Cloudflare Pages y `vercel.json` para Vercel.

## Los 20 puntos de la lista

| Punto | Estado y aplicación real |
| --- | --- |
| 1. Ocultar API keys | No se necesitan claves en el navegador. El escaneo busca formatos comunes. Cualquier futura clave privada debe residir exclusivamente en secretos de servidor. |
| 2. Eliminar secretos de Git | Escaneo del árbol de trabajo y de los commits alcanzables. Si se detecta una clave real, bloquear publicación, revocar/rotar y planificar limpieza de historial; no reescribir historia automáticamente. |
| 3. Key pública para DB | No aplica: no hay conexión a una base de datos. No añadir claves administrativas en HTML, JS o JSON. |
| 4. Row-Level Security | No aplica: no hay tablas ni usuarios. Será obligatoria una revisión de autorización al incorporar una base de datos. |
| 5. Encriptar datos sensibles | HTTPS/HSTS en el alojamiento actual. No se almacenan solicitudes en el sitio. La seguridad del buzón y de su proveedor requiere revisión independiente. |
| 6. Forzar autenticación | El catálogo es público por diseño. La cuenta administradora de GitHub debe usar 2FA; su activación no se puede verificar desde el código. |
| 7. Restringir acceso a registros | No hay API de registros privados. Se publica solo `dist`; no se incluyen configuración privada, código de pruebas ni archivos de entorno. |
| 8. Bloquear manipulación de campos | Se validan opciones y longitudes del formulario. La validación de navegador es eludible: los datos no constituyen una orden ni un precio autorizado. Un futuro servidor debe validarlos de nuevo. |
| 9. Proteger sesión/cookies | No aplica: la aplicación no crea sesiones ni cookies de autenticación. No existe información de sesión propia que proteger. |
| 10. Hashear contraseñas | No aplica: no se reciben ni guardan contraseñas. |
| 11. Rate limiting | No hay endpoint de escritura que limitar. La protección contra tráfico abusivo depende del alojamiento; límites por IP deben configurarse en el futuro servidor/WAF, no en JavaScript del cliente. |
| 12. Protección contra bots | No hay envío automático de correo desde la web. El correo público puede recibir spam. Un futuro receptor de formularios necesitará controles de servidor y, si procede, desafío anti-bot. |
| 13. Parametrizar queries | No aplica: no hay SQL ni consultas de base de datos. Las consultas de interfaz se filtran localmente. |
| 14. Validar inputs | Validación local de tipo, longitudes, correo, opciones y controles; JSON validado antes de renderizar. Requiere repetición en servidor si se conecta una API. |
| 15. Sanitizar contenido | `textContent`/`value`, nunca HTML proveniente de visitantes. Rutas de imagen restringidas a archivos WebP locales. No ejecutar ni interpretar los textos como código. |
| 16. Restringir archivos | No existe carga de archivos. La publicación rechaza enlaces simbólicos, tipos inesperados y nombres de archivos privados. |
| 17. Devolver datos necesarios | El catálogo expone referencias comerciales públicas. No hay endpoints con datos de usuarios ni secretos de servidor. |
| 18. Security headers | CSP en HTML activa. Cabeceras HTTP preparadas, pendientes de desplegar en un proveedor compatible; GitHub Pages no aplica `_headers` ni `vercel.json`. No afirmar que `frame-ancestors` o `X-Frame-Options` están activos por incluir estos archivos. |
| 19. Forzar HTTPS | GitHub Pages sirve este dominio `github.io` por HTTPS y se verificó HSTS. `upgrade-insecure-requests` evita cargar recursos HTTP desde las páginas. Verificar redirección y certificado al cambiar de dominio/alojamiento. |
| 20. Escanear dependencias | No hay dependencias npm de ejecución ni desarrollo en este repositorio. Se revisan las acciones directas y se fijan sus SHA. Dependabot propone sus actualizaciones. Si se añaden paquetes, exigir lockfile y análisis de vulnerabilidades en CI. |

## Pendientes externos antes del lanzamiento comercial definitivo

1. **Recepción confirmada de formularios.** Elegir un proveedor o servidor, destinatario y método de autenticación. El código actual prepara el mensaje, pero no lo envía, registra ni confirma su recepción. No enviar datos de clientes a un tercero sin elegir y configurar ese servicio.
2. **Cabeceras y protección de tráfico.** Elegir un alojamiento compatible para activar las cabeceras preparadas y, si se incorpora un receptor, limitar sus solicitudes en servidor. No se ha creado ni contratado un servicio nuevo. GitHub Pages tiene condiciones de uso y límites propios que deben validarse para este uso comercial.
3. **Protección administrativa de `main`.** La conexión disponible permite cambios de código; el navegador no tiene sesión de administrador. No se ha activado protección de rama. En Settings → Rules → Rulesets, crear una regla activa para `main`, impedir eliminación y force-push, exigir pull request y el check `verify`. Usar al menos una aprobación si existe otro revisor; no bloquear una cuenta individual exigiendo un revisor inexistente. Comprobar la regla después de activarla.
4. **Cuenta y recuperación.** Verificar 2FA, miembros con acceso y recuperación de GitHub y correo. Git conserva versiones; no se ha verificado un respaldo externo independiente de la cuenta.

## Publicación y comprobación

Ejecutar `node scripts/update-manifest.mjs` únicamente tras cambios intencionados de `dist`, y después `npm run check`. La CI verifica el manifiesto recibido, no lo regenera para ocultar diferencias.

En Vercel, usar la configuración del repositorio; en Netlify, el directorio público es `dist`. En Cloudflare Pages, servir `dist` y ejecutar `npm run check` antes de publicar. Antes de migrar, actualizar en `404.html` los dos enlaces absolutos al dominio definitivo. La migración no se realiza automáticamente.

Tras el despliegue, comprobar estado HTTP 404 en una ruta inexistente anidada, recuperación del catálogo al fallar una fuente, imágenes bajo conexión lenta y formulario sin cliente de correo. Verificar las cabeceras con una petición HTTP real: tener los archivos de configuración no demuestra que el servidor las haya activado.

Referencias oficiales: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits ; https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site ; https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors ; https://docs.netlify.com/manage/routing/headers/ ; https://developers.cloudflare.com/pages/configuration/headers/ ; https://vercel.com/docs/project-configuration/vercel-json .
