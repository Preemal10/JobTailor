/**
 * Error Handling Middleware
 * Catches and handles errors throughout the application
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Error codes for consistent error handling
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  FILE_PROCESSING_ERROR = 'FILE_PROCESSING_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  GENERATION_ERROR = 'GENERATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    public isOperational: boolean = true,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a validation error
   */
  static validation(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(message, 400, ErrorCode.VALIDATION_ERROR, true, details);
  }

  /**
   * Create a not found error
   */
  static notFound(resource: string): AppError {
    return new AppError(`${resource} not found`, 404, ErrorCode.NOT_FOUND);
  }

  /**
   * Create a file processing error
   */
  static fileProcessing(message: string): AppError {
    return new AppError(message, 422, ErrorCode.FILE_PROCESSING_ERROR);
  }

  /**
   * Create a parse error
   */
  static parseError(message: string): AppError {
    return new AppError(message, 422, ErrorCode.PARSE_ERROR);
  }

  /**
   * Create a generation error
   */
  static generationError(message: string): AppError {
    return new AppError(message, 500, ErrorCode.GENERATION_ERROR);
  }
}

/**
 * Main error handling middleware
 * @param error - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 *
 * TODO: Implement:
 * - Structured error logging
 * - Error tracking/monitoring integration
 * - Sensitive data redaction in error messages
 * - User-friendly error responses
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ...(error instanceof AppError && { code: error.code }),
  });

  // Determine status code and error code
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const errorCode = error instanceof AppError ? error.code : ErrorCode.INTERNAL_ERROR;

  // Prepare error response with consistent format
  const response: {
    success: boolean;
    error: string;
    code: ErrorCode;
    details?: Record<string, unknown>;
    stack?: string;
  } = {
    success: false,
    error: error instanceof AppError ? error.message : 'Internal server error',
    code: errorCode,
  };

  // Include details if available
  if (error instanceof AppError && error.details) {
    response.details = error.details;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found middleware
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = AppError.notFound(`Route ${req.originalUrl}`);
  next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers and passes errors to error handler
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 *
 * @param fn - Async function to wrap
 * @returns Wrapped function with error handling
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request validation error middleware
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 *
 * TODO: Implement validation using libraries like:
 * - joi
 * - yup
 * - zod
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // TODO: Implement request validation

  next();
};
