let selectedTechnologies = new Set();
let selectedSoftSkills = new Set();
let allTechnologies = [];
let allSoftSkills = [];

const CROP_VIEW_SIZE = 320;
const CROP_OUTPUT_SIZE = 512;
let cropImage = null;
let cropState = {
  scale: 1,
  minScale: 1,
  offsetX: 0,
  offsetY: 0,
  dragging: false,
  startX: 0,
  startY: 0,
};

function populateDashboardYearSelect(selectedYear) {
  const select = document.getElementById("graduationYear");
  if (!select) return;
  select.innerHTML = "";
  const currentYear = Math.max(new Date().getFullYear(), 2026);
  const startYear = 1980;

  for (let year = currentYear; year >= startYear; year -= 1) {
    select.appendChild(el("option", { value: String(year), text: String(year) }));
  }
  if (selectedYear) {
    select.value = String(selectedYear);
  }
}

function fillProfileForm(graduate) {
  document.getElementById("firstName").value = graduate.firstName || "";
  document.getElementById("lastName").value = graduate.lastName || "";
  populateDashboardYearSelect(graduate.graduationYear);
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
  const frameExistingButton = document.getElementById("photoFrameExistingBtn");
  const removeButton = document.getElementById("photoRemoveBtn");
  const hasPhoto = Boolean(photoUrl);

  image.hidden = !hasPhoto;
  placeholder.hidden = hasPhoto;
  selectButton.textContent = hasPhoto ? "Cambiar" : "Subir foto";
  selectButton.setAttribute("aria-label", hasPhoto ? "Cambiar foto de perfil" : "Subir foto de perfil");
  selectButton.title = hasPhoto ? "Cambiar foto de perfil" : "Subir foto de perfil";
  if (frameExistingButton) frameExistingButton.hidden = !hasPhoto;
  removeButton.hidden = !hasPhoto;

  if (hasPhoto) {
    const separator = photoUrl.includes("?") ? "&" : "?";
    image.src = photoUrl.startsWith("/api/") ? `${photoUrl}${separator}v=${Date.now()}` : photoUrl;
  } else {
    image.removeAttribute("src");
  }
}

function clampCropOffsets() {
  if (!cropImage) return;
  const totalScale = cropState.minScale * cropState.scale;
  const drawWidth = cropImage.naturalWidth * totalScale;
  const drawHeight = cropImage.naturalHeight * totalScale;
  const maxOffsetX = Math.max(0, (drawWidth - CROP_VIEW_SIZE) / 2);
  const maxOffsetY = Math.max(0, (drawHeight - CROP_VIEW_SIZE) / 2);

  cropState.offsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, cropState.offsetX));
  cropState.offsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, cropState.offsetY));
}

function drawCropPreview() {
  const canvas = document.getElementById("photoCropCanvas");
  if (!canvas || !cropImage) return;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, CROP_VIEW_SIZE, CROP_VIEW_SIZE);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, CROP_VIEW_SIZE, CROP_VIEW_SIZE);

  const totalScale = cropState.minScale * cropState.scale;
  const drawWidth = cropImage.naturalWidth * totalScale;
  const drawHeight = cropImage.naturalHeight * totalScale;
  const x = (CROP_VIEW_SIZE - drawWidth) / 2 + cropState.offsetX;
  const y = (CROP_VIEW_SIZE - drawHeight) / 2 + cropState.offsetY;

  ctx.drawImage(cropImage, x, y, drawWidth, drawHeight);

  // Mascara circular guia para visualizar el avatar final
  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
  ctx.beginPath();
  ctx.rect(0, 0, CROP_VIEW_SIZE, CROP_VIEW_SIZE);
  ctx.arc(CROP_VIEW_SIZE / 2, CROP_VIEW_SIZE / 2, CROP_VIEW_SIZE / 2 - 8, 0, Math.PI * 2, true);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(CROP_VIEW_SIZE / 2, CROP_VIEW_SIZE / 2, CROP_VIEW_SIZE / 2 - 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function resetCropPosition() {
  if (!cropImage) return;
  cropState.minScale = Math.max(
    CROP_VIEW_SIZE / cropImage.naturalWidth,
    CROP_VIEW_SIZE / cropImage.naturalHeight,
  );
  cropState.scale = 1;
  cropState.offsetX = 0;
  cropState.offsetY = 0;
  const zoomRange = document.getElementById("photoZoomRange");
  if (zoomRange) zoomRange.value = "1";
  clampCropOffsets();
  drawCropPreview();
}

function openCropDialogWithImage(imgElement) {
  cropImage = imgElement;
  resetCropPosition();
  document.getElementById("photoCropDialog").hidden = false;
}

function closeCropDialog() {
  document.getElementById("photoCropDialog").hidden = true;
  cropImage = null;
  cropState.dragging = false;
}

function loadImageForCrop(src, useCrossOrigin = false) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (useCrossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen para encuadrar."));
    img.src = src;
  });
}

