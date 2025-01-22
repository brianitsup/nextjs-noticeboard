interface RateLimitInfo {
  attempts: number;
  firstAttempt: number;
  blocked: boolean;
}

class RateLimit {
  private attempts: Map<string, RateLimitInfo>;
  private readonly maxAttempts: number;
  private readonly timeWindowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts = 5, timeWindowMs = 15 * 60 * 1000, blockDurationMs = 60 * 60 * 1000) {
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.timeWindowMs = timeWindowMs;
    this.blockDurationMs = blockDurationMs;
  }

  check(key: string): { blocked: boolean; remainingAttempts: number; blockedUntil?: Date } {
    const now = Date.now();
    const info = this.attempts.get(key);

    if (!info) {
      this.attempts.set(key, {
        attempts: 1,
        firstAttempt: now,
        blocked: false
      });
      return { blocked: false, remainingAttempts: this.maxAttempts - 1 };
    }

    // Check if currently blocked
    if (info.blocked) {
      const blockedUntil = new Date(info.firstAttempt + this.blockDurationMs);
      if (now < info.firstAttempt + this.blockDurationMs) {
        return { blocked: true, remainingAttempts: 0, blockedUntil };
      }
      // Block duration expired, reset attempts
      this.attempts.delete(key);
      return this.check(key);
    }

    // Check if time window expired
    if (now > info.firstAttempt + this.timeWindowMs) {
      // Reset attempts
      this.attempts.set(key, {
        attempts: 1,
        firstAttempt: now,
        blocked: false
      });
      return { blocked: false, remainingAttempts: this.maxAttempts - 1 };
    }

    // Increment attempts
    info.attempts++;
    this.attempts.set(key, info);

    // Check if should be blocked
    if (info.attempts > this.maxAttempts) {
      info.blocked = true;
      const blockedUntil = new Date(now + this.blockDurationMs);
      return { blocked: true, remainingAttempts: 0, blockedUntil };
    }

    return {
      blocked: false,
      remainingAttempts: this.maxAttempts - info.attempts
    };
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Create a singleton instance
export const adminLoginRateLimit = new RateLimit(); 