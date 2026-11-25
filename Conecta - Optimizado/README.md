# CONECTA — documentación del proyecto

CONECTA es una aplicación web social orientada a una comunidad universitaria.
Reúne perfiles, publicaciones, mensajería y herramientas de vida académica en una
interfaz adaptable a móviles y escritorio. Esta guía resume el proyecto según los archivos
presentes en el repositorio; no sustituye una auditoría de seguridad ni confirma que cada
servicio remoto esté desplegado y operativo.

## Funciones principales

- Registro e inicio de sesión con correo y contraseña.
- Perfiles con fotografía e información personal y académica.
- Publicaciones, comentarios, reacciones y contenido multimedia.
- Historias de texto, imágenes o videos; el código las configura para expirar en 24 horas.
- Búsqueda de personas y publicaciones, sugerencias de amistad y gestión de contactos.
- Mensajes directos y chats grupales; la interfaz contempla imágenes, presencia de escritura y opciones del chat.
- Notificaciones dentro de la aplicación y soporte para notificaciones push cuando el navegador y el despliegue lo permiten.
- Encuestas con opciones de respuesta, duración configurable y resultados/*****ítica para quien las publica.
- Funciones universitarias: eventos, recordatorios locales, grupos organizados por carrera o semestre y enlaces a portales académicos.
- Reporte y bloqueo de usuarios.
- Ajustes de idioma (español/inglés), privacidad, estado activo y tema claro/oscuro.
- Instalación como PWA en navegadores compatibles.

## Tecnologías y servicios

- HTML, CSS y JavaScript moderno con módulos ES.
- Firebase Web SDK 12.7.0: Authentication, Cloud Firestore, Storage y Cloud Messaging (según compatibilidad/configuración).
- Cloudinary para la carga de ciertos medios.
- Service worker, manifiesto web y capacidades PWA.
- Una ruta `/api/assistant` se invoca desde el cliente para analizar PDF/DOCX y responder preguntas sobre documentos. Su backend no aparece entre los archivos disponibles; esta función requiere que ese endpoint esté desplegado.

## Organización del código

```text
css/
  base/       Estilos generales y adaptaciones
  modulos/    Estilos específicos de cada función
js/
  app.js      Punto de entrada y coordinación principal
  nucleo/     Firebase, estado, tema y utilidades compartidas
  modulos/    Funciones independientes de la aplicación
  interfaz/   Componentes visuales, autenticación e instalación PWA
```

Los módulos reutilizan servicios compartidos desde `js/nucleo/`. Al agregar una función, coloca su JavaScript en `js/modulos/` y sus estilos en `css/modulos/`; registra las rutas en `index.html` y en la lista de recursos de `sw.js` cuando deban estar disponibles sin conexión.

## Archivos destacados

| Archivo | Responsabilidad principal |
| --- | --- |
| `index.html` | Estructura de la interfaz, formularios, ventanas y navegación visual. |
| `js/app.js` | Coordina navegación, perfiles, publicaciones, conversaciones, notificaciones y ajustes principales. |
| `js/nucleo/firebase.js` | Inicializa una sola instancia compartida de Firebase para Auth, Firestore y Storage. |
| `js/modulos/academic-assistant.js` | Interfaz, estado local y solicitudes del asistente documental. |
| `js/modulos/campus-features.js` | Historias, eventos, grupos, moderación y chat grupal. |
| `js/modulos/polls.js` | Creación, votación y presentación de resultados de encuestas. |
| `js/interfaz/story-composer-ui.js` | Editor, vista previa y controles visuales para historias. |
| `js/modulos/push-notifications.js` | Registro del dispositivo para Firebase Cloud Messaging. |
| `js/interfaz/pwa-install.js`, `manifest.json`, `sw.js` | Instalación y soporte de aplicación web progresiva. |
| `css/base/`, `css/modulos/` | Estilos generales y estilos específicos de funciones. |
| `firebase.json` | Configuración de Firebase Hosting y encabezados del sitio. |

## Servicios externos y requisitos de configuración

El cliente contiene una configuración de Firebase para el proyecto utilizado por la aplicación y un preset de carga de Cloudinary. Para una entrega o publicación institucional, la persona responsable debe verificar que:

1. Firebase Authentication tenga habilitados los métodos de acceso usados.
2. Firestore y Storage estén creados y tengan reglas de seguridad revisadas y aplicadas. Las reglas no están incluidas en los archivos que se documentan aquí, por lo que no se puede confirmar su nivel de protección.
3. Cloudinary limite el preset público de carga (formatos, tamaño y transformaciones) y tenga controles de abuso adecuados.
4. Las notificaciones push tengan service worker, permisos, configuración Firebase y envío desde un componente de servidor correctamente configurados. Registrar un token en el navegador, por sí solo, no garantiza que se envíen notificaciones.
5. Si se presenta el asistente documental, exista un backend funcional y autenticado para `/api/assistant`. No se debe publicar una clave privada de proveedor en el cliente.
6. La política de privacidad y los términos se revisen con la institución; el texto que aparece en la interfaz no demuestra por sí mismo cumplimiento legal.

La clave `apiKey` de la configuración web de Firebase está diseñada para aparecer en el cliente; no debe confundirse con una credencial secreta. La seguridad depende especialmente de las reglas de Firebase y de proteger credenciales administrativas. El preset de carga de Cloudinary también es público en el cliente y debe configurarse con restricciones apropiadas.

## Datos y funcionamiento (vista general)

La aplicación autentica al usuario con Firebase Authentication. Los datos de perfiles, publicaciones, conversaciones y otras funciones se leen o escriben en Firestore, con escuchas en tiempo real en algunas vistas. Las imágenes y otros medios se cargan mediante servicios de almacenamiento externos o Firebase, según la función. El navegador conserva algunas preferencias localmente, como idioma y tema; el asistente documental, si está disponible, guarda su estado en `localStorage` por cuenta y dispositivo.

En el código se observan colecciones de Firestore como `users`, `posts`, `chats`, `stories`, `polls`, `campusGroups`, `campusEvents` y `userReports`, además de subcolecciones relacionadas. El esquema exacto puede evolucionar y debe contrastarse con la base de datos y sus reglas.

## Accesibilidad y uso adaptable

El HTML incorpora etiquetas, nombres accesibles, estados de diálogo y mensajes de estado en varios controles. Los estilos incluyen ajustes para pantallas pequeñas y el manifiesto define presentación instalable. Esto es una descripción de las medidas presentes en el código, no una certificación de accesibilidad; se recomienda probar navegación por teclado, lector de pantalla, contraste y distintos dispositivos.

## Verificación antes de una presentación

Use una cuenta de prueba y compruebe, al menos:

- registro, inicio y cierre de sesión;
- edición del perfil y comportamiento de privacidad;
- creación, lectura y eliminación de una publicación de prueba;
- comentarios, reacciones, mensajes y una encuesta;
- historia y expiración, evento, grupo y reporte/bloqueo;
- vista móvil, modo oscuro e idioma inglés;
- permisos de notificación e instalación PWA en un navegador compatible;
- acceso denegado a datos con una cuenta no autorizada, mediante reglas de Firebase.

Registre los resultados reales de cada prueba en el informe académico. No marque como verificada una función que no haya probado en el entorno de presentación.

## Documentos de presentación

- `INFORME_UNIVERSITARIO.md`: plantilla de informe académico editable, con objetivos, descripción, arquitectura, alcance, limitaciones y plan de validación.
- `README.md`: esta guía técnica y funcional del proyecto.

Complete los campos entre corchetes del informe (autoría, curso, docente, institución y fecha) y añada únicamente resultados de pruebas observadas en el entorno desplegado.
