/**
 * Resume Optimizer Service
 * Handles optimization of resumes for ATS and specific job descriptions
 */

import { Resume, JobDescription, OptimizedResume } from '../types';
import {
  extractATSKeywords,
  calculateKeywordMatchPercentage,
  getMissingKeywords,
  suggestKeywordsToAdd,
  getAllATSKeywords,
} from '../utils/atsKeywords';

/**
 * Calculate ATS score for a resume based on job description
 * @param resume - Resume object
 * @param jobDescription - Job description object
 * @returns ATS score (0-100)
 *
 * TODO: Implement comprehensive ATS scoring:
 * - Keyword matching (weighted)
 * - Format compatibility check
 * - Section completeness analysis
 * - Experience alignment with JD
 * - Education relevance
 * - Skill match scoring
 * - Penalize for common ATS-unfriendly formats
 */
export const calculateATSScore = async (
  resume: Resume,
  jobDescription: JobDescription
): Promise<number> => {
  let score = 0;

  // 1. Keyword matching (40% of score)
  const resumeText = JSON.stringify(resume).toLowerCase();
  const keywordMatchPercentage = calculateKeywordMatchPercentage(
    resumeText,
    jobDescription.atsKeywords
  );
  score += (keywordMatchPercentage / 100) * 40;

  // 2. Skills match (30% of score)
  const requiredSkillNames = jobDescription.requiredSkills.map((s) => s.name.toLowerCase());
  const resumeSkillNames = resume.skills.map((s) => s.name.toLowerCase());
  const matchedSkills = requiredSkillNames.filter((skill) =>
    resumeSkillNames.includes(skill)
  );
  const skillsMatchPercentage = (matchedSkills.length / requiredSkillNames.length) * 100;
  score += (skillsMatchPercentage / 100) * 30;

  // 3. Format and structure (20% of score)
  // TODO: Implement format checks
  const hasAllSections = Boolean(
    resume.personalInfo &&
    resume.experience.length > 0 &&
    resume.education.length > 0
  );
  score += hasAllSections ? 20 : 10;

  // 4. Experience relevance (10% of score)
  // TODO: Implement experience relevance scoring using NLP
  score += 5; // Placeholder

  return Math.round(score);
};

/**
 * Get keywords to add to resume for better ATS match
 * @param resume - Current resume
 * @param jobDescription - Job description
 * @returns Array of suggested keywords
 *
 * TODO: Implement intelligent keyword suggestions:
 * - Prioritize high-impact keywords
 * - Consider context and relevance
 * - Suggest placement locations in resume
 */
export const getKeywordSuggestions = (
  resume: Resume,
  jobDescription: JobDescription
): string[] => {
  const resumeText = JSON.stringify(resume);
  const missingKeywords = getMissingKeywords(resumeText, jobDescription.atsKeywords);

  // Return top 10 missing keywords
  return missingKeywords.slice(0, 10);
};

/**
 * Optimize professional summary for job description
 * @param originalSummary - Original professional summary
 * @param jobDescription - Target job description
 * @returns Optimized professional summary
 *
 * TODO: Implement AI-powered summary rewriting:
 * - Analyze job description for key themes
 * - Rewrite summary to highlight relevant experience
 * - Incorporate ATS keywords naturally
 * - Maintain professional tone
 * - Keep summary concise (3-4 sentences)
 * - Use action verbs and quantifiable achievements
 *
 * This would typically use:
 * - OpenAI GPT API for text generation
 * - Claude API for advanced reasoning
 * - Or other LLM services
 */
export const optimizeProfessionalSummary = async (
  originalSummary: string,
  jobDescription: JobDescription
): Promise<string> => {
  // TODO: Implement AI-powered optimization

  // Placeholder: Return enhanced summary with top 3 keywords
  const topKeywords = jobDescription.atsKeywords.slice(0, 3);

  const optimizedSummary = `
    ${originalSummary || 'Experienced professional'} with strong expertise in ${topKeywords.join(', ')}.
    Proven track record of delivering results in ${jobDescription.roleTitle} roles.
    TODO: Replace with AI-generated content that matches the job requirements.
  `.trim();

  return optimizedSummary;
};

