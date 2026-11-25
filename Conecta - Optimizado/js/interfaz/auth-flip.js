// Presenta los formularios de autenticación existentes en una tarjeta 3D sin reemplazar sus manejadores.
(() => {
  const start = () => {
    const authSection = document.getElementById("authSection");
    if (!authSection) return;
    authSection.classList.add("auth-3d-active");

    let stage = authSection.querySelector(".auth-3d-stage");
    let front;
    let back;

    if (!stage) {
      const registerPanel = document.getElementById("registerFullScreen");
      stage = document.createElement("div");
      stage.className = "auth-3d-stage";
      stage.setAttribute("aria-label", "Acceso y registro de CONECTA");

      const rotor = document.createElement("div");
      rotor.className = "auth-3d-rotor";
      front = document.createElement("section");
      front.className = "auth-3d-face auth-3d-front";
      front.setAttribute("aria-label", "Iniciar sesión");
      back = document.createElement("section");
      back.className = "auth-3d-face auth-3d-back";
      back.setAttribute("aria-label", "Crear cuenta");
      rotor.append(front, back);
      stage.appendChild(rotor);

      // Conserva el formulario y el contenido de acceso tal como los creó la aplicación.
      [...authSection.childNodes].forEach((node) => {
        if (node !== stage) front.appendChild(node);
      });
      authSection.appendChild(stage);

      if (registerPanel) back.appendChild(registerPanel);
      const wordmark = document.createElement("div");
      wordmark.className = "auth-wordmark";
      wordmark.innerHTML = '<span class="auth-wordmark-mark" aria-hidden="true"></span><span>CONECTA</span>';
      front.prepend(wordmark);

      const frontSwitch = document.createElement("button");
      frontSwitch.type = "button";
      frontSwitch.className = "auth-switch-link";
      frontSwitch.dataset.authFlip = "register";
      frontSwitch.textContent = "¿No tienes cuenta? Regístrate";
      front.appendChild(frontSwitch);

      const backSwitch = document.createElement("button");
      backSwitch.type = "button";
      backSwitch.className = "auth-switch-link";
      backSwitch.dataset.authFlip = "login";
      backSwitch.textContent = "¿Ya tienes una cuenta? Inicia sesión";
      back.appendChild(backSwitch);
    } else {
      front = stage.querySelector(".auth-3d-front");
      back = stage.querySelector(".auth-3d-back");
      const registerPanel = document.getElementById("registerFullScreen");
      if (registerPanel && !back.contains(registerPanel)) back.appendChild(registerPanel);
    }

    if (!front || !back) return;

        const registerPanel = document.getElementById("registerFullScreen");
    if (registerPanel) {
      registerPanel.hidden = false;
      registerPanel.classList.remove("hidden");
      registerPanel.setAttribute("aria-label", "Formulario de registro");
    }

    // Mantiene el acceso al inicio de sesión justo después del envío del registro.
    const registerForm = document.getElementById("registerForm");
    const backSwitch = back.querySelector('[data-auth-flip="login"]');
    const registerSubmit = registerForm?.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
    if (registerForm && backSwitch) {
      if (registerSubmit) registerSubmit.insertAdjacentElement("afterend", backSwitch);
      else registerForm.appendChild(backSwitch);
    }

    // Oculta los antiguos enlaces de cambio de vista; los enlaces nuevos controlan el giro.
    authSection.querySelectorAll("a, button, [role='button']").forEach((control) => {
      if (control.matches("[data-auth-flip]")) return;
      const label = (control.textContent || "").trim();
      const isLegacySwitch = /^(¿ya tienes una cuenta\??\s*)?inicia sesión$|^¿no tienes cuenta\??\s*regístrate$|^regístrate$|^registrarse$|^sign up$|^register$|^log in$|^already have an account\??\s*log in$/i.test(label);
      if (!isLegacySwitch || control.type === "submit" || control.closest("#registerForm")) return;
      control.classList.add("auth-legacy-switch");
    });

    const setFace = (showRegister) => {
      stage.classList.toggle("is-flipped", showRegister);
      front.inert = showRegister;
      back.inert = !showRegister;
      front.setAttribute("aria-hidden", String(showRegister));
      back.setAttribute("aria-hidden", String(!showRegister));
    };

    if (!stage.dataset.authEventsReady) {
      stage.addEventListener("click", (event) => {
        const switchControl = event.target.closest("[data-auth-flip]");
        if (!switchControl) return;
        event.preventDefault();
        setFace(switchControl.dataset.authFlip === "register");
      });

      // Compatibilidad con enlaces de registro existentes y con el enlace de invitación #registro.
      document.addEventListener("click", (event) => {
        const control = event.target.closest("a, button, [role='button']");
        if (!control || control.matches("[data-auth-flip]") || control.type === "submit") return;
        const label = (control.textContent || "").trim();
        const isSignup = /^regístrate$|^registrarse$|^sign up$|^register$/i.test(label);
        const isLogin = /^(¿ya tienes una cuenta\??\s*)?inicia sesión$|^log in$|^already have an account\??\s*log in$/i.test(label);
        if (!isSignup && !isLogin) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        setFace(isSignup);
      }, true);
      stage.dataset.authEventsReady = "true";
    }

    setFace(location.hash.toLowerCase().includes("registro"));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  // El contenido de autenticación puede aparecer después de la inicialización de Firebase.
  const observer = new MutationObserver(() => {
    if (document.getElementById("authSection") && !document.querySelector("#authSection .auth-3d-stage")) start();
    const back = document.querySelector("#authSection .auth-3d-back");
    const registerPanel = document.getElementById("registerFullScreen");
    if (back && registerPanel && !back.contains(registerPanel)) {
      back.appendChild(registerPanel);
      registerPanel.hidden = false;
      registerPanel.classList.remove("hidden");
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
