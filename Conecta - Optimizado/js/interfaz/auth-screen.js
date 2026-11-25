// Pantalla de acceso: muestra u oculta el panel de inicio de sesión a pantalla completa.
// Solo manipula el DOM y el listener de cierre de sesión; no depende de currentUser.
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// Muestra la pantalla de acceso a pantalla completa y deja visible el contenedor principal.
export function showAuthScreen() {
  const authSection = document.getElementById("authSection");
  const appElement = document.getElementById("app");
  if (appElement) appElement.style.display = "flex";
  if (!authSection) return;

  authSection.hidden = false;
  authSection.classList.remove("hidden");
  Object.assign(authSection.style, {
    display: "block",
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100dvh",
    maxWidth: "none",
    margin: "0",
    overflowY: "auto",
    background: "white",
    zIndex: "11000",
  });
}

// Oculta la pantalla de acceso y limpia los estilos aplicados por showAuthScreen.
export function hideAuthScreen() {
  const authSection = document.getElementById("authSection");
  if (!authSection) return;
  authSection.classList.add("hidden");
  authSection.hidden = true;
  ["display", "position", "inset", "width", "height", "max-width", "margin", "overflow-y", "background", "z-index"]
    .forEach((property) => authSection.style.removeProperty(property));
}

// Vigila el cierre de sesión: si se pasa de un usuario a ninguno, muestra la pantalla de acceso.
export function watchSignOut(auth) {
  let lastAuthenticatedUser = auth.currentUser;
  onAuthStateChanged(auth, (user) => {
    const justSignedOut = Boolean(lastAuthenticatedUser && !user);
    lastAuthenticatedUser = user;
    if (justSignedOut) {
      setTimeout(() => {
        if (!auth.currentUser) showAuthScreen();
      }, 0);
    }
  });
}
