let currentPage = 1;
const LIMIT = 9;
const MAX_FILTER_TECHS = 3;
let allDirectoryTechnologies = [];
const selectedFilterTechs = new Map(); // slug -> name

function renderTechnologyFilterState() {
  const select = document.getElementById("technology");
  const countLabel = document.getElementById("selectedTechsCount");
  if (!select) return;

  if (countLabel) {
    countLabel.textContent = `(${selectedFilterTechs.size}/${MAX_FILTER_TECHS})`;
  }

  select.innerHTML = "";
  const selectedNames = Array.from(selectedFilterTechs.values());
  const summaryText =
    selectedNames.length > 0
      ? `✓ ${selectedNames.join(", ")} (${selectedNames.length}/${MAX_FILTER_TECHS})`
      : `Todas las habilidades (0/${MAX_FILTER_TECHS})`;

  const summaryOpt = el("option", { value: "", text: summaryText });
  if (selectedNames.length > 0) {
    summaryOpt.style.fontWeight = "700";
    summaryOpt.style.color = "var(--primary)";
  }
  select.appendChild(summaryOpt);

  if (selectedFilterTechs.size > 0) {
    const clearOpt = el("option", {
      value: "__clear__",
      text: "✕ Limpiar habilidades seleccionadas",
    });
    clearOpt.style.backgroundColor = "#fee2e2";
    clearOpt.style.color = "#991b1b";
    clearOpt.style.fontWeight = "600";
    select.appendChild(clearOpt);
  }

  for (const tech of allDirectoryTechnologies) {
    const isSelected = selectedFilterTechs.has(tech.slug);
    const opt = el("option", {
      value: tech.slug,
      class: isSelected ? "tech-option-selected" : "",
      text: isSelected ? `✓ ${tech.name} (Seleccionada)` : tech.name,
    });
    if (isSelected) {
      opt.style.backgroundColor = "var(--panel-soft)";
      opt.style.color = "var(--primary)";
      opt.style.fontWeight = "700";
    }
    select.appendChild(opt);
  }

  // Mantener seleccionada la opción resumen para ver las activas y permitir marcar/desmarcar cualquiera
  select.value = "";
  if (selectedFilterTechs.size > 0) {
    select.style.borderColor = "var(--secondary)";
    select.style.backgroundColor = "var(--panel-soft)";
    select.style.color = "var(--primary)";
    select.style.fontWeight = "600";
  } else {
    select.style.borderColor = "";
    select.style.backgroundColor = "";
    select.style.color = "";
    select.style.fontWeight = "";
  }
}

async function loadTechnologiesFilter() {
  const select = document.getElementById("technology");
  try {
    allDirectoryTechnologies = (await api.catalogs.technologies()) || [];
  } catch {
    allDirectoryTechnologies = [];
  }
  renderTechnologyFilterState();

  if (select) {
    select.addEventListener("change", () => {
      const val = select.value;
      if (!val) return;

      if (val === "__clear__") {
        selectedFilterTechs.clear();
        renderTechnologyFilterState();
        loadDirectory(1);
        return;
      }

      // Si ya estaba seleccionada, al hacer clic nuevamente se desmarca
      if (selectedFilterTechs.has(val)) {
        selectedFilterTechs.delete(val);
        renderTechnologyFilterState();
        loadDirectory(1);
        return;
      }

      if (selectedFilterTechs.size >= MAX_FILTER_TECHS) {
        showToast(
          "Solo puedes seleccionar un máximo de 3 habilidades. Selecciona una ya marcada en la lista para quitarla.",
          "warning"
        );
        select.value = "";
        return;
      }

      const found = allDirectoryTechnologies.find((t) => t.slug === val);
      if (found) {
        selectedFilterTechs.set(found.slug, found.name);
        renderTechnologyFilterState();
        loadDirectory(1);
      }
    });
  }
}

