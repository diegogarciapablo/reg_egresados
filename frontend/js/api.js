// Modulo unico de comunicacion con el backend.
// Ninguna otra pantalla debe usar fetch() directamente: todas pasan por aqui.
// En el VPS (puerto 8084), apunta automaticamente al backend en el puerto 3004
// de la misma IP publica (ej. http://187.41.117.126:3004/api).

const API_ORIGIN =
  window.API_ORIGIN ||
  (window.location.port === "8084"
    ? `${window.location.protocol}//${window.location.hostname}:3004`
    : "");

const BASE_URL = `${API_ORIGIN}/api`;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, params } = {}) {
  let url = BASE_URL + path;

  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
    const queryString = query.toString();
    if (queryString) url += `?${queryString}`;
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(url, {
    method,
    headers: body && !isFormData ? { "Content-Type": "application/json" } : undefined,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: "include",
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message = (data && data.error) || "Ocurrio un error inesperado. Intenta de nuevo.";
    throw new ApiError(message, response.status);
  }

  return data;
}

const api = {
  auth: {
    register: (payload) => request("/auth/register", { method: "POST", body: payload }),
    login: (payload) => request("/auth/login", { method: "POST", body: payload }),
    logout: () => request("/auth/logout", { method: "POST" }),
    me: () => request("/auth/me"),
    changePassword: (payload) => request("/auth/change-password", { method: "POST", body: payload }),
  },
  directory: {
    list: (params) => request("/graduates", { params }),
    getByCode: (code) => request(`/graduates/${encodeURIComponent(code)}`),
    recommend: (id, payload) => request(`/graduates/${id}/recommendations`, { method: "POST", body: payload }),
  },
  catalogs: {
    technologies: () => request("/catalogs/technologies"),
    softSkills: () => request("/catalogs/soft-skills"),
    languages: () => request("/catalogs/languages"),
  },
  profile: {
    get: () => request("/me/profile"),
    update: (payload) => request("/me/profile", { method: "PATCH", body: payload }),
    updatePhoto: (formData) => request("/me/profile/photo", { method: "PUT", body: formData }),
    removePhoto: () => request("/me/profile/photo", { method: "DELETE" }),
    setVisibility: (visibility) => request("/me/profile/visibility", { method: "PATCH", body: { visibility } }),
    setTechnologies: (technologyIds) => request("/me/profile/technologies", { method: "PUT", body: { technologyIds } }),
    setSoftSkills: (softSkillIds) => request("/me/profile/soft-skills", { method: "PUT", body: { softSkillIds } }),
    setLanguages: (languages) => request("/me/profile/languages", { method: "PUT", body: { languages } }),
    setProjects: (projects) => request("/me/profile/projects", { method: "PUT", body: { projects } }),
    setExperiences: (experiences) => request("/me/profile/experiences", { method: "PUT", body: { experiences } }),
    uploadCertificateFile: (formData) => request("/me/profile/certificates/file", { method: "POST", body: formData }),
    setCertificates: (certificates) => request("/me/profile/certificates", { method: "PUT", body: { certificates } }),
  },
  coverLetters: {
    list: () => request("/me/cover-letters"),
    get: (id) => request(`/me/cover-letters/${id}`),
    create: (payload) => request("/me/cover-letters", { method: "POST", body: payload }),
    update: (id, payload) => request(`/me/cover-letters/${id}`, { method: "PATCH", body: payload }),
    setTechnologies: (id, technologyIds) => request(`/me/cover-letters/${id}/technologies`, { method: "PUT", body: { technologyIds } }),
    setSoftSkills: (id, softSkillIds) => request(`/me/cover-letters/${id}/soft-skills`, { method: "PUT", body: { softSkillIds } }),
    setSelections: (id, technologyIds, softSkillIds) => request(`/me/cover-letters/${id}/selections`, { method: "PUT", body: { technologyIds, softSkillIds } }),
  },
  admin: {
    entities: () => request("/admin/entities"),
    listEntity: (entity, q = "") => request(`/admin/entities/${encodeURIComponent(entity)}`, { params: { q } }),
    createEntity: (entity, data) => request(`/admin/entities/${encodeURIComponent(entity)}`, { method: "POST", body: { data } }),
    updateEntity: (entity, id, changes) => request(`/admin/entities/${encodeURIComponent(entity)}/${encodeURIComponent(id)}`, { method: "PATCH", body: { changes } }),
    setEntityActive: (entity, id, isActive) => request(`/admin/entities/${encodeURIComponent(entity)}/${encodeURIComponent(id)}/active`, { method: "PATCH", body: { isActive } }),
  },
};
