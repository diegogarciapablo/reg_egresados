// Generador de CV moderno imprimible (2 columnas) compartido entre Dashboard y Perfil Público

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

  // ==========================================
  // COLUMNA IZQUIERDA (SIDEBAR)
  // ==========================================

  // 1. Foto de perfil o avatar formal
  const fullName = `${escape(graduate.firstName || "")} ${escape(graduate.lastName || "")}`.trim() || "Egresado UAJMS";
  let photoHtml = "";
  if (graduate.photoUrl) {
    photoHtml = `
      <div class="cv-photo-container">
        <img src="${escape(graduate.photoUrl)}" alt="${fullName}" class="cv-photo-img" />
      </div>
    `;
  } else {
    const initials = `${(graduate.firstName || "E")[0] || ""}${(graduate.lastName || "G")[0] || ""}`.toUpperCase();
    photoHtml = `
      <div class="cv-photo-container">
        <div class="cv-photo-placeholder">${escape(initials)}</div>
      </div>
    `;
  }

  // 2. Contacto
  const contactItems = [];
  if (graduate.phone) {
    contactItems.push(`
      <div class="cv-contact-row">
        <span class="cv-contact-label">Teléfono:</span>
        <span class="cv-contact-val">${escape(graduate.phone)}</span>
      </div>
    `);
  }
  if (graduate.personalEmail) {
    contactItems.push(`
      <div class="cv-contact-row">
        <span class="cv-contact-label">Correo:</span>
        <span class="cv-contact-val"><a href="mailto:${escape(graduate.personalEmail)}">${escape(graduate.personalEmail)}</a></span>
      </div>
    `);
  }
  if (graduate.institutionalEmail) {
    contactItems.push(`
      <div class="cv-contact-row">
        <span class="cv-contact-label">Institucional:</span>
        <span class="cv-contact-val">${escape(graduate.institutionalEmail)}</span>
      </div>
    `);
  }
  if (graduate.location || graduate.city) {
    contactItems.push(`
      <div class="cv-contact-row">
        <span class="cv-contact-label">Ubicación:</span>
        <span class="cv-contact-val">${escape(graduate.location || graduate.city)}</span>
      </div>
    `);
  }

  // Enlaces profesionales en Contacto
  const links = Array.isArray(graduate.professionalLinks) ? graduate.professionalLinks : [];
  for (const l of links) {
    if (l && l.url) {
      const typeLabel = l.type === "linkedin" ? "LinkedIn" : l.type === "github" ? "GitHub" : l.type === "portfolio" ? "Portafolio" : l.type;
      contactItems.push(`
        <div class="cv-contact-row">
          <span class="cv-contact-label">${escape(typeLabel)}:</span>
          <span class="cv-contact-val"><a href="${escape(l.url)}" target="_blank" rel="noopener noreferrer">${escape(l.url.replace(/^https?:\/\/(www\.)?/, ""))}</a></span>
        </div>
      `);
    }
  }

  let contactSectionHtml = "";
  if (contactItems.length > 0) {
    contactSectionHtml = `
      <div class="cv-sidebar-section">
        <div class="cv-sidebar-banner">CONTACTO</div>
        <div class="cv-sidebar-content">
          ${contactItems.join("")}
        </div>
      </div>
    `;
  }

  // 3. Habilidades (Técnicas y Blandas)
  const techs = Array.isArray(graduate.technologies) ? graduate.technologies.map((t) => t.name) : [];
  const softs = Array.isArray(graduate.softSkills) ? graduate.softSkills.map((s) => s.name) : [];

  let skillsSectionHtml = "";
  if (techs.length > 0 || softs.length > 0) {
    const listItems = [];
    techs.forEach((t) => listItems.push(`<li>${escape(t)}</li>`));
    softs.forEach((s) => listItems.push(`<li>${escape(s)}</li>`));

    skillsSectionHtml = `
      <div class="cv-sidebar-section">
        <div class="cv-sidebar-banner">HABILIDADES</div>
        <div class="cv-sidebar-content">
          <ul class="cv-bullets-list">
            ${listItems.join("")}
          </ul>
        </div>
      </div>
    `;
  }

  // 4. Idiomas
  const langs = Array.isArray(graduate.languages) ? graduate.languages : [];
  let languagesSectionHtml = "";
  if (langs.length > 0) {
    const levelLabels = {
      nativo: "Nativo",
      avanzado: "Avanzado",
      intermedio: "Intermedio",
      basico: "Básico",
    };
    const langRows = langs.map((l) => `
      <div class="cv-lang-row">
        <strong>${escape(l.name)}:</strong> <span>${escape(levelLabels[l.level] || l.level)}</span>
      </div>
    `);

    languagesSectionHtml = `
      <div class="cv-sidebar-section">
        <div class="cv-sidebar-banner">IDIOMAS</div>
        <div class="cv-sidebar-content cv-langs-content">
          ${langRows.join("")}
        </div>
      </div>
    `;
  }

  // ==========================================
  // COLUMNA DERECHA (MAIN CONTENT)
  // ==========================================

  // 1. Cabecera (Nombre, Cargo, Resumen)
  const roleTitle = (graduate.currentRole || "Ingeniero Informático").toUpperCase();
  const metaInfo = [
    graduate.graduationYear ? `Egresado ${escape(String(graduate.graduationYear))}` : "",
    graduate.registrationCode ? `Reg. UAJMS: ${escape(graduate.registrationCode)}` : "",
  ].filter(Boolean).join(" · ");

  let summaryHtml = "";
  if (graduate.professionalSummary) {
    summaryHtml = `
      <div class="cv-hero-summary">
        ${escape(graduate.professionalSummary)}
      </div>
    `;
  }

  const headerHtml = `
    <header class="cv-main-hero">
      <h1 class="cv-hero-name">${fullName.toUpperCase()}</h1>
      <div class="cv-hero-role">${escape(roleTitle)}</div>
      ${metaInfo ? `<div class="cv-hero-meta">${metaInfo}</div>` : ""}
      <div class="cv-hero-line"></div>
      ${summaryHtml}
    </header>
  `;

  // 2. Experiencia Profesional
  let experienceSectionHtml = "";
  const experiences = Array.isArray(graduate.experiences) ? graduate.experiences : [];
  if (experiences.length > 0) {
    const workItems = experiences.filter((e) => !e.category || e.category === "work");
    const academicItems = experiences.filter((e) => e.category === "academic");
    const preGradItems = experiences.filter((e) => e.category === "pre_graduate");

    const renderExpList = (list) => {
      let html = "";
      for (const exp of list) {
        const start = formatExpDate(exp.start_date || exp.startDate, exp.date_format || exp.dateFormat);
        const end = exp.is_current || exp.isCurrent ? "Actualidad" : formatExpDate(exp.end_date || exp.endDate, exp.date_format || exp.dateFormat);
        const dates = [start, end].filter(Boolean).join(" – ");

        let descHtml = "";
        if (exp.description) {
          const lines = exp.description.split("\n").map((l) => l.trim()).filter(Boolean);
          if (lines.length > 1) {
            descHtml = `<ul class="cv-entry-bullets">${lines.map((l) => `<li>${escape(l.replace(/^[•\-\*]\s*/, ""))}</li>`).join("")}</ul>`;
          } else {
            descHtml = `<p class="cv-entry-text">${escape(exp.description)}</p>`;
          }
        }

        html += `
          <div class="cv-entry-block">
            <div class="cv-entry-title-line">
              <span class="cv-entry-position">${escape(exp.position)}</span>
            </div>
            <div class="cv-entry-subline">
              <span class="cv-entry-org">${escape(exp.organization)}</span>
              ${dates ? `<span class="cv-entry-sep">|</span><span class="cv-entry-period">${escape(dates)}</span>` : ""}
            </div>
            ${descHtml}
          </div>
        `;
      }
      return html;
    };

    let entriesHtml = "";
    if (workItems.length > 0) entriesHtml += renderExpList(workItems);
    if (academicItems.length > 0) entriesHtml += renderExpList(academicItems);
    if (preGradItems.length > 0) entriesHtml += renderExpList(preGradItems);

    experienceSectionHtml = `
      <section class="cv-main-section">
        <div class="cv-section-header">
          <div class="cv-section-banner">EXPERIENCIA PROFESIONAL</div>
          <div class="cv-section-line"></div>
        </div>
        <div class="cv-section-body">
          ${entriesHtml}
        </div>
      </section>
    `;
  }

  // 3. Formación Académica y Certificaciones
  let educationSectionHtml = "";
  const certificates = Array.isArray(graduate.certificates) ? graduate.certificates : [];
  if (certificates.length > 0) {
    const formationHierarchy = ["doctorate", "master", "specialty", "diploma", "bachelor", "courses", "other"];
    let eduEntries = "";

    for (const type of formationHierarchy) {
      const items = certificates.filter((c) => (c.formation_type || c.formationType || "courses") === type);
      for (const item of items) {
        const dateStr = item.issue_date || item.issueDate ? String(item.issue_date || item.issueDate).slice(0, 10) : "";
        eduEntries += `
          <div class="cv-entry-block">
            <div class="cv-entry-title-line">
              <span class="cv-entry-position">${escape(item.title)}</span>
            </div>
            <div class="cv-entry-subline">
              <span class="cv-entry-org">${escape(item.issuer || "Universidad Autónoma Juan Misael Saracho")}</span>
              ${dateStr ? `<span class="cv-entry-sep">|</span><span class="cv-entry-period">${escape(dateStr)}</span>` : ""}
            </div>
          </div>
        `;
      }
    }

    if (eduEntries) {
      educationSectionHtml = `
        <section class="cv-main-section">
          <div class="cv-section-header">
            <div class="cv-section-banner">FORMACIÓN ACADÉMICA</div>
            <div class="cv-section-line"></div>
          </div>
          <div class="cv-section-body">
            ${eduEntries}
          </div>
        </section>
      `;
    }
  }

  // 4. Proyectos Destacados (si existen)
  let projectsSectionHtml = "";
  const projects = Array.isArray(graduate.projects) ? graduate.projects : [];
  if (projects.length > 0) {
    let projEntries = "";
    for (const p of projects) {
      projEntries += `
        <div class="cv-entry-block">
          <div class="cv-entry-title-line">
            <span class="cv-entry-position">${escape(p.title)}</span>
          </div>
          ${p.url ? `
            <div class="cv-entry-subline">
              <a href="${escape(p.url)}" target="_blank" rel="noopener noreferrer" class="cv-entry-link">${escape(p.url.replace(/^https?:\/\/(www\.)?/, ""))}</a>
            </div>
          ` : ""}
          ${p.description ? `<p class="cv-entry-text">${escape(p.description)}</p>` : ""}
        </div>
      `;
    }

    projectsSectionHtml = `
      <section class="cv-main-section">
        <div class="cv-section-header">
          <div class="cv-section-banner">PROYECTOS DESTACADOS</div>
          <div class="cv-section-line"></div>
        </div>
        <div class="cv-section-body">
          ${projEntries}
        </div>
      </section>
    `;
  }

  // Ensamblado final de la hoja de vida moderna
  return `
    <div class="cv-formal-sheet cv-modern-layout">
      <!-- Acentos decorativos de esquinas superior e inferior -->
      <div class="cv-corner-accent-top"></div>
      <div class="cv-corner-accent-bottom"></div>

      <!-- Columna Izquierda (Sidebar) -->
      <aside class="cv-sidebar-col">
        ${photoHtml}
        ${contactSectionHtml}
        ${skillsSectionHtml}
        ${languagesSectionHtml}
      </aside>

      <!-- Columna Derecha (Contenido Principal) -->
      <main class="cv-main-col">
        ${headerHtml}
        ${experienceSectionHtml}
        ${educationSectionHtml}
        ${projectsSectionHtml}
      </main>
    </div>
  `;
}

if (typeof window !== "undefined") {
  window.buildFormalCvHtml = buildFormalCvHtml;
}