function populateYearFilters() {
  const yearFromSelect = document.getElementById("yearFrom");
  const yearToSelect = document.getElementById("yearTo");
  const currentYear = Math.max(new Date().getFullYear(), 2026);
  const startYear = 1980;

  yearFromSelect.innerHTML = '<option value="">Todos</option>';
  for (let year = currentYear; year >= startYear; year -= 1) {
    yearFromSelect.appendChild(el("option", { value: String(year), text: String(year) }));
  }

  function updateYearToOptions() {
    const selectedFrom = yearFromSelect.value ? Number(yearFromSelect.value) : null;
    const previousToValue = yearToSelect.value;

    yearToSelect.innerHTML = '<option value="">Todos</option>';
    for (let year = currentYear; year >= startYear; year -= 1) {
      // Si hay un año "desde" seleccionado, no mostramos los años menores a ese año
      if (selectedFrom !== null && year < selectedFrom) {
        continue;
      }
      yearToSelect.appendChild(el("option", { value: String(year), text: String(year) }));
    }

    // Conservar el valor previo si sigue siendo válido (mayor o igual al desde)
    if (previousToValue && (selectedFrom === null || Number(previousToValue) >= selectedFrom)) {
      yearToSelect.value = previousToValue;
    } else if (selectedFrom !== null && previousToValue && Number(previousToValue) < selectedFrom) {
      yearToSelect.value = "";
    }
  }

  updateYearToOptions();

  yearFromSelect.addEventListener("change", () => {
    updateYearToOptions();
  });
}

function createGradCapSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "13");
  svg.setAttribute("height", "13");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  const p1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p1.setAttribute("d", "M22 10v6M2 10l10-5 10 5-10 5z");
  const p2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p2.setAttribute("d", "M6 12v5c3 3 9 3 12 0v-5");
  svg.appendChild(p1);
  svg.appendChild(p2);
  return svg;
}

function createArrowUpRightSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "11");
  svg.setAttribute("height", "11");
  svg.setAttribute("viewBox", "0 0 12 12");
  svg.setAttribute("fill", "none");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M1 11L11 1M11 1H3M11 1V9");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.appendChild(path);
  return svg;
}

function createLinkedInSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "13");
  svg.setAttribute("height", "13");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "currentColor");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z");
  svg.appendChild(path);
  return svg;
}

function createGithubSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "13");
  svg.setAttribute("height", "13");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "currentColor");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z");
  svg.appendChild(path);
  return svg;
}

function createGlobeSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "13");
  svg.setAttribute("height", "13");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  c.setAttribute("cx", "12");
  c.setAttribute("cy", "12");
  c.setAttribute("r", "10");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", "M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z");
  svg.appendChild(c);
  svg.appendChild(p);
  return svg;
}

function graduateCard(graduate) {
  const card = el("div", { class: "graduate-card" });

  // 1. Cabecera con Avatar interactivo y datos principales
  const headerRow = el("div", { class: "graduate-card-header" });
  
  const avatarContainer = el("div", { class: "graduate-avatar-container" });
  const avatarWrapper = el("div", { class: "graduate-avatar-wrapper" });

  if (graduate.photoUrl) {
    avatarWrapper.appendChild(
      el("img", {
        class: "graduate-avatar",
        src: graduate.photoUrl,
        alt: `Foto de ${graduate.firstName} ${graduate.lastName}`,
        loading: "lazy",
      })
    );
  } else {
    const initials = `${graduate.firstName?.[0] || ""}${graduate.lastName?.[0] || ""}`.toUpperCase();
    avatarWrapper.appendChild(
      el("div", { class: "graduate-avatar-placeholder", text: initials || "?" })
    );
  }
  avatarContainer.appendChild(avatarWrapper);

  // Indicador de estado activo
  avatarContainer.appendChild(el("div", { class: "graduate-status-dot", title: "Perfil verificado" }));
  headerRow.appendChild(avatarContainer);

  const meta = el("div", { class: "graduate-card-meta" });
  const nameH3 = el("h3", { class: "graduate-name-title" });
  
  const nameSpan = el("span", {
    class: "graduate-name-text",
    text: `${graduate.firstName} ${graduate.lastName}`,
    title: `${graduate.firstName} ${graduate.lastName}`,
  });
  nameH3.appendChild(nameSpan);

  if (graduate.emailVerified && typeof createVerifiedBadge === "function") {
    nameH3.appendChild(createVerifiedBadge());
  }
  meta.appendChild(nameH3);

  const roleText = graduate.currentRole || "Graduado de Informática";
  meta.appendChild(el("div", { class: "role", text: roleText, title: roleText }));

  // Metadato de promoción académica UAJMS
  const metaSub = el("div", { class: "graduate-meta-sub" });
  metaSub.appendChild(createGradCapSvg());
  metaSub.appendChild(document.createTextNode(` Promoción ${graduate.graduationYear} · UAJMS`));
  meta.appendChild(metaSub);

  headerRow.appendChild(meta);
  card.appendChild(headerRow);

  // 2. Resumen profesional o bio
  const summaryText = graduate.professionalSummary || "Perfil profesional de graduado registrado en el directorio oficial de la Universidad Autónoma Juan Misael Saracho.";
  card.appendChild(el("p", { class: "graduate-summary", text: summaryText, title: summaryText }));

  // 3. Píldoras de habilidades tecnológicas (Tags)
  if (graduate.technologies && graduate.technologies.length > 0) {
    const tags = el("div", { class: "tag-list" });
    for (const tech of graduate.technologies.slice(0, 5)) {
      tags.appendChild(el("span", { class: "tag", text: tech.name }));
    }
    card.appendChild(tags);
  } else {
    const tags = el("div", { class: "tag-list" });
    tags.appendChild(el("span", { class: "tag", text: "Informática" }));
    tags.appendChild(el("span", { class: "tag", text: "Tecnología" }));
    card.appendChild(tags);
  }

  // 4. Pie de tarjeta con redes sociales y botón interactivo Framer con barrido Rojo UAJMS
  const footer = el("div", { class: "graduate-card-footer" });
  const socialsGroup = el("div", { class: "graduate-socials-group" });

  if (graduate.linkedinUrl) {
    const lk = el("a", {
      class: "graduate-social-btn",
      href: graduate.linkedinUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "LinkedIn",
    });
    lk.appendChild(createLinkedInSvg());
    socialsGroup.appendChild(lk);
  }

  if (graduate.githubUrl) {
    const gh = el("a", {
      class: "graduate-social-btn",
      href: graduate.githubUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "GitHub",
    });
    gh.appendChild(createGithubSvg());
    socialsGroup.appendChild(gh);
  }

  if (graduate.portfolioUrl) {
    const pt = el("a", {
      class: "graduate-social-btn",
      href: graduate.portfolioUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Portafolio web",
    });
    pt.appendChild(createGlobeSvg());
    socialsGroup.appendChild(pt);
  }

  footer.appendChild(socialsGroup);

  // Botón "Ver perfil" con efecto Framer de barrido institucional
  const ctaBtn = el("a", {
    class: "btn-framer-profile",
    href: `/perfil.html?codigo=${encodeURIComponent(graduate.registrationCode)}`,
  });
  ctaBtn.appendChild(el("span", { text: "Ver perfil" }));
  const arrowWrap = el("span", { class: "cta-arrow" });
  arrowWrap.appendChild(createArrowUpRightSvg());
  ctaBtn.appendChild(arrowWrap);

  footer.appendChild(ctaBtn);
  card.appendChild(footer);

  return card;
}

