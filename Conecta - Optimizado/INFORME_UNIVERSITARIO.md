# Informe de presentación del proyecto CONECTA

> **Documento base para edición académica.** Complete los campos entre corchetes y ajuste el texto a las indicaciones de la asignatura. La descripción se elaboró a partir del código disponible; no afirma resultados de pruebas que todavía no se hayan realizado.

## Portada

**Proyecto:** CONECTA — plataforma web de interacción para una comunidad universitaria  
**Presentado por:** [Nombre(s) y apellido(s)]  
**Programa / asignatura:** [Programa y asignatura]  
**Docente:** [Nombre del docente]  
**Institución:** [Nombre de la universidad]  
**Lugar y fecha:** [Ciudad, fecha]

## Resumen

CONECTA es una aplicación web social pensada para facilitar la interacción y el intercambio de información dentro de una comunidad universitaria. Integra autenticación, perfiles, publicaciones, mensajería, historias y encuestas con herramientas relacionadas con la vida académica, como grupos, eventos y accesos a portales universitarios. La interfaz está construida con HTML, CSS y JavaScript modular, y utiliza Firebase para autenticación y persistencia de datos en tiempo real. Algunas funciones dependen además de Cloudinary, de las capacidades del navegador o de servicios de backend que deben estar configurados. Este informe describe el alcance funcional y la arquitectura observable del proyecto, y propone una lista de validaciones que debe completarse en el entorno real antes de su presentación.

**Palabras clave:** comunidad universitaria, aplicación web, redes sociales, Firebase, PWA.

## 1. Introducción

Las comunidades universitarias necesitan canales digitales para comunicarse, compartir información y coordinar actividades. CONECTA propone reunir en una sola aplicación herramientas sociales y utilidades académicas. El proyecto se presenta como una aplicación web adaptable, con acceso mediante cuenta y funciones que conectan a los miembros de la comunidad.

Este documento describe lo que se identifica en los archivos del proyecto. La existencia de una función en el código no implica que sus servicios externos estén activos, que haya sido probada en producción ni que el sistema cuente con una auditoría de seguridad.

## 2. Problema y justificación

La comunicación universitaria puede quedar distribuida entre distintos canales, dificultando el descubrimiento de personas, la conversación, la difusión de actividades y la participación comunitaria. CONECTA busca ofrecer un espacio común para estas interacciones y añadir herramientas enfocadas en la vida universitaria. Su pertinencia para una institución concreta debe evaluarse con usuarios, necesidades y políticas institucionales reales.

## 3. Objetivos

### 3.1 Objetivo general

Describir y presentar CONECTA como una aplicación web que integra funciones sociales y herramientas universitarias para apoyar la comunicación y la participación de una comunidad académica.

### 3.2 Objetivos específicos

- Identificar las funciones de usuario disponibles en la interfaz.
- Explicar los componentes principales y los servicios tecnológicos conectados.
- Mostrar el flujo general de autenticación, interacción y almacenamiento de información.
- Definir verificaciones funcionales, de usabilidad y de seguridad pendientes o necesarias antes de su uso institucional.

## 4. Alcance funcional

En los archivos se identifican estas áreas:

1. **Acceso y perfil:** registro e inicio de sesión con correo y contraseña; perfil con datos personales y académicos.
2. **Interacción social:** publicaciones, archivos multimedia, comentarios, reacciones, búsqueda de personas y sugerencias de amistad.
3. **Comunicación:** mensajería directa, chat grupal y funciones de estado o escritura en conversaciones.
4. **Historias:** publicación de texto, imágenes o videos, visor y caducidad configurada a 24 horas.
5. **Encuestas:** publicación de preguntas con opciones, votación, duración y visualización de resultados.
6. **Vida universitaria:** eventos y recordatorios en el navegador, grupos organizados por carrera o semestre, y enlaces a portales académicos.
7. **Seguridad comunitaria y preferencias:** reporte y bloqueo de usuarios, ajustes de privacidad, estado activo, idioma y tema visual.
8. **Experiencia web:** diseño adaptable y soporte de instalación PWA en navegadores compatibles.

El código también contempla una función de asistencia sobre documentos PDF/DOCX mediante una solicitud autenticada a `/api/assistant`. El backend de esa ruta no figura en los archivos revisados; por ello debe tratarse como una función condicionada a la disponibilidad de ese servicio y probarse antes de presentarla como operativa.

## 5. Tecnologías y arquitectura

### 5.1 Tecnologías identificadas

- **Interfaz:** HTML, CSS y JavaScript con módulos ES.
- **Autenticación y datos:** Firebase Authentication y Cloud Firestore, mediante Firebase Web SDK 12.7.0.
- **Archivos y medios:** Cloudinary para determinadas cargas; el código también inicializa Firebase Storage.
- **Notificaciones:** integración del navegador con Firebase Cloud Messaging, sujeta a permisos y compatibilidad.
- **PWA:** manifiesto, service worker y lógica de instalación.
- **Publicación web:** existe configuración de Firebase Hosting en `firebase.json`.

### 5.2 Componentes principales

`index.html` define las vistas y formularios. `js/app.js` coordina autenticación, navegación y numerosas funciones sociales; los recursos compartidos están en `js/nucleo/`, las funciones independientes en `js/modulos/` y los componentes de presentación en `js/interfaz/`. Los estilos se organizan en `css/base/` y `css/modulos/`. `sw.js`, `manifest.json` y `js/interfaz/pwa-install.js` complementan las capacidades de notificación e instalación.

### 5.3 Flujo general

