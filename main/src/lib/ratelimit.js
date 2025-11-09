/**
 * Rate Limiting Utility
 * Protects API endpoints from abuse and excessive costs
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// In-memory fallback for development (when Upstash is not configured)
class InMemoryRatelimit {
  constructor(config) {
    this.requests = new Map()
    this.maxRequests = config.limiter.tokens
    this.windowMs = config.limiter.window
  }

  async limit(identifier) {
    const now = Date.now()
    const key = identifier
    const requests = this.requests.get(key) || []

    // Remove old requests outside the window
    const windowStart = now - this.windowMs
    const recentRequests = requests.filter((time) => time > windowStart)

    if (recentRequests.length >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: Math.min(...recentRequests) + this.windowMs,
      }
    }

    // Add current request
    recentRequests.push(now)
    this.requests.set(key, recentRequests)

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - recentRequests.length,
      reset: now + this.windowMs,
    }
  }
}

/**
 * Create rate limiter instance
 * Uses Upstash Redis if configured, otherwise falls back to in-memory
 */
function createRateLimiter() {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

  // Use Upstash if configured (production)
  if (upstashUrl && upstashToken) {
    const redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    })

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
      analytics: true,
      prefix: 'whichmap:ratelimit',
    })
  }

  // Fallback to in-memory for development
  console.warn('⚠️  Using in-memory rate limiting (development only)')
  return new InMemoryRatelimit({
    limiter: {
      tokens: 10,
      window: 60 * 1000, // 1 minute in milliseconds
    },
  })
}

// Singleton instance
let rateLimiter = null

/**
 * Get rate limiter instance
 * @returns {Ratelimit|InMemoryRatelimit}
 */
export function getRateLimiter() {
  if (!rateLimiter) {
    rateLimiter = createRateLimiter()
  }
  return rateLimiter
}

/**
 * Check rate limit for a request
 * @param {Request} request - Next.js request object
 * @returns {Promise<object>} { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkRateLimit(request) {
  const limiter = getRateLimiter()

  // Get identifier (IP address or fallback)
  const identifier = getIdentifier(request)

  // Check limit
  const result = await limiter.limit(identifier)

  return result
}

/**
 * Get unique identifier for rate limiting
 * Uses IP address or fallback to 'anonymous'
 * @param {Request} request
 * @returns {string}
 */
function getIdentifier(request) {
  // Try to get real IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  const ip =
    cfConnectingIp ||
    realIp ||
    (forwarded ? forwarded.split(',')[0].trim() : null) ||
    'anonymous'

  return `ip:${ip}`
}

/**
 * Format rate limit headers for response
 * @param {object} result - Rate limit result
 * @returns {object} Headers object
 */
export function getRateLimitHeaders(result) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  }
}

