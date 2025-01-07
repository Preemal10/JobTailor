/**
 * Resume Parser Service
 * Handles parsing of PDF and DOCX resume files
 */

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { Resume } from '../types';
import fs from 'fs';

/**
 * Parse PDF file and extract text
 * @param filePath - Path to PDF file
 * @returns Extracted text from PDF
 */
export const parsePDFFile = async (filePath: string): Promise<string> => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(fileBuffer);

    // TODO: Implement robust text extraction from PDF
    // Current implementation uses basic text extraction
    // May need to improve structured data extraction

    return pdfData.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
};

/**
 * Parse DOCX file and extract text
 * @param filePath - Path to DOCX file
 * @returns Extracted text from DOCX
 */
export const parseDOCXFile = async (filePath: string): Promise<string> => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: fileBuffer });

    // TODO: Implement structured data extraction from DOCX
    // Current implementation uses basic text extraction
    // May need to preserve formatting and sections

    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file');
  }
};

/**
 * Extract structured resume data from parsed text
 * @param text - Raw text extracted from resume file
 * @returns Structured Resume object
 *
 * TODO: Implement advanced NLP/AI processing to extract:
 * - Personal information (name, email, phone)
 * - Professional summary
 * - Job title/position
 * - Skills with proficiency levels
 * - Work experience with dates and descriptions
 * - Education details
 * - Certifications
 * - Languages
 * - Projects
 *
 * This is a placeholder implementation with basic regex patterns.
 * Consider using:
 * - Named Entity Recognition (NER) for names and locations
 * - Regular expressions for emails and phone numbers
 * - Machine Learning models for section classification
 */
export const extractResumeData = async (
  text: string
): Promise<Resume> => {
  // Placeholder implementation
  // TODO: Replace with actual parsing logic using NLP/ML

  const resumeData: Resume = {
    personalInfo: {
      name: '', // Extract from text
      email: '', // Extract using regex
      phone: '', // Extract using regex
      location: '', // Extract from text
      profileUrl: '', // Extract URLs
    },
    professionalSummary: '', // Extract first paragraph
    jobTitle: '', // Extract from text
    skills: [], // Extract and categorize
    experience: [], // Parse work history
    education: [], // Parse education section
  };

  // Basic regex patterns for demonstration
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    resumeData.personalInfo.email = emailMatch[0];
  }

  const phoneMatch = text.match(
    /(?:\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/
  );
  if (phoneMatch) {
    resumeData.personalInfo.phone = phoneMatch[0];
  }

  // TODO: Implement remaining extraction logic

  return resumeData;
};

/**
 * Main function to parse resume file
 * @param filePath - Path to resume file (PDF or DOCX)
 * @returns Structured Resume object
 */
export const parseResumeFile = async (filePath: string): Promise<Resume> => {
  try {
    const extension = filePath.split('.').pop()?.toLowerCase();

    let extractedText: string;

    if (extension === 'pdf') {
      extractedText = await parsePDFFile(filePath);
    } else if (extension === 'docx') {
      extractedText = await parseDOCXFile(filePath);
    } else {
      throw new Error('Unsupported file format');
    }

    const resumeData = await extractResumeData(extractedText);

    return resumeData;
  } catch (error) {
    console.error('Error in parseResumeFile:', error);
    throw error;
  }
};

/**
 * Parse resume file and return both raw text and structured data
 * @param filePath - Path to resume file (PDF or DOCX)
 * @returns Object containing raw text and structured Resume
 */
export const parseResumeFileWithText = async (filePath: string): Promise<{ text: string; data: Resume }> => {
  try {
    const extension = filePath.split('.').pop()?.toLowerCase();

    let extractedText: string;

    if (extension === 'pdf') {
      extractedText = await parsePDFFile(filePath);
    } else if (extension === 'docx') {
      extractedText = await parseDOCXFile(filePath);
    } else {
      throw new Error('Unsupported file format');
    }

    const resumeData = await extractResumeData(extractedText);

    return {
      text: extractedText,
      data: resumeData,
    };
  } catch (error) {
    console.error('Error in parseResumeFileWithText:', error);
    throw error;
  }
};
