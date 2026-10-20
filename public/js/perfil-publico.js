function section(title, contentNode) {
  const wrap = el("div", { class: "card" });
  wrap.appendChild(el("h3", { text: title }));
  wrap.appendChild(contentNode);
  return wrap;
}

function buildProfileView(graduate) {
  const container = document.getElementById("profileContainer");
  container.innerHTML = "";

  const header = el("div", { class: "card page-header" });
  header.appendChild(el("h1", { text: `${graduate.firstName} ${graduate.lastName}` }));
  if (graduate.currentRole) header.appendChild(el("p", { text: graduate.currentRole }));
  header.appendChild(el("p", { class: "muted", text: `Egresado ${graduate.graduationYear} - Codigo ${graduate.registrationCode}` }));

  const links = el("div", { class: "tag-list" });
  if (graduate.githubUrl) links.appendChild(el("a", { href: graduate.githubUrl, target: "_blank", text: "GitHub" }));
  if (graduate.linkedinUrl) links.appendChild(el("a", { href: graduate.linkedinUrl, target: "_blank", text: "LinkedIn" }));
  if (graduate.portfolioUrl) links.appendChild(el("a", { href: graduate.portfolioUrl, target: "_blank", text: "Portafolio" }));
  header.appendChild(links);
  container.appendChild(header);

  if (graduate.professionalSummary) {
    container.appendChild(section("Resumen profesional", el("p", { text: graduate.professionalSummary })));
  }

  if (graduate.technologies && graduate.technologies.length) {
    const tags = el("div", { class: "tag-list" });
    for (const t of graduate.technologies) tags.appendChild(el("span", { class: "tag", text: t.name }));
    container.appendChild(section("Tecnologias", tags));
  }

  if (graduate.softSkills && graduate.softSkills.length) {
    const tags = el("div", { class: "tag-list" });
    for (const s of graduate.softSkills) tags.appendChild(el("span", { class: "tag", text: s.name }));
    container.appendChild(section("Habilidades blandas", tags));
  }

  if (graduate.experiences && graduate.experiences.length) {
    const list = el("div");
    for (const exp of graduate.experiences) {
      const item = el("div", { class: "card", style: "margin-bottom:10px;" });
      item.appendChild(el("strong", { text: `${exp.position} - ${exp.organization}` }));
      const dates = [exp.start_date, exp.is_current ? "Actualidad" : exp.end_date].filter(Boolean).join(" a ");
      if (dates) item.appendChild(el("div", { class: "muted", text: dates }));
      if (exp.description) item.appendChild(el("p", { text: exp.description }));
      list.appendChild(item);
    }
    container.appendChild(section("Experiencia", list));
  }

  if (graduate.projects && graduate.projects.length) {
    const grid = el("div", { class: "card-grid" });
    for (const project of graduate.projects) {
      const card = el("div", { class: "graduate-card" });
      card.appendChild(el("h3", { text: project.title }));
      if (project.description) card.appendChild(el("p", { text: project.description }));
      if (project.url) card.appendChild(el("a", { href: project.url, target: "_blank", text: "Ver proyecto" }));
      grid.appendChild(card);
    }
    container.appendChild(section("Proyectos", grid));
  }

  const recommendations = el("div");
  if (graduate.recommendations && graduate.recommendations.length) {
    for (const rec of graduate.recommendations) {
      const item = el("div", { class: "card", style: "margin-bottom:10px;" });
      item.appendChild(el("p", { text: `"${rec.message}"` }));
      item.appendChild(el("div", { class: "muted", text: `- ${rec.author_name}${rec.author_role ? ", " + rec.author_role : ""}` }));
      recommendations.appendChild(item);
    }
  } else {
    recommendations.appendChild(el("p", { class: "muted", text: "Aun no hay recomendaciones publicadas." }));
  }
  container.appendChild(section("Recomendaciones", recommendations));

  container.appendChild(section("Dejar una recomendacion", buildRecommendationForm(graduate.id)));
}

function buildRecommendationForm(graduateId) {
  const form = el("form");
  const alertBox = el("div");
  form.appendChild(alertBox);

  const nameGroup = el("div", { class: "form-group" });
  nameGroup.appendChild(el("label", { for: "authorName", text: "Tu nombre" }));
  const nameInput = el("input", { type: "text", id: "authorName", required: "required" });
  nameGroup.appendChild(nameInput);
  form.appendChild(nameGroup);

  const roleGroup = el("div", { class: "form-group" });
  roleGroup.appendChild(el("label", { for: "authorRole", text: "Tu cargo o relacion (opcional)" }));
  const roleInput = el("input", { type: "text", id: "authorRole" });
  roleGroup.appendChild(roleInput);
  form.appendChild(roleGroup);

  const msgGroup = el("div", { class: "form-group" });
  msgGroup.appendChild(el("label", { for: "message", text: "Mensaje" }));
  const msgInput = el("textarea", { id: "message", required: "required" });
  msgGroup.appendChild(msgInput);
  form.appendChild(msgGroup);

  const submitBtn = el("button", { type: "submit", class: "btn btn-primary", text: "Enviar recomendacion" });
  form.appendChild(submitBtn);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert(alertBox);
    submitBtn.disabled = true;
    try {
      await api.directory.recommend(graduateId, {
        authorName: nameInput.value,
        authorRole: roleInput.value || undefined,
        message: msgInput.value,
      });
      showAlert(alertBox, "Gracias, tu recomendacion quedo pendiente de revision.", "success");
      form.reset();
    } catch (err) {
      showAlert(alertBox, err.message || "No se pudo enviar la recomendacion.");
    } finally {
      submitBtn.disabled = false;
    }
  });

  return form;
}

document.addEventListener("DOMContentLoaded", async () => {
  await renderTopbar();

  const params = new URLSearchParams(window.location.search);
  const code = params.get("codigo");
  const container = document.getElementById("profileContainer");

  if (!code) {
    container.innerHTML = "";
    showAlert(container, "No se especifico ningun egresado.");
    return;
  }

  try {
    const graduate = await api.directory.getByCode(code);
    buildProfileView(graduate);
  } catch (err) {
    container.innerHTML = "";
    showAlert(container, err.message || "No se encontro la ficha solicitada.");
  }
});
