// Tema claro/oscuro: aplica la preferencia, la guarda en localStorage y anima el cambio.
// Usa el botón #btnThemeToggle del HTML y no depende del resto de la aplicación.

let darkMode = false;
let themeAnimationRunning = false;

export function isDarkMode() {
  return darkMode;
}

// Cambia el tema, actualiza el switch y conserva la preferencia existente.
export function applyTheme(dark) {
  const toggle = document.getElementById("btnThemeToggle");
  darkMode = dark;
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  if (toggle) {
    toggle.setAttribute("aria-checked", String(dark));
    toggle.setAttribute("aria-label", dark ? "Modo oscuro" : "Modo claro");
  }
  const themeLabel = document.getElementById("themeModeLabel");
  if (themeLabel) themeLabel.textContent = dark ? "Modo oscuro" : "Modo claro";
  localStorage.setItem("darkMode", dark ? "1" : "0");
}

export function setTheme(dark, animate = true) {
  const toggle = document.getElementById("btnThemeToggle");
  if (dark === darkMode || themeAnimationRunning || !toggle) return;
  const root = document.documentElement;
  const switchRect = toggle.getBoundingClientRect();
  const targetX = switchRect.left + (dark ? switchRect.width - 23 : 23);
  root.style.setProperty("--theme-origin-x", `${targetX}px`);
  root.style.setProperty("--theme-origin-y", `${switchRect.top + switchRect.height / 2}px`);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!animate || reducedMotion) {
    applyTheme(dark);
    return;
  }

  themeAnimationRunning = true;
  toggle.disabled = true;
  const transitionClass = dark ? "theme-transition-to-dark" : "theme-transition-to-light";
  const finish = () => {
    root.classList.remove(transitionClass, "theme-fallback-transition");
    root.style.removeProperty("--theme-origin-x");
    root.style.removeProperty("--theme-origin-y");
    toggle.disabled = false;
    themeAnimationRunning = false;
  };

  if (typeof document.startViewTransition === "function") {
    root.classList.add(transitionClass);
    const transition = document.startViewTransition(() => applyTheme(dark));
    transition.finished.then(finish, finish);
  } else {
    root.classList.add("theme-fallback-transition");
    applyTheme(dark);
    window.setTimeout(finish, 600);
  }
}

// Aplica el tema guardado al cargar la página.
export function initTheme() {
  applyTheme(localStorage.getItem("darkMode") === "1");
}
