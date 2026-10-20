let currentPage = 1;
const LIMIT = 12;

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

function graduateCard(graduate) {
  const card = el("div", { class: "graduate-card" });
  card.appendChild(el("h3", { text: `${graduate.firstName} ${graduate.lastName}` }));
  if (graduate.currentRole) {
    card.appendChild(el("div", { class: "role", text: graduate.currentRole }));
  }
  card.appendChild(el("div", { class: "muted", text: `Egresado ${graduate.graduationYear}` }));

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
  const params = {
    q: formData.get("q") || undefined,
    technology: formData.get("technology") || undefined,
    year: formData.get("year") || undefined,
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
    info.textContent = `${result.total} egresado(s) encontrado(s) - pagina ${result.page} de ${totalPages}`;

    if (totalPages > 1) {
      if (result.page > 1) {
        const prev = el("button", { class: "btn btn-secondary", text: "Anterior" });
        prev.addEventListener("click", () => loadDirectory(result.page - 1));
        pagination.appendChild(prev);
      }
      if (result.page < totalPages) {
        const next = el("button", { class: "btn btn-secondary", text: "Siguiente" });
        next.addEventListener("click", () => loadDirectory(result.page + 1));
        pagination.appendChild(next);
      }
    }

    currentPage = result.page;
  } catch (err) {
    grid.innerHTML = "";
    showAlert(grid, err.message || "No se pudo cargar el directorio.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await renderTopbar();
  await loadTechnologiesFilter();
  await loadDirectory(1);

  document.getElementById("filtersForm").addEventListener("submit", (e) => {
    e.preventDefault();
    loadDirectory(1);
  });
});
