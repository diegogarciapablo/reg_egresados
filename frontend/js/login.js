document.addEventListener("DOMContentLoaded", async () => {
  await renderTopbar();

  const form = document.getElementById("loginForm");
  const alertBox = document.getElementById("alertBox");

  const viewTermsBtn = document.getElementById("viewTermsLinkLogin");
  if (viewTermsBtn) {
    viewTermsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showTermsModal({ canClose: true });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert(alertBox);
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;

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
      submitBtn.disabled = false;
    }
  });
});
