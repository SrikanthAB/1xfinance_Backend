// customErrors.ts

export class EmailValidationError extends Error {
  public statusCode: number;

  constructor(message = 'Invalid email address') {
    super(message);
    this.name = 'EmailValidationError';
    this.statusCode = 400; // 400 Bad Request
    Error.captureStackTrace(this, this.constructor);
  }
}

export class OTPExpiredError extends Error {
  public statusCode: number;

  constructor(message = 'OTP has expired') {
    super(message);
    this.name = 'OTPExpiredError';
    this.statusCode = 410; // 410 Gone
    Error.captureStackTrace(this, this.constructor);
  }
}

export class OTPAttemptsExceededError extends Error {
  public statusCode: number;

  constructor(waitMinutes: number = 5) {
    const message = `Maximum OTP attempts exceeded. Please try after ${waitMinutes} minutes.`;
    super(message);
    this.name = 'OTPAttemptsExceededError';
    this.statusCode = 429; // 429 Too Many Requests
    Error.captureStackTrace(this, this.constructor);
  }
}


export class OTPVerificationFailedError extends Error {
  public statusCode: number;

  constructor(message = 'OTP verification failed') {
    super(message);
    this.name = 'OTPVerificationFailedError';
    this.statusCode = 400; // 400 Bad Request
    Error.captureStackTrace(this, this.constructor);
  }
}
