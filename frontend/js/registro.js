function populateGraduationYearSelect() {
  const select = document.getElementById("graduationYear");
  const currentYear = Math.max(new Date().getFullYear(), 2026);
  const startYear = 1980;

  for (let year = currentYear; year >= startYear; year -= 1) {
    select.appendChild(el("option", { value: String(year), text: String(year) }));
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await renderTopbar();
  populateGraduationYearSelect();

  const form = document.getElementById("registerForm");
  const alertBox = document.getElementById("alertBox");

  const viewTermsLink = document.getElementById("viewTermsLink");
  if (viewTermsLink) {
    viewTermsLink.addEventListener("click", (e) => {
      e.preventDefault();
      showTermsModal({ canClose: true });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert(alertBox);

    const termsCheckbox = document.getElementById("termsAccepted");
    if (!termsCheckbox.checked) {
      showAlert(alertBox, "Debes marcar la casilla para confirmar que entendiste y aceptas los términos y condiciones antes de registrarte.");
      return;
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;

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
      submitBtn.disabled = false;
    }
  });
});
