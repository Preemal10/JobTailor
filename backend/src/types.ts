/**
 * Type definitions for the Resume Builder API
 */

/**
 * Skill interface
 */
export interface Skill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

/**
 * Experience interface
 */
export interface Experience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  responsibilities: string[];
  achievements?: string[];
}

/**
 * Education interface
 */
export interface Education {
  degree: string;
  institution: string;
  graduationDate: string;
  grade?: string;
  details?: string;
}

/**
 * Resume interface - Main structure for parsed resume
 */
export interface Resume {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    profileUrl?: string;
  };
  professionalSummary: string;
  jobTitle: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  certifications?: string[];
  languages?: string[];
  projects?: {
    title: string;
    description: string;
    technologies?: string[];
  }[];
}

/**
 * Job Description interface - Main structure for parsed JD
 */
export interface JobDescription {
  roleTitle: string;
  company: string;
  description: string;
  responsibilities: string[];
  requiredSkills: Skill[];
  preferredSkills?: Skill[];
  atsKeywords: string[];
  qualifications: string[];
  experienceRequired?: string;
  salaryRange?: {
    min?: number;
    max?: number;
  };
}

/**
 * Optimized Resume Response - After AI processing
 */
export interface OptimizedResume extends Resume {
  atsScore?: number;
  matchingKeywords: string[];
  suggestions?: string[];
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * File Upload Response
 */
export interface FileUploadResponse {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

/**
 * Resume Generation Request
 */
export interface ResumeGenerationRequest {
  resume: Resume;
  jobDescription: JobDescription;
  optimizationType?: 'ats' | 'recruiter' | 'balanced';
}

/**
 * Resume Generation Response
 */
export interface ResumeGenerationResponse {
  resumeUrl: string;
  fileName: string;
  atsScore: number;
  matchedKeywords: string[];
  suggestions: string[];
}
