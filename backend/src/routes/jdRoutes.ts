/**
 * Job Description Routes
 * API endpoints for job description operations
 */

import express, { Router } from 'express';
import { jdUpload } from '../utils/fileUpload';
import { asyncHandler } from '../middleware/errorHandler';
import {
  validate,
  jdCreateRequestSchema,
  extractKeywordsRequestSchema,
} from '../middleware/validation';
import {
  uploadJobDescription,
  createJobDescription,
  getJobDescription,
  updateJobDescription,
  deleteJobDescription,
  extractKeywords,
} from '../controllers/jdController';

const router: Router = express.Router();

/**
 * POST /jd/upload
 * Upload a job description file (TXT) for parsing
 *
 * Form data:
 * - file (multipart): Text file containing job description
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     roleTitle: string,
 *     company: string,
 *     description: string,
 *     responsibilities: string[],
 *     requiredSkills: [{ name, level }],
 *     preferredSkills: [{ name, level }],
 *     qualifications: string[],
 *     experienceRequired: string,
 *     atsKeywords: string[],
 *     salaryRange?: { min, max }
 *   }
 * }
 */
router.post('/upload', jdUpload.single('jd'), asyncHandler(uploadJobDescription));

/**
 * POST /jd/create
 * Create a job description object from raw text
 *
 * Request body:
 * {
 *   content: string (raw job description text, minimum 50 characters)
 * }
 *
 * Response: Same structure as /upload endpoint
 *
 * TODO: Implement parsing and extraction logic
 */
router.post('/create', validate(jdCreateRequestSchema), asyncHandler(createJobDescription));

/**
 * POST /jd/extract-keywords
 * Extract ATS keywords from job description text without full parsing
 *
 * Request body:
 * {
 *   content: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     keywords: string[]
 *   }
 * }
 *
 * TODO: Add keyword weighting and categorization
 */
router.post('/extract-keywords', validate(extractKeywordsRequestSchema), asyncHandler(extractKeywords));

/**
 * GET /jd/:jdId
 * Retrieve a previously stored job description by ID
 *
 * TODO: Implement database retrieval
 */
router.get('/:jdId', asyncHandler(getJobDescription));

/**
 * PUT /jd/:jdId
 * Update a stored job description
 *
 * Request body: Partial JobDescription object with fields to update
 *
 * TODO: Implement database update with validation
 */
router.put('/:jdId', asyncHandler(updateJobDescription));

/**
 * DELETE /jd/:jdId
 * Delete a stored job description
 *
 * TODO: Implement database deletion
 */
router.delete('/:jdId', asyncHandler(deleteJobDescription));

export default router;
