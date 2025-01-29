/**
 * API service for JobTailor frontend
 * Handles all communication with the backend
 */

import axios from 'axios';
import { 
  ApiResponse, 
  ResumeUploadResponse, 
  JDParseResponse, 
  Resume, 
  JobDescription 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Upload resume file (PDF or DOCX)
 */
export const uploadResume = async (file: File): Promise<ApiResponse<ResumeUploadResponse>> => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await api.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Parse job description from text
 */
export const parseJDText = async (content: string): Promise<ApiResponse<JDParseResponse>> => {
  const response = await api.post('/jd/create', { content });
  return response.data;
};

/**
 * Upload job description file (TXT)
 */
export const uploadJDFile = async (file: File): Promise<ApiResponse<JDParseResponse>> => {
  const formData = new FormData();
  formData.append('jd', file);

  const response = await api.post('/jd/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Analyze resume against job description and get ATS score
 */
export const analyzeATS = async (
  resume: Resume,
  jobDescription: JobDescription
): Promise<ApiResponse<any>> => {
  const response = await api.post('/resume/optimize', {
    resume,
    jobDescription,
  });

  return response.data;
};

/**
 * Simple ATS keyword check - compares resume text against JD keywords
 * This is a simpler endpoint that doesn't require full resume parsing
 */
export const checkATSKeywords = async (
  resumeText: string,
  jobDescription: JobDescription
): Promise<ApiResponse<any>> => {
  const response = await api.post('/resume/check-ats', {
    resumeText,
    jobDescription,
  });

  return response.data;
};

/**
 * Read file content as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Upload resume and get raw text content
 */
export const uploadResumeAndGetText = async (file: File): Promise<{ text: string; fileId: string }> => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await api.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // The backend extracts text, but since the parser doesn't return it directly,
  // we need to handle DOCX/PDF text extraction on the server
  // For now, return what we get
  return {
    text: JSON.stringify(response.data.data), // Stringify the parsed data as a workaround
    fileId: response.data.fileId,
  };
};

/**
 * Health check
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.data.status === 'ok';
  } catch {
    return false;
  }
};

export default api;
