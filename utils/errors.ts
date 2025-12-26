export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.userMessage = userMessage || message;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      'VALIDATION_ERROR',
      400,
      details,
      'Please check your input and try again.'
    );
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(
      message,
      'AUTH_ERROR',
      401,
      undefined,
      'Please sign in to continue.'
    );
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(
      `${resource} not found`,
      'NOT_FOUND',
      404,
      undefined,
      `We couldn't find that ${resource.toLowerCase()}. It may have been deleted.`
    );
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, retryAfter?: number) {
    const userMessage = retryAfter
      ? `Too many requests. Please wait ${retryAfter} seconds and try again.`
      : 'Too many requests. Please slow down and try again in a moment.';

    super(message, 'RATE_LIMIT', 429, { retryAfter }, userMessage);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error') {
    super(
      message,
      'NETWORK_ERROR',
      0,
      undefined,
      'Unable to connect. Please check your internet connection and try again.'
    );
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends AppError {
  constructor() {
    super(
      'Request timed out',
      'TIMEOUT_ERROR',
      408,
      undefined,
      'The request took too long. Please try again.'
    );
    this.name = 'TimeoutError';
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (isNetworkError(error)) {
    return new NetworkError();
  }

  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      return new TimeoutError();
    }
    if (error.message.includes('rate limit')) {
      return new RateLimitError(error.message);
    }
    if (error.message.includes('not found')) {
      return new NotFoundError('Resource');
    }
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      return new AuthenticationError();
    }

    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      500,
      undefined,
      'Something went wrong. Please try again.'
    );
  }

  return new AppError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    500,
    undefined,
    'Something unexpected happened. Please try again.'
  );
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;

  return (
    error instanceof TypeError &&
    (error.message.includes('fetch') ||
     error.message.includes('network') ||
     error.message.includes('Failed to fetch'))
  );
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }

  const appError = handleError(error);
  return (
    appError.statusCode === 0 ||
    appError.statusCode === 408 ||
    appError.statusCode === 429 ||
    appError.statusCode === 500 ||
    appError.statusCode === 502 ||
    appError.statusCode === 503 ||
    appError.statusCode === 504
  );
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred. Please try again.';
}

export function getUserFriendlyMessage(error: unknown): string {
  const appError = handleError(error);
  return appError.userMessage || 'Something went wrong. Please try again.';
}

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts || !isRetryableError(error)) {
        throw lastError;
      }

      const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
      onRetry?.(attempt, lastError);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
