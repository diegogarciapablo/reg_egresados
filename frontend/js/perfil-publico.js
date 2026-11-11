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

function createExpandableText(text) {
  if (!text) return null;
  const wrap = el("div", { class: "expandable-text-wrap" });
  const p = el("p", { class: "clamped-text", text });
  const toggleBtn = el("button", {
    type: "button",
    class: "btn-toggle-expand",
    text: "Ver más",
  });
  toggleBtn.style.display = "none";

  let isExpanded = false;
  toggleBtn.addEventListener("click", () => {
    isExpanded = !isExpanded;
    if (isExpanded) {
      p.classList.add("expanded");
      toggleBtn.textContent = "Ver menos";
    } else {
      p.classList.remove("expanded");
      toggleBtn.textContent = "Ver más";
    }
  });

  wrap.appendChild(p);
  wrap.appendChild(toggleBtn);

  // Evaluar tras renderizar si el texto excede las 3 líneas
  requestAnimationFrame(() => {
    if (p.scrollHeight > p.clientHeight + 2) {
      toggleBtn.style.display = "inline-block";
    }
  });

  return wrap;
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
  header.appendChild(headerInfo);

  const headerActions = el("div", { class: "profile-header-actions" });
  const downloadCvBtn = el("button", {
    id: "downloadCvBtn",
    class: "btn btn-secondary",
    type: "button",
    text: "📄 Descargar CV en PDF",
    style: "display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;",
  });
  downloadCvBtn.addEventListener("click", () => {
    const cvModal = document.getElementById("cvPreviewModal");
    const cvSheetContainer = document.getElementById("cvSheetContainer");
    if (cvModal && cvSheetContainer && window.buildFormalCvHtml) {
      cvSheetContainer.innerHTML = window.buildFormalCvHtml(graduate);
      cvModal.hidden = false;
    }
  });
  headerActions.appendChild(downloadCvBtn);
  header.appendChild(headerActions);

  container.appendChild(header);

  // --- SECCIÓN CONTACTO Y REDES PROFESIONALES ---
  const contactButtons = [];

  // 1. WhatsApp
  if (graduate.phone) {
    const cleanPhone = graduate.phone.replace(/[^0-9+]/g, "").replace(/^\+/, "");
    const waUrl = `https://wa.me/${cleanPhone}`;
    const btnWa = el("a", {
      href: waUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      class: "btn-contact btn-brand-whatsapp",
    });
    btnWa.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.62C9.36 7.62 9.08 7.69 8.84 7.94C8.61 8.2 7.95 8.81 7.95 10.07C7.95 11.33 8.87 12.54 9 12.71C9.13 12.89 10.7 15.3 13.12 16.34C15.13 17.21 15.54 17.03 15.98 17C16.42 16.96 17.4 16.42 17.6 15.84C17.81 15.26 17.81 14.77 17.74 14.66C17.68 14.56 17.5 14.5 17.24 14.37C16.98 14.25 15.69 13.61 15.45 13.53C15.21 13.44 15.04 13.4 14.87 13.66C14.7 13.91 14.21 14.5 14.06 14.67C13.91 14.84 13.76 14.87 13.5 14.74C13.24 14.61 12.4 14.34 11.41 13.45C10.63 12.76 10.1 11.9 9.95 11.64C9.8 11.38 9.93 11.24 10.07 11.11C10.18 11 10.33 10.81 10.46 10.66C10.59 10.5 10.64 10.39 10.72 10.22C10.81 10.05 10.76 9.9 10.7 9.77C10.64 9.65 10.12 8.37 9.9 7.85C9.69 7.33 9.47 7.4 9.32 7.4L8.98 7.39C8.81 7.39 8.53 7.46 8.35 7.62H9.53Z"/>
      </svg>
      <span>WhatsApp (${escapeHtml(graduate.phone)})</span>
    `;
    contactButtons.push(btnWa);
  }

  // 2. Correo Personal (Gmail)
  if (graduate.personalEmail) {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(graduate.personalEmail)}`;
    const btnGmail = el("a", {
      href: gmailUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      class: "btn-contact btn-brand-gmail",
    });
    btnGmail.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4M20 8L12 13L4 8V6L12 11L20 6V8Z"/>
      </svg>
      <span>Correo Gmail (${escapeHtml(graduate.personalEmail)})</span>
    `;
    contactButtons.push(btnGmail);
  }

  // 3. Correo Institucional
  if (graduate.institutionalEmail) {
    const btnInst = el("a", {
      href: `mailto:${encodeURIComponent(graduate.institutionalEmail)}`,
      class: "btn-contact btn-brand-institutional",
    });
    btnInst.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/>
      </svg>
      <span>Correo Institucional (${escapeHtml(graduate.institutionalEmail)})</span>
    `;
    contactButtons.push(btnInst);
  }

  // 4. Redes Profesionales Dinámicas
  const platformMeta = {
    linkedin: {
      label: "LinkedIn",
      className: "btn-brand-linkedin",
      svg: '<path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z"/>',
    },
    github: {
      label: "GitHub",
      className: "btn-brand-github",
      svg: '<path d="M12 2A10 10 0 0 0 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21C9.5 20.77 9.5 20.14 9.5 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.5 20.68 14.5 21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/>',
    },
    portfolio: {
      label: "Portafolio Web",
      className: "btn-brand-portfolio",
      svg: '<path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M11 4.07C7.6 4.5 4.92 7.15 4.5 10.5H7.13C7.57 7.79 8.89 5.44 11 4.07M13 4.07C15.11 5.44 16.43 7.79 16.87 10.5H19.5C19.08 7.15 16.4 4.5 13 4.07M4.07 13C4.5 16.4 7.15 19.08 10.5 19.5V16.87C7.79 16.43 5.44 15.11 4.07 13M13.5 19.5C16.85 19.08 19.5 16.4 19.93 13H17.28C16.84 15.11 15.54 16.43 13.5 16.87V19.5M9.14 10.5C9.5 8.17 10.5 6.13 12 4.67C13.5 6.13 14.5 8.17 14.86 10.5H9.14M9.14 13.5H14.86C14.5 15.83 13.5 17.87 12 19.33C10.5 17.87 9.5 15.83 9.14 13.5Z"/>',
    },
    gitlab: {
      label: "GitLab",
      className: "btn-brand-gitlab",
      svg: '<path d="M21.94 13.11L19.46 5.5A1 1 0 0 0 17.56 5.5L15.35 12.3H8.65L6.44 5.5A1 1 0 0 0 4.54 5.5L2.06 13.11A1 1 0 0 0 2.42 14.22L11.47 20.8A1 1 0 0 0 12.53 20.8L21.58 14.22A1 1 0 0 0 21.94 13.11Z"/>',
    },
    kaggle: {
      label: "Kaggle / IA",
      className: "btn-brand-kaggle",
      svg: '<path d="M18.8 21H14.5L9.9 14.2L8.2 15.8V21H5V3H8.2V12.7L14.2 3H18.5L12.1 11.9L18.8 21Z"/>',
    },
    leetcode: {
      label: "LeetCode",
      className: "btn-brand-leetcode",
      svg: '<path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 5.845a1.375 1.375 0 0 0 0 1.944l2.122 2.122a1.375 1.375 0 0 0 1.944 0l5.406-5.406A1.375 1.375 0 0 0 15.626.438 1.374 1.374 0 0 0 13.483 0zm-8.214 7.21a1.375 1.375 0 0 0-.962.438L.438 11.516a1.375 1.375 0 0 0 0 1.944l5.406 5.406a1.375 1.375 0 0 0 1.944 0l3.87-3.87a1.375 1.375 0 0 0 0-1.944l-2.122-2.122a1.375 1.375 0 0 0-1.944 0L4.72 13.8a1.375 1.375 0 0 1-1.944 0l-2.333-2.334a1.375 1.375 0 0 1 0-1.944l2.87-2.87a1.375 1.375 0 0 0-.044-1.943 1.375 1.375 0 0 0-1-.439zm10.74 5.405a1.375 1.375 0 0 0-1.944 0l-2.122 2.122a1.375 1.375 0 0 0 0 1.944l3.87 3.87a1.375 1.375 0 0 0 1.944 0l3.87-3.87a1.375 1.375 0 0 0 0-1.944l-2.122-2.122a1.375 1.375 0 0 0-1.944 0l-1.552 1.552a1.375 1.375 0 0 1-1.944 0z"/>',
    },
    behance: {
      label: "Behance",
      className: "btn-brand-behance",
      svg: '<path d="M22 7H14V5H22V7M9.5 12C10.9 12 11.8 11 11.8 9.7C11.8 7.6 9.8 7.3 8 7.3H2V17H8.2C10.5 17 12.3 16 12.3 13.8C12.3 12.7 11.2 12 9.5 12M5 9.1H7.8C8.5 9.1 9.2 9.3 9.2 10.1C9.2 10.9 8.6 11.1 7.8 11.1H5V9.1M7.9 15.2H5V12.8H8C8.8 12.8 9.5 13.1 9.5 14C9.5 14.9 8.8 15.2 7.9 15.2M17.6 9C15 9 13.3 10.8 13.3 13.5C13.3 16.2 15 17.8 17.7 17.8C19.7 17.8 21.1 16.7 21.6 15.1H19.5C19.2 15.8 18.5 16.2 17.6 16.2C16.2 16.2 15.4 15.1 15.3 13.9H22C22.1 11.1 20.3 9 17.6 9M15.4 12.3C15.6 11.2 16.4 10.5 17.5 10.5C18.6 10.5 19.3 11.2 19.5 12.3H15.4Z"/>',
    },
    other: {
      label: "Enlace Web",
      className: "btn-brand-other",
      svg: '<path d="M3.9 12C3.9 10.29 5.29 8.9 7 8.9H11V7H7A5 5 0 0 0 2 12A5 5 0 0 0 7 17H11V15.1H7C5.29 15.1 3.9 13.71 3.9 12M8 13H16V11H8V13M17 7H13V8.9H17C18.71 8.9 20.1 10.29 20.1 12C20.1 13.71 18.71 15.1 17 15.1H13V17H17A5 5 0 0 0 22 12A5 5 0 0 0 17 7Z"/>',
    },
  };

  const allLinks = Array.isArray(graduate.professionalLinks) ? [...graduate.professionalLinks] : [];
  // Fallbacks si quedaron valores en las columnas antiguas y no están en professionalLinks
  if (!allLinks.some((l) => l.type === "linkedin") && graduate.linkedinUrl) {
    allLinks.push({ type: "linkedin", url: graduate.linkedinUrl });
  }
  if (!allLinks.some((l) => l.type === "github") && graduate.githubUrl) {
    allLinks.push({ type: "github", url: graduate.githubUrl });
  }
  if (!allLinks.some((l) => l.type === "portfolio") && graduate.portfolioUrl) {
    allLinks.push({ type: "portfolio", url: graduate.portfolioUrl });
  }

  for (const item of allLinks) {
    if (!item.url) continue;
    const meta = platformMeta[item.type] || platformMeta.other;
    const btn = el("a", {
      href: item.url,
      target: "_blank",
      rel: "noopener noreferrer",
      class: `btn-contact ${meta.className}`,
    });
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        ${meta.svg}
      </svg>
      <span>${escapeHtml(meta.label)}</span>
    `;
    contactButtons.push(btn);
  }

  if (contactButtons.length > 0) {
    const contactGrid = el("div", { class: "contact-buttons-grid" });
    for (const btn of contactButtons) {
      contactGrid.appendChild(btn);
    }
    container.appendChild(section("Contacto y Canales Profesionales", contactGrid));
  }

  if (graduate.professionalSummary) {
    container.appendChild(section("Resumen profesional", el("p", { text: graduate.professionalSummary })));
  }

  if (graduate.technologies && graduate.technologies.length) {
    const tags = el("div", { class: "tag-list" });
    for (const t of graduate.technologies) tags.appendChild(el("span", { class: "tag", text: t.name }));
    container.appendChild(section("Habilidades técnicas", tags));
  }

  if (graduate.softSkills && graduate.softSkills.length) {
    const tags = el("div", { class: "tag-list" });
    for (const s of graduate.softSkills) tags.appendChild(el("span", { class: "tag", text: s.name }));
    container.appendChild(section("Habilidades Personales", tags));
  }

  if (graduate.languages && graduate.languages.length) {
    const levelLabels = {
      nativo: "Nativo / Bilingüe",
      avanzado: "Avanzado",
      intermedio: "Intermedio",
      basico: "Básico",
    };
    const tags = el("div", { class: "tag-list" });
    for (const l of graduate.languages) {
      const label = `${l.name} (${levelLabels[l.level] || l.level})`;
      tags.appendChild(el("span", { class: "tag", text: label }));
    }
    container.appendChild(section("Idiomas", tags));
  }

  if (graduate.experiences && graduate.experiences.length) {
    const formatExpDate = (rawDate, dateFormat) => {
      if (!rawDate) return null;
      const iso = String(rawDate).slice(0, 10);
      const [year, month, day] = iso.split("-");
      if (!year || !month) return iso;
      if (dateFormat === "month") {
        return `${month}/${year}`;
      }
      return day ? `${day}/${month}/${year}` : `${month}/${year}`;
    };

    const buildExperienceGroup = (title, hintText, items) => {
      if (!items || !items.length) return null;
      const groupWrapper = el("div", { style: "margin-bottom: 20px;" });
      groupWrapper.appendChild(el("h4", { text: title, style: "margin-bottom: 4px; color: var(--primary);" }));
      if (hintText) {
        groupWrapper.appendChild(el("p", { class: "hint", text: hintText, style: "margin-top: 0; margin-bottom: 10px;" }));
      }
      const list = el("div");
      for (const exp of items) {
        const item = el("div", { class: "card", style: "margin-bottom:10px;" });
        item.appendChild(el("strong", { text: `${exp.position} - ${exp.organization}` }));
        const startFormatted = formatExpDate(exp.start_date, exp.date_format);
        const endFormatted = exp.is_current ? "Actualidad" : formatExpDate(exp.end_date, exp.date_format);
        const dates = [startFormatted, endFormatted].filter(Boolean).join(" a ");
        if (dates) item.appendChild(el("div", { class: "muted", text: dates }));
        if (exp.description) {
          const expDescNode = createExpandableText(exp.description);
          if (expDescNode) item.appendChild(expDescNode);
        }
        list.appendChild(item);
      }
      groupWrapper.appendChild(list);
      return groupWrapper;
    };

    const workItems = graduate.experiences.filter((e) => (e.category || "work") === "work");
    const academicItems = graduate.experiences.filter((e) => e.category === "academic");
    const preGraduateItems = graduate.experiences.filter((e) => e.category === "pre_graduate");

    const expContainer = el("div");
    const workBlock = buildExperienceGroup("Experiencia Laboral", "Empleos, consultorías y proyectos profesionales.", workItems);
    const academicBlock = buildExperienceGroup("Experiencia Académica", "Docencia, investigación, ponencias y proyectos académicos.", academicItems);
    const preGraduateBlock = buildExperienceGroup("Experiencia Pre-egreso", "Actividades, ayudantías y logros durante su estancia universitaria.", preGraduateItems);

    if (workBlock) expContainer.appendChild(workBlock);
    if (academicBlock) expContainer.appendChild(academicBlock);
    if (preGraduateBlock) expContainer.appendChild(preGraduateBlock);

    if (expContainer.children.length > 0) {
      container.appendChild(section("Experiencias", expContainer));
    }
  }

  if (graduate.projects && graduate.projects.length) {
    const grid = el("div", { class: "card-grid" });
    for (const project of graduate.projects) {
      const card = el("div", { class: "graduate-card" });
      card.appendChild(el("h3", { text: project.title }));
      if (project.description) {
        const projDescNode = createExpandableText(project.description);
        if (projDescNode) card.appendChild(projDescNode);
      }
      const projLink = safeExternalLink(project.url, "Ver proyecto");
      if (projLink) card.appendChild(projLink);
      grid.appendChild(card);
    }
    container.appendChild(section("Proyectos", grid));
  }

  if (graduate.certificates && graduate.certificates.length) {
    const formationLabels = {
      doctorate: "Doctorado",
      master: "Maestría",
      specialty: "Especialidad",
      diploma: "Diplomado",
      bachelor: "Licenciatura",
      courses: "Cursos y Certificaciones",
      other: "Otros Estudios y Reconocimientos",
    };

    const formationHierarchy = [
      "doctorate",
      "master",
      "specialty",
      "diploma",
      "bachelor",
      "courses",
      "other",
    ];

    const formationContainer = el("div");

    for (const type of formationHierarchy) {
      const itemsOfType = graduate.certificates.filter((c) => (c.formation_type || "courses") === type);
      if (!itemsOfType.length) continue;

      const groupWrapper = el("div", { style: "margin-bottom: 18px;" });
      groupWrapper.appendChild(el("h4", { text: formationLabels[type] || type, style: "margin-bottom: 8px; color: var(--primary);" }));

      const list = el("div");
      for (const cert of itemsOfType) {
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
              text: cert.file_name ? `Ver documento digital (${cert.file_name})` : "Ver documento digital",
            })
          );
        }
        const extLink = safeExternalLink(cert.credential_url, "Ver credencial externa");
        if (extLink) certLinks.appendChild(extLink);
        if (certLinks.children.length > 0) item.appendChild(certLinks);

        list.appendChild(item);
      }

      groupWrapper.appendChild(list);
      formationContainer.appendChild(groupWrapper);
    }

    container.appendChild(section("Formación Académica", formationContainer));
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
    recommendations.appendChild(el("p", { class: "muted", text: "Aún no hay comentarios publicados." }));
  }
  container.appendChild(section("Comentarios", recommendations));

  container.appendChild(section("Dejar un Comentario", buildRecommendationForm(graduate.id)));
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

  const submitBtn = el("button", { type: "submit", class: "btn btn-primary", text: "Enviar comentario" });
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
      showAlert(alertBox, "Gracias, tu comentario quedó pendiente de revisión.", "success");
      form.reset();
    } catch (err) {
      showAlert(alertBox, err.message || "No se pudo enviar el comentario.");
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

  // --- Modal CV Listeners ---
  const cvModal = document.getElementById("cvPreviewModal");
  const closeCvModalBtn = document.getElementById("closeCvModalBtn");
  const printCvBtn = document.getElementById("printCvBtn");

  if (cvModal) {
    const closeCv = () => {
      cvModal.hidden = true;
    };
    closeCvModalBtn?.addEventListener("click", closeCv);
    cvModal.addEventListener("click", (e) => {
      if (e.target === cvModal) closeCv();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !cvModal.hidden) closeCv();
    });
    printCvBtn?.addEventListener("click", () => {
      document.body.classList.add("cv-printing");
      window.print();
    });
    window.addEventListener("afterprint", () => {
      document.body.classList.remove("cv-printing");
    });
  }
});
