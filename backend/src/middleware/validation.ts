/**
 * Request Validation Middleware
 * Uses Zod for schema validation
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';

/**
 * Skill schema
 */
export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  yearsOfExperience: z.number().nonnegative().optional(),
});

/**
 * Experience schema
 */
export const experienceSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  startDate: z.string(),
  endDate: z.string(),
  currentlyWorking: z.boolean(),
  description: z.string(),
  responsibilities: z.array(z.string()),
  achievements: z.array(z.string()).optional(),
});

/**
 * Education schema
 */
export const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  graduationDate: z.string(),
  grade: z.string().optional(),
  details: z.string().optional(),
});

/**
 * Resume schema
 */
export const resumeSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().optional(),
    location: z.string().optional(),
    profileUrl: z.string().url().optional().or(z.literal('')),
  }),
  professionalSummary: z.string(),
  jobTitle: z.string(),
  skills: z.array(skillSchema),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  projects: z.array(z.object({
    title: z.string(),
    description: z.string(),
    technologies: z.array(z.string()).optional(),
  })).optional(),
});

/**
 * Job Description schema
 */
export const jobDescriptionSchema = z.object({
  roleTitle: z.string().min(1, 'Role title is required'),
  company: z.string(),
  description: z.string(),
  responsibilities: z.array(z.string()),
  requiredSkills: z.array(skillSchema),
  preferredSkills: z.array(skillSchema).optional(),
  atsKeywords: z.array(z.string()),
  qualifications: z.array(z.string()),
  experienceRequired: z.string().optional(),
  salaryRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
});

/**
 * Resume Generation Request schema
 */
export const resumeGenerationRequestSchema = z.object({
  resume: resumeSchema,
  jobDescription: jobDescriptionSchema,
  optimizationType: z.enum(['ats', 'recruiter', 'balanced']).optional(),
});

/**
 * Resume Generation from DOCX Request schema
 */
export const resumeFromDocxRequestSchema = resumeGenerationRequestSchema.extend({
  fileId: z.string().min(1, 'File ID is required'),
});

/**
 * JD Create Request schema
 */
export const jdCreateRequestSchema = z.object({
  content: z.string().min(50, 'Job description must be at least 50 characters'),
});

/**
 * Extract Keywords Request schema
 */
export const extractKeywordsRequestSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

/**
 * Validation middleware factory
 * @param schema - Zod schema to validate against
 * @param source - Where to find the data to validate ('body', 'query', 'params')
 * @returns Express middleware function
 */
export const validate = <T extends ZodSchema>(
  schema: T,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
};

/**
 * Type exports for use in controllers
 */
export type ResumeInput = z.infer<typeof resumeSchema>;
export type JobDescriptionInput = z.infer<typeof jobDescriptionSchema>;
export type ResumeGenerationRequestInput = z.infer<typeof resumeGenerationRequestSchema>;
export type ResumeFromDocxRequestInput = z.infer<typeof resumeFromDocxRequestSchema>;
