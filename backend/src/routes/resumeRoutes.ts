/**
 * Resume Routes
 * API endpoints for resume operations
 */

import express, { Router } from 'express';
import { resumeUpload } from '../utils/fileUpload';
import { asyncHandler } from '../middleware/errorHandler';
import {
  validate,
  resumeGenerationRequestSchema,
  resumeFromDocxRequestSchema,
} from '../middleware/validation';
import {
  uploadResume,
  generateOptimizedResume,
  generateOptimizedResumeFromDocx,
  optimizeResumeData,
  checkATSKeywords,
  getResume,
  deleteResume,
} from '../controllers/resumeController';

const router: Router = express.Router();

/**
 * POST /resume/upload
 * Upload a resume file (PDF or DOCX) for parsing
 *
 * Form data:
 * - file (multipart): PDF or DOCX file
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     personalInfo: { name, email, phone, location, profileUrl },
 *     professionalSummary: string,
 *     jobTitle: string,
 *     skills: [{ name, level, yearsOfExperience }],
 *     experience: [{ jobTitle, company, startDate, endDate, ... }],
 *     education: [{ degree, institution, graduationDate, ... }]
 *   }
 * }
 */
router.post('/upload', resumeUpload.single('resume'), asyncHandler(uploadResume));

/**
 * POST /resume/generate
 * Generate an optimized resume based on a job description
 *
 * Request body:
 * {
 *   resume: Resume,
 *   jobDescription: JobDescription,
 *   optimizationType?: 'ats' | 'recruiter' | 'balanced'
 * }
 *
 * Response: DOCX file download
 * - Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
 *
 * The response includes:
 * - Optimized professional summary aligned with JD
 * - Updated job title to match target role
 * - Rewritten experience bullets with ATS keywords
 * - Included relevant skills from JD
 * - ATS score and matching keywords
 */
router.post('/generate', validate(resumeGenerationRequestSchema), asyncHandler(generateOptimizedResume));

/**
 * POST /resume/generate-from-docx
 * Generate optimized resume by updating original DOCX file
 * This preserves the original formatting and structure!
 *
 * Request body:
 * {
 *   resume: Resume,
 *   jobDescription: JobDescription,
 *   fileId: string (from /resume/upload response)
 *   optimizationType?: 'ats' | 'recruiter' | 'balanced'
 * }
 *
 * Response: Updated DOCX file download
 * - Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
 *
 * ADVANTAGE over /generate:
 * - Preserves original file's formatting
 * - Keeps fonts, colors, layout
 * - Updates content intelligently
 * - Returns professional-looking resume
 *
 * Usage flow:
 * 1. POST /resume/upload → get fileId from response
 * 2. POST /resume/generate-from-docx with fileId → download updated DOCX
 */
router.post('/generate-from-docx', validate(resumeFromDocxRequestSchema), asyncHandler(generateOptimizedResumeFromDocx));

/**
 * POST /resume/optimize
 * Get optimization suggestions and data without generating a file
 *
 * Request body:
 * {
 *   resume: Resume,
 *   jobDescription: JobDescription
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     ...Resume,
 *     atsScore: number,
 *     matchingKeywords: string[],
 *     suggestions: string[]
 *   }
 * }
 */
router.post('/optimize', validate(resumeGenerationRequestSchema), asyncHandler(optimizeResumeData));

/**
 * POST /resume/check-ats
 * Simple ATS keyword check - just compares text without full resume parsing
 * 
 * Request body:
 * {
 *   resumeText: string,
 *   jobDescription: JobDescription
 * }
 */
router.post('/check-ats', asyncHandler(checkATSKeywords));

/**
 * GET /resume/:resumeId
 * Retrieve a previously stored resume by ID
 *
 * TODO: Implement database storage
 */
router.get('/:resumeId', asyncHandler(getResume));

/**
 * DELETE /resume/:resumeId
 * Delete a stored resume
 *
 * TODO: Implement database deletion
 */
router.delete('/:resumeId', asyncHandler(deleteResume));

export default router;
