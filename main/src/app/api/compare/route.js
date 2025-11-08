import { NextResponse } from 'next/server'
import { compareRoutes } from '@/services/routeService'

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
 * TODO: Add authentication/API key validation for monetization
 * TODO: Add rate limiting
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { start, end, preferences } = body

    // Validation
    if (!start || !end) {
      return NextResponse.json(
        { error: 'Both start and end locations are required' },
        { status: 400 }
      )
    }

    // TODO: Validate API key here for monetization
    // const apiKey = request.headers.get('x-api-key')
    // if (!apiKey || !isValidApiKey(apiKey)) {
    //   return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    // }

    // TODO: Implement rate limiting
    // const rateLimitOk = await checkRateLimit(apiKey, request.ip)
    // if (!rateLimitOk) {
    //   return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    // }

    // TODO: If user is authenticated, load their preferences from Firestore
    // For now, use preferences from request body or defaults

    // Fetch routes from all enabled providers
    const routes = await compareRoutes(start, end, preferences)

    // Transform routes for frontend compatibility
    const results = transformRoutesForFrontend(routes)

    return NextResponse.json({
      success: true,
      start,
      end,
      results,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
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
