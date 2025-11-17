import { config } from './config';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = config.api.retryAttempts,
    delayMs = config.api.retryDelay,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        break;
      }

      if (error instanceof APIError && !error.retryable) {
        throw error;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new APIError(
    `Failed after ${maxAttempts} attempts: ${lastError!.message}`,
    undefined,
    false
  );
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = config.api.timeout
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new APIError('Request timeout', 408, true)),
        timeoutMs
      )
    ),
  ]);
}

export async function safeApiCall<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    console.error('API call failed:', error);
    return {
      data: fallback ?? null,
      error: error as Error,
    };
  }
}