1. La persona crea una cuenta o inicia sesión mediante Firebase Authentication.
2. La aplicación consulta o actualiza datos asociados a la cuenta en Firestore.
3. Las vistas muestran publicaciones, conversaciones y otros datos; varias se actualizan mediante escuchas en tiempo real.
4. Para medios, el cliente utiliza los servicios de carga configurados para cada función.
5. Las preferencias locales y algunos datos de asistencia se almacenan en el navegador. Los permisos de notificaciones e instalación dependen del navegador y de un contexto seguro (HTTPS).

Entre los nombres de colecciones observados en el código figuran `users`, `posts`, `chats`, `stories`, `polls`, `campusGroups`, `campusEvents` y `userReports`. La estructura definitiva de datos y sus permisos deben confirmarse en Firebase.

## 6. Consideraciones de privacidad y seguridad

El sistema procesa información de cuentas, perfiles, comunicaciones y contenido generado por usuarios. Antes de un uso con datos reales se recomienda:

- revisar y probar reglas de acceso de Firestore y Firebase Storage; no se encontraron archivos de reglas en el material revisado;
- limitar los permisos por usuario y validar las operaciones sensibles también en el servidor cuando corresponda;
- restringir el preset de carga de Cloudinary, ya que el identificador del preset está presente en el cliente;
- no exponer claves privadas, credenciales de servicio ni secretos de backend en JavaScript enviado al navegador;
- revisar el tratamiento, la retención y la eliminación de datos, así como el consentimiento y la política institucional aplicable;
- comprobar que las opciones de privacidad mostradas coincidan con las reglas efectivas de lectura de datos;
- someter el sistema a pruebas de seguridad y revisión institucional antes de manejar datos personales reales.

La clave de configuración web de Firebase que se incluye en aplicaciones cliente no equivale por sí sola a una contraseña administrativa. Su seguridad depende de configurar correctamente reglas, restricciones y servicios. Este informe no certifica cumplimiento legal ni seguridad técnica.

## 7. Plan de demostración y validación

Para una exposición, se recomienda preparar una cuenta de demostración sin datos personales sensibles y seguir este recorrido:

1. Presentar el inicio de sesión y la navegación principal.
2. Mostrar el perfil y los controles de idioma, privacidad y tema.
3. Crear una publicación de prueba y mostrar una interacción disponible.
4. Recorrer una historia o encuesta y explicar el chat.
5. Mostrar un grupo o evento de prueba y los portales académicos.
6. Explicar las opciones de reporte/bloqueo y las consideraciones de seguridad.
7. Indicar qué módulos dependen de servicios externos y qué aspectos quedan pendientes de validación.

### Registro de pruebas

Complete la tabla después de ejecutar cada prueba en el entorno real. Sustituya “Pendiente” por el resultado observado y agregue evidencia si la asignatura lo solicita.

| Prueba | Resultado observado | Evidencia / observaciones |
| --- | --- | --- |
| Registro e inicio/cierre de sesión | Pendiente | [Completar] |
| Guardar y consultar perfil | Pendiente | [Completar] |
| Crear y consultar una publicación | Pendiente | [Completar] |
| Mensajes entre cuentas de prueba | Pendiente | [Completar] |
| Crear y votar en una encuesta | Pendiente | [Completar] |
| Publicar y visualizar una historia | Pendiente | [Completar] |
| Crear o consultar grupo/evento | Pendiente | [Completar] |
| Diseño móvil y navegación con teclado | Pendiente | [Completar] |
| Reglas de acceso con usuarios distintos | Pendiente | [Completar] |
| Notificaciones/PWA en navegador compatible | Pendiente | [Completar] |

## 8. Limitaciones y trabajo futuro

- La aplicación depende de Firebase, Cloudinary y del despliegue web; un fallo o una configuración incompleta puede deshabilitar funciones.
- No se incluyeron reglas de Firestore/Storage ni el código de backend para `/api/assistant` en los archivos revisados. Deben proporcionarse y verificarse por separado.
- Las notificaciones push requieren permisos, compatibilidad, service worker y configuración de envío; no están garantizadas en todos los navegadores.
- Se necesita ejecutar pruebas funcionales, de seguridad, accesibilidad y rendimiento en el entorno de despliegue.
- Para valorar su adopción universitaria se recomienda realizar pruebas de usabilidad con estudiantes y documentar resultados, problemas y cambios.
- Antes de una implementación institucional deben revisarse gobernanza, moderación, protección de datos, soporte y mantenimiento.

## 9. Conclusiones

CONECTA reúne en una interfaz web un conjunto amplio de funciones sociales y universitarias y utiliza servicios gestionados para autenticación, persistencia y comunicación. Su arquitectura modular separa varias áreas de funcionalidad y contempla el uso adaptable y la instalación como PWA. Para presentarla responsablemente, es importante distinguir entre funciones implementadas en el cliente y servicios realmente configurados, desplegados y verificados. La siguiente etapa recomendada es completar la matriz de pruebas y revisar reglas de acceso, privacidad y dependencias externas antes de utilizar datos reales.

## 10. Referencias técnicas

- Documentación oficial de Firebase: https://firebase.google.com/docs
- Documentación de Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging
- Documentación de Cloudinary: https://cloudinary.com/documentation
- MDN Web Docs, aplicaciones web progresivas: https://developer.mozilla.org/docs/Web/Progressive_web_apps

> Añada las fuentes consultadas y el formato de citación exigido por la universidad (por ejemplo, APA), además de capturas propias de la aplicación en funcionamiento.
