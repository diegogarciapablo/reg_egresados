document.addEventListener("DOMContentLoaded", async () => {
  await renderTopbar();

  const form = document.getElementById("forgotPasswordForm");
  const alertBox = document.getElementById("alertBox");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert(alertBox);

    const email = document.getElementById("email").value.trim();
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Enviando...";

    try {
      const res = await api.auth.requestPasswordReset(email);
      showAlert(
        alertBox,
        res.message || "Se ha enviado un enlace de recuperación a tu correo electrónico.",
        "success"
      );
      showToast("Enlace de recuperación enviado.", "success");
      form.reset();
    } catch (err) {
      showAlert(alertBox, err.message || "No se pudo procesar la solicitud.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
