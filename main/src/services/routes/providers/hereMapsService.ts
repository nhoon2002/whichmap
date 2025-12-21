/**
 * HERE Maps Service
 * Fetches directions using HERE Routing API v8
 * Documentation: https://developer.here.com/documentation/routing-api/8/dev_guide/index.html
 *
 * Features:
 * - Traffic-aware routing
 * - ETA, distance, and route summary
 * - Free tier: 250,000 transactions/month
 * - Pricing: $1 per 1,000 requests after free tier
 */

import type { Location, ProviderRouteResponse, RouteOptions, RawRouteData, Coordinates } from '@/types'

const HERE_API_KEY = process.env.HERE_API_KEY
const HERE_ROUTING_API_BASE = 'https://router.hereapi.com/v8'

/**
 * HERE Routing API Response Types
 */
interface HereRoute {
  id: string
  sections: HereRouteSection[]
}

interface HereRouteSection {
  id: string
  type: string
  departure: {
    place: {
      location: {
        lat: number
        lng: number
      }
    }
  }
  arrival: {
    place: {
      location: {
        lat: number
        lng: number
      }
    }
  }
  summary: {
    duration: number // seconds
    length: number // meters
    baseDuration?: number
  }
  polyline?: string
  transport?: {
    mode: string
  }
}

interface HereRoutingResponse {
  routes: HereRoute[]
  notices?: Array<{
    title: string
    code: string
  }>
}

/**
 * Get route from HERE Routing API v8
 */
