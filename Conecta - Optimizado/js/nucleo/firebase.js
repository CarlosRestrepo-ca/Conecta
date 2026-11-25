// Inicializa una única instancia de Firebase compartida por los módulos de la aplicación.
import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFadmAn_msK29B3Hj-NyXs3dNiMPEH5eE",
  authDomain: "conecta-f0162.firebaseapp.com",
  projectId: "conecta-f0162",
  storageBucket: "conecta-f0162.firebasestorage.app",
  messagingSenderId: "483948542084",
  appId: "1:483948542084:web:ac512a6e91c87a5ea0ead1",
  measurementId: "G-99SX22B1DC",
};

export const app = getApps().find((item) => item.name === "[DEFAULT]") || initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
