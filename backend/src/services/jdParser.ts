/**
 * Job Description Parser Service
 * Handles parsing and extraction of key information from job descriptions
 */

import { JobDescription, Skill } from '../types';
import { extractATSKeywords, getAllATSKeywords } from '../utils/atsKeywords';
import fs from 'fs';

/**
 * Parse text file containing job description
 * @param filePath - Path to text file
 * @returns Raw text content
 */
export const parseTextFile = async (filePath: string): Promise<string> => {
  try {
    const text = fs.readFileSync(filePath, 'utf-8');
    return text;
  } catch (error) {
    console.error('Error reading text file:', error);
    throw new Error('Failed to read text file');
  }
};

/**
 * Extract role title from job description
 * @param text - Job description text
 * @returns Extracted role title
 */
const extractRoleTitle = (text: string): string => {
  const patterns = [
    // Explicit labels
    /(?:Role|Position|Job Title|Hiring For|Title)\s*:?\s*([^\n]+)/i,
    // "JOB POSTING: Title" format
    /JOB\s*POSTING\s*:?\s*([^\n]+)/i,
    // Title at the start followed by dash/hyphen (e.g., "Full Stack Developer - Remote")
    /^([A-Za-z\s]+(?:Engineer|Developer|Manager|Specialist|Analyst|Architect|Designer|Administrator|Consultant|Scientist))\s*[-–—]/im,
    // Title at the very beginning of text (first line often is the title)
    /^([A-Za-z\s]+(?:Engineer|Developer|Manager|Specialist|Analyst|Architect|Designer|Administrator|Consultant|Scientist))/im,
    // "Looking for a [Title]" pattern
    /(?:looking for|hiring|seeking)\s+(?:a|an)?\s*([A-Za-z\s]+(?:Engineer|Developer|Manager|Specialist|Analyst|Architect))/i,
    // Position: Title pattern
    /Position\s*:?\s*([^\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim();
      // Clean up the title - remove trailing punctuation and extra words
      const cleaned = title
        .replace(/[-–—].*/g, '') // Remove everything after dash
        .replace(/\s+(at|@|for|in)\s+.*/i, '') // Remove "at Company" etc.
        .trim();
      if (cleaned.length > 3 && cleaned.length < 100) {
        return cleaned;
      }
    }
  }

  return 'Not specified';
};

/**
 * Extract company name from job description
 * @param text - Job description text
 * @returns Extracted company name
 *
 * TODO: Implement company extraction using:
 * - Pattern matching for "Company:", "About us:", etc.
 * - Entity recognition for organization names
 */
const extractCompanyName = (text: string): string => {
  const patterns = [
    /(?:Company|Organization|Hiring|At)\s*:?\s*([^\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return 'Not specified';
};

/**
 * Extract responsibilities from job description
 * @param text - Job description text
 * @returns Array of responsibilities
 *
 * TODO: Implement advanced responsibility extraction:
 * - Identify responsibility section
 * - Parse bullet points/lists
 * - Use NLP for action verb identification
 * - Normalize and clean extracted responsibilities
 */
const extractResponsibilities = (text: string): string[] => {
  const responsibilities: string[] = [];

  // Look for responsibility sections
  const responsibilitySection = text.match(
    /(?:Responsibilities|Duties|What You'll Do|Key Responsibilities)\s*:?\s*([\s\S]+?)(?=\n\n|Required|Qualifications|$)/i
  );

  if (responsibilitySection) {
    const lines = responsibilitySection[1].split('\n');
    lines.forEach((line) => {
      const cleaned = line.replace(/^[\s•\-*]+/, '').trim();
      if (cleaned && cleaned.length > 10) {
        responsibilities.push(cleaned);
      }
    });
  }

  // TODO: If no section found, use sentence parsing or ML model
  // to identify responsibility-related sentences

  return responsibilities;
};

/**
 * Extract skills from job description
 * @param text - Job description text
 * @returns Array of required and preferred skills
 *
 * TODO: Implement skill extraction:
 * - Use ATS keyword matching
 * - Parse skill requirements section
 * - Use skill ontology/database for normalization
 * - Classify as required or preferred
 */
const extractSkills = (text: string): { required: Skill[]; preferred: Skill[] } => {
  const allKeywords = getAllATSKeywords();
  const foundKeywords = extractATSKeywords(text, allKeywords);

  // Convert to Skill objects
  const skillsArray: Skill[] = foundKeywords.map((keyword) => ({
    name: keyword,
    level: 'intermediate', // TODO: Extract proficiency level from text
  }));

  // Placeholder logic for separating required and preferred
  // TODO: Implement logic to classify skills as required or preferred
  return {
    required: skillsArray.slice(0, Math.ceil(skillsArray.length * 0.7)),
    preferred: skillsArray.slice(Math.ceil(skillsArray.length * 0.7)),
  };
};

/**
 * Extract qualifications from job description
 * @param text - Job description text
 * @returns Array of qualifications
 *
 * TODO: Implement qualification extraction:
 * - Identify qualifications section
 * - Parse education requirements
 * - Extract experience requirements (e.g., "5+ years")
 * - Extract certifications and licenses
 */
const extractQualifications = (text: string): string[] => {
  const qualifications: string[] = [];

  const qualificationSection = text.match(
    /(?:Qualifications|Requirements|Must Have|Minimum Requirements)\s*:?\s*([\s\S]+?)(?=\n\n|$|Preferred)/i
  );

  if (qualificationSection) {
    const lines = qualificationSection[1].split('\n');
    lines.forEach((line) => {
      const cleaned = line.replace(/^[\s•\-*]+/, '').trim();
      if (cleaned && cleaned.length > 10) {
        qualifications.push(cleaned);
      }
    });
  }

  // TODO: Parse qualifications further for structured data
  // (education level, years of experience, certifications)

  return qualifications;
};

/**
 * Extract experience requirements from job description
 * @param text - Job description text
 * @returns Experience requirement string
 *
 * TODO: Implement experience extraction:
 * - Parse "X+ years" patterns
 * - Identify industry/domain experience requirements
 * - Extract specific role experience requirements
 */
const extractExperienceRequired = (text: string): string => {
  // Look for patterns like "5+ years", "3 years experience", etc.
  const expMatch = text.match(/(\d+)\+?\s*(?:year|yr)s?\s*(?:of\s*)?(?:experience|exp)/i);

  if (expMatch) {
    return `${expMatch[1]}+ years`;
  }

  return 'Not specified';
};

/**
 * Extract salary information from job description
 * @param text - Job description text
 * @returns Salary range object or undefined
 *
 * TODO: Implement salary extraction:
 * - Parse salary ranges
 * - Handle different currency formats
 * - Identify salary frequency (hourly, annual, monthly)
 */
const extractSalaryRange = (
  text: string
): { min?: number; max?: number } | undefined => {
  // Look for salary patterns like "$50,000 - $70,000" or "50-70k"
  const salaryMatch = text.match(
    /\$?(\d+(?:,\d{3})*)\s*(?:-|to|–)\s*\$?(\d+(?:,\d{3})*)/i
  );

  if (salaryMatch) {
    return {
      min: parseInt(salaryMatch[1].replace(/,/g, ''), 10),
      max: parseInt(salaryMatch[2].replace(/,/g, ''), 10),
    };
  }

  // TODO: Handle more salary formats and units (k, M, etc.)

  return undefined;
};

/**
 * Parse job description from raw text content
 * @param text - Raw job description text
 * @returns Structured JobDescription object
 */
export const parseJobDescriptionFromText = (text: string): JobDescription => {
  const roleTitle = extractRoleTitle(text);
  const company = extractCompanyName(text);
  const responsibilities = extractResponsibilities(text);
  const { required: requiredSkills, preferred: preferredSkills } = extractSkills(text);
  const qualifications = extractQualifications(text);
  const experienceRequired = extractExperienceRequired(text);
  const salaryRange = extractSalaryRange(text);

  // Extract all ATS keywords from the job description
  const allKeywords = getAllATSKeywords();
  const atsKeywords = extractATSKeywords(text, allKeywords);

  const jobDescription: JobDescription = {
    roleTitle,
    company,
    description: text.substring(0, 500), // TODO: Extract executive summary
    responsibilities,
    requiredSkills,
    preferredSkills,
    qualifications,
    experienceRequired,
    salaryRange,
    atsKeywords,
  };

  return jobDescription;
};

/**
 * Main function to parse job description from file
 * @param filePath - Path to job description text file
 * @returns Structured JobDescription object
 */
export const parseJobDescription = async (filePath: string): Promise<JobDescription> => {
  try {
    const text = await parseTextFile(filePath);
    return parseJobDescriptionFromText(text);
  } catch (error) {
    console.error('Error in parseJobDescription:', error);
    throw error;
  }
};
