document.addEventListener("DOMContentLoaded", async () => {
  await renderTopbar();

  const form = document.getElementById("loginForm");
  const alertBox = document.getElementById("alertBox");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert(alertBox);
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    try {
      await api.auth.login({
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
      });
      window.location.href = "/dashboard.html";
    } catch (err) {
      showAlert(alertBox, err.message || "No se pudo iniciar sesion.");
    } finally {
      submitBtn.disabled = false;
    }
  });
});
