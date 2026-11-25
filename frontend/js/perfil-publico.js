function section(title, contentNode, iconName = null) {
  const wrap = el("div", { class: "card profile-section-card" });
  const h3 = el("h3", { class: "profile-section-title" });
  if (iconName && typeof getSvgIcon === "function") {
    const iconSpan = el("span", { class: "section-title-icon", html: getSvgIcon(iconName) });
    h3.appendChild(iconSpan);
  }
  h3.appendChild(document.createTextNode(title));
  wrap.appendChild(h3);
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
      class: "profile-external-link",
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

function buildProfileView(graduate, activeUser) {
  const container = document.getElementById("profileContainer");
  container.innerHTML = "";

  // 1. Hero Header Universitario Contemporáneo
  const heroCard = el("div", { class: "card profile-hero-card" });

  // Banda superior heráldica institucional (Ink Navy + Burgundy)
  const heroCover = el("div", { class: "profile-hero-cover" });
  heroCard.appendChild(heroCover);

  const heroBody = el("div", { class: "profile-hero-body" });

  const avatarWrap = el("div", { class: "profile-hero-avatar-wrap" });
  if (graduate.photoUrl) {
    avatarWrap.appendChild(
      el("img", {
        class: "profile-public-avatar",
        src: graduate.photoUrl,
        alt: `Fotografía profesional de ${graduate.firstName} ${graduate.lastName}`,
      })
    );
  } else {
    const initials = `${graduate.firstName?.[0] || ""}${graduate.lastName?.[0] || ""}`.toUpperCase();
    avatarWrap.appendChild(
      el("div", { class: "profile-public-avatar profile-avatar-placeholder", text: initials || "?" })
    );
  }
  heroBody.appendChild(avatarWrap);

  const heroInfo = el("div", { class: "profile-hero-info" });
  const nameH1 = el("h1", { class: "profile-hero-name" });
  nameH1.appendChild(document.createTextNode(`${graduate.firstName} ${graduate.lastName}`));
  if (graduate.emailVerified && typeof createVerifiedBadge === "function") {
    nameH1.appendChild(createVerifiedBadge());
  }
  heroInfo.appendChild(nameH1);

  if (graduate.currentRole) {
    heroInfo.appendChild(el("p", { class: "profile-hero-role", text: graduate.currentRole }));
  }

  const metaRow = el("div", { class: "profile-hero-meta-row" });
  const academicSvg = typeof getSvgIcon === "function" ? getSvgIcon("academic") : "";
  const gradBadge = el("span", { class: "profile-meta-badge", html: `${academicSvg} Promoción ${graduate.graduationYear} · UAJMS` });
  const codeBadge = el("span", { class: "profile-meta-badge badge-code", text: `Código: ${graduate.registrationCode}` });
  metaRow.appendChild(gradBadge);
  metaRow.appendChild(codeBadge);
  heroInfo.appendChild(metaRow);

  heroBody.appendChild(heroInfo);

  const heroActions = el("div", { class: "profile-hero-actions" });

  if (activeUser && (activeUser.id === graduate.userId || activeUser.email === graduate.personalEmail)) {
    const editModeBtn = el("a", {
      href: "/dashboard.html",
      class: "btn btn-primary",
      style: "display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;",
      html: `${typeof getSvgIcon === 'function' ? getSvgIcon("edit") : ''} Volver al modo edición`,
    });
    heroActions.appendChild(editModeBtn);
  }

  const downloadCvBtn = el("button", {
    id: "downloadCvBtn",
    class: "btn btn-secondary",
    type: "button",
    html: `${typeof getSvgIcon === 'function' ? getSvgIcon("file-pdf") : ''} Descargar CV en PDF`,
    style: "display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;",
  });
  downloadCvBtn.addEventListener("click", () => {
    const cvModal = document.getElementById("cvPreviewModal");
    const cvSheetContainer = document.getElementById("cvSheetContainer");
    if (cvModal && cvSheetContainer) {
      cvModal.hidden = false;
      if (window.renderFormalCv) {
        window.renderFormalCv(cvSheetContainer, graduate);
      } else if (window.buildFormalCvHtml) {
        cvSheetContainer.innerHTML = window.buildFormalCvHtml(graduate);
      }
    }
  });
  heroActions.appendChild(downloadCvBtn);
  heroBody.appendChild(heroActions);

  heroCard.appendChild(heroBody);
  container.appendChild(heroCard);

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
    container.appendChild(section("Canales de Contacto Directo", contactGrid, "briefcase"));
  }

  if (graduate.professionalSummary) {
    container.appendChild(section("Perfil Profesional", el("p", { class: "profile-summary-text", text: graduate.professionalSummary }), "document"));
  }

  if (graduate.technologies && graduate.technologies.length) {
    const specialtyNames = {
      software: "Software y Programación",
      hardware: "Hardware y Ensamblaje",
      networks: "Redes y Comunicaciones",
      documentation: "Documentación y Gestión",
    };

    const groups = {
      software: [],
      hardware: [],
      networks: [],
      documentation: [],
    };

    for (const item of graduate.technologies) {
      const spec = item.specialty || "software";
      if (!groups[spec]) groups[spec] = [];
      groups[spec].push(item);
    }

    const techContainer = el("div", { class: "tech-specialties-display" });

    for (const [key, list] of Object.entries(groups)) {
      if (!list.length) continue;
      const groupBlock = el("div", { class: "tech-specialty-group", style: "margin-bottom: 14px;" });
      groupBlock.appendChild(el("h4", {
        class: "tech-specialty-title",
        text: specialtyNames[key] || key,
        style: "margin: 0 0 8px 0; font-size: 0.95rem; color: var(--primary);"
      }));
      const tags = el("div", { class: "tag-list" });
      for (const t of list) {
        tags.appendChild(el("span", { class: "tag", text: t.name }));
      }
      groupBlock.appendChild(tags);
      techContainer.appendChild(groupBlock);
    }

    container.appendChild(section("Habilidades Técnicas", techContainer, "edit"));
  }

  if (graduate.softSkills && graduate.softSkills.length) {
    const tags = el("div", { class: "tag-list" });
    for (const s of graduate.softSkills) tags.appendChild(el("span", { class: "tag", text: s.name }));
    container.appendChild(section("Habilidades Personales", tags, "info"));
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
    container.appendChild(section("Idiomas", tags, "globe"));
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
      const groupWrapper = el("div", { class: "trajectory-group-wrapper" });
      groupWrapper.appendChild(el("h4", { class: "trajectory-group-title", text: title }));
      if (hintText) {
        groupWrapper.appendChild(el("p", { class: "trajectory-group-hint muted", text: hintText }));
      }
      const list = el("div", { class: "trajectory-timeline-list" });
      for (const exp of items) {
        const item = el("div", { class: "trajectory-item" });
        const itemHeader = el("div", { class: "trajectory-header" });
        const titleRow = el("div", { class: "trajectory-title-row" });
        titleRow.appendChild(el("h5", { class: "trajectory-position", text: exp.position }));
        titleRow.appendChild(el("span", { class: "trajectory-company", text: exp.organization }));
        itemHeader.appendChild(titleRow);

        const startFormatted = formatExpDate(exp.start_date, exp.date_format);
        const endFormatted = exp.is_current ? "Actualidad" : formatExpDate(exp.end_date, exp.date_format);
        const dates = [startFormatted, endFormatted].filter(Boolean).join(" — ");
        if (dates) {
          itemHeader.appendChild(el("span", { class: "trajectory-date-badge", text: dates }));
        }
        item.appendChild(itemHeader);

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

    const expContainer = el("div", { class: "trajectory-container" });
    const workBlock = buildExperienceGroup("Experiencia Laboral", "Empleos, consultorías y proyectos profesionales.", workItems);
    const academicBlock = buildExperienceGroup("Experiencia Académica", "Docencia, investigación, ponencias y proyectos académicos.", academicItems);
    const preGraduateBlock = buildExperienceGroup("Experiencia Pre-graduación", "Actividades, ayudantías y logros durante su estancia universitaria.", preGraduateItems);

    if (workBlock) expContainer.appendChild(workBlock);
    if (academicBlock) expContainer.appendChild(academicBlock);
    if (preGraduateBlock) expContainer.appendChild(preGraduateBlock);

    if (expContainer.children.length > 0) {
      container.appendChild(section("Experiencias y Trayectoria", expContainer, "award"));
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
      const projLink = safeExternalLink(project.url, "Ver proyecto ↗");
      if (projLink) card.appendChild(projLink);
      grid.appendChild(card);
    }
    container.appendChild(section("Proyectos Destacados", grid, "rocket"));
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

    const formationContainer = el("div", { class: "formation-container" });

    for (const type of formationHierarchy) {
      const itemsOfType = graduate.certificates.filter((c) => (c.formation_type || "courses") === type);
      if (!itemsOfType.length) continue;

      const groupWrapper = el("div", { class: "formation-group-wrapper" });
      groupWrapper.appendChild(el("h4", { class: "formation-group-title", text: formationLabels[type] || type }));

      const list = el("div", { class: "formation-list" });
      for (const cert of itemsOfType) {
        const item = el("div", { class: "card formation-item-card" });
        const hasDate = Boolean(cert.issue_date || cert.issueDate);
        const titleH5 = el("h5", { class: "formation-item-title" });
        titleH5.appendChild(document.createTextNode(cert.title));
        if (!hasDate) {
          titleH5.appendChild(
            el("span", {
              class: "badge-in-progress",
              text: "(En curso)",
            })
          );
        }
        item.appendChild(titleH5);

        const dateText = hasDate ? String(cert.issue_date || cert.issueDate).slice(0, 10) : "(En curso)";
        const meta = [cert.issuer, dateText].filter(Boolean).join(" · ");
        if (meta) item.appendChild(el("div", { class: "formation-meta muted", text: meta }));

        const certLinks = el("div", { class: "formation-links", style: "margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;" });
        if (cert.file_url && cert.file_url.startsWith("/api/graduates/certificates/")) {
          certLinks.appendChild(
            el("a", {
              href: cert.file_url,
              target: "_blank",
              rel: "noopener noreferrer",
              class: "btn btn-secondary",
              style: "font-size: 0.85rem; padding: 6px 12px;",
              text: cert.file_name ? `Ver documento digital (${cert.file_name})` : "Ver documento digital",
            })
          );
        }
        const extLink = safeExternalLink(cert.credential_url, "Ver credencial externa ↗");
        if (extLink) {
          extLink.className = "btn btn-secondary";
          extLink.style.fontSize = "0.85rem";
          extLink.style.padding = "6px 12px";
          certLinks.appendChild(extLink);
        }
        if (certLinks.children.length > 0) item.appendChild(certLinks);

        list.appendChild(item);
      }

      groupWrapper.appendChild(list);
      formationContainer.appendChild(groupWrapper);
    }

    container.appendChild(section("Formación Continua y Certificaciones", formationContainer, "academic"));
  }

  const recommendations = el("div", { class: "recommendations-wrapper" });
  if (graduate.recommendations && graduate.recommendations.length) {
    for (const rec of graduate.recommendations) {
      const item = el("div", { class: "card testimonial-card" });
      item.appendChild(el("blockquote", { class: "testimonial-quote", text: `“${rec.message}”` }));
      const authorLine = el("div", { class: "testimonial-author-line" });
      authorLine.appendChild(el("strong", { text: rec.author_name }));
      if (rec.author_role) {
        authorLine.appendChild(el("span", { class: "muted", text: ` · ${rec.author_role}` }));
      }
      item.appendChild(authorLine);
      recommendations.appendChild(item);
    }
  } else {
    recommendations.appendChild(el("div", { class: "empty-state-notice", text: "Aún no hay comentarios o recomendaciones públicas para este perfil." }));
  }
  container.appendChild(section("Comentarios y Recomendaciones", recommendations, "message"));

  container.appendChild(section("Dejar un Comentario", buildRecommendationForm(graduate.id), "edit"));
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

const MODERATION_STATUS_META = {
  draft: { label: "Borrador", badgeClass: "mod-badge-draft" },
  pending_review: { label: "Pendiente de revisión", badgeClass: "mod-badge-pending" },
  observed: { label: "Con observaciones", badgeClass: "mod-badge-observed" },
  approved: { label: "Aprobada", badgeClass: "mod-badge-approved" },
};

const VISIBILITY_STATUS_META = {
  public: { label: "Pública en directorio", badgeClass: "vis-badge-public", icon: "globe" },
  link_only: { label: "Solo con enlace", badgeClass: "vis-badge-private", icon: "lock" },
  private: { label: "Privada", badgeClass: "vis-badge-private", icon: "lock" },
};

function getModerationStatusMeta(status) {
  return MODERATION_STATUS_META[status] || { label: status || "Borrador", badgeClass: "mod-badge-draft" };
}

function getVisibilityStatusMeta(visibility) {
  return VISIBILITY_STATUS_META[visibility] || VISIBILITY_STATUS_META.private;
}

function buildAdminModerationSection(graduate) {
  const wrap = el("section", {
    class: "card admin-moderation-panel",
    "aria-labelledby": "adminModerationTitle",
  });

  const modMeta = getModerationStatusMeta(graduate.moderationStatus || "draft");
  const visMeta = getVisibilityStatusMeta(graduate.visibility || "private");

  const modBadge = el("span", {
    id: "adminStatusBadge",
    class: `moderation-pill ${modMeta.badgeClass}`,
    text: `Moderación: ${modMeta.label}`,
  });

  const visBadge = el("span", {
    id: "adminVisibilityBadge",
    class: `moderation-pill ${visMeta.badgeClass}`,
    html: `${typeof getSvgIcon === "function" ? getSvgIcon(visMeta.icon) : ""} <span>Visibilidad: ${escapeHtml(visMeta.label)}</span>`,
  });

  function syncModerationBadges() {
    const nextMod = getModerationStatusMeta(graduate.moderationStatus || "draft");
    const nextVis = getVisibilityStatusMeta(graduate.visibility || "private");
    modBadge.className = `moderation-pill ${nextMod.badgeClass}`;
    modBadge.textContent = `Moderación: ${nextMod.label}`;
    visBadge.className = `moderation-pill ${nextVis.badgeClass}`;
    visBadge.innerHTML = `${typeof getSvgIcon === "function" ? getSvgIcon(nextVis.icon) : ""} <span>Visibilidad: ${escapeHtml(nextVis.label)}</span>`;
  }

  // Cabecera institucional en Ink Navy
  const header = el("header", { class: "admin-moderation-header" }, [
    el("div", { class: "admin-moderation-header-main" }, [
      el("span", {
        class: "admin-moderation-header-icon",
        html: typeof getSvgIcon === "function" ? getSvgIcon("award") : "",
      }),
      el("div", { class: "admin-moderation-header-titles" }, [
        el("span", { class: "admin-moderation-eyebrow", text: "Control de Calidad Institucional · Uso Exclusivo Administrador" }),
        el("h3", { id: "adminModerationTitle", class: "admin-moderation-title", text: "Panel de Moderación de Ficha Profesional" }),
      ]),
    ]),
    el("div", { class: "admin-moderation-badges" }, [modBadge, visBadge]),
  ]);
  wrap.appendChild(header);

  const body = el("div", { class: "admin-moderation-body" });

  const alertBox = el("div", { id: "adminModerationAlert", class: "admin-moderation-alert-slot" });
  body.appendChild(alertBox);

  const grid = el("div", { class: "admin-moderation-grid" });

  // Bloque 1: Observaciones al egresado
  const obsTextarea = el("textarea", {
    id: "adminObsInput",
    class: "admin-moderation-textarea",
    rows: "4",
    placeholder: "Ej: Por favor detalla tus responsabilidades en la experiencia laboral registrada o verifica el año de emisión de tu certificado...",
  });
  if (graduate.moderationObservations) {
    obsTextarea.value = graduate.moderationObservations;
  }

  const sendObsBtn = el("button", {
    type: "button",
    id: "adminSendObsBtn",
    class: "btn btn-primary admin-moderation-obs-btn",
    html: `${typeof getSvgIcon === "function" ? getSvgIcon("mail") : ""} <span>Enviar observación al graduado</span>`,
  });

  sendObsBtn.addEventListener("click", async () => {
    const rawValue = obsTextarea.value.trim();
    if (!rawValue) {
      const msg = "Escribe una observación antes de enviar.";
      showAlert(alertBox, msg);
      if (typeof showToast === "function") showToast(msg, "warning");
      obsTextarea.focus();
      return;
    }
    clearAlert(alertBox);
    sendObsBtn.disabled = true;
    const originalHtml = sendObsBtn.innerHTML;
    sendObsBtn.textContent = "Enviando observación...";
    try {
      const res = await api.admin.moderateGraduate(graduate.id, {
        action: "observe",
        observations: rawValue,
      });
      graduate.moderationStatus = "observed";
      graduate.visibility = "private";
      graduate.moderationObservations = rawValue;
      syncModerationBadges();
      const pubSwitch = document.getElementById("adminMakePublicSwitch");
      if (pubSwitch) {
        pubSwitch.checked = false;
        pubSwitch.dispatchEvent(new Event("change"));
      }
      showAlert(alertBox, res.message || "Observación enviada con éxito.", "success");
      if (typeof showToast === "function") showToast("Observación enviada al graduado.", "info");
    } catch (err) {
      const errMsg = err.message || "Error al enviar observación.";
      showAlert(alertBox, errMsg);
      if (typeof showToast === "function") showToast(errMsg, "error");
    } finally {
      sendObsBtn.disabled = false;
      sendObsBtn.innerHTML = originalHtml;
    }
  });

  const obsCard = el("div", { class: "admin-moderation-box admin-moderation-box-obs" }, [
    el("div", { class: "admin-moderation-box-header" }, [
      el("span", { class: "admin-moderation-box-icon icon-burgundy", html: typeof getSvgIcon === "function" ? getSvgIcon("message") : "" }),
      el("div", {}, [
        el("h4", { class: "admin-moderation-box-title", text: "Observaciones al Graduado" }),
        el("p", {
          class: "admin-moderation-box-desc",
          text: "Si la ficha requiere correcciones, envía una observación detallada. Se notificará al graduado en la plataforma y por correo electrónico, y la ficha pasará a estado privada.",
        }),
      ]),
    ]),
    el("div", { class: "form-group admin-moderation-field" }, [
      el("label", { for: "adminObsInput", class: "admin-moderation-label", text: "Detalle de las correcciones solicitadas" }),
      obsTextarea,
    ]),
    el("div", { class: "admin-moderation-box-actions" }, [sendObsBtn]),
  ]);

  // Bloque 2: Aprobación y visibilidad pública con Switch accesible
  const switchInput = el("input", {
    type: "checkbox",
    id: "adminMakePublicSwitch",
    class: "moderation-switch-input",
    role: "switch",
    checked: graduate.visibility === "public",
    "aria-checked": String(graduate.visibility === "public"),
  });

  const switchStateText = el("span", {
    id: "adminSwitchStateText",
    class: `moderation-switch-state ${graduate.visibility === "public" ? "is-public" : "is-private"}`,
    text: graduate.visibility === "public" ? "Publicar en el directorio público" : "Mantener como ficha privada",
  });

  switchInput.addEventListener("change", () => {
    const isChecked = switchInput.checked;
    switchInput.setAttribute("aria-checked", String(isChecked));
    switchStateText.textContent = isChecked ? "Publicar en el directorio público" : "Mantener como ficha privada";
    switchStateText.className = `moderation-switch-state ${isChecked ? "is-public" : "is-private"}`;
  });

  const switchControl = el("label", { class: "moderation-switch-card", for: "adminMakePublicSwitch" }, [
    el("span", { class: "moderation-switch-control" }, [
      switchInput,
      el("span", { class: "moderation-switch-track", "aria-hidden": "true" }, [
        el("span", { class: "moderation-switch-thumb" }),
      ]),
    ]),
    el("span", { class: "moderation-switch-copy" }, [
      el("span", { class: "moderation-switch-title", text: "Hacer público el perfil en el directorio" }),
      switchStateText,
    ]),
  ]);

  const approveBtn = el("button", {
    type: "button",
    id: "adminApproveProfileBtn",
    class: "btn admin-moderation-approve-btn",
    html: `${typeof getSvgIcon === "function" ? getSvgIcon("check") : ""} <span>Guardar y Aprobar Ficha</span>`,
  });

  approveBtn.addEventListener("click", async () => {
    const isPublic = switchInput.checked;
    clearAlert(alertBox);
    approveBtn.disabled = true;
    const originalHtml = approveBtn.innerHTML;
    approveBtn.textContent = "Procesando aprobación...";
    try {
      const res = await api.admin.moderateGraduate(graduate.id, {
        action: "approve",
        makePublic: isPublic,
      });
      graduate.moderationStatus = "approved";
      graduate.visibility = isPublic ? "public" : "private";
      graduate.moderationObservations = null;
      syncModerationBadges();
      showAlert(alertBox, res.message || "Ficha aprobada exitosamente.", "success");
      if (typeof showToast === "function") showToast("Ficha aprobada con éxito.", "success");
    } catch (err) {
      const errMsg = err.message || "Error al aprobar la ficha.";
      showAlert(alertBox, errMsg);
      if (typeof showToast === "function") showToast(errMsg, "error");
    } finally {
      approveBtn.disabled = false;
      approveBtn.innerHTML = originalHtml;
    }
  });

  const approveCard = el("div", { class: "admin-moderation-box admin-moderation-box-approve" }, [
    el("div", { class: "admin-moderation-box-header" }, [
      el("span", { class: "admin-moderation-box-icon icon-approve", html: typeof getSvgIcon === "function" ? getSvgIcon("check") : "" }),
      el("div", {}, [
        el("h4", { class: "admin-moderation-box-title", text: "Aprobación y Visibilidad Pública" }),
        el("p", {
          class: "admin-moderation-box-desc",
          text: "Define si la ficha aprobada estará visible en el directorio público institucional o permanecerá accesible únicamente de forma privada.",
        }),
      ]),
    ]),
    switchControl,
    el("div", { class: "admin-moderation-box-actions" }, [approveBtn]),
  ]);

  grid.appendChild(obsCard);
  grid.appendChild(approveCard);
  body.appendChild(grid);
  wrap.appendChild(body);

  return wrap;
}

document.addEventListener("DOMContentLoaded", async () => {
  const activeUser = await renderTopbar();

  const params = new URLSearchParams(window.location.search);
  const code = params.get("codigo");
  const container = document.getElementById("profileContainer");

  if (!code) {
    container.innerHTML = `
      <div class="card empty-state-box">
        <div class="empty-state-icon-wrap">${typeof getSvgIcon === 'function' ? getSvgIcon('user') : ''}</div>
        <h3 class="empty-state-title">No se especificó ningún graduado</h3>
        <p class="empty-state-desc muted">Selecciona un profesional desde el directorio público para consultar su perfil académico y trayectoria.</p>
        <a href="/" class="btn btn-primary" style="margin-top: 14px; display: inline-flex; align-items: center; gap: 6px;">
          ${typeof getSvgIcon === 'function' ? getSvgIcon('search') : ''} Explorar Directorio
        </a>
      </div>
    `;
    return;
  }

  try {
    const graduate = await api.directory.getByCode(code);
    buildProfileView(graduate, activeUser);

    if (activeUser && activeUser.role === "admin") {
      container.appendChild(buildAdminModerationSection(graduate));
    }
  } catch (err) {
    container.innerHTML = `
      <div class="card empty-state-box">
        <div class="empty-state-icon-wrap">${typeof getSvgIcon === 'function' ? getSvgIcon('info') : ''}</div>
        <h3 class="empty-state-title">Ficha no disponible</h3>
        <p class="empty-state-desc muted">${escapeHtml(err.message || "No se encontró la ficha solicitada o actualmente no se encuentra pública.")}</p>
        <a href="/" class="btn btn-primary" style="margin-top: 14px; display: inline-flex; align-items: center; gap: 6px;">
          ${typeof getSvgIcon === 'function' ? getSvgIcon('search') : ''} Volver al Directorio
        </a>
      </div>
    `;
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