async function loadDirectory(page = 1) {
  const grid = document.getElementById("directoryGrid");
  const info = document.getElementById("resultsInfo");
  const pagination = document.getElementById("pagination");

  const form = document.getElementById("filtersForm");
  const formData = new FormData(form);
  const yearFrom = formData.get("yearFrom") || undefined;
  const yearTo = formData.get("yearTo") || undefined;

  if (yearFrom && yearTo && Number(yearFrom) > Number(yearTo)) {
    grid.innerHTML = "";
    pagination.innerHTML = "";
    info.textContent = "";
    showAlert(grid, "El año 'desde' no puede ser mayor que el año 'hasta'.");
    return;
  }

  const techSlugs = Array.from(selectedFilterTechs.keys());

  const params = {
    q: formData.get("q") || undefined,
    technology: techSlugs.length > 0 ? techSlugs.join(",") : undefined,
    yearFrom,
    yearTo,
    page,
    limit: LIMIT,
  };

  grid.innerHTML = `
    <div class="empty-state-loading" style="padding: 36px 16px; text-align: center;">
      <span class="spinner-institutional"></span>
      <p class="muted" style="margin-top: 10px;">Cargando directorio de profesionales...</p>
    </div>
  `;
  pagination.innerHTML = "";

  try {
    const result = await api.directory.list(params);
    grid.innerHTML = "";

    const countBadge = document.getElementById("resultsCountBadge");

    if (result.items.length === 0) {
      const searchSvg = typeof getSvgIcon === "function" ? getSvgIcon("search") : "🔍";
      const emptyBox = el("div", { class: "card empty-state-box", style: "grid-column: 1 / -1; text-align: center; padding: 48px 20px;" }, [
        el("div", { class: "empty-state-icon-wrap", html: searchSvg, style: "font-size: 2.2rem; color: var(--muted); margin-bottom: 12px;" }),
        el("h3", { style: "color: var(--primary); margin-bottom: 8px; font-size: 1.15rem;", text: "No se encontraron profesionales graduados" }),
        el("p", { class: "muted", style: "max-width: 460px; margin: 0 auto 18px;", text: "No hay registros que coincidan exactamente con los criterios de búsqueda o habilidades seleccionadas. Intenta ajustar el texto o restablecer los filtros." }),
        el("button", {
          type: "button",
          class: "btn btn-secondary",
          text: "Limpiar filtros de búsqueda",
          onclick: () => {
            form.reset();
            selectedFilterTechs.clear();
            renderTechnologyFilterState();
            loadDirectory(1);
          }
        })
      ]);
      grid.appendChild(emptyBox);
      info.textContent = "";
      if (countBadge) countBadge.textContent = "0 profesionales";
      return;
    }

    for (const graduate of result.items) {
      grid.appendChild(graduateCard(graduate));
    }

    const totalPages = Math.max(1, Math.ceil(result.total / result.limit));
    info.textContent = `${result.total} graduado(s) encontrado(s) - página ${result.page} de ${totalPages}`;
    if (countBadge) {
      countBadge.textContent = `${result.total} profesional${result.total === 1 ? "" : "es"} registrado${result.total === 1 ? "" : "s"}`;
    }

    renderPaginationControls(pagination, result.page, totalPages);
    currentPage = result.page;
  } catch (err) {
    grid.innerHTML = "";
    showAlert(grid, err.message || "No se pudo cargar el directorio.");
  }
}

