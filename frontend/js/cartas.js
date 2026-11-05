let currentLetterId = null;
let letterTechSelected = new Set();
let letterSkillSelected = new Set();
let catalogTechnologies = [];
let catalogSoftSkills = [];
let profileDefaults = {};

const MAX_POR_CATEGORIA = 2;
const MAX_TOTAL = 5;

function unirLista(lista) {
  if (lista.length === 0) return "";
  if (lista.length === 1) return lista[0];
  return lista.slice(0, -1).join(", ") + " y " + lista[lista.length - 1];
}

function valorOPlaceholder(id, placeholder) {
  const valor = document.getElementById(id).value.trim();
  return valor || `[${placeholder}]`;
}

function formatearFecha(value) {
  if (!value) return "[FECHA]";
  const [year, month, day] = value.split("-").map(Number);
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  return `${day} de ${meses[month - 1]} de ${year}`;
}

function generarCarta() {
  const nombre = valorOPlaceholder("fullName", "TU NOMBRE COMPLETO");
  const ciudadPais = valorOPlaceholder("cityCountry", "CIUDAD, PAÍS");
  const telefono = valorOPlaceholder("phone", "TELÉFONO");
  const correo = valorOPlaceholder("letterEmail", "CORREO");

  const empresa = valorOPlaceholder("companyName", "NOMBRE DE LA EMPRESA");
  const puesto = valorOPlaceholder("targetPosition", "PUESTO");
  const fuente = valorOPlaceholder("jobSource", "FUENTE DEL ANUNCIO");

  const sendingCity = valorOPlaceholder("sendingCity", "CIUDAD");
  const sendingDate = formatearFecha(document.getElementById("sendingDate").value);
  const recruiterName = document.getElementById("recruiterName").value.trim();
  const recruiterRole = document.getElementById("recruiterRole").value.trim();
  const saludo = recruiterName ? `Estimado/a ${recruiterName}:` : "Estimado/a responsable de Recursos Humanos:";

  const carrera = valorOPlaceholder("career", "CARRERA");
  const universidad = valorOPlaceholder("university", "UNIVERSIDAD");
  const specialty = document.getElementById("specialty").value.trim();
  const specialtyPhrase = specialty ? `, con especializacion en ${specialty},` : "";

  const tecnicas = catalogTechnologies
    .filter((t) => letterTechSelected.has(t.id))
    .map((t) => t.name);
  const blandas = catalogSoftSkills
    .filter((s) => letterSkillSelected.has(s.id))
    .map((s) => s.name);

  const listaTecnicas = tecnicas.length ? unirLista(tecnicas) : "[TECNOLOGÍAS/HERRAMIENTAS]";
  const listaBlandas = blandas.length ? unirLista(blandas) : "[HABILIDADES BLANDAS]";

  const experiencia = valorOPlaceholder("relevantExperience", "EXPERIENCIA/PROYECTO RELEVANTE");
  const motivacion = valorOPlaceholder("motivation", "QUÉ TE MOTIVA DE LA EMPRESA");
  const valor = valorOPlaceholder("valueProposition", "VALOR QUE OFRECES");

  return `${nombre}
${ciudadPais} | ${telefono} | ${correo}

${recruiterName ? `${recruiterName}\n${recruiterRole ? recruiterRole + "\n" : ""}${empresa}\n\n` : ""}${sendingCity}, ${sendingDate}

${saludo}

Me dirijo a usted para postular al puesto de ${puesto}, publicado en ${fuente}. Como egresado/a de ${carrera} en ${universidad}${specialtyPhrase} me interesa iniciar mi trayectoria profesional aportando mis conocimientos al equipo de ${empresa}.

Durante mi formacion desarrollé conocimientos en ${listaTecnicas}, que reforcé a través de ${experiencia}. Entre mis habilidades blandas destacan ${listaBlandas}.

Me motiva especialmente ${motivacion} y considero que puedo aportar ${valor} a su equipo.

Adjunto mi currículum con más detalle sobre mi formacion y habilidades. Quedo a su disposición para una entrevista donde pueda ampliar esta información.

Atentamente,
${nombre}`;
}

