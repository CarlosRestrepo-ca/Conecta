// Registro central de listeners en tiempo real, agrupados por vista.
// Permite cancelar todos los listeners de una vista al salir de ella.
const viewListeners = new Map();

// Registra una función de cancelación para una vista y la devuelve tal cual.
// Al cancelarse manualmente se quita del registro, así no se acumulan referencias.
export function trackListener(view, unsubscribe) {
  if (typeof unsubscribe !== "function") return unsubscribe;
  if (!viewListeners.has(view)) viewListeners.set(view, new Set());
  const listeners = viewListeners.get(view);
  const wrapped = () => {
    listeners.delete(wrapped);
    unsubscribe();
  };
  listeners.add(wrapped);
  return wrapped;
}

// Cancela todos los listeners registrados para una vista.
export function cancelViewListeners(view) {
  const listeners = viewListeners.get(view);
  if (!listeners) return;
  [...listeners].forEach((cancel) => {
    try {
      cancel();
    } catch (error) {
      console.warn(`No se pudo cancelar un listener de ${view}:`, error);
    }
  });
  listeners.clear();
}

// Estado de sesión compartido. js/app.js lo mantiene sincronizado con su variable local
// currentUser mientras se migran las referencias restantes.
export const appState = { currentUser: null };

// Guarda el usuario actual y actualiza window.currentUser por compatibilidad.
export function setCurrentUser(user) {
  appState.currentUser = user ?? null;
  window.currentUser = appState.currentUser;
}

// Devuelve el usuario actual del estado compartido.
export function getCurrentUser() {
  return appState.currentUser;
}
