document.addEventListener("DOMContentLoaded", async () => {
  await renderTopbar();

  const form = document.getElementById("resetPasswordForm");
  const alertBox = document.getElementById("alertBox");
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    showAlert(
      alertBox,
      "El enlace de restablecimiento no es válido o le falta el token de seguridad. Solicita uno nuevo."
    );
    form.hidden = true;
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert(alertBox);

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword.length < 8) {
      showAlert(alertBox, "La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert(alertBox, "Las contraseñas escritas no coinciden. Verifica por favor.");
      return;
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Guardando...";

    try {
      const res = await api.auth.resetPassword({ token, newPassword });
      showAlert(
        alertBox,
        res.message || "¡Contraseña restablecida con éxito! Redirigiendo al login...",
        "success"
      );
      showToast("Contraseña actualizada correctamente.", "success");
      form.hidden = true;
      setTimeout(() => {
        window.location.href = "/login.html";
      }, 2200);
    } catch (err) {
      showAlert(alertBox, err.message || "No se pudo restablecer la contraseña.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
