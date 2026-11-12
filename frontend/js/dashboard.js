let selectedTechnologies = new Set();
let selectedSoftSkills = new Set();
let allTechnologies = [];
let allSoftSkills = [];
let allLanguages = [];

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

function socialLinkRow(link = {}) {
  const row = el("div", { class: "card social-link-row", style: "margin-bottom:10px;" });

  const typeSelect = el("select", { style: "max-width: 200px;" }, [
    el("option", { value: "linkedin", text: "LinkedIn" }),
    el("option", { value: "github", text: "GitHub" }),
    el("option", { value: "portfolio", text: "Portafolio Personal" }),
    el("option", { value: "gitlab", text: "GitLab" }),
    el("option", { value: "kaggle", text: "Kaggle / Hugging Face" }),
    el("option", { value: "leetcode", text: "LeetCode / HackerRank" }),
    el("option", { value: "behance", text: "Behance / Dribbble" }),
    el("option", { value: "other", text: "Otra red / Enlace" }),
  ]);
  typeSelect.value = link.type || "linkedin";

  const urlInput = el("input", {
    type: "url",
    placeholder: "https://...",
    value: link.url || "",
    style: "flex: 1;",
  });

  const removeBtn = el("button", {
    type: "button",
    class: "btn btn-danger",
    text: "Eliminar",
    style: "padding: 6px 12px;",
  });
  removeBtn.addEventListener("click", () => row.remove());

  const flexBox = el("div", { style: "display: flex; gap: 10px; align-items: center; flex-wrap: wrap;" }, [
    typeSelect,
    urlInput,
    removeBtn,
  ]);
  row.appendChild(flexBox);

  row._getData = () => {
    const url = urlInput.value.trim();
    if (!url) return null;
    return {
      type: typeSelect.value,
      url,
    };
  };

  return row;
}

function languageRow(item = {}) {
  const row = el("div", { class: "card", style: "margin-bottom:10px;" });

  const langSelect = el("select", { style: "max-width: 240px;" }, [
    el("option", { value: "", text: "Selecciona un idioma..." }),
    ...allLanguages.map((l) => el("option", { value: l.id, text: l.name })),
  ]);
  const currentLangId = item.languageId || item.language_id;
  if (currentLangId) {
    langSelect.value = currentLangId;
  }

  const levelSelect = el("select", { style: "max-width: 220px;" }, [
    el("option", { value: "nativo", text: "Nativo / Bilingüe" }),
    el("option", { value: "avanzado", text: "Avanzado (C1 - C2)" }),
    el("option", { value: "intermedio", text: "Intermedio (B1 - B2)" }),
    el("option", { value: "basico", text: "Básico (A1 - A2)" }),
  ]);
  levelSelect.value = item.level || "intermedio";

  const removeBtn = el("button", {
    type: "button",
    class: "btn btn-danger",
    text: "Eliminar",
    style: "padding: 6px 12px;",
  });
  removeBtn.addEventListener("click", () => row.remove());

  const flexBox = el("div", { style: "display: flex; gap: 10px; align-items: center; flex-wrap: wrap;" }, [
    langSelect,
    levelSelect,
    removeBtn,
  ]);
  row.appendChild(flexBox);

  row._getData = () => {
    const languageId = langSelect.value;
    if (!languageId) return null;
    return {
      languageId,
      level: levelSelect.value,
    };
  };

  return row;
}

