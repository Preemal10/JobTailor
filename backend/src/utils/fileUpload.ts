/**
 * File Upload Utility
 * Handles file validation, storage, and retrieval
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB default

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Configure multer storage
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

/**
 * File filter to validate file types
 * @param req - Express request object
 * @param file - Uploaded file
 * @param cb - Callback function
 */
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = {
    resume: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    jd: ['text/plain'],
  };

  const fieldType = file.fieldname === 'resume' ? 'resume' : 'jd';
  const allowed = allowedMimes[fieldType as keyof typeof allowedMimes] || [];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${fieldType}. Allowed: ${allowed.join(', ')}`));
  }
};

/**
 * Multer configuration for resume upload
 */
export const resumeUpload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter,
});

/**
 * Multer configuration for JD upload
 */
export const jdUpload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter,
});

/**
 * Validate file extension
 * @param fileName - Name of the file
 * @param allowedExtensions - Array of allowed extensions
 * @returns boolean
 */
export const validateFileExtension = (
  fileName: string,
  allowedExtensions: string[]
): boolean => {
  const fileExtension = path.extname(fileName).toLowerCase().substring(1);
  return allowedExtensions.includes(fileExtension);
};

/**
 * Validate file size
 * @param fileSize - Size of the file in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns boolean
 */
export const validateFileSize = (fileSize: number, maxSize: number): boolean => {
  return fileSize <= maxSize;
};

/**
 * Delete uploaded file
 * @param filePath - Path to the file
 */
export const deleteUploadedFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Get file info
 * @param filePath - Path to the file
 * @returns File information object
 */
export const getFileInfo = (filePath: string): { size: number; path: string } | null => {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      path: filePath,
    };
  } catch (error) {
    return null;
  }
};

/**
 * File Storage Registry
 * Maps file IDs to file paths for secure file reference
 * In production, this would be stored in a database or Redis
 */
const fileRegistry = new Map<string, { path: string; createdAt: Date; originalName: string }>();

/**
 * Generate a unique file ID
 * @returns Unique file ID string
 */
export const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Register a file and return its ID (prevents path exposure)
 * @param filePath - Absolute path to the file
 * @param originalName - Original file name
 * @returns File ID for client reference
 */
export const registerFile = (filePath: string, originalName: string): string => {
  const fileId = generateFileId();
  fileRegistry.set(fileId, {
    path: filePath,
    createdAt: new Date(),
    originalName,
  });
  return fileId;
};

/**
 * Get file path from ID (server-side only)
 * @param fileId - File ID
 * @returns File path or null if not found
 */
export const getFilePathById = (fileId: string): string | null => {
  const entry = fileRegistry.get(fileId);
  if (!entry) return null;
  
  // Verify file still exists
  if (!fs.existsSync(entry.path)) {
    fileRegistry.delete(fileId);
    return null;
  }
  
  return entry.path;
};

/**
 * Delete file by ID
 * @param fileId - File ID
 * @returns Promise that resolves when file is deleted
 */
export const deleteFileById = async (fileId: string): Promise<boolean> => {
  const entry = fileRegistry.get(fileId);
  if (!entry) return false;
  
  try {
    await deleteUploadedFile(entry.path);
    fileRegistry.delete(fileId);
    return true;
  } catch (error) {
    console.error(`Failed to delete file ${fileId}:`, error);
    return false;
  }
};

/**
 * Clean up expired files (call periodically)
 * @param maxAgeMs - Maximum age in milliseconds (default: 1 hour)
 */
export const cleanupExpiredFiles = async (maxAgeMs: number = 3600000): Promise<number> => {
  const now = Date.now();
  let deletedCount = 0;
  
  for (const [fileId, entry] of fileRegistry.entries()) {
    if (now - entry.createdAt.getTime() > maxAgeMs) {
      await deleteFileById(fileId);
      deletedCount++;
    }
  }
  
  return deletedCount;
};
