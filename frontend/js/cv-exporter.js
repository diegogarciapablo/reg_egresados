// Generador de CV formal imprimible compartido entre Dashboard y Perfil Público

function buildFormalCvHtml(graduate) {
  const formatExpDate = (rawDate, dateFormat) => {
    if (!rawDate) return "";
    const iso = String(rawDate).slice(0, 10);
    const [year, month, day] = iso.split("-");
    if (!year || !month) return iso;
    if (dateFormat === "month") return `${month}/${year}`;
    return day ? `${day}/${month}/${year}` : `${month}/${year}`;
  };

  const escape = (str) => {
    if (!str) return "";
    if (typeof escapeHtml === "function") return escapeHtml(str);
    if (typeof document !== "undefined") {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  // 1. Cabecera y Contactos
  const contacts = [];
  if (graduate.phone) contacts.push(`Tel / WhatsApp: ${escape(graduate.phone)}`);
  if (graduate.personalEmail) contacts.push(`Correo: ${escape(graduate.personalEmail)}`);
  if (graduate.institutionalEmail) contacts.push(`Inst: ${escape(graduate.institutionalEmail)}`);

  const links = Array.isArray(graduate.professionalLinks) ? graduate.professionalLinks : [];
  for (const l of links) {
    if (l.url) {
      const label = l.type === "linkedin" ? "LinkedIn" : l.type === "github" ? "GitHub" : l.type === "portfolio" ? "Portafolio" : l.type;
      contacts.push(`<a href="${escape(l.url)}" target="_blank" rel="noopener noreferrer">${label}</a>`);
    }
  }

  // 2. Resumen profesional
  let summaryHtml = "";
  if (graduate.professionalSummary) {
    summaryHtml = `
      <section class="cv-section">
        <h2 class="cv-section-title">Perfil Profesional</h2>
        <p class="cv-text">${escape(graduate.professionalSummary)}</p>
      </section>
    `;
  }

  // 3. Formación Académica
  let educationHtml = "";
  const certificates = Array.isArray(graduate.certificates) ? graduate.certificates : [];
  if (certificates.length > 0) {
    const formationLabels = {
      doctorate: "Doctorado",
      master: "Maestría",
      specialty: "Especialidad",
      diploma: "Diplomado",
      bachelor: "Licenciatura",
      courses: "Cursos y Certificaciones",
      other: "Otros Estudios",
    };

    const formationHierarchy = ["doctorate", "master", "specialty", "diploma", "bachelor", "courses", "other"];
    let eduItems = "";

    for (const type of formationHierarchy) {
      const items = certificates.filter((c) => (c.formation_type || c.formationType || "courses") === type);
      for (const item of items) {
        const dateStr = item.issue_date || item.issueDate ? String(item.issue_date || item.issueDate).slice(0, 10) : "";
        eduItems += `
          <div class="cv-entry">
            <div class="cv-entry-header">
              <span class="cv-entry-title"><strong>${escape(item.title)}</strong> — <span class="cv-badge">${formationLabels[type] || type}</span></span>
              <span class="cv-entry-date">${escape(dateStr)}</span>
            </div>
            <div class="cv-entry-subtitle">${escape(item.issuer || "Universidad Autónoma Juan Misael Saracho")}</div>
          </div>
        `;
      }
    }

    if (eduItems) {
      educationHtml = `
        <section class="cv-section">
          <h2 class="cv-section-title">Formación Académica y Certificaciones</h2>
          ${eduItems}
        </section>
      `;
    }
  }

  // 4. Experiencias organizadas por categoría
  let experienceHtml = "";
  const experiences = Array.isArray(graduate.experiences) ? graduate.experiences : [];
  if (experiences.length > 0) {
    const workItems = experiences.filter((e) => (e.category || "work") === "work");
    const academicItems = experiences.filter((e) => e.category === "academic");
    const preGraduateItems = experiences.filter((e) => e.category === "pre_graduate");

    const renderExpBlock = (blockTitle, list) => {
      if (!list.length) return "";
      let rows = `<h3 class="cv-subsection-title">${blockTitle}</h3>`;
      for (const exp of list) {
        const start = formatExpDate(exp.start_date || exp.startDate, exp.date_format || exp.dateFormat);
        const end = exp.is_current || exp.isCurrent ? "Actualidad" : formatExpDate(exp.end_date || exp.endDate, exp.date_format || exp.dateFormat);
        const dates = [start, end].filter(Boolean).join(" — ");

        rows += `
          <div class="cv-entry">
            <div class="cv-entry-header">
              <span class="cv-entry-title"><strong>${escape(exp.position)}</strong> en <em>${escape(exp.organization)}</em></span>
              <span class="cv-entry-date">${escape(dates)}</span>
            </div>
            ${exp.description ? `<p class="cv-entry-desc">${escape(exp.description)}</p>` : ""}
          </div>
        `;
      }
      return rows;
    };

    const workBlock = renderExpBlock("Experiencia Laboral", workItems);
    const academicBlock = renderExpBlock("Experiencia Académica y Docencia", academicItems);
    const preGradBlock = renderExpBlock("Experiencia Pre-egreso y Logros Universitarios", preGraduateItems);

    experienceHtml = `
      <section class="cv-section">
        <h2 class="cv-section-title">Experiencia</h2>
        ${workBlock}
        ${academicBlock}
        ${preGradBlock}
      </section>
    `;
  }

  // 5. Habilidades
  let skillsHtml = "";
  const techs = Array.isArray(graduate.technologies) ? graduate.technologies.map((t) => t.name) : [];
  const softs = Array.isArray(graduate.softSkills) ? graduate.softSkills.map((s) => s.name) : [];

  if (techs.length > 0 || softs.length > 0) {
    skillsHtml = `
      <section class="cv-section">
        <h2 class="cv-section-title">Habilidades y Competencias</h2>
        ${techs.length ? `<p class="cv-text"><strong>Habilidades técnicas:</strong> ${escape(techs.join(" · "))}</p>` : ""}
        ${softs.length ? `<p class="cv-text" style="margin-top:4px;"><strong>Habilidades Personales:</strong> ${escape(softs.join(" · "))}</p>` : ""}
      </section>
    `;
  }

  // 6. Proyectos Destacados
  let projectsHtml = "";
  const projects = Array.isArray(graduate.projects) ? graduate.projects : [];
  if (projects.length > 0) {
    let projEntries = "";
    for (const p of projects) {
      projEntries += `
        <div class="cv-entry">
          <div class="cv-entry-header">
            <span class="cv-entry-title"><strong>${escape(p.title)}</strong></span>
            ${p.url ? `<span class="cv-entry-date"><a href="${escape(p.url)}" target="_blank">Enlace del proyecto</a></span>` : ""}
          </div>
          ${p.description ? `<p class="cv-entry-desc">${escape(p.description)}</p>` : ""}
        </div>
      `;
    }
    projectsHtml = `
      <section class="cv-section">
        <h2 class="cv-section-title">Proyectos Destacados</h2>
        ${projEntries}
      </section>
    `;
  }

  return `
    <div class="cv-formal-sheet">
      <header class="cv-header">
        <h1 class="cv-name">${escape(graduate.firstName)} ${escape(graduate.lastName)}</h1>
        <div class="cv-role">${escape(graduate.currentRole || "Ingeniero Informático")}</div>
        <div class="cv-meta">Egresado ${escape(String(graduate.graduationYear || ""))} · Código UAJMS: ${escape(graduate.registrationCode || "")}</div>
        ${contacts.length ? `<div class="cv-contacts">${contacts.join(" &nbsp;|&nbsp; ")}</div>` : ""}
      </header>

      ${summaryHtml}
      ${educationHtml}
      ${experienceHtml}
      ${skillsHtml}
      ${projectsHtml}
    </div>
  `;
}

if (typeof window !== "undefined") {
  window.buildFormalCvHtml = buildFormalCvHtml;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { buildFormalCvHtml };
}