function actualizarVistaPrevia() {
  const preview = document.getElementById("letterPreview");
  if (preview) preview.textContent = generarCarta();
}

function contarSeleccionados() {
  return letterTechSelected.size + letterSkillSelected.size;
}

function renderLetterChips() {
  const techContainer = document.getElementById("letterTechChips");
  const skillContainer = document.getElementById("letterSkillChips");

  const renderGroup = (container, items, selectedSet, otherSet) => {
    container.innerHTML = "";
    for (const item of items) {
      const isSelected = selectedSet.has(item.id);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `chip ${isSelected ? "selected" : ""}`;
      chip.textContent = item.name;

      chip.addEventListener("click", (e) => {
        e.preventDefault();
        const total = selectedSet.size + otherSet.size;

        if (!selectedSet.has(item.id)) {
          if (total >= MAX_TOTAL) {
            showAlert(document.getElementById("alertBox"), `Máximo ${MAX_TOTAL} selecciones en total.`);
            return;
          }
          selectedSet.add(item.id);
        } else {
          selectedSet.delete(item.id);
        }
        clearAlert(document.getElementById("alertBox"));
        renderLetterChips();
        actualizarVistaPrevia();
      });

      container.appendChild(chip);
    }
  };

  renderGroup(techContainer, catalogTechnologies, letterTechSelected, letterSkillSelected);
  renderGroup(skillContainer, catalogSoftSkills, letterSkillSelected, letterTechSelected);
}

function letterCard(letter) {
  const card = el("div", { class: "graduate-card" });
  card.appendChild(el("h3", { text: `${letter.companyName} - ${letter.targetPosition}` }));
  card.appendChild(el("div", { class: "muted", text: letter.fullName }));
  const editBtn = el("button", { class: "btn btn-secondary", text: "Editar" });
  editBtn.addEventListener("click", async () => {
    editBtn.disabled = true;
    try {
      openEditor(await api.coverLetters.get(letter.id));
    } catch (err) {
      showAlert(document.getElementById("alertBox"), err.message || "No se pudo abrir la carta.");
    } finally {
      editBtn.disabled = false;
    }
  });
  card.appendChild(editBtn);
  return card;
}

async function loadLetters() {
  const list = document.getElementById("lettersList");
  list.innerHTML = '<p class="muted">Cargando...</p>';
  try {
    const letters = await api.coverLetters.list();
    list.innerHTML = "";
    if (letters.length === 0) {
      list.appendChild(el("div", { class: "empty-state" }, [el("p", { text: "Aun no tienes cartas creadas." })]));
      return letters;
    }
    for (const letter of letters) {
      list.appendChild(letterCard(letter));
    }
    return letters;
  } catch (err) {
    list.innerHTML = "";
    showAlert(document.getElementById("alertBox"), err.message || "No se pudieron cargar tus cartas.");
    return [];
  }
}

function fillLetterForm(letter) {
  document.getElementById("fullName").value = letter?.fullName || "";
  document.getElementById("cityCountry").value = letter?.cityCountry || "";
  document.getElementById("sendingCity").value = letter?.sendingCity || "";
  document.getElementById("sendingDate").value = letter?.sendingDate ? letter.sendingDate.slice(0, 10) : "";
  document.getElementById("phone").value = letter?.phone || "";
  document.getElementById("letterEmail").value = letter?.email || "";
  document.getElementById("companyName").value = letter?.companyName || "";
  document.getElementById("targetPosition").value = letter?.targetPosition || "";
  document.getElementById("recruiterName").value = letter?.recruiterName || "";
  document.getElementById("recruiterRole").value = letter?.recruiterRole || "";
  document.getElementById("relevantExperience").value = letter?.relevantExperience || "";
  document.getElementById("motivation").value = letter?.motivation || "";
  document.getElementById("valueProposition").value = letter?.valueProposition || "";
  document.getElementById("career").value = letter?.career || "";
  document.getElementById("university").value = letter?.university || "";
  document.getElementById("specialty").value = letter?.specialty || "";
  document.getElementById("jobSource").value = letter?.jobSource || "";
}