function exportCroppedBlob() {
  return new Promise((resolve, reject) => {
    if (!cropImage) {
      reject(new Error("No hay imagen para recortar."));
      return;
    }

    const outCanvas = document.createElement("canvas");
    outCanvas.width = CROP_OUTPUT_SIZE;
    outCanvas.height = CROP_OUTPUT_SIZE;
    const outCtx = outCanvas.getContext("2d");

    const ratio = CROP_OUTPUT_SIZE / CROP_VIEW_SIZE;
    const totalScale = cropState.minScale * cropState.scale * ratio;
    const drawWidth = cropImage.naturalWidth * totalScale;
    const drawHeight = cropImage.naturalHeight * totalScale;
    const x = (CROP_OUTPUT_SIZE - drawWidth) / 2 + cropState.offsetX * ratio;
    const y = (CROP_OUTPUT_SIZE - drawHeight) / 2 + cropState.offsetY * ratio;

    outCtx.fillStyle = "#ffffff";
    outCtx.fillRect(0, 0, CROP_OUTPUT_SIZE, CROP_OUTPUT_SIZE);
    outCtx.drawImage(cropImage, x, y, drawWidth, drawHeight);

    outCanvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("No se pudo procesar el recorte de la imagen."));
        else resolve(blob);
      },
      "image/jpeg",
      0.92,
    );
  });
}

function setupPhotoCropEvents(graduate, generalAlert) {
  const canvas = document.getElementById("photoCropCanvas");
  const zoomRange = document.getElementById("photoZoomRange");
  const resetBtn = document.getElementById("photoCenterResetBtn");
  const cancelBtn = document.getElementById("cancelCropBtn");
  const closeBtn = document.getElementById("closeCropDialogBtn");
  const saveBtn = document.getElementById("saveCropBtn");
  const dialog = document.getElementById("photoCropDialog");

  const startDrag = (clientX, clientY) => {
    if (!cropImage) return;
    cropState.dragging = true;
    cropState.startX = clientX - cropState.offsetX;
    cropState.startY = clientY - cropState.offsetY;
  };

  const moveDrag = (clientX, clientY) => {
    if (!cropState.dragging || !cropImage) return;
    cropState.offsetX = clientX - cropState.startX;
    cropState.offsetY = clientY - cropState.startY;
    clampCropOffsets();
    drawCropPreview();
  };

  const endDrag = () => {
    cropState.dragging = false;
  };

  canvas.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener("mouseup", endDrag);

  canvas.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: false },
  );
  window.addEventListener(
    "touchmove",
    (e) => {
      if (cropState.dragging && e.touches.length === 1) {
        e.preventDefault();
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: false },
  );
  window.addEventListener("touchend", endDrag);

  canvas.addEventListener(
    "wheel",
    (e) => {
      if (!cropImage) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      cropState.scale = Math.min(3, Math.max(1, cropState.scale + delta));
      zoomRange.value = String(cropState.scale);
      clampCropOffsets();
      drawCropPreview();
    },
    { passive: false },
  );

  zoomRange.addEventListener("input", () => {
    cropState.scale = Number(zoomRange.value) || 1;
    clampCropOffsets();
    drawCropPreview();
  });

  resetBtn.addEventListener("click", resetCropPosition);
  cancelBtn.addEventListener("click", closeCropDialog);
  closeBtn.addEventListener("click", closeCropDialog);
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) closeCropDialog();
  });

  saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true;
    clearAlert(generalAlert);
    try {
      const blob = await exportCroppedBlob();
      const formData = new FormData();
      formData.append("photo", blob, "avatar.jpg");
      const result = await api.profile.updatePhoto(formData);
      graduate.photoUrl = result.photoUrl;
      renderProfilePhoto(graduate.photoUrl);
      closeCropDialog();
      showAlert(generalAlert, "Foto de perfil encuadrada y guardada.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudo guardar la foto.");
    } finally {
      saveBtn.disabled = false;
    }
  });
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

