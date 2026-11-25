# Guía comentada del código de CONECTA

Este documento sirve como mapa para recorrer el proyecto. Se añadieron comentarios descriptivos al inicio de los archivos fuente y se conservaron los comentarios que ya explicaban partes concretas. Los comentarios se enfocan en bloques y responsabilidades para que el código siga siendo legible, en lugar de repetir lo evidente en cada línea.

## Archivos principales

- **`index.html`**: estructura de las pantallas, formularios, botones, ventanas emergentes y áreas donde JavaScript inserta contenido. También contiene algunos estilos en línea asociados a componentes concretos.
- **`js/app.js`**: controlador principal. Coordina la sesión, navegación, usuarios, perfiles, publicaciones, comentarios, reacciones, mensajes, notificaciones y ajustes.
- **`js/nucleo/`**: servicios comunes de Firebase, estado, tema, sonido y utilidades. Los módulos importan estos recursos en vez de inicializar copias propias.
- **`js/modulos/academic-assistant.js`**: interfaz, estado local y solicitudes del asistente documental.
- **`js/modulos/campus-features.js`**: funciones de vida universitaria: historias y su visor, grupos y chat grupal, eventos y recordatorios, encuestas integradas, reportes/bloqueos e indicador de escritura.
- **`js/modulos/polls.js`**: creación y presentación de encuestas, validación de opciones, registro seguro de un voto por cuenta, actualización en tiempo real y estadísticas para quien publicó.
- **`js/modulos/birthday-widget.js`**: localiza cumpleaños próximos entre las amistades y actualiza el widget del inicio.
- **`js/modulos/push-notifications.js`**: obtiene el token de Firebase Cloud Messaging y lo asocia con la cuenta cuando los permisos están concedidos.
- **`js/interfaz/`**: componentes de presentación, autenticación, compositor de historias e instalación PWA.
- **`sw.js`**: service worker; administra la caché de recursos estáticos, el uso básico sin conexión y la presentación/acción de notificaciones push.

## Hojas de estilo

- **`css/base/`**: reglas visuales generales, estructura y adaptaciones responsivas.
- **`css/modulos/`**: hojas específicas para búsquedas, funciones universitarias, encuestas, perfiles, autenticación, chat y otros componentes.

Al añadir una función nueva, ubica su lógica en `js/modulos/` y sus estilos en `css/modulos/`. Si necesita un recurso común, agrégalo en `js/nucleo/` y expórtalo desde allí. Actualiza también las rutas de `index.html` y la precarga de `sw.js` cuando corresponda.

## Configuración y recursos

- **`manifest.json`**: metadatos de instalación PWA, como nombre, colores, orientación e iconos.
- **`firebase.json`**: configuración de Hosting, destino público, reescritura hacia `index.html` y encabezados HTTP.
- **`icon.svg`**: icono vectorial de CONECTA.
- **`INFORME_UNIVERSITARIO.md`**: informe explicativo del proyecto; no es código ejecutable.

Los archivos `manifest.json` y `firebase.json` usan formato JSON, que no admite comentarios. Para conservar su validez, la explicación de esos campos se deja aquí: el manifiesto describe la experiencia instalable; la configuración de Firebase indica cómo se publica el sitio y qué encabezados aplica el hosting.

## Convención de comentarios

Los comentarios del código describen el propósito de los módulos, las secciones de interfaz y los bloques de comportamiento. Se mantienen breves y en español para facilitar la lectura sin repetir el significado evidente de cada instrucción. Los archivos JSON (`manifest.json` y `firebase.json`) no admiten comentarios válidos; su configuración se explica en esta guía.

## Cómo recorrer el programa

1. Empieza por `index.html` para ubicar el elemento de interfaz y su identificador (`id`).
2. Busca ese identificador en el módulo JavaScript correspondiente para localizar sus eventos y comportamiento.
3. Busca las clases CSS del elemento en la hoja asociada para entender su apariencia y adaptación a pantallas.
4. Las operaciones de cuenta y datos dependen de Firebase; las cargas de medios y notificaciones también dependen de los servicios y permisos configurados.