function openEditor(letter) {
  currentLetterId = letter?.id || null;
  fillLetterForm(letter || profileDefaults);
  letterTechSelected = new Set(letter?.technologyIds || []);
  letterSkillSelected = new Set(letter?.softSkillIds || []);
  renderLetterChips();
  document.getElementById("saveLetterBtn").textContent = currentLetterId ? "Guardar cambios" : "Guardar carta";
  document.getElementById("editorSection").style.display = "block";
  document.getElementById("editorSection").scrollIntoView({ behavior: "smooth" });
  actualizarVistaPrevia();
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireSession();
  if (!user) return;
  await renderTopbar(user);

  const alertBox = document.getElementById("alertBox");
  const letterForm = document.getElementById("letterForm");

  try {
    [catalogTechnologies, catalogSoftSkills] = await Promise.all([
      api.catalogs.technologies(),
      api.catalogs.softSkills(),
    ]);
  } catch {
    catalogTechnologies = [];
    catalogSoftSkills = [];
  }

  try {
    const graduate = await api.profile.get();
    profileDefaults = {
      fullName: [graduate.firstName, graduate.lastName].filter(Boolean).join(" "),
      email: user.email || "",
      career: "Ingenieria Informatica",
      university: "Universidad Autonoma Juan Misael Saracho",
    };
  } catch {
    profileDefaults = {
      fullName: "",
      email: user.email || "",
      career: "Ingenieria Informatica",
      university: "Universidad Autonoma Juan Misael Saracho",
    };
  }

  const letters = await loadLetters();
  if (letters.length) {
    try {
      openEditor(await api.coverLetters.get(letters[0].id));
    } catch (err) {
      showAlert(alertBox, err.message || "No se pudo abrir tu carta mas reciente.");
      openEditor(null);
    }
  } else {
    openEditor(null);
  }

  document.getElementById("newLetterBtn").addEventListener("click", () => {
    clearAlert(alertBox);
    openEditor(null);
  });

  letterForm.addEventListener("input", actualizarVistaPrevia);
  letterForm.addEventListener("change", actualizarVistaPrevia);

  letterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert(alertBox);

    const payload = {
      fullName: document.getElementById("fullName").value,
      cityCountry: document.getElementById("cityCountry").value || null,
      sendingCity: document.getElementById("sendingCity").value || null,
      sendingDate: document.getElementById("sendingDate").value || null,
      phone: document.getElementById("phone").value || null,
      email: document.getElementById("letterEmail").value || null,
      companyName: document.getElementById("companyName").value,
      targetPosition: document.getElementById("targetPosition").value,
      recruiterName: document.getElementById("recruiterName").value || null,
      recruiterRole: document.getElementById("recruiterRole").value || null,
      jobSource: document.getElementById("jobSource").value || null,
      career: document.getElementById("career").value || null,
      university: document.getElementById("university").value || null,
      specialty: document.getElementById("specialty").value || null,
      relevantExperience: document.getElementById("relevantExperience").value || null,
      motivation: document.getElementById("motivation").value || null,
      valueProposition: document.getElementById("valueProposition").value || null,
    };

    try {
      if (currentLetterId) {
        await api.coverLetters.update(currentLetterId, payload);
      } else {
        const created = await api.coverLetters.create(payload);
        currentLetterId = created.id;
      }
      await api.coverLetters.setSelections(currentLetterId, [...letterTechSelected], [...letterSkillSelected]);
      document.getElementById("saveLetterBtn").textContent = "Guardar cambios";
      showAlert(alertBox, "Carta guardada correctamente.", "success");
      await loadLetters();
    } catch (err) {
      showAlert(alertBox, err.message || "No se pudo guardar la carta.");
    }
  });

  document.getElementById("printBtn").addEventListener("click", () => {
    document.getElementById("printModal").classList.remove("hidden");
  });

  document.getElementById("cancelPrintBtn").addEventListener("click", () => {
    document.getElementById("printModal").classList.add("hidden");
  });

  document.getElementById("confirmPrintBtn").addEventListener("click", () => {
    document.getElementById("printModal").classList.add("hidden");
    window.print();
  });
});
