/**
 * Job Description Controller
 * Handles HTTP requests related to job description parsing
 */

import { Request, Response } from 'express';
import { parseJobDescription, parseJobDescriptionFromText } from '../services/jdParser';
import { deleteUploadedFile } from '../utils/fileUpload';
import { JobDescription } from '../types';
import { extractATSKeywords, getAllATSKeywords } from '../utils/atsKeywords';

/**
 * POST /jd/upload
 * Upload and parse a job description file (TXT)
 *
 * Request:
 * - File: multipart/form-data with "jd" field
 *
 * Response:
 * - { success: true, data: JobDescription }
 * - { success: false, error: string }
 *
 * The response includes:
 * - Role title
 * - Company name
 * - Required skills with proficiency levels
 * - Preferred skills
 * - Key responsibilities
 * - Qualifications
 * - Experience requirements
 * - ATS keywords extracted from the JD
 */
export const uploadJobDescription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check if file is uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
      return;
    }

    const filePath = req.file.path;

    console.log(`Parsing job description file: ${filePath}`);

    // Parse job description file
    const parsedJD = await parseJobDescription(filePath);

    // TODO: Store parsed JD in database with unique ID
    // const jdId = storeParseJD(parsedJD);
    // Include jdId in response for future reference

    // Clean up temporary file
    await deleteUploadedFile(filePath);

    res.status(200).json({
      success: true,
      message: 'Job description uploaded and parsed successfully',
      data: parsedJD,
    });
  } catch (error) {
    console.error('Error in uploadJobDescription:', error);

    // Clean up failed upload
    if (req.file) {
      try {
        await deleteUploadedFile(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse job description',
    });
  }
};

/**
 * POST /jd/create
 * Create a job description object from raw text
 *
 * Request body:
 * {
 *   content: string (raw job description text)
 * }
 *
 * Response:
 * - { success: true, data: JobDescription }
 * - { success: false, error: string }
 */
export const createJobDescription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { content } = req.body as { content: string };

    // Validate input
    if (!content || typeof content !== 'string' || content.trim().length < 50) {
      res.status(400).json({
        success: false,
        error: 'Invalid job description. Must be at least 50 characters.',
      });
      return;
    }

    console.log('Creating job description from raw text');

    // Parse the raw text using the same logic as file upload
    const jobDescription = parseJobDescriptionFromText(content);

    res.status(200).json({
      success: true,
      message: 'Job description created successfully',
      data: jobDescription,
    });
  } catch (error) {
    console.error('Error in createJobDescription:', error);

    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create job description',
    });
  }
};

/**
 * GET /jd/:jdId
 * Retrieve previously parsed/stored job description
 *
 * TODO: Implement:
 * - Database storage for parsed job descriptions
 * - User authentication
 * - Job description versioning
 */
export const getJobDescription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { jdId } = req.params;

    // TODO: Fetch job description from database
    // const jd = await getJobDescriptionFromDatabase(jdId);

    res.status(200).json({
      success: true,
      message: 'Job description retrieved successfully',
      // data: jd,
    });
  } catch (error) {
    console.error('Error in getJobDescription:', error);

    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to retrieve job description',
    });
  }
};

/**
 * PUT /jd/:jdId
 * Update a job description
 *
 * Request body: Partial JobDescription object
 *
 * TODO: Implement:
 * - Field-level updates
 * - Validation of updated fields
 * - Update tracking/versioning
 */
export const updateJobDescription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { jdId } = req.params;
    const updates = req.body;

    // TODO: Validate and update job description in database

    res.status(200).json({
      success: true,
      message: 'Job description updated successfully',
    });
  } catch (error) {
    console.error('Error in updateJobDescription:', error);

    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update job description',
    });
  }
};

/**
 * DELETE /jd/:jdId
 * Delete a stored job description
 *
 * TODO: Implement:
 * - Database deletion
 * - Cascade delete related data (matching results, etc.)
 * - User authorization check
 */
export const deleteJobDescription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { jdId } = req.params;

    // TODO: Delete job description from database

    res.status(200).json({
      success: true,
      message: 'Job description deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteJobDescription:', error);

    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete job description',
    });
  }
};

/**
 * POST /jd/extract-keywords
 * Extract ATS keywords from raw job description text
 *
 * Request body:
 * {
 *   content: string (raw job description text)
 * }
 *
 * Response:
 * - { success: true, data: { keywords: string[], categorized: object } }
 * - { success: false, error: string }
 */
export const extractKeywords = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { content } = req.body as { content: string };

    if (!content || typeof content !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Invalid content provided',
      });
      return;
    }

    console.log('Extracting ATS keywords from job description');

    // Extract keywords using the ATS utility
    const allKeywords = getAllATSKeywords();
    const keywords = extractATSKeywords(content, allKeywords);

    res.status(200).json({
      success: true,
      message: 'Keywords extracted successfully',
      data: { 
        keywords,
        count: keywords.length,
      },
    });
  } catch (error) {
    console.error('Error in extractKeywords:', error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract keywords',
    });
  }
};
