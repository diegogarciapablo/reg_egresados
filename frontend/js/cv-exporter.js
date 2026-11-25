// Generador de CV Institucional Imprimible (Diseño de 2 columnas con paginación dinámica A4)
// Compartido entre Dashboard y Perfil Público

(function () {
  const SPECIALTY_LABELS = {
    software: "Software y Programación",
    hardware: "Hardware y Ensamblaje",
    networks: "Redes y Comunicaciones",
    documentation: "Documentación y Gestión",
  };

  const FORMATION_LABELS = {
    doctorate: "Doctorado",
    master: "Maestría",
    specialty: "Especialidad",
    diploma: "Diplomado",
    bachelor: "Licenciatura / Grado Académico",
    courses: "Cursos y Certificaciones",
    other: "Otros Estudios y Reconocimientos",
  };

  const FORMATION_HIERARCHY = [
    "doctorate",
    "master",
    "specialty",
    "diploma",
    "bachelor",
    "courses",
    "other",
  ];

  const EXPERIENCE_CATEGORY_LABELS = {
    work: "Experiencia Laboral",
    academic: "Experiencia Académica e Investigación",
    pre_graduate: "Prácticas y Experiencia Pre-profesional",
  };

  const LANGUAGE_LEVEL_LABELS = {
    nativo: "Nativo / Bilingüe",
    avanzado: "Avanzado (C1/C2)",
    intermedio: "Intermedio (B1/B2)",
    basico: "Básico (A1/A2)",
  };

  const PLATFORM_LABELS = {
    linkedin: "LinkedIn",
    github: "GitHub",
    gitlab: "GitLab",
    portfolio: "Portafolio Web",
    behance: "Behance",
    kaggle: "Kaggle",
    leetcode: "LeetCode",
    other: "Enlace Profesional",
  };

  function escape(str) {
    if (str === null || str === undefined) return "";
    if (typeof escapeHtml === "function") return escapeHtml(String(str));
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatExpDate(rawDate, dateFormat) {
    if (!rawDate) return "";
    const iso = String(rawDate).slice(0, 10);
    const [year, month, day] = iso.split("-");
    if (!year || !month) return iso;
    if (dateFormat === "month") return `${month}/${year}`;
    return day ? `${day}/${month}/${year}` : `${month}/${year}`;
  }

  function formatCleanUrl(url) {
    if (!url) return "";
    return String(url).replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
  }

  function chunkArray(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) {
      out.push(arr.slice(i, i + size));
    }
    return out;
  }

  // Divide textos o listas muy extensas en fragmentos atómicos para que ningún bloque individual supere una página A4
  function splitDescriptionIntoChunks(description, maxBulletsPerChunk = 6, maxCharsPerParagraph = 650) {
    if (!description) return [""];
    const rawLines = String(description)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (rawLines.length > 1) {
      const bulletChunks = chunkArray(rawLines, maxBulletsPerChunk);
      return bulletChunks.map((lines) => {
        const lis = lines
          .map((l) => `<li>${escape(l.replace(/^[•\-\*]\s*/, ""))}</li>`)
          .join("");
        return `<ul class="cv-entry-bullets">${lis}</ul>`;
      });
    }

    const singleText = rawLines[0] || "";
    if (singleText.length <= maxCharsPerParagraph) {
      return [`<p class="cv-entry-text">${escape(singleText)}</p>`];
    }

    // Si es un párrafo extremadamente largo, dividirlo por oraciones en bloques manejables
    const sentences = singleText.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [singleText];
    const chunks = [];
    let current = "";
    for (const s of sentences) {
      if ((current + " " + s).trim().length > maxCharsPerParagraph && current.length > 0) {
        chunks.push(`<p class="cv-entry-text">${escape(current.trim())}</p>`);
        current = s;
      } else {
        current = (current + " " + s).trim();
      }
    }
    if (current.trim()) {
      chunks.push(`<p class="cv-entry-text">${escape(current.trim())}</p>`);
    }
    return chunks.length ? chunks : [`<p class="cv-entry-text">${escape(singleText)}</p>`];
  }

  /**
   * Construye las unidades atómicas de la columna izquierda (sidebar) y columna derecha (main)
   * para permitir tanto renderizado directo como paginación dinámica A4 exacta.
   */
  function buildCvModel(graduate = {}) {
    const firstName = graduate.firstName || graduate.first_name || "";
    const lastName = graduate.lastName || graduate.last_name || "";
    const fullName = `${escape(firstName)} ${escape(lastName)}`.trim() || "Egresado UAJMS";
    const initials = `${(firstName || "E")[0] || "E"}${(lastName || "G")[0] || "G"}`.toUpperCase();

    const sidebarUnits = [];
    const mainUnits = [];

    // =====================================================
    // 1. SIDEBAR: FOTO E IDENTIDAD GRÁFICA INSTITUCIONAL
    // =====================================================
    const photoUrl = graduate.photoUrl || graduate.photo_url || "";
    const photoInnerHtml = photoUrl
      ? `<img src="${escape(photoUrl)}" alt="${fullName}" class="cv-photo-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
         <div class="cv-photo-placeholder" style="display:none;">${escape(initials)}</div>`
      : `<div class="cv-photo-placeholder">${escape(initials)}</div>`;

    sidebarUnits.push({
      type: "photo",
      html: `
        <div class="cv-unit cv-photo-unit">
          <div class="cv-photo-container">
            ${photoInnerHtml}
          </div>
          <div class="cv-institution-stamp">
            <span class="cv-stamp-univ">UAJMS · YACUIBA</span>
            <span class="cv-stamp-career">Ingeniería Informática</span>
          </div>
        </div>
      `,
    });

    // =====================================================
    // 2. SIDEBAR: DATOS PERSONALES Y CONTACTO
    // =====================================================
    const contactRows = [];
    if (graduate.registrationCode || graduate.registration_code) {
      contactRows.push(`
        <div class="cv-contact-row">
          <span class="cv-contact-label">Registro Institucional</span>
          <span class="cv-contact-val cv-contact-code">${escape(graduate.registrationCode || graduate.registration_code)}</span>
        </div>
      `);
    }
    if (graduate.graduationYear || graduate.graduation_year) {
      contactRows.push(`
        <div class="cv-contact-row">
          <span class="cv-contact-label">Año de Titulación / Egreso</span>
          <span class="cv-contact-val">${escape(graduate.graduationYear || graduate.graduation_year)}</span>
        </div>
      `);
    }
    if (graduate.phone) {
      contactRows.push(`
        <div class="cv-contact-row">
          <span class="cv-contact-label">Teléfono / Celular</span>
          <span class="cv-contact-val">${escape(graduate.phone)}</span>
        </div>
      `);
    }
    const personalEmail = graduate.personalEmail || graduate.personal_email;
    if (personalEmail) {
      contactRows.push(`
        <div class="cv-contact-row">
          <span class="cv-contact-label">Correo Personal</span>
          <span class="cv-contact-val"><a href="mailto:${escape(personalEmail)}">${escape(personalEmail)}</a></span>
        </div>
      `);
    }
    const institutionalEmail = graduate.institutionalEmail || graduate.institutional_email;
    if (institutionalEmail) {
      contactRows.push(`
        <div class="cv-contact-row">
          <span class="cv-contact-label">Correo Institucional</span>
          <span class="cv-contact-val"><a href="mailto:${escape(institutionalEmail)}">${escape(institutionalEmail)}</a></span>
        </div>
      `);
    }
    const locationVal = graduate.location || graduate.city || graduate.city_country;
    if (locationVal) {
      contactRows.push(`
        <div class="cv-contact-row">
          <span class="cv-contact-label">Ubicación</span>
          <span class="cv-contact-val">${escape(locationVal)}</span>
        </div>
      `);
    }

    // Enlaces profesionales (incluyendo fallbacks de columnas legadas)
    const rawLinks = Array.isArray(graduate.professionalLinks) ? [...graduate.professionalLinks] : [];
    if (!rawLinks.some((l) => l && l.type === "linkedin") && (graduate.linkedinUrl || graduate.linkedin_url)) {
      rawLinks.push({ type: "linkedin", url: graduate.linkedinUrl || graduate.linkedin_url });
    }
    if (!rawLinks.some((l) => l && l.type === "github") && (graduate.githubUrl || graduate.github_url)) {
      rawLinks.push({ type: "github", url: graduate.githubUrl || graduate.github_url });
    }
    if (!rawLinks.some((l) => l && l.type === "portfolio") && (graduate.portfolioUrl || graduate.portfolio_url)) {
      rawLinks.push({ type: "portfolio", url: graduate.portfolioUrl || graduate.portfolio_url });
    }

    for (const l of rawLinks) {
      if (l && l.url) {
        const label = PLATFORM_LABELS[l.type] || l.label || l.type || "Enlace";
        contactRows.push(`
          <div class="cv-contact-row">
            <span class="cv-contact-label">${escape(label)}</span>
            <span class="cv-contact-val"><a href="${escape(l.url)}" target="_blank" rel="noopener noreferrer">${escape(formatCleanUrl(l.url))}</a></span>
          </div>
        `);
      }
    }

    if (contactRows.length > 0) {
      const contactChunks = chunkArray(contactRows, 6);
      contactChunks.forEach((chunk, idx) => {
        sidebarUnits.push({
          type: "sidebar-section",
          sectionKey: "contacto",
          html: `
            <div class="cv-unit cv-sidebar-section">
              <div class="cv-sidebar-banner">${idx === 0 ? "CONTACTO" : "CONTACTO (CONT.)"}</div>
              <div class="cv-sidebar-content">
                ${chunk.join("")}
              </div>
            </div>
          `,
        });
      });
    }

    // =====================================================
    // 3. SIDEBAR: HABILIDADES TÉCNICAS (SEPARADAS Y AGRUPADAS POR ESPECIALIDAD SI EXISTE)
    // =====================================================
    const rawTechs = Array.isArray(graduate.technologies) ? graduate.technologies : [];
    const validTechs = rawTechs
      .map((t) => (typeof t === "string" ? { name: t } : t))
      .filter((t) => t && t.name);

    if (validTechs.length > 0) {
      const hasExplicitCategory = validTechs.some((t) => Boolean(t.specialty || t.category));

      if (hasExplicitCategory) {
        const grouped = {};
        const uncategorized = [];

        for (const t of validTechs) {
          const rawCat = t.specialty || t.category || "";
          if (rawCat) {
            const catLabel = SPECIALTY_LABELS[rawCat] || rawCat;
            if (!grouped[catLabel]) grouped[catLabel] = [];
            grouped[catLabel].push(t.name);
          } else {
            uncategorized.push(t.name);
          }
        }
        if (uncategorized.length > 0) {
          grouped["Otras Tecnologías"] = uncategorized;
        }

        const categoryEntries = Object.entries(grouped);
        categoryEntries.forEach(([catLabel, techNames], catIdx) => {
          const nameChunks = chunkArray(techNames, 14);
          nameChunks.forEach((chunk, chunkIdx) => {
            const showBanner = catIdx === 0 && chunkIdx === 0;
            const showContBanner = !showBanner && chunkIdx > 0;
            const chipsHtml = chunk
              .map((name) => `<span class="cv-skill-tag cv-skill-tag-tech">${escape(name)}</span>`)
              .join("");

            sidebarUnits.push({
              type: "sidebar-section",
              sectionKey: "habilidades-tecnicas",
              needsContinuationHeader: !showBanner,
              continuationTitle: "HABILIDADES TÉCNICAS (CONT.)",
              html: `
                <div class="cv-unit cv-sidebar-section cv-sidebar-group-unit">
                  ${showBanner ? `<div class="cv-sidebar-banner">HABILIDADES TÉCNICAS</div>` : ""}
                  ${showContBanner ? `<div class="cv-sidebar-banner">HABILIDADES TÉCNICAS (CONT.)</div>` : ""}
                  <div class="cv-sidebar-content">
                    <div class="cv-tech-category-block">
                      <div class="cv-tech-category-title">${escape(catLabel)}${chunkIdx > 0 ? " (cont.)" : ""}</div>
                      <div class="cv-skill-tags-wrap">${chipsHtml}</div>
                    </div>
                  </div>
                </div>
              `,
            });
          });
        });
      } else {
        // Sin categorías en los datos: mostrar lista limpia sin inventar categorías
        const techNames = validTechs.map((t) => t.name);
        const techChunks = chunkArray(techNames, 16);
        techChunks.forEach((chunk, idx) => {
          const chipsHtml = chunk
            .map((name) => `<span class="cv-skill-tag cv-skill-tag-tech">${escape(name)}</span>`)
            .join("");
          sidebarUnits.push({
            type: "sidebar-section",
            sectionKey: "habilidades-tecnicas",
            html: `
              <div class="cv-unit cv-sidebar-section">
                <div class="cv-sidebar-banner">${idx === 0 ? "HABILIDADES TÉCNICAS" : "HABILIDADES TÉCNICAS (CONT.)"}</div>
                <div class="cv-sidebar-content">
                  <div class="cv-skill-tags-wrap">${chipsHtml}</div>
                </div>
              </div>
            `,
          });
        });
      }
    }

    // =====================================================
    // 4. SIDEBAR: HABILIDADES PERSONALES (CLARAMENTE SEPARADAS)
    // =====================================================
    const rawSofts = Array.isArray(graduate.softSkills || graduate.soft_skills)
      ? graduate.softSkills || graduate.soft_skills
      : [];
    const softNames = rawSofts
      .map((s) => (typeof s === "string" ? s : s && s.name))
      .filter(Boolean);

    if (softNames.length > 0) {
      const softChunks = chunkArray(softNames, 12);
      softChunks.forEach((chunk, idx) => {
        const itemsHtml = chunk.map((name) => `<li>${escape(name)}</li>`).join("");
        sidebarUnits.push({
          type: "sidebar-section",
          sectionKey: "habilidades-personales",
          html: `
            <div class="cv-unit cv-sidebar-section">
              <div class="cv-sidebar-banner">${idx === 0 ? "HABILIDADES PERSONALES" : "HABILIDADES PERSONALES (CONT.)"}</div>
              <div class="cv-sidebar-content">
                <ul class="cv-bullets-list cv-soft-skills-list">
                  ${itemsHtml}
                </ul>
              </div>
            </div>
          `,
        });
      });
    }

    // =====================================================
    // 5. SIDEBAR: IDIOMAS
    // =====================================================
    const langs = Array.isArray(graduate.languages) ? graduate.languages.filter((l) => l && l.name) : [];
    if (langs.length > 0) {
      const langChunks = chunkArray(langs, 8);
      langChunks.forEach((chunk, idx) => {
        const langRows = chunk.map((l) => {
          const levelText = LANGUAGE_LEVEL_LABELS[l.level] || l.level || "";
          return `
            <div class="cv-lang-row">
              <span class="cv-lang-name">${escape(l.name)}</span>
              ${levelText ? `<span class="cv-lang-badge">${escape(levelText)}</span>` : ""}
            </div>
          `;
        });
        sidebarUnits.push({
          type: "sidebar-section",
          sectionKey: "idiomas",
          html: `
            <div class="cv-unit cv-sidebar-section">
              <div class="cv-sidebar-banner">${idx === 0 ? "IDIOMAS" : "IDIOMAS (CONT.)"}</div>
              <div class="cv-sidebar-content cv-langs-content">
                ${langRows.join("")}
              </div>
            </div>
          `,
        });
      });
    }

    // =====================================================
    // 6. MAIN: CABECERA PRINCIPAL Y RESUMEN PROFESIONAL
    // =====================================================
    const roleTitle = (graduate.currentRole || graduate.current_role || "Ingeniero Informático").toUpperCase();
    const metaInfo = [
      graduate.graduationYear || graduate.graduation_year
        ? `Promoción ${escape(String(graduate.graduationYear || graduate.graduation_year))}`
        : "",
      graduate.registrationCode || graduate.registration_code
        ? `Reg. UAJMS: ${escape(graduate.registrationCode || graduate.registration_code)}`
        : "",
      locationVal ? escape(locationVal) : "",
    ]
      .filter(Boolean)
      .join("  ·  ");

    const summaryText = graduate.professionalSummary || graduate.professional_summary || "";
    const summaryChunks = summaryText ? splitDescriptionIntoChunks(summaryText, 6, 850) : [];

    mainUnits.push({
      type: "hero",
      html: `
        <header class="cv-unit cv-main-hero">
          <div class="cv-hero-eyebrow">UNIVERSIDAD AUTÓNOMA JUAN MISAEL SARACHO · INGENIERÍA INFORMÁTICA</div>
          <h1 class="cv-hero-name">${fullName.toUpperCase()}</h1>
          <div class="cv-hero-role">${escape(roleTitle)}</div>
          ${metaInfo ? `<div class="cv-hero-meta">${metaInfo}</div>` : ""}
          <div class="cv-hero-line"></div>
          ${summaryChunks[0] ? `<div class="cv-hero-summary">${summaryChunks[0]}</div>` : ""}
        </header>
      `,
    });

    for (let i = 1; i < summaryChunks.length; i++) {
      mainUnits.push({
        type: "hero-summary-cont",
        html: `
          <div class="cv-unit cv-hero-summary cv-hero-summary-cont">
            ${summaryChunks[i]}
          </div>
        `,
      });
    }

    // Helper para agregar entradas cronológicas o de sección manteniendo el encabezado unido al primer ítem
    const pushSectionEntries = (sectionKey, sectionTitle, entryHtmlList, isTimeline = false) => {
      if (!entryHtmlList || entryHtmlList.length === 0) return;

      entryHtmlList.forEach((entryHtml, idx) => {
        const bodyClass = isTimeline ? "cv-section-body cv-timeline-list" : "cv-section-body";
        if (idx === 0) {
          // El primer elemento lleva el encabezado de sección integrado para evitar encabezados huérfanos
          mainUnits.push({
            type: "main-entry",
            sectionKey,
            sectionTitle,
            isFirstInSection: true,
            isTimeline,
            html: `
              <section class="cv-unit cv-main-section-unit">
                <div class="cv-section-header">
                  <div class="cv-section-banner">${escape(sectionTitle)}</div>
                  <div class="cv-section-line"></div>
                </div>
                <div class="${bodyClass}">
                  ${entryHtml}
                </div>
              </section>
            `,
          });
        } else {
          mainUnits.push({
            type: "main-entry",
            sectionKey,
            sectionTitle,
            isFirstInSection: false,
            isTimeline,
            entryHtml,
            html: `
              <div class="cv-unit cv-main-section-unit cv-main-continuation-unit">
                <div class="${bodyClass}">
                  ${entryHtml}
                </div>
              </div>
            `,
          });
        }
      });
    };

    // =====================================================
    // 7. MAIN: EXPERIENCIA PROFESIONAL (LÍNEA CRONOLÓGICA ELEGANTE)
    // =====================================================
    const experiences = Array.isArray(graduate.experiences)
      ? graduate.experiences.filter((e) => e && (e.position || e.organization))
      : [];

    if (experiences.length > 0) {
      const workItems = experiences.filter((e) => !e.category || e.category === "work");
      const academicItems = experiences.filter((e) => e.category === "academic");
      const preGradItems = experiences.filter((e) => e.category === "pre_graduate");
      const otherExpItems = experiences.filter(
        (e) => e.category && !["work", "academic", "pre_graduate"].includes(e.category)
      );

      const hasMultipleExpCategories =
        [workItems.length > 0, academicItems.length > 0, preGradItems.length > 0, otherExpItems.length > 0].filter(
          Boolean
        ).length > 1;

      const expGroups = [
        { key: "work", label: EXPERIENCE_CATEGORY_LABELS.work, items: workItems },
        { key: "academic", label: EXPERIENCE_CATEGORY_LABELS.academic, items: academicItems },
        { key: "pre_graduate", label: EXPERIENCE_CATEGORY_LABELS.pre_graduate, items: preGradItems },
        { key: "other", label: "Otras Experiencias", items: otherExpItems },
      ];

      const expEntryBlocks = [];
      for (const grp of expGroups) {
        if (!grp.items.length) continue;
        grp.items.forEach((exp, itemIdx) => {
          const start = formatExpDate(exp.start_date || exp.startDate, exp.date_format || exp.dateFormat);
          const isCurrent = Boolean(exp.is_current || exp.isCurrent);
          const end = isCurrent
            ? "Actualidad"
            : formatExpDate(exp.end_date || exp.endDate, exp.date_format || exp.dateFormat);
          const dates = [start, end].filter(Boolean).join(" – ");

          const descChunks = splitDescriptionIntoChunks(exp.description, 5, 580);
          const catBadgeHtml =
            hasMultipleExpCategories && itemIdx === 0
              ? `<div class="cv-timeline-category-label">${escape(grp.label)}</div>`
              : "";

          descChunks.forEach((descHtml, chunkIdx) => {
            const titleText =
              chunkIdx === 0 ? escape(exp.position || "Cargo Profesional") : `${escape(exp.position || "Cargo")} (cont.)`;
            expEntryBlocks.push(`
              ${chunkIdx === 0 ? catBadgeHtml : ""}
              <div class="cv-entry-block cv-timeline-item ${isCurrent ? "cv-timeline-item-current" : ""}">
                <div class="cv-timeline-marker"></div>
                <div class="cv-timeline-content">
                  <div class="cv-entry-header-row">
                    <div class="cv-entry-title-col">
                      <span class="cv-entry-position">${titleText}</span>
                      ${exp.organization ? `<span class="cv-entry-org">${escape(exp.organization)}</span>` : ""}
                    </div>
                    ${dates ? `<span class="cv-entry-period-badge">${escape(dates)}</span>` : ""}
                  </div>
                  ${descHtml}
                </div>
              </div>
            `);
          });
        });
      }

      pushSectionEntries("experiencia", "EXPERIENCIA PROFESIONAL", expEntryBlocks, true);
    }

    // =====================================================
    // 8. MAIN: FORMACIÓN ACADÉMICA Y CERTIFICACIONES (LÍNEA CRONOLÓGICA)
    // =====================================================
    const certificates = Array.isArray(graduate.certificates)
      ? graduate.certificates.filter((c) => c && c.title)
      : [];

    if (certificates.length > 0) {
      const eduEntryBlocks = [];
      const seenCerts = new Set();

      const renderCertItem = (item, typeKey) => {
        const hasDate = Boolean(item.issue_date || item.issueDate);
        const rawDate = hasDate ? String(item.issue_date || item.issueDate).slice(0, 10) : "";
        const dateStr = hasDate ? formatExpDate(rawDate, item.date_format || item.dateFormat) : "En curso";
        const typeLabel = FORMATION_LABELS[typeKey] || "";
        const credentialUrl = item.credential_url || item.credentialUrl || "";

        return `
          <div class="cv-entry-block cv-timeline-item ${!hasDate ? "cv-timeline-item-current" : ""}">
            <div class="cv-timeline-marker"></div>
            <div class="cv-timeline-content">
              <div class="cv-entry-header-row">
                <div class="cv-entry-title-col">
                  <div class="cv-entry-title-with-tag">
                    <span class="cv-entry-position">${escape(item.title)}</span>
                    ${typeLabel ? `<span class="cv-formation-type-pill">${escape(typeLabel)}</span>` : ""}
                  </div>
                  <span class="cv-entry-org">${escape(item.issuer || "Universidad Autónoma Juan Misael Saracho")}</span>
                </div>
                <span class="cv-entry-period-badge ${!hasDate ? "cv-period-in-progress" : ""}">${escape(dateStr)}</span>
              </div>
              ${
                credentialUrl
                  ? `<div class="cv-entry-subline"><a href="${escape(credentialUrl)}" target="_blank" rel="noopener noreferrer" class="cv-entry-link">Credencial: ${escape(formatCleanUrl(credentialUrl))}</a></div>`
                  : ""
              }
            </div>
          </div>
        `;
      };

      for (const type of FORMATION_HIERARCHY) {
        const items = certificates.filter((c) => (c.formation_type || c.formationType || "courses") === type);
        for (const item of items) {
          seenCerts.add(item);
          eduEntryBlocks.push(renderCertItem(item, type));
        }
      }
      // Incluir cualquier certificado cuyo formation_type sea distinto a los de la lista estándar
      for (const item of certificates) {
        if (!seenCerts.has(item)) {
          eduEntryBlocks.push(renderCertItem(item, item.formation_type || item.formationType || "other"));
        }
      }

      pushSectionEntries("formacion", "FORMACIÓN ACADÉMICA Y CERTIFICACIONES", eduEntryBlocks, true);
    }

    // =====================================================
    // 9. MAIN: PROYECTOS DESTACADOS
    // =====================================================
    const projects = Array.isArray(graduate.projects)
      ? graduate.projects.filter((p) => p && p.title)
      : [];

    if (projects.length > 0) {
      const projEntryBlocks = [];
      for (const p of projects) {
        const projUrl = p.url || "";
        const repoUrl = p.repository_url || p.repositoryUrl || "";
        const descChunks = splitDescriptionIntoChunks(p.description, 5, 580);

        descChunks.forEach((descHtml, chunkIdx) => {
          const titleText = chunkIdx === 0 ? escape(p.title) : `${escape(p.title)} (cont.)`;
          projEntryBlocks.push(`
            <div class="cv-entry-block cv-project-card-block">
              <div class="cv-entry-header-row">
                <span class="cv-entry-position">${titleText}</span>
              </div>
              ${
                chunkIdx === 0 && (projUrl || repoUrl)
                  ? `<div class="cv-project-links-row">
                      ${
                        projUrl
                          ? `<a href="${escape(projUrl)}" target="_blank" rel="noopener noreferrer" class="cv-entry-link">${escape(formatCleanUrl(projUrl))}</a>`
                          : ""
                      }
                      ${projUrl && repoUrl ? `<span class="cv-entry-sep">·</span>` : ""}
                      ${
                        repoUrl && repoUrl !== projUrl
                          ? `<a href="${escape(repoUrl)}" target="_blank" rel="noopener noreferrer" class="cv-entry-link">Repo: ${escape(formatCleanUrl(repoUrl))}</a>`
                          : ""
                      }
                    </div>`
                  : ""
              }
              ${descHtml}
            </div>
          `);
        });
      }

      pushSectionEntries("proyectos", "PROYECTOS DESTACADOS", projEntryBlocks, false);
    }

    // =====================================================
    // 10. MAIN: RECOMENDACIONES / REFERENCIAS (SI EXISTEN)
    // =====================================================
    const recommendations = Array.isArray(graduate.recommendations)
      ? graduate.recommendations.filter((r) => r && (r.message || r.author_name || r.authorName))
      : [];

    if (recommendations.length > 0) {
      const recBlocks = recommendations.map((r) => {
        const author = r.author_name || r.authorName || "Referencia Profesional";
        const role = r.author_role || r.authorRole || "";
        return `
          <div class="cv-entry-block cv-recommendation-block">
            ${r.message ? `<blockquote class="cv-rec-quote">“${escape(r.message)}”</blockquote>` : ""}
            <div class="cv-rec-author">
              <strong>${escape(author)}</strong>${role ? ` <span>· ${escape(role)}</span>` : ""}
            </div>
          </div>
        `;
      });

      pushSectionEntries("recomendaciones", "REFERENCIAS Y RECOMENDACIONES", recBlocks, false);
    }

    return {
      fullName,
      sidebarUnits,
      mainUnits,
    };
  }

  /**
   * Envuelve una unidad de continuación con su encabezado "(CONT.)" cuando inicia una nueva página A4
   */
  function renderMainUnitForPage(unit, isFirstUnitOfSectionOnPage) {
    if (!unit.isFirstInSection && isFirstUnitOfSectionOnPage && unit.sectionTitle) {
      const bodyClass = unit.isTimeline ? "cv-section-body cv-timeline-list" : "cv-section-body";
      return `
        <section class="cv-unit cv-main-section-unit cv-section-continued">
          <div class="cv-section-header">
            <div class="cv-section-banner">${escape(unit.sectionTitle)} (CONT.)</div>
            <div class="cv-section-line"></div>
          </div>
          <div class="${bodyClass}">
            ${unit.entryHtml}
          </div>
        </section>
      `;
    }
    return unit.html;
  }

  function renderSidebarUnitForPage(unit, isFirstUnitOfSectionOnPage) {
    if (unit.needsContinuationHeader && isFirstUnitOfSectionOnPage && unit.continuationTitle) {
      return unit.html.replace(
        '<div class="cv-sidebar-content">',
        `<div class="cv-sidebar-banner">${escape(unit.continuationTitle)}</div><div class="cv-sidebar-content">`
      );
    }
    return unit.html;
  }

  function createPageShell(mode, pageNumber) {
    const page = document.createElement("div");
    page.className = `cv-formal-sheet cv-page-sheet ${
      mode === "two-col" ? "cv-modern-layout cv-page-two-col" : "cv-page-full-width"
    }`;
    page.setAttribute("data-cv-page", String(pageNumber));

    const topAccent = document.createElement("div");
    topAccent.className = "cv-corner-accent-top";
    const bottomAccent = document.createElement("div");
    bottomAccent.className = "cv-corner-accent-bottom";
    page.appendChild(topAccent);
    page.appendChild(bottomAccent);

    if (mode === "two-col") {
      const sidebarCol = document.createElement("aside");
      sidebarCol.className = "cv-sidebar-col";
      const mainCol = document.createElement("main");
      mainCol.className = "cv-main-col";
      page.appendChild(sidebarCol);
      page.appendChild(mainCol);
      return { page, sidebarCol, mainCol };
    } else {
      const fullCol = document.createElement("main");
      fullCol.className = "cv-main-col cv-main-col-full";
      page.appendChild(fullCol);
      return { page, sidebarCol: null, mainCol: fullCol };
    }
  }

  /**
   * Paginador dinámico A4 en el DOM:
   * - Página 1: siempre 2 columnas (Sidebar + Main).
   * - Páginas 2+:
   *   * Si ambas columnas tienen contenido pendiente, usa 2 columnas.
   *   * Si una columna ya terminó (p. ej. Sidebar agotada), usa 100% del ancho disponible (cv-page-full-width).
   * - Garantiza cero recortes, cero pérdidas y coherencia 1:1 entre Vista Previa e Impresión PDF.
   */
  function paginateCvIntoContainer(container, graduate) {
    if (!container) return;
    const model = buildCvModel(graduate);

    // Sandbox de medición con ancho exacto A4 (794px a 96dpi) para que la paginación sea idéntica en móvil y escritorio
    const measureHost = document.createElement("div");
    measureHost.className = "cv-pagination-measure-host";
    document.body.appendChild(measureHost);

    // Altura máxima interna de contenido por página A4 (1122px totales - 72px de márgenes superior/inferior A4)
    const PAGE_MAX_CONTENT_HEIGHT = 1036;

    const pagesOutput = [];
    let sIdx = 0;
    let mIdx = 0;
    let pageNum = 1;

    try {
      while (sIdx < model.sidebarUnits.length || mIdx < model.mainUnits.length || pageNum === 1) {
        const hasSidebarLeft = sIdx < model.sidebarUnits.length;
        const hasMainLeft = mIdx < model.mainUnits.length;

        // Primera página siempre en 2 columnas; páginas posteriores en 2 columnas sólo si ambas tienen contenido
        const mode = pageNum === 1 || (hasSidebarLeft && hasMainLeft) ? "two-col" : "full-width";
        const shell = createPageShell(mode, pageNum);
        measureHost.innerHTML = "";
        measureHost.appendChild(shell.page);

        if (mode === "two-col") {
          // 1. Llenar columna izquierda (sidebar) hasta el límite vertical de la página A4
          const seenSidebarSectionsOnPage = new Set();
          let placedInSidebar = 0;

          while (sIdx < model.sidebarUnits.length) {
            const unit = model.sidebarUnits[sIdx];
            const isFirstOfSec = unit.sectionKey ? !seenSidebarSectionsOnPage.has(unit.sectionKey) : true;
            const wrapper = document.createElement("div");
            wrapper.className = "cv-unit-wrapper";
            wrapper.innerHTML = renderSidebarUnitForPage(unit, isFirstOfSec);
            shell.sidebarCol.appendChild(wrapper);

            const bottomOffset = wrapper.offsetTop + wrapper.offsetHeight;
            if (bottomOffset > PAGE_MAX_CONTENT_HEIGHT && placedInSidebar > 0) {
              shell.sidebarCol.removeChild(wrapper);
              break;
            }
            if (unit.sectionKey) seenSidebarSectionsOnPage.add(unit.sectionKey);
            placedInSidebar++;
            sIdx++;
          }

          // 2. Llenar columna derecha (main) hasta el límite vertical de la página A4
          const seenMainSectionsOnPage = new Set();
          let placedInMain = 0;

          while (mIdx < model.mainUnits.length) {
            const unit = model.mainUnits[mIdx];
            const isFirstOfSec = unit.sectionKey ? !seenMainSectionsOnPage.has(unit.sectionKey) : true;
            const wrapper = document.createElement("div");
            wrapper.className = "cv-unit-wrapper";
            wrapper.innerHTML = renderMainUnitForPage(unit, isFirstOfSec);
            shell.mainCol.appendChild(wrapper);

            const bottomOffset = wrapper.offsetTop + wrapper.offsetHeight;
            if (bottomOffset > PAGE_MAX_CONTENT_HEIGHT && placedInMain > 0) {
              shell.mainCol.removeChild(wrapper);
              break;
            }
            if (unit.sectionKey) seenMainSectionsOnPage.add(unit.sectionKey);
            placedInMain++;
            mIdx++;
          }
        } else {
          // Modo ancho completo (100% de la hoja A4) cuando sólo una columna continúa en páginas posteriores
          const activeQueue = hasMainLeft ? "main" : "sidebar";
          const seenSectionsOnPage = new Set();
          let placedCount = 0;

          if (activeQueue === "main") {
            while (mIdx < model.mainUnits.length) {
              const unit = model.mainUnits[mIdx];
              const isFirstOfSec = unit.sectionKey ? !seenSectionsOnPage.has(unit.sectionKey) : true;
              const wrapper = document.createElement("div");
              wrapper.className = "cv-unit-wrapper";
              wrapper.innerHTML = renderMainUnitForPage(unit, isFirstOfSec);
              shell.mainCol.appendChild(wrapper);

              const bottomOffset = wrapper.offsetTop + wrapper.offsetHeight;
              if (bottomOffset > PAGE_MAX_CONTENT_HEIGHT && placedCount > 0) {
                shell.mainCol.removeChild(wrapper);
                break;
              }
              if (unit.sectionKey) seenSectionsOnPage.add(unit.sectionKey);
              placedCount++;
              mIdx++;
            }
          } else {
            // Caso en que la barra lateral continúa sola (p. ej. perfil con decenas de habilidades y poca experiencia)
            shell.mainCol.classList.add("cv-sidebar-overflow-full-grid");
            while (sIdx < model.sidebarUnits.length) {
              const unit = model.sidebarUnits[sIdx];
              const isFirstOfSec = unit.sectionKey ? !seenSectionsOnPage.has(unit.sectionKey) : true;
              const wrapper = document.createElement("div");
              wrapper.className = "cv-unit-wrapper cv-sidebar-full-item";
              wrapper.innerHTML = renderSidebarUnitForPage(unit, isFirstOfSec);
              shell.mainCol.appendChild(wrapper);

              const bottomOffset = wrapper.offsetTop + wrapper.offsetHeight;
              if (bottomOffset > PAGE_MAX_CONTENT_HEIGHT && placedCount > 0) {
                shell.mainCol.removeChild(wrapper);
                break;
              }
              if (unit.sectionKey) seenSectionsOnPage.add(unit.sectionKey);
              placedCount++;
              sIdx++;
            }
          }
        }

        pagesOutput.push(shell.page);
        pageNum++;

        if (pageNum > 25) break; // Salvaguarda contra bucles infinitos
      }
    } finally {
      if (measureHost.parentNode) {
        measureHost.parentNode.removeChild(measureHost);
      }
    }

    // Numeración discreta de páginas en el pie de cada hoja A4
    const totalPages = pagesOutput.length;
    pagesOutput.forEach((pageEl, idx) => {
      const footer = document.createElement("div");
      footer.className = "cv-page-footer-meta";
      footer.innerHTML = `
        <span>Currículum Vitae · ${model.fullName}</span>
        <span>Página ${idx + 1} de ${totalPages}</span>
      `;
      pageEl.appendChild(footer);
    });

    container.innerHTML = "";
    const deck = document.createElement("div");
    deck.className = "cv-pages-deck";
    pagesOutput.forEach((p) => deck.appendChild(p));
    container.appendChild(deck);
    return totalPages;
  }

  /**
   * Mantiene compatibilidad total con llamadas existentes a `buildFormalCvHtml(graduate)`
   * y además activa automáticamente la paginación dinámica A4 si `#cvSheetContainer` está en el DOM.
   */
  function buildFormalCvHtml(graduate) {
    const model = buildCvModel(graduate);
    const fallbackHtml = `
      <div class="cv-pages-deck" data-cv-needs-pagination="true">
        <div class="cv-formal-sheet cv-page-sheet cv-modern-layout cv-page-two-col" data-cv-page="1">
          <div class="cv-corner-accent-top"></div>
          <div class="cv-corner-accent-bottom"></div>
          <aside class="cv-sidebar-col">
            ${model.sidebarUnits.map((u) => u.html).join("")}
          </aside>
          <main class="cv-main-col">
            ${model.mainUnits.map((u) => u.html).join("")}
          </main>
        </div>
      </div>
    `;

    if (typeof window !== "undefined" && typeof document !== "undefined") {
      window.__lastCvGraduateData = graduate;
      setTimeout(() => {
        const target = document.getElementById("cvSheetContainer");
        if (target && target.querySelector('[data-cv-needs-pagination="true"]')) {
          paginateCvIntoContainer(target, graduate);
        }
      }, 0);
    }

    return fallbackHtml;
  }

  function renderFormalCv(container, graduate) {
    if (!container) return 0;
    window.__lastCvGraduateData = graduate;
    return paginateCvIntoContainer(container, graduate);
  }

  if (typeof window !== "undefined") {
    window.buildFormalCvHtml = buildFormalCvHtml;
    window.renderFormalCv = renderFormalCv;
    window.paginateCvIntoContainer = paginateCvIntoContainer;
  }
})();
