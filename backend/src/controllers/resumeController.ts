/**
 * Resume Controller
 * Handles HTTP requests related to resume operations
 */

import { Request, Response } from 'express';
import { parseResumeFileWithText } from '../services/resumeParser';
import { optimizeResume } from '../services/resumeOptimizer';
import { generateDocxBuffer } from '../services/resumeGenerator';
import { generateUpdatedDocxBuffer } from '../services/docxUpdater';
import { deleteUploadedFile, registerFile, getFilePathById, deleteFileById } from '../utils/fileUpload';
import { Resume, OptimizedResume, JobDescription, ResumeGenerationRequest } from '../types';

/**
 * POST /resume/upload
 * Upload and parse a resume file (PDF or DOCX)
 *
 * Request:
 * - File: multipart/form-data with "resume" field
 *
 * Response:
 * - { success: true, data: Resume, fileId: string, fileName: string }
 * - { success: false, error: string }
 *
 * NOTE: File is kept on server for later use in /resume/generate-from-docx
 * Use fileId parameter in subsequent requests to update original file
 */
export const uploadResume = async (
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
    const originalName = req.file.originalname;

    console.log(`Parsing resume file: ${originalName}`);

    // Parse resume file and get raw text
    const { text: resumeText, data: parsedResume } = await parseResumeFileWithText(filePath);

    // Register file and get secure ID (doesn't expose server path)
    const fileId = registerFile(filePath, originalName);

    // NOTE: Don't delete file - keep it for generating updated version
    // File will be stored on server for later use in generate-from-docx

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: parsedResume,
      resumeText: resumeText, // Return raw text for ATS keyword matching
      fileId: fileId, // Return secure file ID instead of path
      fileName: originalName,
    });
  } catch (error) {
    console.error('Error in uploadResume:', error);

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
      error: error instanceof Error ? error.message : 'Failed to parse resume',
    });
  }
};

/**
 * POST /resume/generate
 * Generate an optimized resume based on job description
 *
 * Request body:
 * {
 *   resume: Resume,
 *   jobDescription: JobDescription,
 *   optimizationType?: 'ats' | 'recruiter' | 'balanced'
 * }
 *
 * Response:
 * - File download stream with generated DOCX
 * - { success: false, error: string }
 *
 * TODO: Add support for:
 * - Multiple optimization strategies
 * - Resume templates selection
 * - Custom styling options
 * - Batch generation (multiple JDs)
 */
export const generateOptimizedResume = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resume, jobDescription, optimizationType = 'ats' } =
      req.body as ResumeGenerationRequest;

    // Validate input
    if (!resume || !jobDescription) {
      res.status(400).json({
        success: false,
        error: 'Missing resume or job description data',
      });
      return;
    }

    console.log(
      `Generating optimized resume for role: ${jobDescription.roleTitle}`
    );

    // Optimize resume
    const optimizedResume = await optimizeResume(resume, jobDescription);

    // Generate DOCX file
    const docxBuffer = await generateDocxBuffer(optimizedResume);

    // Set response headers for file download
    // Clean filename: remove special characters and spaces
    const cleanRoleTitle = jobDescription.roleTitle
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .trim();
    
    const fileName = `Resume_${cleanRoleTitle || 'Resume'}_${Date.now()}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', docxBuffer.length);

    // Send file as response
    res.send(docxBuffer);
  } catch (error) {
    console.error('Error in generateOptimizedResume:', error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate resume',
    });
  }
};

/**
 * POST /resume/generate-from-docx
 * Generate an optimized resume by updating the original DOCX file
 * This preserves the original file's formatting and structure!
 *
 * Request body:
 * {
 *   resume: Resume,
 *   jobDescription: JobDescription,
 *   fileId: string (returned from /resume/upload),
 *   optimizationType?: 'ats' | 'recruiter' | 'balanced'
 * }
 *
 * Response:
 * - File download (updated DOCX with same structure as original)
 * - { success: false, error: string }
 *
 * ADVANTAGE: Preserves original formatting, colors, fonts, and layout!
 */
export const generateOptimizedResumeFromDocx = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      resume,
      jobDescription,
      fileId,
      optimizationType = 'ats',
    } = req.body as ResumeGenerationRequest & { fileId: string };

    // Validate input
    if (!resume || !jobDescription || !fileId) {
      res.status(400).json({
        success: false,
        error: 'Missing resume, job description, or file ID',
      });
      return;
    }

    // Get file path from secure ID
    const originalDocxPath = getFilePathById(fileId);
    if (!originalDocxPath) {
      res.status(404).json({
        success: false,
        error: 'Original file not found or has expired. Please upload again.',
      });
      return;
    }

    console.log(
      `Generating optimized resume from DOCX for role: ${jobDescription.roleTitle}`
    );

    // Store original job title before optimization
    const originalJobTitle = resume.jobTitle;

    // Optimize resume
    const optimizedResume = await optimizeResume(resume, jobDescription);

    // Generate updated DOCX from original file (preserves formatting & tailors to JD!)
    const docxBuffer = await generateUpdatedDocxBuffer(
      originalDocxPath,
      optimizedResume,
      jobDescription,
      originalJobTitle  // Pass original job title for replacement
    );

    // Set response headers for file download
    const cleanRoleTitle = jobDescription.roleTitle
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .trim();

    const fileName = `Resume_${cleanRoleTitle || 'Resume'}_${Date.now()}.docx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', docxBuffer.length);

    // Send file as response
    res.send(docxBuffer);

    // Optionally clean up file after download (uncomment in production)
    // await deleteFileById(fileId);
  } catch (error) {
    console.error('Error in generateOptimizedResumeFromDocx:', error);

    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to generate resume',
    });
  }
};

