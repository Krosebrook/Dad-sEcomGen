import { useState, useCallback } from 'react';
import { withRetry, RetryOptions, handleError } from '../utils/errors';

interface UseRetryOptions<T> extends RetryOptions {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useRetry<T>(
  asyncFn: () => Promise<T>,
  options: UseRetryOptions<T> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await withRetry(asyncFn, {
        ...options,
        onRetry: (attempt, err) => {
          setRetryCount(attempt);
          options.onRetry?.(attempt, err);
        },
      });

      setData(result);
      options.onSuccess?.(result);
      setRetryCount(0);
      return result;
    } catch (err) {
      const appError = handleError(err);
      setError(appError);
      options.onError?.(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, options]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
    setRetryCount(0);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    retryCount,
    reset,
  };
}
