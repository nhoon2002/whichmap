import { NextResponse } from 'next/server'
import { compareRoutes } from '@/services/routes/routeService'
import { validateRouteComparison } from '@/lib/validation'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/ratelimit'

/**
 * POST /api/compare
 * Compare routes across map providers
 *
 * Body: {
 *   start: string,
 *   end: string,
 *   preferences: { navServices: { google, apple, waze } } (optional)
 * }
 * Returns: Array of routes from enabled providers
 *
 * Security:
 * - Rate limiting: 10 requests per minute per IP
 * - Input validation: Zod schema validation
 * - Error sanitization: No internal details exposed
 *
 * TODO: Add API key authentication for monetization
 */
export async function POST(request) {
  try {
    // 1. Rate Limiting
    const rateLimitResult = await checkRateLimit(request)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    // 2. Parse and validate input
    const body = await request.json()
    const validation = validateRouteComparison(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { 
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    const { start, end, preferences } = validation.data

    // TODO: API key validation for monetization
    // const apiKey = request.headers.get('x-api-key')
    // if (!apiKey || !isValidApiKey(apiKey)) {
    //   return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    // }

    // TODO: If user is authenticated, load their preferences from Firestore
    // For now, use preferences from request body or defaults

    // 3. Fetch routes from all enabled providers
    const routes = await compareRoutes(start, end, preferences)

    // 4. Transform routes for frontend compatibility
    const results = transformRoutesForFrontend(routes)

    return NextResponse.json(
      {
        success: true,
        start,
        end,
        results,
        timestamp: new Date().toISOString(),
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    )

  } catch (error) {
    // Log error internally but don't expose details to client
    console.error('API Error:', error)
    
    // Determine if it's a known error type
    const isGoogleApiError = error.message?.includes('Google Maps')
    const isValidationError = error.message?.includes('Invalid')
    
    return NextResponse.json(
      {
        error: isGoogleApiError 
          ? 'Unable to fetch route data. Please try again.'
          : isValidationError
          ? 'Invalid request. Please check your input.'
          : 'An error occurred while processing your request.',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/compare?start={start}&end={end}
 * Alternative endpoint using query parameters
 */
export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json(
      { error: 'Both start and end query parameters are required' },
      { status: 400 }
    )
  }

  // Reuse POST logic
  return POST(new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ start, end })
  }))
}

/**
 * Transform routes from service layer to frontend format
 * Maintains backward compatibility with existing frontend code
 * @private
 */
function transformRoutesForFrontend(routes) {
  return routes.map(route => {
    // For providers with full route data (like Google)
    if (route.duration && route.distance) {
      return {
        id: route.provider,
        provider: formatProviderName(route.provider),
        eta: Math.round(route.durationInTraffic / 60) || Math.round(route.duration / 60),
        distance: route.distanceText,
        unit: 'min',

        // Additional data for detailed view
        summary: route.summary,
        durationText: route.durationInTrafficText || route.durationText,
        startAddress: route.startAddress,
        endAddress: route.endAddress,
        warnings: route.warnings,
        steps: route.steps,
        deepLink: route.deepLink,
        webLink: route.webLink,
      }
    }

    // For providers with only deep links (Apple, Waze - not implemented yet)
    return {
      id: route.provider,
      provider: formatProviderName(route.provider),
      message: route.message,
      deepLink: route.deepLink,
      webLink: route.webLink,
    }
  })
}

/**
 * Format provider name for display
 * @private
 */
function formatProviderName(provider) {
  const names = {
    google: 'Google Maps',
    apple: 'Apple Maps',
    waze: 'Waze',
  }
  return names[provider] || provider
}