/**
 * POST /resume/optimize
 * Get optimization suggestions without generating a file
 *
 * Request body:
 * {
 *   resume: Resume,
 *   jobDescription: JobDescription
 * }
 *
 * Response:
 * - { success: true, data: OptimizedResume }
 * - { success: false, error: string }
 *
 * TODO: Add:
 * - Detailed improvement suggestions with explanations
 * - Interactive optimization (user can choose which suggestions to apply)
 * - Side-by-side comparison views
 */
export const optimizeResumeData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resume, jobDescription } = req.body as {
      resume: Resume;
      jobDescription: JobDescription;
    };

    // Validate input
    if (!resume || !jobDescription) {
      res.status(400).json({
        success: false,
        error: 'Missing resume or job description data',
      });
      return;
    }

    console.log('Optimizing resume data');

    // Optimize resume
    const optimizedResume = await optimizeResume(resume, jobDescription);

    res.status(200).json({
      success: true,
      message: 'Resume optimized successfully',
      data: optimizedResume,
    });
  } catch (error) {
    console.error('Error in optimizeResumeData:', error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to optimize resume',
    });
  }
};

/**
 * POST /resume/check-ats
 * Simple ATS keyword check - compares resume text against JD keywords
 * This endpoint doesn't require full resume parsing, just text comparison
 *
 * Request body:
 * {
 *   resumeText: string (raw text from resume),
 *   jobDescription: JobDescription
 * }
 */
