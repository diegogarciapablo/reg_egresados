const MAX_PER_CATEGORY = 2;
const MAX_TOTAL = 5;

let selectedTechnologies = new Set();
let selectedSoftSkills = new Set();
let allTechnologies = [];
let allSoftSkills = [];

function fillProfileForm(graduate) {
  document.getElementById("firstName").value = graduate.firstName || "";
  document.getElementById("lastName").value = graduate.lastName || "";
  document.getElementById("currentRole").value = graduate.currentRole || "";
  document.getElementById("professionalSummary").value = graduate.professionalSummary || "";
  document.getElementById("githubUrl").value = graduate.githubUrl || "";
  document.getElementById("linkedinUrl").value = graduate.linkedinUrl || "";
  document.getElementById("portfolioUrl").value = graduate.portfolioUrl || "";
}

function renderProfilePhoto(photoUrl) {
  const image = document.getElementById("profilePhoto");
  const placeholder = document.getElementById("profilePhotoPlaceholder");
  const selectButton = document.getElementById("photoSelectBtn");
  const removeButton = document.getElementById("photoRemoveBtn");
  const hasPhoto = Boolean(photoUrl);

  image.hidden = !hasPhoto;
  placeholder.hidden = hasPhoto;
  selectButton.textContent = hasPhoto ? "Cambiar" : "Subir foto";
  selectButton.setAttribute("aria-label", hasPhoto ? "Cambiar foto de perfil" : "Subir foto de perfil");
  selectButton.title = hasPhoto ? "Cambiar foto de perfil" : "Subir foto de perfil";
  removeButton.hidden = !hasPhoto;
  if (hasPhoto) {
    const separator = photoUrl.includes("?") ? "&" : "?";
    image.src = photoUrl.startsWith("/api/") ? `${photoUrl}${separator}v=${Date.now()}` : photoUrl;
  } else {
    image.removeAttribute("src");
  }
}

function renderVisibilityToggle(graduate) {
  const box = document.getElementById("visibilityBox");
  box.innerHTML = "";

  const badge = el("span", {
    class: `badge ${graduate.visibility === "public" ? "badge-public" : "badge-private"}`,
    text: graduate.visibility === "public" ? "Ficha publica" : "Ficha privada",
  });
  box.appendChild(badge);

  const toggleBtn = el("button", {
    class: "btn btn-secondary",
    style: "margin-left:10px;",
    text: graduate.visibility === "public" ? "Ocultar del directorio" : "Publicar en el directorio",
  });
  toggleBtn.addEventListener("click", async () => {
    const newVisibility = graduate.visibility === "public" ? "private" : "public";
    toggleBtn.disabled = true;
    try {
      const updated = await api.profile.setVisibility(newVisibility);
      graduate.visibility = updated.visibility;
      renderVisibilityToggle(graduate);
      showAlert(document.getElementById("generalAlert"), "Visibilidad actualizada.", "success");
    } catch (err) {
      showAlert(document.getElementById("generalAlert"), err.message || "No se pudo actualizar la visibilidad.");
    } finally {
      toggleBtn.disabled = false;
    }
  });
  box.appendChild(toggleBtn);
}

function renderChips(container, items, selectedSet, otherSet) {
  container.innerHTML = "";
  for (const item of items) {
    const isSelected = selectedSet.has(item.id);
    const chip = el("button", {
      type: "button",
      class: `chip ${isSelected ? "selected" : ""}`,
      text: item.name,
    });

    chip.addEventListener("click", () => {
      const totalSelected = selectedSet.size + otherSet.size;
      if (!selectedSet.has(item.id)) {
        if (selectedSet.size >= MAX_PER_CATEGORY) {
          showAlert(document.getElementById("generalAlert"), `Maximo ${MAX_PER_CATEGORY} selecciones en esta categoria.`);
          return;
        }
        if (totalSelected >= MAX_TOTAL) {
          showAlert(document.getElementById("generalAlert"), `Maximo ${MAX_TOTAL} selecciones en total.`);
          return;
        }
        selectedSet.add(item.id);
      } else {
        selectedSet.delete(item.id);
      }
      clearAlert(document.getElementById("generalAlert"));
      renderChips(container, items, selectedSet, otherSet);
    });

    container.appendChild(chip);
  }
}

function experienceRow(exp = {}) {
  const row = el("div", { class: "card", style: "margin-bottom:10px;" });

  const positionInput = el("input", { type: "text", placeholder: "Puesto", value: exp.position || "" });
  const orgInput = el("input", { type: "text", placeholder: "Organizacion", value: exp.organization || "" });
  const startInput = el("input", { type: "date", value: exp.start_date ? exp.start_date.slice(0, 10) : "" });
  const endInput = el("input", { type: "date", value: exp.end_date ? exp.end_date.slice(0, 10) : "" });
  const descInput = el("textarea", { placeholder: "Descripcion" });
  descInput.value = exp.description || "";

  const removeBtn = el("button", { type: "button", class: "btn btn-danger", text: "Eliminar" });
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "Puesto" }), positionInput]));
  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "Organizacion" }), orgInput]));
  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "Inicio" }), startInput]));
  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "Fin (vacio si es actual)" }), endInput]));
  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "Descripcion" }), descInput]));
  row.appendChild(removeBtn);

  row._getData = () => ({
    position: positionInput.value,
    organization: orgInput.value,
    startDate: startInput.value || null,
    endDate: endInput.value || null,
    isCurrent: !endInput.value,
    description: descInput.value || null,
  });

  return row;
}

