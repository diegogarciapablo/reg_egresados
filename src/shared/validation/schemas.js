import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(150),
  graduationYear: z.number().int().min(1950).max(2100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(150).optional(),
  currentRole: z.string().max(150).nullable().optional(),
  professionalSummary: z.string().max(1000).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  portfolioUrl: z.string().url().nullable().optional(),
});

export const visibilitySchema = z.object({
  visibility: z.enum(["public", "link_only", "private"]),
});

export const technologiesSelectionSchema = z.object({
  technologyIds: z.array(z.string().uuid()).max(10),
});

export const softSkillsSelectionSchema = z.object({
  softSkillIds: z.array(z.string().uuid()).max(10),
});

export const projectSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().max(2000).nullable().optional(),
  url: z.string().url().nullable().optional(),
  repositoryUrl: z.string().url().nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const experienceSchema = z.object({
  position: z.string().min(1).max(150),
  organization: z.string().min(1).max(150),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().max(2000).nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const recommendationSchema = z.object({
  authorName: z.string().min(1).max(150),
  authorRole: z.string().max(150).nullable().optional(),
  message: z.string().min(1).max(1500),
});

export const coverLetterSchema = z.object({
  fullName: z.string().min(1).max(200),
  cityCountry: z.string().max(150).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  email: z.string().email().nullable().optional(),
  sendingCity: z.string().max(100).nullable().optional(),
  sendingDate: z.string().nullable().optional(),
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

export const directoryQuerySchema = z.object({
  q: z.string().optional(),
  technology: z.string().optional(),
  year: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

/**
 * Middleware de Express que valida req.body contra un schema de zod
 * y devuelve 400 con el detalle si falla.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Datos invalidos", details: result.error.flatten() });
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
