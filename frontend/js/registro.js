function populateGraduationYearSelect() {
  const select = document.getElementById("graduationYear");
  if (!select) return;
  const currentYear = Math.max(new Date().getFullYear(), 2026);
  const startYear = 1980;

  for (let year = currentYear; year >= startYear; year -= 1) {
    select.appendChild(el("option", { value: String(year), text: String(year) }));
  }
}

function initRegistro() {
  populateGraduationYearSelect();

  const form = document.getElementById("registerForm");
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

  const viewTermsLink = document.getElementById("viewTermsLink");
  if (viewTermsLink) {
    viewTermsLink.addEventListener("click", (e) => {
      e.preventDefault();
      showTermsModal({ canClose: true });
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAlert(alertBox);

      const termsCheckbox = document.getElementById("termsAccepted");
      if (!termsCheckbox.checked) {
        showAlert(alertBox, "Debes marcar la casilla para confirmar que entendiste y aceptas los términos y condiciones antes de registrarte.");
        return;
      }

      const submitBtn = form.querySelector("button[type=submit]");
      if (submitBtn) submitBtn.disabled = true;

      try {
        await api.auth.register({
          firstName: document.getElementById("firstName").value,
          lastName: document.getElementById("lastName").value,
          graduationYear: Number(document.getElementById("graduationYear").value),
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
          termsAccepted: true,
        });
        window.location.href = "/dashboard.html";
      } catch (err) {
        showAlert(alertBox, err.message || "No se pudo crear la cuenta.");
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
  document.addEventListener("DOMContentLoaded", initRegistro);
} else {
  initRegistro();
}
