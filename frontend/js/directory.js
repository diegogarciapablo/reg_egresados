let currentPage = 1;
const LIMIT = 9;

async function loadTechnologiesFilter() {
  const select = document.getElementById("technology");
  try {
    const technologies = await api.catalogs.technologies();
    for (const tech of technologies) {
      select.appendChild(el("option", { value: tech.slug, text: tech.name }));
    }
  } catch {
    // Si el catalogo falla, el filtro simplemente queda solo con "Todas".
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

function graduateCard(graduate) {
  const card = el("div", { class: "graduate-card" });

  const headerRow = el("div", { class: "graduate-card-header" });
  if (graduate.photoUrl) {
    headerRow.appendChild(
      el("img", {
        class: "graduate-avatar",
        src: graduate.photoUrl,
        alt: `Foto de ${graduate.firstName} ${graduate.lastName}`,
        loading: "lazy",
      })
    );
  } else {
    const initials = `${graduate.firstName?.[0] || ""}${graduate.lastName?.[0] || ""}`.toUpperCase();
    headerRow.appendChild(el("div", { class: "graduate-avatar graduate-avatar-placeholder", text: initials || "?" }));
  }

  const meta = el("div", { class: "graduate-card-meta" });
  const nameH3 = el("h3", { class: "graduate-name-title" });
  nameH3.appendChild(document.createTextNode(`${graduate.firstName} ${graduate.lastName}`));
  if (graduate.emailVerified && typeof createVerifiedBadge === "function") {
    nameH3.appendChild(createVerifiedBadge());
  }
  meta.appendChild(nameH3);
  if (graduate.currentRole) {
    meta.appendChild(el("div", { class: "role", text: graduate.currentRole }));
  }
  meta.appendChild(el("div", { class: "muted", text: `Egresado ${graduate.graduationYear}` }));
  headerRow.appendChild(meta);
  card.appendChild(headerRow);

  if (graduate.professionalSummary) {
    const summary = graduate.professionalSummary.length > 140
      ? graduate.professionalSummary.slice(0, 140) + "..."
      : graduate.professionalSummary;
    card.appendChild(el("p", { text: summary }));
  }

  if (graduate.technologies && graduate.technologies.length) {
    const tags = el("div", { class: "tag-list" });
    for (const tech of graduate.technologies.slice(0, 5)) {
      tags.appendChild(el("span", { class: "tag", text: tech.name }));
    }
    card.appendChild(tags);
  }

  card.appendChild(
    el("a", {
      class: "btn btn-secondary",
      href: `/perfil.html?codigo=${encodeURIComponent(graduate.registrationCode)}`,
      text: "Ver ficha completa",
    })
  );

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

  const params = {
    q: formData.get("q") || undefined,
    technology: formData.get("technology") || undefined,
    yearFrom,
    yearTo,
    page,
    limit: LIMIT,
  };

  grid.innerHTML = `<p class="muted">Cargando...</p>`;
  pagination.innerHTML = "";

  try {
    const result = await api.directory.list(params);
    grid.innerHTML = "";

    if (result.items.length === 0) {
      grid.appendChild(
        el("div", { class: "empty-state" }, [
          el("p", { text: "No se encontraron egresados con esos filtros." }),
        ])
      );
      info.textContent = "";
      return;
    }

    for (const graduate of result.items) {
      grid.appendChild(graduateCard(graduate));
    }

    const totalPages = Math.max(1, Math.ceil(result.total / result.limit));
    info.textContent = `${result.total} egresado(s) encontrado(s) - página ${result.page} de ${totalPages}`;

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
  populateYearFilters();
  await loadTechnologiesFilter();
  await loadDirectory(1);

  document.getElementById("filtersForm").addEventListener("submit", (e) => {
    e.preventDefault();
    loadDirectory(1);
  });
});
