/**
 * TypeScript interfaces for JobTailor frontend
 */

export interface Skill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Experience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  responsibilities: string[];
}

export interface Education {
  degree: string;
  institution: string;
  graduationDate: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
}

export interface Resume {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  jobTitle: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  certifications?: string[];
}

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
}

export interface ATSResult {
  atsScore: number;
  matchingKeywords: string[];
  suggestions: string[];
  optimizedResume: Resume;
  jobDescription: JobDescription;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ResumeUploadResponse {
  fileId: string;
  fileName: string;
  data: Resume;
}

export interface JDParseResponse {
  data: JobDescription;
}

export interface OptimizeResponse {
  data: {
    atsScore: number;
    matchingKeywords: string[];
    suggestions: string[];
  } & Resume;
}