export const checkATSKeywords = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resumeText, jobDescription } = req.body as {
      resumeText: string;
      jobDescription: JobDescription;
    };

    if (!resumeText || !jobDescription) {
      res.status(400).json({
        success: false,
        error: 'Missing resume text or job description',
      });
      return;
    }

    const resumeTextLower = resumeText.toLowerCase();
    const atsKeywords = jobDescription.atsKeywords || [];

    /**
     * Check if a keyword exists as a whole word in text
     * Uses word boundary matching to avoid false positives like:
     * - "R" matching "React" or "Remote"
     * - "Gin" matching "Engineering"
     */
    const keywordExistsInText = (text: string, keyword: string): boolean => {
      // Escape special regex characters in keyword
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Create regex with word boundaries (case insensitive)
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(text);
    };

    // Find matching keywords (using word boundary matching)
    const matchingKeywords = atsKeywords.filter(keyword =>
      keywordExistsInText(resumeText, keyword)
    );

    // Find missing keywords
    const missingKeywords = atsKeywords.filter(keyword =>
      !keywordExistsInText(resumeText, keyword)
    );

    // Calculate score (simple percentage based on keyword matches)
    const keywordScore = atsKeywords.length > 0
      ? Math.round((matchingKeywords.length / atsKeywords.length) * 60)
      : 0;

    // Check for skills match (also using word boundary matching)
    const requiredSkills = jobDescription.requiredSkills?.map(s => s.name) || [];
    const matchedSkills = requiredSkills.filter(skill =>
      keywordExistsInText(resumeText, skill)
    );
    const skillScore = requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 30)
      : 15;

    // Base score for having content
    const baseScore = resumeText.length > 100 ? 10 : 5;

    const atsScore = Math.min(keywordScore + skillScore + baseScore, 100);

    /**
     * Extract job title from resume text
     * Common patterns: title appears near the top, after name, or in experience section
     */
    const extractResumeTitle = (text: string): string | null => {
      // Common job title patterns
      const titlePatterns = [
        /(?:^|\n)\s*((?:Senior|Junior|Lead|Staff|Principal|Chief)?\s*(?:Software|Frontend|Backend|Full[\s-]?Stack|Web|Mobile|DevOps|Data|ML|Cloud|Platform|Site Reliability|QA|Test)?\s*(?:Engineer|Developer|Architect|Manager|Designer|Analyst|Scientist|Administrator|Consultant|Specialist))/im,
        /(?:Professional\s+Summary|Summary|Profile|About)\s*[:\n]\s*([A-Za-z\s]+(?:Engineer|Developer|Architect|Manager|Designer|Analyst))/im,
      ];

      for (const pattern of titlePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      return null;
    };

    // Extract resume title and compare with JD role
    const resumeTitle = extractResumeTitle(resumeText);
    const jdTitle = jobDescription.roleTitle;
    let titleMatch = false;
    let titleSuggestion: string | null = null;

    if (resumeTitle && jdTitle && jdTitle !== 'Not specified') {
      // Check if titles are similar (case-insensitive comparison)
      const resumeTitleLower = resumeTitle.toLowerCase();
      const jdTitleLower = jdTitle.toLowerCase();
      
      // Check for exact match or partial match
      titleMatch = resumeTitleLower === jdTitleLower || 
                   resumeTitleLower.includes(jdTitleLower) || 
                   jdTitleLower.includes(resumeTitleLower);

      if (!titleMatch) {
        titleSuggestion = `Consider updating your job title from "${resumeTitle}" to "${jdTitle}" to better match the target role`;
      }
    } else if (jdTitle && jdTitle !== 'Not specified') {
      titleSuggestion = `Add "${jdTitle}" as your target job title in your resume header or summary`;
    }

    // Generate suggestions
    const suggestions: string[] = [];
    
    // Title suggestion first (most important)
    if (titleSuggestion) {
      suggestions.push(titleSuggestion);
    }
    
    if (missingKeywords.length > 0) {
      suggestions.push(`Add missing keywords: ${missingKeywords.slice(0, 5).join(', ')}`);
    }
    if (matchingKeywords.length < 5) {
      suggestions.push('Consider adding more relevant technical skills from the job description');
    }
    suggestions.push('Include quantifiable achievements in your experience section');

    res.status(200).json({
      success: true,
      message: 'ATS check completed',
      data: {
        atsScore,
        matchingKeywords,
        missingKeywords,
        suggestions,
        titleComparison: {
          resumeTitle: resumeTitle || 'Not detected',
          jdTitle: jdTitle || 'Not specified',
          match: titleMatch,
        },
        stats: {
          totalKeywords: atsKeywords.length,
          matchedKeywords: matchingKeywords.length,
          totalRequiredSkills: requiredSkills.length,
          matchedSkills: matchedSkills.length,
        },
      },
    });
  } catch (error) {
    console.error('Error in checkATSKeywords:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check ATS keywords',
    });
  }
};

/**
 * GET /resume/:resumeId
 * Retrieve previously parsed/stored resume
 *
 * TODO: Implement:
 * - Database storage for parsed resumes
 * - User authentication to access own resumes
 * - Resume history tracking
 */
export const getResume = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resumeId } = req.params;

    // TODO: Fetch resume from database
    // const resume = await getResumeFromDatabase(resumeId);

    res.status(200).json({
      success: true,
      message: 'Resume retrieved successfully',
      // data: resume,
    });
  } catch (error) {
    console.error('Error in getResume:', error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve resume',
    });
  }
};

/**
 * DELETE /resume/:resumeId
 * Delete a stored resume
 *
 * TODO: Implement:
 * - Database deletion
 * - File cleanup
 * - User authorization check
 */
export const deleteResume = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resumeId } = req.params;

    // TODO: Delete resume from database and files

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteResume:', error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete resume',
    });
  }
};