export async function getRoute(
  origin: Location,
  destination: Location,
  options: RouteOptions = {}
): Promise<ProviderRouteResponse> {
  if (!HERE_API_KEY) {
    throw new Error('HERE Maps API key is not configured')
  }

  try {
    // Format origin and destination for HERE API (must be coordinates)
    const originCoords = formatLocationForAPI(origin)
    const destinationCoords = formatLocationForAPI(destination)

    // Build query parameters
    const params = new URLSearchParams({
      apiKey: HERE_API_KEY,
      transportMode: 'car',
      origin: originCoords,
      destination: destinationCoords,
      return: 'summary,polyline,travelSummary',
      // Use traffic flow data for accurate ETAs (ISO 8601 format)
      departureTime: new Date().toISOString(),
    })

    // Add route modifiers based on options
    if (options.avoid === 'tolls') {
      params.append('avoid[features]', 'tollRoad')
    }
    if (options.avoid === 'highways') {
      params.append('avoid[features]', 'controlledAccessHighway')
    }
    if (options.avoid === 'ferries') {
      params.append('avoid[features]', 'ferry')
    }

    // Call HERE Routing API
    const response = await fetch(`${HERE_ROUTING_API_BASE}/routes?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData: unknown = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        // Response is not JSON
      }

      console.error('HERE Maps API Error Details:')
      console.error('  Status:', response.status)
      console.error('  Response:', errorText)

      throw new Error(
        `HERE Maps API error: ${response.status} - ${errorText || 'Unknown error'}`
      )
    }

    const data: HereRoutingResponse = await response.json()

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found from HERE Maps')
    }

    // Normalize the response to match our route format
    return normalizeHereRoutingResponse(data, origin, destination)
  } catch (error) {
    console.error('HERE Maps API error:', error instanceof Error ? error.message : error)
    throw error
  }
}

/**
 * Format location for HERE Maps API
 * HERE Routing API requires coordinates as "lat,lng" string format
 */
function formatLocationForAPI(location: Location): string {
  // If it's a coordinate object, format as "lat,lng" string
  if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
    return `${location.lat},${location.lng}`
  }

  // If it's a string, assume it needs geocoding
  // NOTE: HERE Maps Routing API requires coordinates, not addresses
  if (typeof location === 'string') {
    throw new Error('HERE Maps Routing API requires coordinates. Please geocode addresses first.')
  }

  throw new Error('Invalid location format. Must be {lat, lng} object')
}

/**
 * Normalize HERE Routing API response to our standard route format
 */
function normalizeHereRoutingResponse(
  routingResponse: HereRoutingResponse,
  origin: Location,
  destination: Location
): ProviderRouteResponse {
  const routes: RawRouteData[] = routingResponse.routes.map((route, index) => {
    // HERE returns route sections - typically just one section for car routes
    const section = route.sections[0]

    if (!section) {
      throw new Error('Route section missing from HERE Maps response')
    }

    // Extract duration and distance from summary
    const durationSeconds = section.summary.duration || 0
    const distanceMeters = section.summary.length || 0

    return {
      // Route identification
      provider: 'here',
      summary: `Route ${index + 1}`,

      // Duration (seconds)
      duration: durationSeconds,
      durationText: formatDuration(durationSeconds),
      durationInTraffic: durationSeconds, // HERE already includes traffic in duration
      durationInTrafficText: formatDuration(durationSeconds),

      // Distance
      distance: distanceMeters,
      distanceText: formatDistance(distanceMeters),

      // Start/End locations
      startAddress: formatLocationDisplay(origin),
      endAddress: formatLocationDisplay(destination),
      startLocation: section.departure?.place?.location
        ? { lat: section.departure.place.location.lat, lng: section.departure.place.location.lng }
        : undefined,
      endLocation: section.arrival?.place?.location
        ? { lat: section.arrival.place.location.lat, lng: section.arrival.place.location.lng }
        : undefined,

      // Additional info
      warnings: routingResponse.notices?.map(notice => notice.title) || [],

      // Steps (HERE API doesn't provide turn-by-turn in this endpoint)
      steps: [],

      // Polyline for map display (encoded)
      polyline: section.polyline || '',
    }
  })

  return {
    routes,
    status: 'OK',
  }
}

/**
 * Format location for display purposes
 */
function formatLocationDisplay(location: Location): string {
  if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
  }
  return String(location)
}

/**
 * Format duration in seconds to human-readable text
 */
function formatDuration(seconds: number): string {
  if (!seconds) return '0 min'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`
  }
  return `${minutes} min`
}

/**
 * Format distance in meters to human-readable text
 */
function formatDistance(meters: number): string {
  if (!meters) return '0 mi'

  const miles = (meters * 0.000621371).toFixed(1)
  return `${miles} mi`
}

/**
 * Generate Universal Link for HERE Maps (RECOMMENDED)
 * Opens in HERE WeGo app on mobile if installed, otherwise web
 * Format: https://share.here.com/r/{origin_lat},{origin_lng}/{dest_lat},{dest_lng}
 */
export function getUniversalLink(origin: Location, destination: Location): string {
  const originStr = formatLocationForUrl(origin)
  const destinationStr = formatLocationForUrl(destination)

  // HERE share.here.com deep link format
  // This opens the HERE WeGo app on mobile, or web map if app not installed
  return `https://share.here.com/r/${originStr}/${destinationStr}`
}

/**
 * Generate deep link URL for HERE Maps app
 * Opens in HERE WeGo app on iOS/Android
 * Note: Universal Links (share.here.com) are recommended over this
 */
export function getDeepLinkUrl(origin: Location, destination: Location): string {
  const originStr = formatLocationForUrl(origin)
  const destinationStr = formatLocationForUrl(destination)

  // Same as universal link - share.here.com works for both web and app
  return `https://share.here.com/r/${originStr}/${destinationStr}`
}

/**
 * Generate web URL for HERE Maps
 */
export function getWebUrl(origin: Location, destination: Location): string {
  // Universal Link and Web URL are the same for HERE Maps
  return getUniversalLink(origin, destination)
}

/**
 * Format location for URL (deep link or web link)
 */
function formatLocationForUrl(location: Location): string {
  // If it's a coordinate object, format as "lat,lng"
  if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
    return `${location.lat},${location.lng}`
  }

  // If it's a string address, return as-is (URL encoded)
  return encodeURIComponent(location)
}

/**
 * Get multiple routes with different options
 */
export async function getRouteVariants(origin: Location, destination: Location) {
  const variants = await Promise.allSettled([
    // Default route
    getRoute(origin, destination),

    // Avoid highways
    getRoute(origin, destination, { avoid: 'highways' }),

    // Avoid tolls
    getRoute(origin, destination, { avoid: 'tolls' }),
  ])

  return {
    default: variants[0].status === 'fulfilled' ? variants[0].value : null,
    avoidHighways: variants[1].status === 'fulfilled' ? variants[1].value : null,
    avoidTolls: variants[2].status === 'fulfilled' ? variants[2].value : null,
  }
}