function renderChips(container, items, selectedSet) {
  container.innerHTML = "";
  for (const item of items) {
    const isSelected = selectedSet.has(item.id);
    const chip = el("button", {
      type: "button",
      class: `chip ${isSelected ? "selected" : ""}`,
      text: item.name,
    });

    chip.addEventListener("click", () => {
      if (!selectedSet.has(item.id)) {
        selectedSet.add(item.id);
      } else {
        selectedSet.delete(item.id);
      }
      clearAlert(document.getElementById("generalAlert"));
      renderChips(container, items, selectedSet);
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

function certificateRow(cert = {}, generalAlert) {
  const row = el("div", { class: "card certificate-row", style: "margin-bottom:10px;" });

  let currentFileUrl = cert.file_url || cert.fileUrl || null;
  let currentFileName = cert.file_name || cert.fileName || null;

  const titleInput = el("input", {
    type: "text",
    placeholder: "Ej: AWS Certified Cloud Practitioner",
    value: cert.title || "",
  });
  const issuerInput = el("input", {
    type: "text",
    placeholder: "Ej: Amazon Web Services / Coursera",
    value: cert.issuer || "",
  });
  const issueDateValue = cert.issue_date ? String(cert.issue_date).slice(0, 10) : cert.issueDate || "";
  const issueDateInput = el("input", { type: "date", value: issueDateValue });
  const credentialUrlInput = el("input", {
    type: "url",
    placeholder: "https://...",
    value: cert.credential_url || cert.credentialUrl || "",
  });

  const fileInput = el("input", {
    type: "file",
    accept: "application/pdf,image/jpeg,image/png,image/webp",
    hidden: "hidden",
  });
  const uploadBtn = el("button", {
    type: "button",
    class: "btn btn-secondary",
    text: currentFileUrl ? "Cambiar archivo digital" : "Subir certificado digital (PDF o imagen)",
  });
  const fileStatus = el("div", { class: "certificate-file-status" });

  function renderFileStatus() {
    fileStatus.innerHTML = "";
    uploadBtn.textContent = currentFileUrl ? "Cambiar archivo digital" : "Subir certificado digital (PDF o imagen)";
    if (currentFileUrl) {
      const badge = el("a", {
        href: currentFileUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        class: "certificate-file-link",
        text: `Archivo adjunto: ${currentFileName || "Ver certificado digital"}`,
      });
      const clearFileBtn = el("button", {
        type: "button",
        class: "photo-remove-button",
        text: "Quitar archivo",
      });
      clearFileBtn.addEventListener("click", () => {
        currentFileUrl = null;
        currentFileName = null;
        renderFileStatus();
      });
      fileStatus.appendChild(badge);
      fileStatus.appendChild(clearFileBtn);
    } else {
      fileStatus.appendChild(el("span", { class: "muted", text: "Sin archivo digital adjunto." }));
    }
  }

  renderFileStatus();

  uploadBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      if (generalAlert) showAlert(generalAlert, "El certificado digital debe ser PDF, JPEG, PNG o WebP.");
      fileInput.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      if (generalAlert) showAlert(generalAlert, "El certificado digital no puede superar los 10 MB.");
      fileInput.value = "";
      return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = "Subiendo archivo...";
    if (generalAlert) clearAlert(generalAlert);

    try {
      const formData = new FormData();
      formData.append("certificate", file);
      const uploaded = await api.profile.uploadCertificateFile(formData);
      currentFileUrl = uploaded.fileUrl;
      currentFileName = uploaded.fileName || file.name;
      if (!titleInput.value.trim() && currentFileName) {
        titleInput.value = currentFileName.replace(/\.[^/.]+$/, "");
      }
      renderFileStatus();
      if (generalAlert) {
        showAlert(
          generalAlert,
          "Archivo digital cargado. Recuerda hacer clic en 'Guardar certificados' al finalizar.",
          "success"
        );
      }
    } catch (err) {
      renderFileStatus();
      if (generalAlert) showAlert(generalAlert, err.message || "No se pudo subir el certificado digital.");
    } finally {
      uploadBtn.disabled = false;
      fileInput.value = "";
    }
  });

  const removeBtn = el("button", { type: "button", class: "btn btn-danger", text: "Eliminar" });
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(
    el("div", { class: "certificate-row-grid" }, [
      el("div", { class: "form-group" }, [el("label", { text: "Nombre del certificado *" }), titleInput]),
      el("div", { class: "form-group" }, [el("label", { text: "Institucion emisora" }), issuerInput]),
      el("div", { class: "form-group" }, [el("label", { text: "Fecha de emision" }), issueDateInput]),
      el("div", { class: "form-group" }, [el("label", { text: "URL de credencial (opcional)" }), credentialUrlInput]),
    ])
  );

  row.appendChild(
    el("div", { class: "form-group certificate-upload-box" }, [
      el("label", { text: "Certificado en digital (PDF o imagen)" }),
      el("div", { class: "certificate-upload-controls" }, [uploadBtn, fileStatus, fileInput]),
    ])
  );

  row.appendChild(el("div", { class: "certificate-row-footer" }, [removeBtn]));

  row._getData = () => ({
    title: titleInput.value.trim(),
    issuer: issuerInput.value.trim() || null,
    issueDate: issueDateInput.value || null,
    credentialUrl: credentialUrlInput.value.trim() || null,
    fileUrl: currentFileUrl || null,
    fileName: currentFileName || null,
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
  setupPhotoCropEvents(graduate, generalAlert);

  const photoFileInput = document.getElementById("photoFileInput");
  const photoSelectBtn = document.getElementById("photoSelectBtn");
  const photoFrameExistingBtn = document.getElementById("photoFrameExistingBtn");
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

    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await loadImageForCrop(objectUrl, false);
      openCropDialogWithImage(img);
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudo abrir la imagen.");
    } finally {
      URL.revokeObjectURL(objectUrl);
      photoFileInput.value = "";
    }
  });

  if (photoFrameExistingBtn) {
    photoFrameExistingBtn.addEventListener("click", async () => {
      if (!graduate.photoUrl) return;
      photoFrameExistingBtn.disabled = true;
      clearAlert(generalAlert);
      try {
        const isExternal = /^https?:\/\//i.test(graduate.photoUrl);
        const img = await loadImageForCrop(graduate.photoUrl, isExternal);
        openCropDialogWithImage(img);
      } catch (err) {
        showAlert(generalAlert, err.message || "No se pudo cargar la foto actual para encuadrar.");
      } finally {
        photoFrameExistingBtn.disabled = false;
      }
    });
  }

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

  renderChips(document.getElementById("technologiesChips"), allTechnologies, selectedTechnologies);
  renderChips(document.getElementById("softSkillsChips"), allSoftSkills, selectedSoftSkills);

  // --- Informacion general ---
  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert(generalAlert);
    try {
      await api.profile.update({
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        graduationYear: Number(document.getElementById("graduationYear").value) || undefined,
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

  // --- Certificados ---
  const certificatesList = document.getElementById("certificatesList");
  const existingCertificates = graduate.certificates || [];
  if (existingCertificates.length > 0) {
    for (const cert of existingCertificates) {
      certificatesList.appendChild(certificateRow(cert, generalAlert));
    }
  } else {
    certificatesList.appendChild(certificateRow({}, generalAlert));
  }

  document.getElementById("addCertificateBtn").addEventListener("click", () => {
    certificatesList.appendChild(certificateRow({}, generalAlert));
  });

  document.getElementById("saveCertificatesBtn").addEventListener("click", async () => {
    const rowsData = [...certificatesList.children].map((row) => row._getData());
    const nonEmptyRows = rowsData.filter(
      (c) => c.title || c.issuer || c.issueDate || c.credentialUrl || c.fileUrl
    );
    const missingTitle = nonEmptyRows.find((c) => !c.title);
    if (missingTitle) {
      showAlert(generalAlert, "Cada certificado de la lista debe tener un nombre o titulo.");
      return;
    }

    try {
      await api.profile.setCertificates(nonEmptyRows);
      showAlert(generalAlert, "Certificados guardados.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudieron guardar los certificados.");
    }
  });
});
