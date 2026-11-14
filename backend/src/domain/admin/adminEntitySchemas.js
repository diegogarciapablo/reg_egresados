import { AppError, NotFoundError } from "../../shared/errors/AppError.js";

export function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const adminEntities = {
  users: {
    label: "Usuarios",
    singularLabel: "usuario",
    table: "users",
    alias: "u",
    from: "users u",
    orderBy: "u.created_at DESC",
    updatesTimestamp: true,
    creatable: false,
    columns: [
      { key: "email", label: "Correo", sql: "u.email", type: "email", required: true, maxLength: 254 },
      {
        key: "role",
        label: "Rol",
        sql: "u.role",
        type: "select",
        required: true,
        options: ["graduate", "admin"],
        optionLabels: {
          graduate: "Usuario estandar",
          admin: "Administrador",
        },
      },
      { key: "last_login_at", label: "Ultimo acceso", sql: "u.last_login_at", type: "datetime" },
      { key: "created_at", label: "Creado", sql: "u.created_at", type: "datetime" },
    ],
  },
  technologies: {
    label: "Habilidades técnicas",
    singularLabel: "tecnologia",
    table: "technologies",
    alias: "t",
    from: "technologies t",
    orderBy: "t.name",
    creatable: true,
    columns: [
      { key: "name", label: "Nombre", sql: "t.name", type: "text", required: true, maxLength: 80 },
      { key: "slug", label: "Slug", sql: "t.slug", type: "text", required: true, maxLength: 80 },
    ],
  },
  soft_skills: {
    label: "Habilidades Personales",
    singularLabel: "habilidad personal",
    table: "soft_skills",
    alias: "s",
    from: "soft_skills s",
    orderBy: "s.name",
    creatable: true,
    columns: [
      { key: "name", label: "Nombre", sql: "t.name".replace("t.", "s."), type: "text", required: true, maxLength: 100 },
      { key: "slug", label: "Slug", sql: "s.slug", type: "text", required: true, maxLength: 100 },
    ],
  },
  graduates: {
    label: "Perfiles",
    singularLabel: "perfil",
    table: "graduates",
    alias: "g",
    from: "graduates g JOIN users u ON u.id = g.user_id",
    orderBy: "g.last_name, g.first_name",
    updatesTimestamp: true,
    creatable: false,
    columns: [
      { key: "account_email", label: "Cuenta", sql: "u.email", type: "text", editable: false },
      { key: "registration_code", label: "Codigo", sql: "g.registration_code", type: "text", required: true, maxLength: 30 },
      { key: "first_name", label: "Nombres", sql: "g.first_name", type: "text", required: true, maxLength: 100 },
      { key: "last_name", label: "Apellidos", sql: "g.last_name", type: "text", required: true, maxLength: 150 },
      { key: "current_role", label: "Cargo actual", sql: "g.current_role", type: "text", nullable: true, maxLength: 150 },
      { key: "graduation_year", label: "Año de egreso", sql: "g.graduation_year", type: "number", required: true },
      { key: "phone", label: "Teléfono / WhatsApp", sql: "g.phone", type: "text", nullable: true, maxLength: 40 },
      { key: "personal_email", label: "Correo personal", sql: "g.personal_email", type: "email", nullable: true, maxLength: 254 },
      { key: "institutional_email", label: "Correo institucional", sql: "g.institutional_email", type: "email", nullable: true, maxLength: 254 },
      { key: "professional_summary", label: "Resumen", sql: "g.professional_summary", type: "textarea", nullable: true, maxLength: 1000 },
      {
        key: "visibility",
        label: "Visibilidad",
        sql: "g.visibility",
        type: "select",
        required: true,
        options: ["public", "link_only", "private"],
        optionLabels: {
          public: "Publico",
          link_only: "Solo con enlace",
          private: "Privado",
        },
      },
      { key: "github_url", label: "GitHub", sql: "g.github_url", type: "url", nullable: true },
      { key: "linkedin_url", label: "LinkedIn", sql: "g.linkedin_url", type: "url", nullable: true },
      { key: "portfolio_url", label: "Portafolio", sql: "g.portfolio_url", type: "url", nullable: true },
      { key: "created_at", label: "Creado", sql: "g.created_at", type: "datetime" },
    ],
  },
  projects: {
    label: "Proyectos",
    singularLabel: "proyecto",
    table: "projects",
    alias: "p",
    from: "projects p JOIN graduates g ON g.id = p.graduate_id JOIN users u ON u.id = g.user_id",
    orderBy: "p.created_at DESC",
    updatesTimestamp: true,
    creatable: false,
    columns: [
      { key: "graduate", label: "Perfil", sql: "concat_ws(' ', g.first_name, g.last_name)", type: "text", editable: false },
      { key: "account_email", label: "Cuenta", sql: "u.email", type: "text", editable: false },
      { key: "title", label: "Titulo", sql: "p.title", type: "text", required: true, maxLength: 150 },
      { key: "description", label: "Descripcion", sql: "p.description", type: "textarea", nullable: true, maxLength: 2000 },
      { key: "url", label: "URL", sql: "p.url", type: "url", nullable: true },
      { key: "repository_url", label: "Repositorio", sql: "p.repository_url", type: "url", nullable: true },
      { key: "display_order", label: "Orden", sql: "p.display_order", type: "number", required: true },
      { key: "created_at", label: "Creado", sql: "p.created_at", type: "datetime" },
    ],
  },
  experiences: {
    label: "Experiencias",
    singularLabel: "experiencia",
    table: "experiences",
    alias: "e",
    from: "experiences e JOIN graduates g ON g.id = e.graduate_id JOIN users u ON u.id = g.user_id",
    orderBy: "e.start_date DESC NULLS LAST",
    creatable: false,
    columns: [
      { key: "graduate", label: "Perfil", sql: "concat_ws(' ', g.first_name, g.last_name)", type: "text", editable: false },
      { key: "account_email", label: "Cuenta", sql: "u.email", type: "text", editable: false },
      { key: "position", label: "Puesto", sql: "e.position", type: "text", required: true, maxLength: 150 },
      { key: "organization", label: "Organizacion", sql: "e.organization", type: "text", required: true, maxLength: 150 },
      {
        key: "category",
        label: "Tipo de experiencia",
        sql: "e.category",
        type: "select",
        required: true,
        options: ["work", "academic", "pre_graduate"],
        optionLabels: {
          work: "Experiencia laboral",
          academic: "Experiencia academica",
          pre_graduate: "Experiencia pre-egreso",
        },
      },
      {
        key: "date_format",
        label: "Formato fecha",
        sql: "e.date_format",
        type: "select",
        required: true,
        options: ["day", "month"],
        optionLabels: {
          day: "Dia/Mes/Año",
          month: "Mes/Año",
        },
      },
      { key: "start_date", label: "Inicio", sql: "e.start_date", type: "date", nullable: true },
      { key: "end_date", label: "Fin", sql: "e.end_date", type: "date", nullable: true },
      { key: "is_current", label: "Actual", sql: "e.is_current", type: "boolean", required: true },
      { key: "description", label: "Descripcion", sql: "e.description", type: "textarea", nullable: true, maxLength: 2000 },
      { key: "display_order", label: "Orden", sql: "e.display_order", type: "number", required: true },
    ],
  },
  certificates: {
    label: "Formacion Academica",
    singularLabel: "formacion academica",
    table: "certificates",
    alias: "ce",
    from: "certificates ce JOIN graduates g ON g.id = ce.graduate_id JOIN users u ON u.id = g.user_id",
    orderBy: "ce.created_at DESC",
    updatesTimestamp: true,
    creatable: false,
    columns: [
      { key: "graduate", label: "Perfil", sql: "concat_ws(' ', g.first_name, g.last_name)", type: "text", editable: false },
      { key: "account_email", label: "Cuenta", sql: "u.email", type: "text", editable: false },
      {
        key: "formation_type",
        label: "Nivel / Categoria",
        sql: "ce.formation_type",
        type: "select",
        required: true,
        options: ["doctorate", "master", "specialty", "diploma", "bachelor", "courses", "other"],
        optionLabels: {
          doctorate: "Doctorado",
          master: "Maestria",
          specialty: "Especialidad",
          diploma: "Diplomado",
          bachelor: "Licenciatura",
          courses: "Cursos / Certificaciones",
          other: "Otros",
        },
      },
      { key: "title", label: "Titulo o Programa", sql: "ce.title", type: "text", required: true, maxLength: 150 },
      { key: "issuer", label: "Institucion", sql: "ce.issuer", type: "text", nullable: true, maxLength: 150 },
      { key: "issue_date", label: "Fecha", sql: "ce.issue_date", type: "date", nullable: true },
      { key: "file_name", label: "Archivo digital", sql: "ce.file_name", type: "text", editable: false },
      { key: "file_url", label: "Documento", sql: "ce.file_url", type: "file_link", editable: false },
      { key: "credential_url", label: "URL credencial", sql: "ce.credential_url", type: "url", nullable: true },
      { key: "display_order", label: "Orden", sql: "ce.display_order", type: "number", required: true },
      { key: "created_at", label: "Creado", sql: "ce.created_at", type: "datetime" },
    ],
  },
  recommendations: {
    label: "Comentarios",
    singularLabel: "comentario",
    table: "recommendations",
    alias: "r",
    from: "recommendations r JOIN graduates g ON g.id = r.graduate_id JOIN users u ON u.id = g.user_id",
    orderBy: "r.created_at DESC",
    creatable: false,
    columns: [
      { key: "graduate", label: "Perfil", sql: "concat_ws(' ', g.first_name, g.last_name)", type: "text", editable: false },
      { key: "account_email", label: "Cuenta", sql: "u.email", type: "text", editable: false },
      { key: "author_name", label: "Autor", sql: "r.author_name", type: "text", required: true, maxLength: 150 },
      { key: "author_role", label: "Cargo del autor", sql: "r.author_role", type: "text", nullable: true, maxLength: 150 },
      { key: "message", label: "Mensaje", sql: "r.message", type: "textarea", required: true, maxLength: 1500 },
      {
        key: "status",
        label: "Estado",
        sql: "r.status",
        type: "select",
        required: true,
        options: ["pending", "published", "rejected"],
        optionLabels: {
          pending: "Pendiente",
          published: "Publicado",
          rejected: "Rechazado",
        },
      },
      { key: "created_at", label: "Creado", sql: "r.created_at", type: "datetime" },
    ],
  },
  cover_letters: {
    label: "Cartas de presentacion",
    singularLabel: "carta de presentacion",
    table: "cover_letters",
    alias: "c",
    from: "cover_letters c JOIN graduates g ON g.id = c.graduate_id JOIN users u ON u.id = g.user_id",
    orderBy: "c.updated_at DESC",
    updatesTimestamp: true,
    creatable: false,
    columns: [
      { key: "graduate", label: "Perfil", sql: "concat_ws(' ', g.first_name, g.last_name)", type: "text", editable: false },
      { key: "account_email", label: "Cuenta", sql: "u.email", type: "text", editable: false },
      { key: "full_name", label: "Nombre completo", sql: "c.full_name", type: "text", required: true, maxLength: 200 },
      { key: "company_name", label: "Empresa", sql: "c.company_name", type: "text", required: true, maxLength: 150 },
      { key: "target_position", label: "Puesto", sql: "c.target_position", type: "text", required: true, maxLength: 150 },
      { key: "email", label: "Correo", sql: "c.email", type: "email", nullable: true, maxLength: 254 },
      { key: "phone", label: "Telefono", sql: "c.phone", type: "text", nullable: true, maxLength: 40 },
      { key: "city_country", label: "Ciudad y pais", sql: "c.city_country", type: "text", nullable: true, maxLength: 150 },
      { key: "sending_city", label: "Ciudad de envio", sql: "c.sending_city", type: "text", nullable: true, maxLength: 100 },
      { key: "sending_date", label: "Fecha de envio", sql: "c.sending_date", type: "date", nullable: true },
      { key: "recruiter_name", label: "Reclutador", sql: "c.recruiter_name", type: "text", nullable: true, maxLength: 150 },
      { key: "recruiter_role", label: "Cargo del reclutador", sql: "c.recruiter_role", type: "text", nullable: true, maxLength: 150 },
      { key: "job_source", label: "Fuente", sql: "c.job_source", type: "text", nullable: true, maxLength: 150 },
      { key: "career", label: "Carrera", sql: "c.career", type: "text", nullable: true, maxLength: 150 },
      { key: "university", label: "Universidad", sql: "c.university", type: "text", nullable: true, maxLength: 150 },
      { key: "specialty", label: "Especialidad", sql: "c.specialty", type: "text", nullable: true, maxLength: 100 },
      { key: "relevant_experience", label: "Experiencia relevante", sql: "c.relevant_experience", type: "textarea", nullable: true, maxLength: 2000 },
      { key: "motivation", label: "Motivacion", sql: "c.motivation", type: "textarea", nullable: true, maxLength: 2000 },
      { key: "value_proposition", label: "Valor ofrecido", sql: "c.value_proposition", type: "textarea", nullable: true, maxLength: 2000 },
      {
        key: "status",
        label: "Estado",
        sql: "c.status",
        type: "select",
        required: true,
        options: ["draft", "archived"],
        optionLabels: {
          draft: "Borrador",
          archived: "Archivada",
        },
      },
      { key: "created_at", label: "Creada", sql: "c.created_at", type: "datetime" },
      { key: "updated_at", label: "Actualizada", sql: "c.updated_at", type: "datetime" },
    ],
  },
  notifications: {
    label: "Notificaciones",
    singularLabel: "notificacion",
    table: "notifications",
    alias: "n",
    from: "notifications n JOIN users u ON u.id = n.user_id",
    orderBy: "n.created_at DESC",
    creatable: false,
    readOnly: true,
    isActiveSql: "TRUE",
    columns: [
      { key: "created_at", label: "Fecha y Hora", sql: "n.created_at", type: "datetime" },
      { key: "account_email", label: "Destinatario", sql: "u.email", type: "text", editable: false },
      { key: "title", label: "Titulo", sql: "n.title", type: "text", editable: false },
      { key: "message", label: "Mensaje", sql: "n.message", type: "text", editable: false },
      { key: "type", label: "Tipo", sql: "n.type", type: "text", editable: false },
      { key: "read_status", label: "Estado", sql: "CASE WHEN n.is_read THEN 'Leida' ELSE 'No leida' END", type: "text", editable: false },
      { key: "link", label: "Enlace", sql: "n.link", type: "text", editable: false },
    ],
  },
  audit_logs: {
    label: "Registro de Auditoría",
    singularLabel: "registro de auditoría",
    table: "audit_logs",
    alias: "a",
    from: "audit_logs a",
    orderBy: "a.created_at DESC",
    creatable: false,
    columns: [
      { key: "created_at", label: "Fecha y Hora", sql: "a.created_at", type: "datetime" },
      { key: "user_email", label: "Usuario", sql: "a.user_email", type: "text" },
      { key: "user_role", label: "Rol", sql: "a.user_role", type: "text" },
      { key: "action", label: "Acción", sql: "a.action", type: "text" },
      { key: "entity_type", label: "Módulo", sql: "a.entity_type", type: "text" },
      { key: "details", label: "Detalles", sql: "a.details", type: "text" },
      { key: "before_state", label: "Estado Anterior", sql: "a.before_state::text", type: "text" },
      { key: "after_state", label: "Estado Posterior", sql: "a.after_state::text", type: "text" },
    ],
  },
};