function scrollToGridTop() {
  const target = document.getElementById("resultsInfo") || document.getElementById("directoryGrid");
  if (target) {
    const offset = target.getBoundingClientRect().top + window.scrollY - 20;
    window.scrollTo({ top: offset, behavior: "smooth" });
  }
}

function renderPaginationControls(paginationContainer, page, totalPages) {
  paginationContainer.innerHTML = "";
  if (totalPages <= 1) return;

  // Botón Anterior
  const prevBtn = el("button", {
    type: "button",
    class: "pagination-btn",
    text: "← Anterior",
  });
  if (page <= 1) {
    prevBtn.disabled = true;
  } else {
    prevBtn.addEventListener("click", () => {
      loadDirectory(page - 1);
      scrollToGridTop();
    });
  }
  paginationContainer.appendChild(prevBtn);

  // Páginas numeradas
  const maxButtons = 7;
  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > maxButtons) {
    startPage = Math.max(1, page - 2);
    endPage = Math.min(totalPages, page + 2);

    if (startPage > 1) {
      const firstBtn = el("button", { type: "button", class: "pagination-btn", text: "1" });
      firstBtn.addEventListener("click", () => {
        loadDirectory(1);
        scrollToGridTop();
      });
      paginationContainer.appendChild(firstBtn);

      if (startPage > 2) {
        paginationContainer.appendChild(el("span", { class: "pagination-ellipsis", text: "..." }));
      }
    }
  }

  for (let p = startPage; p <= endPage; p += 1) {
    const pageBtn = el("button", {
      type: "button",
      class: `pagination-btn ${p === page ? "active" : ""}`,
      text: String(p),
    });
    if (p !== page) {
      pageBtn.addEventListener("click", () => {
        loadDirectory(p);
        scrollToGridTop();
      });
    }
    paginationContainer.appendChild(pageBtn);
  }

  if (totalPages > maxButtons && endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationContainer.appendChild(el("span", { class: "pagination-ellipsis", text: "..." }));
    }
    const lastBtn = el("button", { type: "button", class: "pagination-btn", text: String(totalPages) });
    lastBtn.addEventListener("click", () => {
      loadDirectory(totalPages);
      scrollToGridTop();
    });
    paginationContainer.appendChild(lastBtn);
  }

  // Botón Siguiente
  const nextBtn = el("button", {
    type: "button",
    class: "pagination-btn",
    text: "Siguiente →",
  });
  if (page >= totalPages) {
    nextBtn.disabled = true;
  } else {
    nextBtn.addEventListener("click", () => {
      loadDirectory(page + 1);
      scrollToGridTop();
    });
  }
  paginationContainer.appendChild(nextBtn);
}

document.addEventListener("DOMContentLoaded", async () => {
  await renderTopbar();

  const capDetails = document.getElementById("capabilitiesDetails");
  if (capDetails) {
    if (window.innerWidth <= 860) {
      capDetails.removeAttribute("open");
    } else {
      capDetails.setAttribute("open", "");
    }
  }

  populateYearFilters();
  await loadTechnologiesFilter();
  await loadDirectory(1);

  document.getElementById("filtersForm").addEventListener("submit", (e) => {
    e.preventDefault();
    loadDirectory(1);
  });
});
