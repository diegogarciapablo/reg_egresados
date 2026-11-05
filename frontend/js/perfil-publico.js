function section(title, contentNode) {
  const wrap = el("div", { class: "card" });
  wrap.appendChild(el("h3", { text: title }));
  wrap.appendChild(contentNode);
  return wrap;
}

function safeExternalLink(url, text) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return el("a", {
      href: parsed.href,
      target: "_blank",
      rel: "noopener noreferrer",
      text,
    });
  } catch {
    return null;
  }
}

function buildProfileView(graduate) {
  const container = document.getElementById("profileContainer");
  container.innerHTML = "";

  const header = el("div", { class: "card page-header profile-public-header" });
  if (graduate.photoUrl) {
    header.appendChild(
      el("img", {
        class: "profile-public-avatar",
        src: graduate.photoUrl,
        alt: `Foto de ${graduate.firstName} ${graduate.lastName}`,
      })
    );
  } else {
    const initials = `${graduate.firstName?.[0] || ""}${graduate.lastName?.[0] || ""}`.toUpperCase();
    header.appendChild(
      el("div", { class: "profile-public-avatar graduate-avatar-placeholder", text: initials || "?" })
    );
  }

  const headerInfo = el("div", { class: "profile-public-info" });
  headerInfo.appendChild(el("h1", { text: `${graduate.firstName} ${graduate.lastName}` }));
  if (graduate.currentRole) headerInfo.appendChild(el("p", { text: graduate.currentRole }));
  headerInfo.appendChild(el("p", { class: "muted", text: `Egresado ${graduate.graduationYear} - Codigo ${graduate.registrationCode}` }));

  const links = el("div", { class: "tag-list" });
  const ghLink = safeExternalLink(graduate.githubUrl, "GitHub");
  const liLink = safeExternalLink(graduate.linkedinUrl, "LinkedIn");
  const pfLink = safeExternalLink(graduate.portfolioUrl, "Portafolio");
  if (ghLink) links.appendChild(ghLink);
  if (liLink) links.appendChild(liLink);
  if (pfLink) links.appendChild(pfLink);
  headerInfo.appendChild(links);
  header.appendChild(headerInfo);
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
      const projLink = safeExternalLink(project.url, "Ver proyecto");
      if (projLink) card.appendChild(projLink);
      grid.appendChild(card);
    }
    container.appendChild(section("Proyectos", grid));
  }

  if (graduate.certificates && graduate.certificates.length) {
    const list = el("div");
    for (const cert of graduate.certificates) {
      const item = el("div", { class: "card", style: "margin-bottom:10px;" });
      item.appendChild(el("strong", { text: cert.title }));
      const meta = [cert.issuer, cert.issue_date ? String(cert.issue_date).slice(0, 10) : null]
        .filter(Boolean)
        .join(" · ");
      if (meta) item.appendChild(el("div", { class: "muted", text: meta }));

      const certLinks = el("div", { class: "tag-list", style: "margin-top:8px;" });
      if (cert.file_url && cert.file_url.startsWith("/api/graduates/certificates/")) {
        certLinks.appendChild(
          el("a", {
            href: cert.file_url,
            target: "_blank",
            rel: "noopener noreferrer",
            text: cert.file_name ? `Ver certificado digital (${cert.file_name})` : "Ver certificado digital",
          })
        );
      }
      const extLink = safeExternalLink(cert.credential_url, "Ver credencial externa");
      if (extLink) certLinks.appendChild(extLink);
      if (certLinks.children.length > 0) item.appendChild(certLinks);

      list.appendChild(item);
    }
    container.appendChild(section("Certificados", list));
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
