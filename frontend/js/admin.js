let entityDefinitions = [];
let activeDefinition = null;
let editingRow = null;
let dialogMode = "edit"; // "edit" | "create"
let searchTimer = null;
let requestVersion = 0;

function slugifyClient(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCellValue(value, column) {
  if (value === null || value === undefined || value === "") return "-";
  if (column.optionLabels && column.optionLabels[value]) {
    return column.optionLabels[value];
  }
  if (column.type === "date") return String(value).slice(0, 10);
  if (column.type === "datetime") {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? String(value) : date.toLocaleString("es-BO");
  }
  if (column.type === "boolean") return value ? "Si" : "No";
  return String(value);
}

function renderCellContent(row, column) {
  const value = row[column.key];
  if (activeDefinition.key === "users" && column.key === "role") {
    const isAdmin = value === "admin";
    return el("span", {
      class: `badge ${isAdmin ? "badge-public" : "badge-private"}`,
      text: formatCellValue(value, column),
    });
  }
  if (column.type === "file_link" && value && String(value).startsWith("/api/graduates/certificates/")) {
    return el("a", {
      href: String(value),
      target: "_blank",
      rel: "noopener noreferrer",
      class: "certificate-file-link",
      text: "Ver documento",
    });
  }
  if (column.type === "url" && value && /^https?:\/\//i.test(String(value))) {
    return el("a", {
      href: String(value),
      target: "_blank",
      rel: "noopener noreferrer",
      class: "certificate-file-link",
      text: "Abrir enlace",
    });
  }
  return formatCellValue(value, column);
}

function entityFromUrl() {
  return new URLSearchParams(window.location.search).get("entity");
}

function renderEntityTabs() {
  const tabsContainer = document.getElementById("entityTabs");
  if (!tabsContainer) return;
  tabsContainer.replaceChildren();

  for (const def of entityDefinitions) {
    const isSelected = activeDefinition && activeDefinition.key === def.key;
    const chip = el("button", {
      type: "button",
      class: `chip ${isSelected ? "selected" : ""}`,
      text: def.label,
    });
    chip.addEventListener("click", () => {
      clearAlert(document.getElementById("adminAlert"));
      selectEntity(def.key);
    });
    tabsContainer.appendChild(chip);
  }
}

function selectEntity(entity) {
  const definition = entityDefinitions.find((item) => item.key === entity);
  activeDefinition = definition || entityDefinitions[0];
  if (!activeDefinition) return;

  const url = new URL(window.location.href);
  url.searchParams.set("entity", activeDefinition.key);
  window.history.replaceState({}, "", url);
  document.getElementById("entityTitle").textContent = `Seccion actual: ${activeDefinition.label}`;
  document.getElementById("tableTitle").textContent = activeDefinition.label;
  document.getElementById("entitySearch").value = "";

  const createBtn = document.getElementById("createEntityBtn");
  if (activeDefinition.creatable) {
    createBtn.hidden = false;
    createBtn.textContent = `+ Agregar ${activeDefinition.singularLabel || "registro"}`;
  } else {
    createBtn.hidden = true;
  }

  renderEntityTabs();
  loadEntityRows();
}

function renderTable(rows) {
  const head = document.getElementById("entityTableHead");
  const body = document.getElementById("entityTableBody");
  const emptyState = document.getElementById("emptyState");
  head.replaceChildren();
  body.replaceChildren();

  for (const column of activeDefinition.columns) {
    head.appendChild(el("th", { scope: "col", text: column.label }));
  }
  head.appendChild(el("th", { scope: "col", class: "admin-actions-heading", text: "Estado / Acciones" }));

  emptyState.hidden = rows.length > 0;
  emptyState.textContent = rows.length ? "" : "No se encontraron registros.";

  for (const row of rows) {
    const tableRow = el("tr", { class: row.is_active ? "" : "admin-inactive-row" });
    for (const column of activeDefinition.columns) {
      const cellContent = renderCellContent(row, column);
      tableRow.appendChild(el("td", {}, [cellContent]));
    }

    const actionCell = el("td", { class: "admin-actions-cell" });
    const actions = el("div", { class: "admin-row-actions" });
    const switchButton = el("button", {
      type: "button",
      class: "admin-status-switch",
      role: "switch",
      "aria-checked": String(Boolean(row.is_active)),
      "aria-label": `${row.is_active ? "Deshabilitar" : "Habilitar"} registro de ${activeDefinition.label}`,
      title: row.is_active ? "Activo (clic para desactivar)" : "Inactivo (clic para activar)",
    });
    switchButton.appendChild(el("span", { class: "admin-switch-thumb" }));
    switchButton.addEventListener("click", () => toggleEntityRow(row, switchButton));

    actions.appendChild(switchButton);

    if (activeDefinition.key === "users") {
      const isAdmin = row.role === "admin";
      const roleButton = el("button", {
        type: "button",
        class: "btn btn-secondary admin-edit-button",
        text: isAdmin ? "Pasar a estandar" : "Hacer admin",
        title: isAdmin
          ? "Cambiar rol a usuario estandar"
          : "Asignar como administrador",
      });
      roleButton.addEventListener("click", () => toggleUserRole(row, roleButton));
      actions.appendChild(roleButton);
    }

    const editButton = el("button", {
      type: "button",
      class: "btn btn-secondary admin-edit-button",
      text: "Editar",
    });
    editButton.addEventListener("click", () => openEditDialog(row));
    actions.appendChild(editButton);

    actionCell.appendChild(actions);
    tableRow.appendChild(actionCell);
    body.appendChild(tableRow);
  }
}

async function loadEntityRows() {
  if (!activeDefinition) return;
  const version = ++requestVersion;
  const search = document.getElementById("entitySearch").value;
  const body = document.getElementById("entityTableBody");
  body.replaceChildren(el("tr", {}, [el("td", { colspan: String(activeDefinition.columns.length + 1), class: "muted", text: "Cargando..." })]));

  try {
    const rows = await api.admin.listEntity(activeDefinition.key, search);
    if (version !== requestVersion) return;
    renderTable(rows);
  } catch (error) {
    if (version !== requestVersion) return;
    body.replaceChildren();
    showAlert(document.getElementById("adminAlert"), error.message || "No se pudieron cargar los registros.");
  }
}

async function toggleEntityRow(row, button) {
  const nextActive = button.getAttribute("aria-checked") !== "true";
  button.disabled = true;
  clearAlert(document.getElementById("adminAlert"));
  try {
    await api.admin.setEntityActive(activeDefinition.key, row.id, nextActive);
    showAlert(document.getElementById("adminAlert"), nextActive ? "Registro habilitado." : "Registro deshabilitado.", "success");
    await loadEntityRows();
  } catch (error) {
    showAlert(document.getElementById("adminAlert"), error.message || "No se pudo cambiar el estado.");
  } finally {
    button.disabled = false;
  }
}

async function toggleUserRole(row, button) {
  const nextRole = row.role === "admin" ? "graduate" : "admin";
  button.disabled = true;
  clearAlert(document.getElementById("adminAlert"));
  try {
    await api.admin.updateEntity("users", row.id, { role: nextRole });
    showAlert(
      document.getElementById("adminAlert"),
      nextRole === "admin"
        ? `Se asigno el rol de Administrador a ${row.email}.`
        : `${row.email} ahora tiene rol de Usuario estandar.`,
      "success",
    );
    await loadEntityRows();
  } catch (error) {
    showAlert(document.getElementById("adminAlert"), error.message || "No se pudo cambiar el rol del usuario.");
  } finally {
    button.disabled = false;
  }
}

function createEditControl(field, value) {
  if (field.key === "graduation_year") {
    const select = el("select", { id: `edit-${field.key}`, name: field.key });
    const currentYear = Math.max(new Date().getFullYear(), 2026);
    for (let year = currentYear; year >= 1980; year -= 1) {
      select.appendChild(el("option", { value: String(year), text: String(year) }));
    }
    if (value) select.value = String(value);
    select.required = Boolean(field.required);
    return select;
  }

  const control = field.type === "boolean"
    ? el("input", { id: `edit-${field.key}`, name: field.key, type: "checkbox" })
    : field.type === "textarea"
      ? el("textarea", { id: `edit-${field.key}`, name: field.key, rows: "3" })
    : field.type === "select"
      ? el("select", { id: `edit-${field.key}`, name: field.key })
      : el("input", { id: `edit-${field.key}`, name: field.key, type: field.type === "number" ? "number" : field.type, ...(field.maxLength ? { maxlength: String(field.maxLength) } : {}) });

  if (field.type === "select") {
    if (field.nullable) control.appendChild(el("option", { value: "", text: "-" }));
    for (const option of field.options || []) {
      const label = (field.optionLabels && field.optionLabels[option]) || option;
      control.appendChild(el("option", { value: option, text: label }));
    }
  }

  if (field.type === "boolean") control.checked = Boolean(value);
  else control.value = field.type === "date" && value ? String(value).slice(0, 10) : (value ?? "");
  control.required = Boolean(field.required);
  return control;
}

function openCreateDialog() {
  if (!activeDefinition || !activeDefinition.creatable) return;
  dialogMode = "create";
  editingRow = null;
  const formFields = document.getElementById("editFields");
  formFields.replaceChildren();
  document.getElementById("editDialogTitle").textContent = `Agregar ${activeDefinition.singularLabel || activeDefinition.label.toLowerCase()}`;
  document.getElementById("saveEdit").textContent = "Crear registro";

  for (const field of activeDefinition.fields) {
    const control = createEditControl(field, "");
    const label = el("label", { class: "admin-form-field", for: control.id }, [
      el("span", { text: field.label }),
      control,
    ]);
    formFields.appendChild(label);
  }

  const nameInput = document.getElementById("edit-name");
  const slugInput = document.getElementById("edit-slug");
  if (nameInput && slugInput) {
    let manualSlug = false;
    slugInput.addEventListener("input", () => {
      manualSlug = slugInput.value.trim().length > 0;
    });
    nameInput.addEventListener("input", () => {
      if (!manualSlug) {
        slugInput.value = slugifyClient(nameInput.value);
      }
    });
  }

  document.getElementById("editDialog").hidden = false;
  document.getElementById("editFields").querySelector("input, select, textarea")?.focus();
}

function openEditDialog(row) {
  dialogMode = "edit";
  editingRow = row;
  const formFields = document.getElementById("editFields");
  formFields.replaceChildren();
  document.getElementById("editDialogTitle").textContent = `Editar ${activeDefinition.singularLabel || activeDefinition.label.toLowerCase()}`;
  document.getElementById("saveEdit").textContent = "Guardar cambios";

  for (const field of activeDefinition.fields) {
    const control = createEditControl(field, row[field.key]);
    const label = el("label", { class: "admin-form-field", for: control.id }, [
      el("span", { text: field.label }),
      control,
    ]);
    formFields.appendChild(label);
  }

  document.getElementById("editDialog").hidden = false;
  document.getElementById("editFields").querySelector("input, select, textarea")?.focus();
}

function closeEditDialog() {
  document.getElementById("editDialog").hidden = true;
  editingRow = null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireSession();
  if (!user) return;
  if (user.role !== "admin") {
    window.location.replace("/index.html");
    return;
  }
  await renderTopbar(user);

  try {
    entityDefinitions = await api.admin.entities();
  } catch (error) {
    showAlert(document.getElementById("adminAlert"), error.message || "No se pudo cargar la administracion.");
    return;
  }

  if (!entityDefinitions.length) {
    showAlert(document.getElementById("adminAlert"), "No hay entidades configuradas.");
    return;
  }

  selectEntity(entityFromUrl());
  document.getElementById("createEntityBtn").addEventListener("click", openCreateDialog);
  document.getElementById("entitySearch").addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadEntityRows, 180);
  });

  document.getElementById("editForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (dialogMode === "edit" && !editingRow) return;

    const payload = {};
    for (const field of activeDefinition.fields) {
      const control = document.getElementById(`edit-${field.key}`);
      if (field.type === "boolean") payload[field.key] = control.checked;
      else if (field.type === "number") payload[field.key] = control.value === "" ? null : Number(control.value);
      else payload[field.key] = control.value === "" && field.nullable ? null : control.value;
    }

    const saveButton = document.getElementById("saveEdit");
    saveButton.disabled = true;
    try {
      if (dialogMode === "create") {
        await api.admin.createEntity(activeDefinition.key, payload);
        closeEditDialog();
        showAlert(document.getElementById("adminAlert"), "Registro agregado correctamente.", "success");
      } else {
        await api.admin.updateEntity(activeDefinition.key, editingRow.id, payload);
        closeEditDialog();
        showAlert(document.getElementById("adminAlert"), "Registro actualizado.", "success");
      }
      await loadEntityRows();
    } catch (error) {
      showAlert(
        document.getElementById("adminAlert"),
        error.message || (dialogMode === "create" ? "No se pudo agregar el registro." : "No se pudo actualizar el registro."),
      );
    } finally {
      saveButton.disabled = false;
    }
  });

  document.getElementById("cancelEdit").addEventListener("click", closeEditDialog);
  document.getElementById("closeEditDialog").addEventListener("click", closeEditDialog);
  document.getElementById("editDialog").addEventListener("click", (event) => {
    if (event.target.id === "editDialog") closeEditDialog();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !document.getElementById("editDialog").hidden) closeEditDialog();
  });
});