export function getEntityConfig(entity) {
  const config = adminEntities[entity];
  if (!config) throw new NotFoundError("Entidad no encontrada");
  return config;
}

export function getEntityDefinitions() {
  return Object.entries(adminEntities).map(([key, config]) => ({
    key,
    label: config.label,
    singularLabel: config.singularLabel || config.label.toLowerCase(),
    creatable: Boolean(config.creatable),
    readOnly: Boolean(config.readOnly),
    columns: config.columns.map(({ key: columnKey, label, type, options, optionLabels }) => ({
      key: columnKey,
      label,
      type,
      options,
      optionLabels,
    })),
    fields: config.columns
      .filter((field) => field.editable !== false && !["datetime"].includes(field.type))
      .map(({ key: fieldKey, label, type, required, nullable, maxLength, options, optionLabels }) => ({
        key: fieldKey,
        label,
        type,
        required: Boolean(required),
        nullable: Boolean(nullable),
        maxLength,
        options,
        optionLabels,
      })),
  }));
}

function normalizeField(field, value) {
  if ((value === null || value === "") && field.nullable) return null;
  if (value === null || value === "") {
    if (field.required) throw new AppError(`${field.label} es obligatorio.`);
    return null;
  }
  if (field.type === "number") {
    const number = Number(value);
    if (!Number.isInteger(number)) throw new AppError(`${field.label} debe ser un numero entero.`);
    return number;
  }
  if (field.type === "boolean") {
    if (typeof value !== "boolean") throw new AppError(`${field.label} debe ser booleano.`);
    return value;
  }
  if (field.type === "select" && !field.options.includes(value)) {
    throw new AppError(`Valor no valido para ${field.label}.`);
  }
  if (typeof value !== "string") throw new AppError(`${field.label} debe ser texto.`);
  if (field.maxLength && value.length > field.maxLength) {
    throw new AppError(`${field.label} supera el maximo de ${field.maxLength} caracteres.`);
  }
  if (field.type === "email") {
    const normalizedEmail = value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new AppError("El correo no tiene un formato valido.");
    }
    return normalizedEmail;
  }
  if (field.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(`${field.label} debe tener el formato YYYY-MM-DD.`);
  }
  if (field.type === "url") {
    let parsed;
    try {
      parsed = new URL(value);
    } catch {
      throw new AppError(`${field.label} debe ser una URL valida.`);
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new AppError(`${field.label} debe usar http:// o https://.`);
    }
  }
  return value;
}

