function initLogin() {
  const form = document.getElementById("loginForm");
  const alertBox = document.getElementById("alertBox");

  // Toggle de visualización de contraseña
  const toggleBtn = document.getElementById("togglePasswordBtn");
  const pwdInput = document.getElementById("password");
  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener("click", () => {
      const isPassword = pwdInput.type === "password";
      pwdInput.type = isPassword ? "text" : "password";
      toggleBtn.setAttribute("aria-label", isPassword ? "Ocultar contraseña" : "Mostrar contraseña");
      toggleBtn.setAttribute("title", isPassword ? "Ocultar contraseña" : "Mostrar contraseña");
      const eye = toggleBtn.querySelector(".icon-eye");
      const eyeOff = toggleBtn.querySelector(".icon-eye-off");
      if (eye && eyeOff) {
        eye.style.display = isPassword ? "none" : "block";
        eyeOff.style.display = isPassword ? "block" : "none";
      }
    });
  }

  const viewTermsBtn = document.getElementById("viewTermsLinkLogin");
  if (viewTermsBtn) {
    viewTermsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showTermsModal({ canClose: true });
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAlert(alertBox);
      const submitBtn = form.querySelector("button[type=submit]");
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await api.auth.login({
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
        });

        const user = res?.user;
        if (user && !user.termsAccepted) {
          showTermsModal({
            user,
            canClose: false,
            onAccepted: () => {
              window.location.href = "/dashboard.html";
            },
          });
          return;
        }

        window.location.href = "/dashboard.html";
      } catch (err) {
        showAlert(alertBox, err.message || "No se pudo iniciar sesion.");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (typeof renderTopbar === "function") {
    renderTopbar();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLogin);
} else {
  initLogin();
}
