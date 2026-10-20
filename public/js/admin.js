let entityDefinitions = [];
let activeDefinition = null;
let editingRow = null;
let searchTimer = null;
let requestVersion = 0;

function formatCellValue(value, type) {
  if (value === null || value === undefined || value === "") return "-";
  if (type === "date") return String(value).slice(0, 10);
  if (type === "datetime") {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? String(value) : date.toLocaleString("es-BO");
  }
  if (type === "boolean") return value ? "Si" : "No";
  return String(value);
}

function entityFromUrl() {
  return new URLSearchParams(window.location.search).get("entity");
}

function selectEntity(entity) {
  const definition = entityDefinitions.find((item) => item.key === entity);
  activeDefinition = definition || entityDefinitions[0];
  if (!activeDefinition) return;

  const url = new URL(window.location.href);
  url.searchParams.set("entity", activeDefinition.key);
  window.history.replaceState({}, "", url);
  document.getElementById("entityTitle").textContent = activeDefinition.label;
  document.getElementById("tableTitle").textContent = activeDefinition.label;
  document.getElementById("entitySearch").value = "";
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
  head.appendChild(el("th", { scope: "col", class: "admin-actions-heading", text: "Acciones" }));

  emptyState.hidden = rows.length > 0;
  emptyState.textContent = rows.length ? "" : "No se encontraron registros.";

  for (const row of rows) {
    const tableRow = el("tr", { class: row.is_active ? "" : "admin-inactive-row" });
    for (const column of activeDefinition.columns) {
      tableRow.appendChild(el("td", { text: formatCellValue(row[column.key], column.type) }));
    }

    const actionCell = el("td", { class: "admin-actions-cell" });
    const actions = el("div", { class: "admin-row-actions" });
    const switchButton = el("button", {
      type: "button",
      class: "admin-status-switch",
      role: "switch",
      "aria-checked": String(Boolean(row.is_active)),
      "aria-label": `${row.is_active ? "Deshabilitar" : "Habilitar"} registro de ${activeDefinition.label}`,
      title: row.is_active ? "Deshabilitar registro" : "Habilitar registro",
    });
    switchButton.appendChild(el("span", { class: "admin-switch-thumb" }));
    switchButton.addEventListener("click", () => toggleEntityRow(row, switchButton));

    const editButton = el("button", {
      type: "button",
      class: "btn btn-secondary admin-edit-button",
      text: "Editar",
    });
    editButton.addEventListener("click", () => openEditDialog(row));
    actions.append(switchButton, editButton);
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

function createEditControl(field, value) {
  const control = field.type === "boolean"
    ? el("input", { id: `edit-${field.key}`, name: field.key, type: "checkbox" })
    : field.type === "textarea"
      ? el("textarea", { id: `edit-${field.key}`, name: field.key, rows: "3" })
    : field.type === "select"
      ? el("select", { id: `edit-${field.key}`, name: field.key })
      : el("input", { id: `edit-${field.key}`, name: field.key, type: field.type === "number" ? "number" : field.type, ...(field.maxLength ? { maxlength: String(field.maxLength) } : {}) });

  if (field.type === "select") {
    if (field.nullable) control.appendChild(el("option", { value: "", text: "-" }));
    for (const option of field.options || []) control.appendChild(el("option", { value: option, text: option }));
  }

  if (field.type === "boolean") control.checked = Boolean(value);
  else control.value = field.type === "date" && value ? String(value).slice(0, 10) : (value ?? "");
  control.required = Boolean(field.required);
  return control;
}

function openEditDialog(row) {
  editingRow = row;
  const formFields = document.getElementById("editFields");
  formFields.replaceChildren();
  document.getElementById("editDialogTitle").textContent = `Editar ${activeDefinition.label.toLowerCase()}`;

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
  document.getElementById("entitySearch").addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadEntityRows, 180);
  });

  document.getElementById("editForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!editingRow) return;
    const changes = {};
    for (const field of activeDefinition.fields) {
      const control = document.getElementById(`edit-${field.key}`);
      if (field.type === "boolean") changes[field.key] = control.checked;
      else if (field.type === "number") changes[field.key] = control.value === "" ? null : Number(control.value);
      else changes[field.key] = control.value === "" && field.nullable ? null : control.value;
    }

    const saveButton = document.getElementById("saveEdit");
    saveButton.disabled = true;
    try {
      await api.admin.updateEntity(activeDefinition.key, editingRow.id, changes);
      closeEditDialog();
      showAlert(document.getElementById("adminAlert"), "Registro actualizado.", "success");
      await loadEntityRows();
    } catch (error) {
      showAlert(document.getElementById("adminAlert"), error.message || "No se pudo actualizar el registro.");
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