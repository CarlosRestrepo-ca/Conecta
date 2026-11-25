// Service worker de la PWA: precarga recursos de la aplicación, sirve la copia
// local cuando no hay conexión y administra notificaciones push y sus clics.
const CACHE_NAME = 'conecta-cache-v27';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './css/base/styles.css',
  './css/base/responsive-overrides.css',
  './css/base/home-scroll.css',
  './css/modulos/auth-desktop.css',
  './css/modulos/auth-redesign.css',
  './css/modulos/campus-features.css',
  './css/modulos/chat-redesign.css',
  './css/modulos/desktop-search.css',
  './css/modulos/manual-modal.css',
  './css/modulos/online-people-chat.css',
  './css/modulos/polls.css',
  './css/modulos/postform-mobile.css',
  './css/modulos/profile-realtime.css',
  './css/modulos/settings-privacy.css',
  './css/modulos/splash-nav-composer.css',
  './css/modulos/story-composer.css',
  './css/modulos/users-profile-overrides.css',
  './js/app.js',
  './js/nucleo/firebase.js',
  './js/nucleo/notification-sound.js',
  './js/nucleo/state.js',
  './js/nucleo/theme.js',
  './js/nucleo/utils.js',
  './js/modulos/academic-assistant.js',
  './js/modulos/birthday-widget.js',
  './js/modulos/campus-features.js',
  './js/modulos/polls.js',
  './js/modulos/push-notifications.js',
  './js/interfaz/auth-flip.js',
  './js/interfaz/auth-screen.js',
  './js/interfaz/pwa-install.js',
  './js/interfaz/story-composer-ui.js',
];
const APP_SHELL_URLS = new Set(
  APP_SHELL.map((path) => new URL(path, self.registration.scope).href)
);

function getSafeAppUrl(value, fallback = './') {
  try {
    const url = new URL(value || fallback, self.registration.scope);
    return url.origin === self.location.origin ? url.href : new URL(fallback, self.registration.scope).href;
  } catch {
    return new URL(fallback, self.registration.scope).href;
  }
}

// Durante la instalación, guarda los recursos principales para facilitar la apertura sin conexión.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(
        APP_SHELL.map((path) => {
          const url = new URL(path, self.registration.scope).href;
          return cache.add(url).catch((error) => {
            console.warn(`No se pudo guardar ${url} para uso sin conexión:`, error);
          });
        })
      ))
      .then(() => self.skipWaiting())
  );
});

// Al activarse, elimina cachés antiguas de la aplicación y toma el control de las pestañas abiertas.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key.startsWith('conecta-cache-') && key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  const isNavigation = event.request.mode === 'navigate';
  const isAppShellRequest = APP_SHELL_URLS.has(event.request.url);
  if (!isNavigation && !isAppShellRequest) return;

  // Solo se guardan en caché archivos estáticos de la aplicación, nunca datos personales ni respuestas de la API.
  event.respondWith(
    fetch(event.request).then(async (response) => {
      if (response.ok) {
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
        } catch (error) {
          console.warn('No se pudo actualizar la copia local de CONECTA:', error);
        }
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (isNavigation) {
        return (await caches.match(new URL('./index.html', self.registration.scope).href)) || Response.error();
      }
      return Response.error();
    })
  );
});

// Convierte los datos recibidos por push en una notificación segura y coherente con la aplicación.
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const notification = data.notification || data;
  const messageData = data.data && typeof data.data === 'object' ? data.data : {};
  const safeUrl = getSafeAppUrl(messageData.url || data.url, './');
  const safeIcon = getSafeAppUrl(notification.icon || data.icon, './icon.svg');
  const safeBadge = getSafeAppUrl(notification.badge || data.badge, './icon.svg');
  event.waitUntil(
    self.registration.showNotification(String(notification.title || data.title || 'Notificación CONECTA'), {
      body: String(notification.body || data.body || ''),
      icon: safeIcon,
      badge: safeBadge,
      data: safeUrl
    })
  );
});

// Al pulsar una notificación, enfoca una pestaña existente o abre la dirección segura asociada.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = getSafeAppUrl(event.notification.data, './');
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (new URL(client.url).href === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