/**
 * Optimize job experience bullets with ATS keywords
 * @param experienceBullets - Array of experience descriptions
 * @param jobDescription - Target job description
 * @returns Optimized job bullets
 *
 * TODO: Implement AI-powered bullet rewriting:
 * - Analyze each bullet for impact
 * - Add action verbs if missing
 * - Incorporate relevant keywords from JD
 * - Add quantifiable metrics where possible
 * - Maintain 1-2 lines per bullet
 * - Focus on achievements, not duties
 *
 * Structure for optimized bullets:
 * [Action Verb] + [Task/Project] + [Key Keyword] + [Result/Impact]
 * Example: "Architected scalable Node.js backend handling 100K+ requests/day"
 */
export const optimizeExperienceBullets = async (
  experienceBullets: string[],
  jobDescription: JobDescription
): Promise<string[]> => {
  // TODO: Implement AI-powered bullet optimization

  const optimizedBullets = experienceBullets.map((bullet) => {
    // Placeholder: Add a keyword from the job description
    const keywords = jobDescription.atsKeywords.slice(0, 5);

    let optimized = bullet;

    // Try to inject relevant keywords
    if (keywords.length > 0 && !bullet.toLowerCase().includes(keywords[0].toLowerCase())) {
      optimized = `${bullet} utilizing ${keywords[0]}`;
    }

    return optimized;
    // TODO: Use AI service to rewrite bullet more naturally
  });

  return optimizedBullets;
};

/**
 * Optimize job title to match target role
 * @param currentJobTitle - Current job title from resume
 * @param targetRoleTitle - Target role title from job description
 * @returns Optimized job title
 *
 * TODO: Implement job title optimization:
 * - Analyze similarity between current and target title
 * - Suggest more relevant alternative if not matching
 * - Ensure title is ATS-friendly
 * - Don't change if current title is more senior
 */
export const optimizeJobTitle = (
  currentJobTitle: string,
  targetRoleTitle: string
): string => {
  // Return the target role title directly for JD-tailored resumes
  return targetRoleTitle;
};

/**
 * Optimize entire resume for target job description
 * @param resume - Original resume
 * @param jobDescription - Target job description
 * @returns Optimized resume with ATS score and suggestions
 *
 * This function coordinates all optimization operations
 */
export const optimizeResume = async (
  resume: Resume,
  jobDescription: JobDescription
): Promise<OptimizedResume> => {
  try {
    // Calculate base ATS score
    const atsScore = await calculateATSScore(resume, jobDescription);

    // Get keyword suggestions
    const keywordSuggestions = getKeywordSuggestions(resume, jobDescription);

    // Optimize components (these would use AI in real implementation)
    const optimizedSummary = await optimizeProfessionalSummary(
      resume.professionalSummary,
      jobDescription
    );

    const optimizedExperienceArray = await Promise.all(
      resume.experience.map((exp) =>
        optimizeExperienceBullets(exp.responsibilities || [], jobDescription)
      )
    );

    // Build optimized resume
    const optimizedResume: OptimizedResume = {
      ...resume,
      professionalSummary: optimizedSummary,
      jobTitle: optimizeJobTitle(resume.jobTitle, jobDescription.roleTitle),
      experience: resume.experience.map((exp, index) => ({
        ...exp,
        responsibilities: optimizedExperienceArray[index] || exp.responsibilities,
      })),
      atsScore,
      matchingKeywords: extractATSKeywords(
        JSON.stringify(resume),
        jobDescription.atsKeywords
      ),
      suggestions: [
        `Add missing keywords: ${keywordSuggestions.slice(0, 3).join(', ')}`,
        'Consider rewriting professional summary to better match job requirements',
        'Update experience bullets to include quantifiable achievements',
      ],
    };

    return optimizedResume;
  } catch (error) {
    console.error('Error in optimizeResume:', error);
    throw error;
  }
};
