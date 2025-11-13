/**
 * Rate Limiting Utility
 * In-memory rate limiting (use Upstash Redis for production)
 */

import type { RateLimitResult } from '@/types'

class InMemoryRatelimit {
  private requests: Map<string, number[]>
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.requests = new Map()
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const userRequests = this.requests.get(identifier) || []
    
    // Filter out requests outside the time window
    const recentRequests = userRequests.filter(time => now - time < this.windowMs)
    
    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      const oldestRequest = recentRequests[0] ?? now
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: oldestRequest + this.windowMs,
      }
    }
    
    // Add current request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    
    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - recentRequests.length,
      reset: now + this.windowMs,
    }
  }
}

// Create rate limiter instance (10 requests per minute)
const rateLimiter = new InMemoryRatelimit(10, 60 * 1000)

export async function checkRateLimit(request: Request): Promise<RateLimitResult> {
  // Get client IP (in production, use proper IP detection)
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  return rateLimiter.check(ip)
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  }
}