function projectRow(project = {}) {
  const row = el("div", { class: "card", style: "margin-bottom:10px;" });

  const titleInput = el("input", { type: "text", placeholder: "Titulo", value: project.title || "" });
  const descInput = el("textarea", { placeholder: "Descripcion" });
  descInput.value = project.description || "";
  const urlInput = el("input", { type: "url", placeholder: "https://...", value: project.url || "" });
  const repoInput = el("input", { type: "url", placeholder: "https://github.com/...", value: project.repository_url || "" });

  const removeBtn = el("button", { type: "button", class: "btn btn-danger", text: "Eliminar" });
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "Titulo" }), titleInput]));
  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "Descripcion" }), descInput]));
  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "URL" }), urlInput]));
  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "Repositorio" }), repoInput]));
  row.appendChild(removeBtn);

  row._getData = () => ({
    title: titleInput.value,
    description: descInput.value || null,
    url: urlInput.value || null,
    repositoryUrl: repoInput.value || null,
  });

  return row;
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireSession();
  if (!user) return;
  await renderTopbar(user);

  const generalAlert = document.getElementById("generalAlert");
  let graduate;

  try {
    graduate = await api.profile.get();
  } catch (err) {
    showAlert(generalAlert, err.message || "No se pudo cargar tu ficha.");
    return;
  }

  fillProfileForm(graduate);
  renderProfilePhoto(graduate.photoUrl);
  renderVisibilityToggle(graduate);

  const photoFileInput = document.getElementById("photoFileInput");
  const photoSelectBtn = document.getElementById("photoSelectBtn");
  const photoRemoveBtn = document.getElementById("photoRemoveBtn");
  photoSelectBtn.addEventListener("click", () => photoFileInput.click());
  photoFileInput.addEventListener("change", async () => {
    const file = photoFileInput.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showAlert(generalAlert, "Selecciona una imagen JPEG, PNG o WebP.");
      photoFileInput.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert(generalAlert, "La foto no puede superar los 5 MB.");
      photoFileInput.value = "";
      return;
    }

    photoSelectBtn.disabled = true;
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const result = await api.profile.updatePhoto(formData);
      graduate.photoUrl = result.photoUrl;
      renderProfilePhoto(graduate.photoUrl);
      showAlert(generalAlert, "Foto de perfil actualizada.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudo guardar la foto.");
    } finally {
      photoSelectBtn.disabled = false;
      photoFileInput.value = "";
    }
  });
  photoRemoveBtn.addEventListener("click", async () => {
    photoRemoveBtn.disabled = true;
    try {
      await api.profile.removePhoto();
      graduate.photoUrl = null;
      renderProfilePhoto(null);
      showAlert(generalAlert, "Foto de perfil quitada.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudo quitar la foto.");
    } finally {
      photoRemoveBtn.disabled = false;
    }
  });

  selectedTechnologies = new Set((graduate.technologies || []).map((t) => t.id));
  selectedSoftSkills = new Set((graduate.softSkills || []).map((s) => s.id));

  try {
    [allTechnologies, allSoftSkills] = await Promise.all([api.catalogs.technologies(), api.catalogs.softSkills()]);
  } catch {
    allTechnologies = [];
    allSoftSkills = [];
  }

  renderChips(document.getElementById("technologiesChips"), allTechnologies, selectedTechnologies, selectedSoftSkills);
  renderChips(document.getElementById("softSkillsChips"), allSoftSkills, selectedSoftSkills, selectedTechnologies);

  // --- Informacion general ---
  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert(generalAlert);
    try {
      await api.profile.update({
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        currentRole: document.getElementById("currentRole").value || null,
        professionalSummary: document.getElementById("professionalSummary").value || null,
        githubUrl: document.getElementById("githubUrl").value || null,
        linkedinUrl: document.getElementById("linkedinUrl").value || null,
        portfolioUrl: document.getElementById("portfolioUrl").value || null,
      });
      showAlert(generalAlert, "Informacion guardada.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudo guardar la informacion.");
    }
  });

  // --- Tecnologias / habilidades ---
  document.getElementById("saveTechnologiesBtn").addEventListener("click", async () => {
    try {
      await api.profile.setTechnologies([...selectedTechnologies]);
      showAlert(generalAlert, "Tecnologias guardadas.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudieron guardar las tecnologias.");
    }
  });

  document.getElementById("saveSoftSkillsBtn").addEventListener("click", async () => {
    try {
      await api.profile.setSoftSkills([...selectedSoftSkills]);
      showAlert(generalAlert, "Habilidades guardadas.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudieron guardar las habilidades.");
    }
  });

  // --- Experiencia ---
  const experiencesList = document.getElementById("experiencesList");
  for (const exp of graduate.experiences || []) {
    experiencesList.appendChild(experienceRow(exp));
  }
  document.getElementById("addExperienceBtn").addEventListener("click", () => {
    experiencesList.appendChild(experienceRow());
  });
  document.getElementById("saveExperiencesBtn").addEventListener("click", async () => {
    const experiences = [...experiencesList.children].map((row) => row._getData());
    try {
      await api.profile.setExperiences(experiences);
      showAlert(generalAlert, "Experiencia guardada.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudo guardar la experiencia.");
    }
  });

  // --- Proyectos ---
  const projectsList = document.getElementById("projectsList");
  for (const project of graduate.projects || []) {
    projectsList.appendChild(projectRow(project));
  }
  document.getElementById("addProjectBtn").addEventListener("click", () => {
    projectsList.appendChild(projectRow());
  });
  document.getElementById("saveProjectsBtn").addEventListener("click", async () => {
    const projects = [...projectsList.children].map((row) => row._getData());
    try {
      await api.profile.setProjects(projects);
      showAlert(generalAlert, "Proyectos guardados.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudieron guardar los proyectos.");
    }
  });
});