function fillProfileForm(graduate, sessionUser = {}) {
  document.getElementById("firstName").value = graduate.firstName || "";
  document.getElementById("lastName").value = graduate.lastName || "";
  populateDashboardYearSelect(graduate.graduationYear);
  document.getElementById("currentRole").value = graduate.currentRole || "";
  document.getElementById("professionalSummary").value = graduate.professionalSummary || "";
  document.getElementById("contactPhone").value = graduate.phone || "";
  document.getElementById("personalEmail").value = graduate.personalEmail || sessionUser.email || "";
  document.getElementById("institutionalEmail").value = graduate.institutionalEmail || "";

  const socialContainer = document.getElementById("socialLinksList");
  socialContainer.innerHTML = "";
  const existingLinks = graduate.professionalLinks || [];
  if (existingLinks.length > 0) {
    for (const link of existingLinks) {
      socialContainer.appendChild(socialLinkRow(link));
    }
  } else {
    // Si tenía enlaces antiguos sueltos en columnas legacy
    if (graduate.linkedinUrl) socialContainer.appendChild(socialLinkRow({ type: "linkedin", url: graduate.linkedinUrl }));
    if (graduate.githubUrl) socialContainer.appendChild(socialLinkRow({ type: "github", url: graduate.githubUrl }));
    if (graduate.portfolioUrl) socialContainer.appendChild(socialLinkRow({ type: "portfolio", url: graduate.portfolioUrl }));
  }
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

const EXPERIENCE_MONTHS = [
  { value: "01", label: "01 - Enero" },
  { value: "02", label: "02 - Febrero" },
  { value: "03", label: "03 - Marzo" },
  { value: "04", label: "04 - Abril" },
  { value: "05", label: "05 - Mayo" },
  { value: "06", label: "06 - Junio" },
  { value: "07", label: "07 - Julio" },
  { value: "08", label: "08 - Agosto" },
  { value: "09", label: "09 - Septiembre" },
  { value: "10", label: "10 - Octubre" },
  { value: "11", label: "11 - Noviembre" },
  { value: "12", label: "12 - Diciembre" },
];

function createMonthYearControl(initialIsoDate = "") {
  const monthSelect = el("select", { "aria-label": "Mes" }, [
    el("option", { value: "", text: "Mes..." }),
    ...EXPERIENCE_MONTHS.map((m) => el("option", { value: m.value, text: m.label })),
  ]);

  const currentYear = Math.max(new Date().getFullYear(), 2026);
  const yearOptions = [el("option", { value: "", text: "Año..." })];
  for (let year = currentYear; year >= 1980; year -= 1) {
    yearOptions.push(el("option", { value: String(year), text: String(year) }));
  }
  const yearSelect = el("select", { "aria-label": "Año" }, yearOptions);

  if (initialIsoDate && initialIsoDate.length >= 7) {
    yearSelect.value = initialIsoDate.slice(0, 4);
    monthSelect.value = initialIsoDate.slice(5, 7);
  }

  const wrapper = el("div", { class: "month-year-picker" }, [monthSelect, yearSelect]);

  return {
    wrapper,
    monthSelect,
    yearSelect,
    setFromIso(isoDate) {
      if (isoDate && isoDate.length >= 7) {
        yearSelect.value = isoDate.slice(0, 4);
        monthSelect.value = isoDate.slice(5, 7);
      } else {
        yearSelect.value = "";
        monthSelect.value = "";
      }
    },
    getIsoDate() {
      if (!yearSelect.value || !monthSelect.value) return null;
      return `${yearSelect.value}-${monthSelect.value}-01`;
    },
    isIncomplete() {
      return Boolean(yearSelect.value) !== Boolean(monthSelect.value);
    },
  };
}

function experienceRow(exp = {}, defaultCategory = "work") {
  const row = el("div", { class: "card", style: "margin-bottom:10px;" });

  const currentCategory = exp.category || defaultCategory;
  const initialFormat = exp.date_format === "month" || exp.dateFormat === "month" ? "month" : "day";
  const initialStart = exp.start_date ? String(exp.start_date).slice(0, 10) : exp.startDate ? String(exp.startDate).slice(0, 10) : "";
  const initialEnd = exp.end_date ? String(exp.end_date).slice(0, 10) : exp.endDate ? String(exp.endDate).slice(0, 10) : "";

  const categorySelect = el("select", {}, [
    el("option", { value: "work", text: "Experiencia laboral" }),
    el("option", { value: "academic", text: "Experiencia académica" }),
    el("option", { value: "pre_graduate", text: "Experiencia pre-egreso (vida universitaria)" }),
  ]);
  categorySelect.value = currentCategory;

  const positionInput = el("input", { type: "text", placeholder: "Puesto o Rol desempeñado", value: exp.position || "" });
  const orgInput = el("input", { type: "text", placeholder: "Organización, Empresa o Institución", value: exp.organization || "" });

  const formatSelect = el("select", {}, [
    el("option", { value: "day", text: "Día / Mes / Año" }),
    el("option", { value: "month", text: "Mes / Año" }),
  ]);
  formatSelect.value = initialFormat;

  const startDateInput = el("input", { type: "date", value: initialStart });
  const endDateInput = el("input", { type: "date", value: initialEnd });

  const startMonthYear = createMonthYearControl(initialStart);
  const endMonthYear = createMonthYearControl(initialEnd);

  function updateDateMinConstraint() {
    if (startDateInput.value) {
      endDateInput.min = startDateInput.value;
      if (endDateInput.value && endDateInput.value < startDateInput.value) {
        endDateInput.value = "";
      }
    } else {
      endDateInput.removeAttribute("min");
    }
  }

  function updateEndMonthYearLimits() {
    const startY = Number(startMonthYear.yearSelect.value);
    const startM = Number(startMonthYear.monthSelect.value);
    const currentEndY = Number(endMonthYear.yearSelect.value);

    // 1. Ocultar años menores al año de inicio en el selector de fin
    for (const opt of endMonthYear.yearSelect.options) {
      if (!opt.value) continue;
      const optY = Number(opt.value);
      if (startY && optY < startY) {
        opt.hidden = true;
        opt.disabled = true;
      } else {
        opt.hidden = false;
        opt.disabled = false;
      }
    }
    if (startY && currentEndY && currentEndY < startY) {
      endMonthYear.yearSelect.value = "";
    }

    // 2. Ocultar meses menores si el año de fin es igual al año de inicio
    const endY = Number(endMonthYear.yearSelect.value);
    for (const opt of endMonthYear.monthSelect.options) {
      if (!opt.value) continue;
      const optM = Number(opt.value);
      if (startY && endY && endY === startY && startM && optM < startM) {
        opt.hidden = true;
        opt.disabled = true;
      } else {
        opt.hidden = false;
        opt.disabled = false;
      }
    }
    if (startY && endY && endY === startY && startM && Number(endMonthYear.monthSelect.value) < startM) {
      endMonthYear.monthSelect.value = "";
    }
  }

  startDateInput.addEventListener("change", updateDateMinConstraint);
  startDateInput.addEventListener("input", updateDateMinConstraint);

  startMonthYear.yearSelect.addEventListener("change", updateEndMonthYearLimits);
  startMonthYear.monthSelect.addEventListener("change", updateEndMonthYearLimits);
  endMonthYear.yearSelect.addEventListener("change", updateEndMonthYearLimits);

  updateDateMinConstraint();
  updateEndMonthYearLimits();

  function syncVisibility(mode, syncValues = false) {
    if (mode === "month") {
      if (syncValues) {
        if (startDateInput.value) startMonthYear.setFromIso(startDateInput.value);
        if (endDateInput.value) endMonthYear.setFromIso(endDateInput.value);
      }
      startDateInput.hidden = true;
      endDateInput.hidden = true;
      startMonthYear.wrapper.hidden = false;
      endMonthYear.wrapper.hidden = false;
    } else {
      if (syncValues) {
        const startIso = startMonthYear.getIsoDate();
        if (startIso && (!startDateInput.value || startDateInput.value.slice(0, 7) !== startIso.slice(0, 7))) {
          startDateInput.value = startIso;
        }
        const endIso = endMonthYear.getIsoDate();
        if (endIso && (!endDateInput.value || endDateInput.value.slice(0, 7) !== endIso.slice(0, 7))) {
          endDateInput.value = endIso;
        }
      }
      startDateInput.hidden = false;
      endDateInput.hidden = false;
      startMonthYear.wrapper.hidden = true;
      endMonthYear.wrapper.hidden = true;
    }
    updateDateMinConstraint();
    updateEndMonthYearLimits();
  }

  syncVisibility(initialFormat, false);

  formatSelect.addEventListener("change", () => {
    syncVisibility(formatSelect.value, true);
  });

  const descInput = el("textarea", { placeholder: "Descripción de actividades, logros y responsabilidades..." });
  descInput.value = exp.description || "";

  const removeBtn = el("button", { type: "button", class: "btn btn-danger", text: "Eliminar" });
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "Tipo de experiencia" }), categorySelect]));
  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "Puesto o Rol" }), positionInput]));
  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "Organización o Empresa" }), orgInput]));
  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "Formato de fecha" }), formatSelect]));
  row.appendChild(
    el("div", { class: "form-group" }, [
      el("label", { text: "Inicio" }),
      startDateInput,
      startMonthYear.wrapper,
    ])
  );
  row.appendChild(
    el("div", { class: "form-group" }, [
      el("label", { text: "Fin (vacio si es actual)" }),
      endDateInput,
      endMonthYear.wrapper,
    ])
  );
  row.appendChild(el("div", { class: "form-group" }, [el("label", { text: "Descripción" }), descInput]));
  row.appendChild(removeBtn);

  row._getData = () => {
    const mode = formatSelect.value === "month" ? "month" : "day";
    const startDate = mode === "month" ? startMonthYear.getIsoDate() : startDateInput.value || null;
    const endDate = mode === "month" ? endMonthYear.getIsoDate() : endDateInput.value || null;
    const incompleteDate =
      mode === "month" && (startMonthYear.isIncomplete() || endMonthYear.isIncomplete());

    return {
      category: categorySelect.value,
      position: positionInput.value.trim(),
      organization: orgInput.value.trim(),
      dateFormat: mode,
      startDate,
      endDate,
      isCurrent: !endDate,
      description: descInput.value.trim() || null,
      _incompleteDate: incompleteDate,
    };
  };

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

  const formationSelect = el("select", {}, [
    el("option", { value: "doctorate", text: "Doctorado" }),
    el("option", { value: "master", text: "Maestría" }),
    el("option", { value: "specialty", text: "Especialidad" }),
    el("option", { value: "diploma", text: "Diplomado" }),
    el("option", { value: "bachelor", text: "Licenciatura" }),
    el("option", { value: "courses", text: "Cursos / Certificaciones" }),
    el("option", { value: "other", text: "Otros" }),
  ]);
  formationSelect.value = cert.formation_type || cert.formationType || "courses";

  const titleInput = el("input", {
    type: "text",
    placeholder: "Ej: Licenciatura en Informática / Maestría en Software",
    value: cert.title || "",
  });
  const issuerInput = el("input", {
    type: "text",
    placeholder: "Ej: Universidad Autónoma Juan Misael Saracho / Coursera",
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
          "Archivo digital cargado. Recuerda hacer clic en 'Guardar formación académica' al finalizar.",
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
      el("div", { class: "form-group" }, [el("label", { text: "Nivel / Categoría académica *" }), formationSelect]),
      el("div", { class: "form-group" }, [el("label", { text: "Título, Grado o Certificado *" }), titleInput]),
      el("div", { class: "form-group" }, [el("label", { text: "Institución emisora" }), issuerInput]),
      el("div", { class: "form-group" }, [el("label", { text: "Fecha de emisión / obtención" }), issueDateInput]),
      el("div", { class: "form-group" }, [el("label", { text: "URL de credencial (opcional)" }), credentialUrlInput]),
    ])
  );

  row.appendChild(
    el("div", { class: "form-group certificate-upload-box" }, [
      el("label", { text: "Certificado o Título en digital (PDF o imagen) - Opcional" }),
      el("div", { class: "certificate-upload-controls" }, [uploadBtn, fileStatus, fileInput]),
    ])
  );

  row.appendChild(el("div", { class: "certificate-row-footer" }, [removeBtn]));

  row._getData = () => ({
    formationType: formationSelect.value,
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

  fillProfileForm(graduate, user);
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
    [allTechnologies, allSoftSkills, allLanguages] = await Promise.all([
      api.catalogs.technologies(),
      api.catalogs.softSkills(),
      api.catalogs.languages(),
    ]);
  } catch {
    allTechnologies = [];
    allSoftSkills = [];
    allLanguages = [];
  }

  renderChips(document.getElementById("technologiesChips"), allTechnologies, selectedTechnologies);
  renderChips(document.getElementById("softSkillsChips"), allSoftSkills, selectedSoftSkills);

  // --- Redes profesionales dinámicas ---
  const addSocialBtn = document.getElementById("addSocialLinkBtn");
  const socialList = document.getElementById("socialLinksList");
  if (addSocialBtn && socialList) {
    addSocialBtn.addEventListener("click", () => {
      socialList.appendChild(socialLinkRow({ type: "linkedin", url: "" }));
    });
  }

  // --- Informacion general ---
  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert(generalAlert);

    const phone = document.getElementById("contactPhone").value.trim();
    const personalEmail = document.getElementById("personalEmail").value.trim();
    const institutionalEmail = document.getElementById("institutionalEmail").value.trim() || null;

    if (!phone) {
      showAlert(generalAlert, "El número de teléfono / WhatsApp es obligatorio.");
      return;
    }
    if (!personalEmail) {
      showAlert(generalAlert, "El correo personal / profesional es obligatorio.");
      return;
    }

    const socialRows = [...socialList.children].map((row) => row._getData && row._getData()).filter(Boolean);

    try {
      await api.profile.update({
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        graduationYear: Number(document.getElementById("graduationYear").value) || undefined,
        currentRole: document.getElementById("currentRole").value || null,
        professionalSummary: document.getElementById("professionalSummary").value || null,
        phone,
        personalEmail,
        institutionalEmail,
        professionalLinks: socialRows,
        technologyIds: [...selectedTechnologies],
        softSkillIds: [...selectedSoftSkills],
      });
      showAlert(generalAlert, "Información general y canales de contacto guardados.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudo guardar la información.");
    }
  });

  // --- Habilidades tecnicas / habilidades personales ---
  document.getElementById("saveTechnologiesBtn").addEventListener("click", async () => {
    try {
      await api.profile.setTechnologies([...selectedTechnologies]);
      showAlert(generalAlert, "Habilidades técnicas guardadas.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudieron guardar las habilidades técnicas.");
    }
  });

  document.getElementById("saveSoftSkillsBtn").addEventListener("click", async () => {
    try {
      await api.profile.setSoftSkills([...selectedSoftSkills]);
      showAlert(generalAlert, "Habilidades personales guardadas.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudieron guardar las habilidades personales.");
    }
  });

  // --- Idiomas ---
  const languagesList = document.getElementById("languagesList");
  const addLanguageBtn = document.getElementById("addLanguageBtn");
  const saveLanguagesBtn = document.getElementById("saveLanguagesBtn");

  if (languagesList) {
    const existingLangs = graduate.languages || [];
    if (existingLangs.length > 0) {
      for (const lang of existingLangs) {
        languagesList.appendChild(languageRow(lang));
      }
    } else {
      languagesList.appendChild(languageRow({}));
    }

    addLanguageBtn?.addEventListener("click", () => {
      languagesList.appendChild(languageRow({}));
    });

    saveLanguagesBtn?.addEventListener("click", async () => {
      clearAlert(generalAlert);
      const rowsData = [...languagesList.children].map((row) => row._getData()).filter(Boolean);
      const uniqueLangs = new Set();
      for (const item of rowsData) {
        if (uniqueLangs.has(item.languageId)) {
          showAlert(generalAlert, "No puedes agregar el mismo idioma más de una vez.");
          return;
        }
        uniqueLangs.add(item.languageId);
      }

      try {
        await api.profile.setLanguages(rowsData);
        showAlert(generalAlert, "Idiomas guardados exitosamente.", "success");
      } catch (err) {
        showAlert(generalAlert, err.message || "No se pudieron guardar los idiomas.");
      }
    });
  }

  // --- Experiencias (Laboral, Académica y Pre-egreso) ---
  const workList = document.getElementById("experiencesWorkList");
  const academicList = document.getElementById("experiencesAcademicList");
  const preGraduateList = document.getElementById("experiencesPreGraduateList");

  for (const exp of graduate.experiences || []) {
    const cat = exp.category || "work";
    if (cat === "academic") {
      academicList.appendChild(experienceRow(exp, "academic"));
    } else if (cat === "pre_graduate") {
      preGraduateList.appendChild(experienceRow(exp, "pre_graduate"));
    } else {
      workList.appendChild(experienceRow(exp, "work"));
    }
  }

  document.getElementById("addWorkExpBtn").addEventListener("click", () => {
    workList.appendChild(experienceRow({}, "work"));
  });
  document.getElementById("addAcademicExpBtn").addEventListener("click", () => {
    academicList.appendChild(experienceRow({}, "academic"));
  });
  document.getElementById("addPreGraduateExpBtn").addEventListener("click", () => {
    preGraduateList.appendChild(experienceRow({}, "pre_graduate"));
  });

  document.getElementById("saveExperiencesBtn").addEventListener("click", async () => {
    clearAlert(generalAlert);
    const allRows = [
      ...workList.children,
      ...academicList.children,
      ...preGraduateList.children,
    ];
    const rawRows = allRows.map((row) => row._getData());
    const nonEmptyRows = rawRows.filter(
      (exp) => exp.position || exp.organization || exp.startDate || exp.endDate || exp.description || exp._incompleteDate
    );

    for (const exp of nonEmptyRows) {
      if (!exp.position || !exp.organization) {
        showAlert(generalAlert, "En cada experiencia debes indicar tanto el puesto o rol como la organización.");
        return;
      }
      if (exp._incompleteDate) {
        showAlert(generalAlert, "Si usas el formato Mes / Año en experiencia, debes seleccionar tanto el mes como el año.");
        return;
      }
      if (exp.startDate && exp.endDate && exp.endDate < exp.startDate) {
        showAlert(generalAlert, "La fecha de fin no puede ser anterior a la fecha de inicio en la experiencia.");
        return;
      }
    }

    const experiences = nonEmptyRows.map(({ _incompleteDate, ...rest }) => rest);
    try {
      await api.profile.setExperiences(experiences);
      showAlert(generalAlert, "Experiencias guardadas correctamente.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudieron guardar las experiencias.");
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
      showAlert(generalAlert, "Formación académica guardada.", "success");
    } catch (err) {
      showAlert(generalAlert, err.message || "No se pudo guardar la formación académica.");
    }
  });

  // --- Modal de Cambio de Contraseña ---
  const changePasswordModal = document.getElementById("changePasswordModal");
  const openPasswordModalBtn = document.getElementById("openPasswordModalBtn");
  const closePasswordModalBtn = document.getElementById("closePasswordModalBtn");
  const cancelPasswordBtn = document.getElementById("cancelPasswordBtn");
  const passwordForm = document.getElementById("changePasswordForm");
  const passwordAlert = document.getElementById("passwordAlert");
  const changePasswordBtn = document.getElementById("changePasswordBtn");

  const closePasswordModal = () => {
    if (changePasswordModal) {
      changePasswordModal.hidden = true;
      clearAlert(passwordAlert);
      passwordForm?.reset();
    }
  };

  openPasswordModalBtn?.addEventListener("click", () => {
    clearAlert(passwordAlert);
    passwordForm?.reset();
    if (changePasswordModal) changePasswordModal.hidden = false;
  });

  closePasswordModalBtn?.addEventListener("click", closePasswordModal);
  cancelPasswordBtn?.addEventListener("click", closePasswordModal);

  changePasswordModal?.addEventListener("click", (e) => {
    if (e.target === changePasswordModal) closePasswordModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && changePasswordModal && !changePasswordModal.hidden) {
      closePasswordModal();
    }
  });

  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAlert(passwordAlert);

      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmNewPassword = document.getElementById("confirmNewPassword").value;

      if (newPassword !== confirmNewPassword) {
        showAlert(passwordAlert, "La nueva contraseña y su confirmación no coinciden.");
        return;
      }

      if (newPassword.length < 8) {
        showAlert(passwordAlert, "La nueva contraseña debe tener al menos 8 caracteres.");
        return;
      }

      changePasswordBtn.disabled = true;
      changePasswordBtn.textContent = "Actualizando...";

      try {
        await api.auth.changePassword({ currentPassword, newPassword });
        showAlert(passwordAlert, "Contraseña actualizada exitosamente.", "success");
        passwordForm.reset();
        setTimeout(() => {
          closePasswordModal();
          showAlert(generalAlert, "Contraseña actualizada exitosamente.", "success");
        }, 1500);
      } catch (err) {
        showAlert(passwordAlert, err.message || "No se pudo actualizar la contraseña.");
      } finally {
        changePasswordBtn.disabled = false;
        changePasswordBtn.textContent = "Actualizar contraseña";
      }
    });
  }

  // --- Modal y Exportación de CV en PDF ---
  const cvPreviewModal = document.getElementById("cvPreviewModal");
  const closeCvModalBtn = document.getElementById("closeCvModalBtn");
  const printCvBtn = document.getElementById("printCvBtn");
  const cvSheetContainer = document.getElementById("cvSheetContainer");
  const exportCvBtn = document.getElementById("exportCvBtn");

  if (exportCvBtn && cvPreviewModal) {
    const closeCv = () => {
      cvPreviewModal.hidden = true;
    };

    exportCvBtn.addEventListener("click", async () => {
      const originalText = exportCvBtn.textContent;
      try {
        exportCvBtn.disabled = true;
        exportCvBtn.textContent = "Cargando CV...";
        clearAlert(generalAlert);
        const freshGraduate = await api.profile.get();
        if (window.buildFormalCvHtml) {
          cvSheetContainer.innerHTML = window.buildFormalCvHtml(freshGraduate);
        } else {
          cvSheetContainer.innerHTML = "<p>No se pudo inicializar el generador de CV.</p>";
        }
        cvPreviewModal.hidden = false;
      } catch (err) {
        showAlert(generalAlert, "Error al generar vista de CV: " + (err.message || err));
      } finally {
        exportCvBtn.disabled = false;
        exportCvBtn.textContent = originalText;
      }
    });

    closeCvModalBtn?.addEventListener("click", closeCv);

    cvPreviewModal.addEventListener("click", (e) => {
      if (e.target === cvPreviewModal) closeCv();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !cvPreviewModal.hidden) closeCv();
    });

    printCvBtn?.addEventListener("click", () => {
      document.body.classList.add("cv-printing");
      window.print();
    });
    window.addEventListener("afterprint", () => {
      document.body.classList.remove("cv-printing");
    });
  }

  // --- Estado de Verificación de Correo ---
  const emailVerificationStatusBox = document.getElementById("emailVerificationStatusBox");
  if (emailVerificationStatusBox) {
    if (user.emailVerified) {
      emailVerificationStatusBox.innerHTML = `
        <span class="email-verified-pill" title="Tu correo electrónico está verificado">
          <svg viewBox="0 0 20 20" fill="none" class="verified-icon" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;">
            <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0z" fill="#10b981"/>
            <path d="M6 10.2l2.6 2.6L14.2 7" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Correo verificado
        </span>
      `;
    } else {
      const verifyBtn = el("button", {
        type: "button",
        class: "btn btn-secondary",
        style: "display: inline-flex; align-items: center; gap: 6px;",
        text: "✉️ Verificar correo",
      });
      verifyBtn.addEventListener("click", async () => {
        try {
          verifyBtn.disabled = true;
          verifyBtn.textContent = "Enviando...";
          clearAlert(generalAlert);
          const res = await api.auth.requestEmailVerification();
          showAlert(generalAlert, res.message || "Se envió el correo de verificación.", "success");
        } catch (err) {
          showAlert(generalAlert, "Error al solicitar verificación: " + (err.message || err));
        } finally {
          verifyBtn.disabled = false;
          verifyBtn.textContent = "✉️ Reenviar verificación";
        }
      });
      emailVerificationStatusBox.innerHTML = "";
      emailVerificationStatusBox.appendChild(verifyBtn);
    }
  }
});
