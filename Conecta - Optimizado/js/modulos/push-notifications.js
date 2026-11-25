// Registra el dispositivo para Firebase Cloud Messaging y guarda el token push
// en el perfil del usuario autenticado cuando el navegador concede permiso.
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { arrayUnion, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getMessaging, getToken, isSupported } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging.js";

import { app, auth, db } from "../nucleo/firebase.js";
let pushToken = "";
let messagingPromise;

// Comprueba compatibilidad y permisos, espera al service worker y solicita el token del dispositivo.
async function getPushToken() {
  if (!window.isSecureContext || !("serviceWorker" in navigator) || !("Notification" in window)) {
    throw new Error("Este navegador no admite notificaciones push en este contexto.");
  }
  if (Notification.permission !== "granted") {
    throw new Error("Primero debes conceder el permiso de notificaciones.");
  }
  if (!(await isSupported())) throw new Error("Firebase Messaging no es compatible con este navegador.");

  const registration = await navigator.serviceWorker.ready;
  messagingPromise ||= Promise.resolve(getMessaging(app));
  const messaging = await messagingPromise;
  const token = await getToken(messaging, { serviceWorkerRegistration: registration });
  if (!token) throw new Error("Firebase no pudo crear el token push para este dispositivo.");
  pushToken = token;
  return token;
}

// Asocia el token push con la cuenta actual, evitando duplicados mediante arrayUnion de Firestore.
async function saveTokenForUser(user, token = pushToken) {
  if (!user || !token) return false;
  await setDoc(doc(db, "users", user.uid), {
    pushTokens: arrayUnion(token),
  }, { merge: true });
  return true;
}

window.enablePushNotifications = async () => {
  try {
    const token = await getPushToken();
    if (auth.currentUser) {
      await saveTokenForUser(auth.currentUser, token);
      return { ok: true };
    }
    return {
      ok: false,
      message: "Permiso concedido. Inicia sesión para vincular este dispositivo a tu cuenta y recibir notificaciones.",
    };
  } catch (error) {
    console.warn("No se pudo preparar el dispositivo para push:", error);
    return { ok: false, message: error.message || "No se pudo activar el servicio push." };
  }
};

onAuthStateChanged(auth, async (user) => {
  if (!user || !("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const token = await getPushToken();
    await saveTokenForUser(user, token);
  } catch (error) {
    console.warn("No se pudo sincronizar el token push de este usuario:", error);
  }
});
