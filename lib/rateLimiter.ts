class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  tryRequest(key: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    const validRequests = requests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (validRequests.length >= this.maxRequests) {
      const oldestRequest = validRequests[0];
      const retryAfter = this.windowMs - (now - oldestRequest);

      return { allowed: false, retryAfter };
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);

    return { allowed: true };
  }

  reset(key: string): void {
    this.requests.delete(key);
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        timestamp => now - timestamp < this.windowMs
      );

      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

export const geminiRateLimiter = new RateLimiter(10, 60000);
export const authRateLimiter = new RateLimiter(5, 300000);

setInterval(() => {
  geminiRateLimiter.clearExpired();
  authRateLimiter.clearExpired();
}, 60000);

export function checkRateLimit(
  limiter: RateLimiter,
  key: string
): { allowed: boolean; error?: string } {
  const result = limiter.tryRequest(key);

  if (!result.allowed) {
    const seconds = Math.ceil(result.retryAfter! / 1000);
    return {
      allowed: false,
      error: `Rate limit exceeded. Please try again in ${seconds} seconds.`,
    };
  }

  return { allowed: true };
}
