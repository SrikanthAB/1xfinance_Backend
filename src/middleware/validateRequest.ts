import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * ValidationErrorDetail: Interface for structured error details
 */
interface ValidationErrorDetail {
  path: string;
  message: string;
  errorType: string;
}

/**
 * ValidationError: Custom error class for structured validation failures
 */
export class ValidationError extends Error {
  public statusCode: number;
  public errors: ValidationErrorDetail[];

  constructor(message: string, statusCode: number = 400, errors: ValidationErrorDetail[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * ValidationTarget: Defines which part of the request to validate
 */
export type ValidationTarget = 'body' | 'params' | 'query' | 'headers';

/**
 * ValidationOptions: Options for the validation middleware
 */
export interface ValidationOptions {
  target?: ValidationTarget;
}

/**
 * validateRequest: Middleware for validating request data against a Zod schema
 * 
 * Fixed to ensure compatibility with Express middleware type expectations
 */
export function validateRequest(schema: z.ZodSchema, options: ValidationOptions = {}) {
  const { target = 'body' } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Determine which part of the request to validate
      let dataToValidate: any;
      switch (target) {
        case 'body':
          // Only check content-type and body for methods that typically have a body
          if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const contentType = req.headers['content-type'];
            if (
              !contentType ||
              (!contentType.includes('application/json') && !contentType.includes('application/x-www-form-urlencoded'))
            ) {
              res.status(415).json({
                status: 'error',
                message: 'Unsupported Media Type',
                errors: [{
                  path: 'headers.content-type',
                  message: 'Content type must be application/json or application/x-www-form-urlencoded',
                  errorType: 'CONTENT_TYPE_ERROR'
                }]
              });
              return;
            }

            if (!req.body || Object.keys(req.body).length === 0) {
              res.status(400).json({
                status: 'error',
                message: 'Request body is required',
                errors: [{
                  path: 'body',
                  message: 'Request body cannot be empty',
                  errorType: 'EMPTY_BODY_ERROR'
                }]
              });
              return;
            }
          }
          dataToValidate = req.body;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'headers':
          dataToValidate = req.headers;
          break;
        default:
          dataToValidate = req.body;
      }

      // Validate the data against the schema
      const validatedData = await schema.parseAsync(dataToValidate);

      // Update the request object with validated data
      if (target === 'body') {
        req.body = validatedData;
      } else if (target === 'params') {
        req.params = validatedData as any;
      } else if (target === 'query') {
        Object.assign(req.query, validatedData);
      } else if (target === 'headers') {
        // For headers, we don't replace the entire object
        Object.assign(req.headers, validatedData);
      }

      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        // Group errors by type for better organization
        const typeErrors: ValidationErrorDetail[] = [];
        const requiredErrors: ValidationErrorDetail[] = [];
        const formatErrors: ValidationErrorDetail[] = [];
        const otherErrors: ValidationErrorDetail[] = [];

        // Process and categorize each validation error
        error.errors.forEach(err => {
          const errorInfo: ValidationErrorDetail = {
            path: err.path.join('.'),
            message: err.message,
            errorType: err.code
          };

          // Categorize errors based on their nature
          switch (err.code) {
            case 'invalid_type':
              typeErrors.push(errorInfo);
              break;
            case 'invalid_type':
              requiredErrors.push(errorInfo);
              break;
            case 'invalid_string':
            case 'invalid_date':
              formatErrors.push(errorInfo);
              break;
            default:
              otherErrors.push(errorInfo);
          }
        });

        // Combine all errors for the response
        const allErrors: ValidationErrorDetail[] = [
          ...requiredErrors,
          ...typeErrors,
          ...formatErrors,
          ...otherErrors
        ];

        // Create user-friendly error messages
        const errorMessages: string[] = [];
        if (requiredErrors.length > 0) {
          errorMessages.push(`Missing required fields: ${requiredErrors.map(e => e.path).join(', ')}`);
        }
        if (typeErrors.length > 0) {
          errorMessages.push(`Invalid types: ${typeErrors.map(e => `${e.path} (${e.message})`).join(', ')}`);
        }
        if (formatErrors.length > 0) {
          errorMessages.push(`Format errors: ${formatErrors.map(e => `${e.path} (${e.message})`).join(', ')}`);
        }
        if (otherErrors.length > 0) {
          errorMessages.push(`Other validation errors: ${otherErrors.map(e => `${e.path} (${e.message})`).join(', ')}`);
        }

        // Send the error response
        res.status(400).json({
          status: 'error',
          message: 'Validation failed: ' + errorMessages.join('; '),
          errors: allErrors
        });
        return; // Important: Return void to satisfy TypeScript
      }

      // Handle unexpected errors
      console.error('Unexpected validation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred during request validation',
        errors: [{
          path: '',
          message: 'Internal server error during validation',
          errorType: 'INTERNAL_ERROR'
        }]
      });
      return; // Important: Return void to satisfy TypeScript
    }
  };
}