export function normalizeEntityCreate(entity, data) {
  const config = getEntityConfig(entity);
  if (!config.creatable) {
    throw new AppError(`No se permite crear registros manualmente en ${config.label}.`);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("Debes enviar los datos para crear el registro.");
  }

  const editableFields = config.columns.filter((field) => field.editable !== false && field.type !== "datetime");
  const preparedData = { ...data };
  if ("slug" in editableFields.reduce((acc, f) => ({ ...acc, [f.key]: true }), {})) {
    const rawSlug = preparedData.slug ? slugify(preparedData.slug) : slugify(preparedData.name);
    preparedData.slug = rawSlug;
  }

  const normalized = [];
  for (const field of editableFields) {
    const rawValue = typeof preparedData[field.key] === "string" ? preparedData[field.key].trim() : preparedData[field.key];
    normalized.push({ field, value: normalizeField(field, rawValue) });
  }

  return normalized;
}

export function normalizeEntityChanges(entity, changes) {
  const config = getEntityConfig(entity);
  if (config.readOnly) {
    throw new AppError(`${config.label} es de solo lectura: no se permite editar registros.`);
  }
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
    throw new AppError("Debes enviar campos para editar.");
  }

  const editableFields = config.columns.filter((field) => field.editable !== false && field.type !== "datetime");
  const normalized = [];
  for (const [key, value] of Object.entries(changes)) {
    const field = editableFields.find((candidate) => candidate.key === key);
    if (!field) throw new AppError(`No se permite editar el campo ${key}.`);
    const rawValue = key === "slug" && typeof value === "string" ? slugify(value) : value;
    normalized.push({ field, value: normalizeField(field, rawValue) });
  }
  if (!normalized.length) throw new AppError("No hay campos editables en la solicitud.");

  return normalized;
}
