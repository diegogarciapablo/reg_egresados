import { z } from "zod";

const httpUrlSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((val) => {
    if (!val || val === "") return null;
    // Permitir URLs sin protocolo anteponiendo http:// (ej: github.com/... o midominio.com)
    if (!/^https?:\/\//i.test(val) && /^[\w.-]+(\.[\w.-]+)+(:\d+)?(\/.*)?$/i.test(val)) {
      return `http://${val}`;
    }
    return val;
  })
  .refine((val) => {
    if (val === null || val === undefined) return true;
    try {
      const parsed = new URL(val);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "La URL debe ser una dirección web válida (ej: http://... o https://...)");

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha invalido (YYYY-MM-DD)");

export const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .max(72, "La contrasena no puede superar los 72 caracteres"),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(150),
  graduationYear: z.number().int().min(1950).max(2100),
  termsAccepted: z.boolean().optional().default(true),
});

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(72),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Debes ingresar tu contraseña actual"),
  newPassword: z
    .string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    .max(72, "La nueva contraseña no puede superar los 72 caracteres"),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Correo electrónico inválido").max(254),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token inválido o ausente"),
  newPassword: z
    .string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    .max(72, "La nueva contraseña no puede superar los 72 caracteres"),
});

export const professionalLinkSchema = z.object({
  type: z.enum([
    "linkedin",
    "github",
    "portfolio",
    "gitlab",
    "kaggle",
    "leetcode",
    "behance",
    "other",
  ]),
  url: httpUrlSchema,
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(150).optional(),
  graduationYear: z.number().int().min(1950).max(2100).optional(),
  currentRole: z.string().max(150).nullable().optional(),
  professionalSummary: z.string().max(1000).nullable().optional(),
  photoUrl: httpUrlSchema.nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  personalEmail: z.string().email("Correo personal invalido").max(254).nullable().optional(),
  institutionalEmail: z.string().email("Correo institucional invalido").max(254).nullable().optional(),
  professionalLinks: z.array(professionalLinkSchema).max(15).optional().default([]),
  githubUrl: httpUrlSchema.nullable().optional(),
  linkedinUrl: httpUrlSchema.nullable().optional(),
  portfolioUrl: httpUrlSchema.nullable().optional(),
  technologyIds: z.array(z.string().uuid()).max(100).optional(),
  softSkillIds: z.array(z.string().uuid()).max(100).optional(),
});

export const visibilitySchema = z.object({
  visibility: z.enum(["public", "link_only", "private"]),
});

export const technologiesSelectionSchema = z.object({
  technologyIds: z.array(z.string().uuid()).max(100),
});

export const softSkillsSelectionSchema = z.object({
  softSkillIds: z.array(z.string().uuid()).max(100),
});

export const graduateLanguageItemSchema = z.object({
  languageId: z.string().uuid("ID de idioma inválido"),
  level: z.enum(["nativo", "basico", "intermedio", "avanzado"]),
  displayOrder: z.number().int().min(0).optional(),
});

export const languagesSelectionSchema = z.object({
  languages: z.array(graduateLanguageItemSchema).max(10),
});

export const coverLetterSelectionsSchema = z.object({
  technologyIds: z.array(z.string().uuid()).max(5).default([]),
  softSkillIds: z.array(z.string().uuid()).max(5).default([]),
});

export const projectSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().max(2000).nullable().optional(),
  url: httpUrlSchema.nullable().optional(),
  repositoryUrl: httpUrlSchema.nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const projectsSelectionSchema = z.object({
  projects: z.array(projectSchema).max(20),
});

const experienceDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}(-\d{2})?$/, "Formato de fecha invalido (YYYY-MM-DD o YYYY-MM)")
  .transform((val) => (val.length === 7 ? `${val}-01` : val));

