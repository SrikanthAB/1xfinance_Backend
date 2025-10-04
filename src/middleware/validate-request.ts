import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

interface FieldValidationError {
  field: string;
  message: string;
  value?: any;
}

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors: (FieldValidationError & { location?: string })[] = errors.array({ onlyFirstError: true }).map((error: any) => ({
      field: error.param || 'unknown',
      message: error.msg || 'Validation error',
      value: error.value,
      location: error.location,
    }));
    
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  
  next();
};
