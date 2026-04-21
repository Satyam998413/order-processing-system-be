/**
 * Custom Application Error
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Authorization failed') {
    super(message, 403);
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
  }
}

/**
 * Format error response
 */
export const formatErrorResponse = (err) => {
  if (err instanceof AppError) {
    return {
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.errors }),
    };
  }

  return {
    status: 'error',
    statusCode: 500,
    message: 'Internal server error',
  };
};