export const experienceSchema = z
  .object({
    position: z.string().min(1).max(150),
    organization: z.string().min(1).max(150),
    category: z.enum(["work", "academic", "pre_graduate"]).optional().default("work"),
    startDate: experienceDateSchema.nullable().optional(),
    endDate: experienceDateSchema.nullable().optional(),
    dateFormat: z.enum(["day", "month"]).optional().default("day"),
    isCurrent: z.boolean().optional(),
    description: z.string().max(2000).nullable().optional(),
    displayOrder: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => !data.startDate || !data.endDate || data.endDate >= data.startDate,
    { message: "La fecha de fin no puede ser anterior a la fecha de inicio" }
  );

export const experiencesSelectionSchema = z.object({
  experiences: z.array(experienceSchema).max(20),
});

const certificateFileUrlSchema = z.string().refine((val) => {
  if (/^\/api\/graduates\/certificates\/[0-9a-f-]+\/cert-[0-9a-f-]+\.(pdf|jpg|png|webp)$/i.test(val)) {
    return true;
  }
  try {
    const parsed = new URL(val);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}, "URL de certificado digital invalida");

const certificateDateSchema = z
  .preprocess((val) => (val === "" || val === undefined ? null : val), isoDateSchema.nullable().optional());

export const certificateSchema = z.object({
  title: z.string().min(1, "El nombre del certificado es obligatorio").max(150),
  formationType: z
    .enum(["doctorate", "master", "specialty", "diploma", "bachelor", "courses", "other"])
    .optional()
    .default("courses"),
  issuer: z.string().max(150).nullable().optional(),
  issueDate: certificateDateSchema,
  credentialUrl: httpUrlSchema.nullable().optional(),
  fileUrl: certificateFileUrlSchema.nullable().optional(),
  fileName: z.string().max(255).nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const certificatesSelectionSchema = z.object({
  certificates: z.array(certificateSchema).max(30),
});

export const recommendationSchema = z.object({
  authorName: z.string().min(1).max(150),
  authorRole: z.string().max(150).nullable().optional(),
  message: z.string().min(1).max(1500),
});

export const moderateRecommendationSchema = z.object({
  status: z.enum(["pending", "published", "rejected"]),
});

export const coverLetterSchema = z.object({
  fullName: z.string().min(1).max(200),
  cityCountry: z.string().max(150).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  email: z.string().email().max(254).nullable().optional(),
  sendingCity: z.string().max(100).nullable().optional(),
  sendingDate: isoDateSchema.nullable().optional(),
  recruiterName: z.string().max(150).nullable().optional(),
  recruiterRole: z.string().max(150).nullable().optional(),
  companyName: z.string().min(1).max(150),
  targetPosition: z.string().min(1).max(150),
  jobSource: z.string().max(150).nullable().optional(),
  career: z.string().max(150).nullable().optional(),
  university: z.string().max(150).nullable().optional(),
  specialty: z.string().max(100).nullable().optional(),
  relevantExperience: z.string().max(2000).nullable().optional(),
  motivation: z.string().max(2000).nullable().optional(),
  valueProposition: z.string().max(2000).nullable().optional(),
});

export const directoryQuerySchema = z
  .object({
    q: z.string().max(100).optional(),
    technology: z.string().max(240).optional(),
    year: z.coerce.number().int().min(1950).max(2100).optional(),
    yearFrom: z.coerce.number().int().min(1950).max(2100).optional(),
    yearTo: z.coerce.number().int().min(1950).max(2100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(9),
  })
  .refine(
    (data) => data.yearFrom === undefined || data.yearTo === undefined || data.yearFrom <= data.yearTo,
    { message: "El año inicial (desde) no puede ser mayor al año final (hasta)" }
  );

const FIELD_LABELS_ES = {
  // Sección Proyectos
  projects: "Proyectos",
  title: "Título",
  description: "Descripción",
  url: "URL del proyecto",
  repositoryUrl: "URL del repositorio",
  // Sección Experiencias
  experiences: "Experiencias",
  position: "Puesto / Rol",
  organization: "Empresa / Organización",
  startDate: "Fecha de inicio",
  endDate: "Fecha de fin",
  category: "Categoría de experiencia",
  // Sección Formación y certificaciones
  certificates: "Formación académica",
  formationType: "Nivel / Categoría académica",
  issuer: "Institución emisora",
  issueDate: "Fecha de emisión",
  credentialUrl: "URL de credencial",
  fileUrl: "Archivo digital adjunto",
  // Datos personales y perfil
  firstName: "Nombres",
  lastName: "Apellidos",
  graduationYear: "Año de egreso",
  currentRole: "Cargo actual",
  professionalSummary: "Resumen profesional",
  phone: "Teléfono / WhatsApp",
  personalEmail: "Correo personal",
  institutionalEmail: "Correo institucional",
  linkedinUrl: "Enlace de LinkedIn",
  githubUrl: "Enlace de GitHub",
  portfolioUrl: "Enlace de Portafolio",
  // Idiomas
  languages: "Idiomas",
  languageId: "Idioma seleccionado",
  level: "Nivel de dominio del idioma",
};

export function formatZodError(error) {
  const issues = error?.issues || [];
  if (!issues.length) return "Datos inválidos en el formulario.";

  const first = issues[0];
  let section = "";
  let itemNum = null;
  let field = "";

  for (const p of first.path) {
    if (typeof p === "string" && (p === "projects" || p === "experiences" || p === "certificates" || p === "languages")) {
      section = FIELD_LABELS_ES[p] || p;
    } else if (typeof p === "number") {
      itemNum = p + 1;
    } else if (typeof p === "string") {
      field = FIELD_LABELS_ES[p] || p;
    }
  }

  let prefix = "";
  if (section && itemNum) {
    prefix = `Campo con error: ${section} #${itemNum}` + (field ? ` (${field})` : "");
  } else if (field) {
    prefix = `Campo con error: ${field}`;
  } else {
    prefix = "Campo con error";
  }

  return `${prefix}: ${first.message}`;
}

/**
 * Middleware de Express que valida req.body contra un schema de zod
 * y devuelve 400 con el detalle específico del campo que falló.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedMessage = formatZodError(result.error);
      return res.status(400).json({
        error: formattedMessage,
        details: result.error.flatten(),
        issues: result.error.issues,
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: "Parametros invalidos", details: result.error.flatten() });
    }
    req.validatedQuery = result.data;
    next();
  };
}
