export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = "INTERNAL_SERVER_ERROR", details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Invalid email or password") {
    super(message, 401, "AUTHENTICATION_FAILED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to access this resource") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "A resource with these details already exists") {
    super(message, 409, "CONFLICT");
  }
}

export class AccountSuspendedError extends AppError {
  constructor(message = "This account has been suspended. Please contact hospital administration.") {
    super(message, 403, "ACCOUNT_SUSPENDED");
  }
}

export class AccountPendingVerificationError extends AppError {
  constructor(message = "Please verify your email address to activate your account.") {
    super(message, 403, "ACCOUNT_PENDING_VERIFICATION");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

export class AccountNotFoundError extends AppError {
  constructor(message = "No registered account found with this email. Please register first.") {
    super(message, 404, "ACCOUNT_NOT_FOUND");
  }
}
