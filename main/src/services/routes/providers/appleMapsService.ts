/**
 * Apple Maps Server API Service
 * Fetches directions using Apple Maps Server API
 * Documentation: https://developer.apple.com/documentation/applemapsserverapi
 *
 * Authentication Flow:
 * 1. Generate JWT token from private key (ES256, 1 hour expiry)
 * 2. Exchange JWT for access token at /v1/token endpoint
 * 3. Use access token for API calls (30 minute expiry)
 *
 * NOTE: Apple Maps Server API only provides ETA (distance + time), no route polylines
 */

import { getAppleMapsAccessToken } from '@/lib/appleJWT'
import type { Location, ProviderRouteResponse, RouteOptions, RawRouteData, Coordinates } from '@/types'
import type { AppleEtaResponse } from '@/types/appleMaps'

const APPLE_MAPS_API_BASE = 'https://maps-api.apple.com/v1'

/**
 * Get route from Apple Maps Server API
 * NOTE: Apple Maps Server API only provides ETA (distance + time), not full route details
 */
export async function getRoute(
  origin: Location,
  destination: Location,
  options: RouteOptions = {}
): Promise<ProviderRouteResponse> {
  try {
    // Get Apple Maps access token (JWT exchange handled internally)
    const accessToken = await getAppleMapsAccessToken()

    // Format origin and destination for Apple Maps API (must be coordinates)
    const originCoords = formatLocationForAPI(origin)
    const destinationCoords = formatLocationForAPI(destination)

    // Build query parameters for ETA API
    const params = new URLSearchParams({
      origin: originCoords,
      destinations: destinationCoords, // Note: plural "destinations"
      transportType: options.transportType || 'Automobile',
    })

    // Call Apple Maps ETA API (GET request with query params)
    const response = await fetch(`${APPLE_MAPS_API_BASE}/etas?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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

      console.error('Apple Maps API Error Details:')
      console.error('  Status:', response.status)
      console.error('  Response:', errorText)
      console.error('  Parsed:', errorData)

      // Extract error message safely
      const getErrorMessage = (data: unknown): string => {
        if (typeof data === 'object' && data !== null) {
          if ('error' in data && typeof data.error === 'object' && data.error !== null && 'message' in data.error) {
            return String(data.error.message)
          }
          if ('message' in data) {
            return String(data.message)
          }
        }
        return ''
      }

      throw new Error(
        `Apple Maps API error: ${response.status} - ${getErrorMessage(errorData) || errorText || 'Unknown error'}`
      )
    }

    const data: AppleEtaResponse = await response.json()

    if (!data.etas || data.etas.length === 0) {
      throw new Error('No ETA data found from Apple Maps')
    }

    // Normalize the ETA response to match our route format
    return normalizeAppleMapsEtaResponse(data, origin, destination)
  } catch (error) {
    console.error('Apple Maps API error:', error instanceof Error ? error.message : error)
    throw error
  }
}

/**
 * Format location for Apple Maps API
 * Apple Maps ETA API requires coordinates as "lat,lng" string format
 */
function formatLocationForAPI(location: Location): string {
  // If it's a coordinate object, format as "lat,lng" string
  if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
    return `${location.lat},${location.lng}`
  }

  // If it's a string, assume it needs geocoding
  // NOTE: Apple Maps Server API requires coordinates, not addresses
  if (typeof location === 'string') {
    throw new Error('Apple Maps ETA API requires coordinates. Please geocode addresses first.')
  }

  throw new Error('Invalid location format. Must be {lat, lng} object or "lat,lng" string')
}

/**
 * Normalize Apple Maps ETA API response to our standard route format
 * NOTE: Apple only provides distance and time, no route polylines or turn-by-turn steps
 */
function normalizeAppleMapsEtaResponse(
  etaResponse: AppleEtaResponse,
  origin: Location,
  destination: Location
): ProviderRouteResponse {
  const routes: RawRouteData[] = etaResponse.etas.map((eta, index) => {
    // Apple returns duration in seconds and distance in meters
    const durationSeconds = eta.expectedTravelTimeSeconds || 0
    const distanceMeters = eta.distanceMeters || 0

    return {
      // Route identification
      provider: 'apple',
      summary: `Route via ${eta.transportType || 'Automobile'}`,

      // Duration (seconds)
      duration: durationSeconds,
      durationText: formatDuration(durationSeconds),
      durationInTraffic: durationSeconds, // Apple's ETA includes traffic
      durationInTrafficText: formatDuration(durationSeconds),

      // Distance
      distance: distanceMeters,
      distanceText: formatDistance(distanceMeters),

      // Start/End locations
      startAddress: formatLocationDisplay(origin),
      endAddress: formatLocationDisplay(destination),
      startLocation: eta.destination ? { lat: eta.destination.latitude, lng: eta.destination.longitude } : undefined,
      endLocation: eta.destination ? { lat: eta.destination.latitude, lng: eta.destination.longitude } : undefined,

      // Additional info
      warnings: [],

      // Apple ETA API does not provide these
      steps: [],
      polyline: '',
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
 * Get multiple ETAs with different transport types
 */
export async function getRouteVariants(origin: Location, destination: Location) {
  const variants = await Promise.allSettled([
    // Automobile
    getRoute(origin, destination, { transportType: 'Automobile' }),

    // Walking
    getRoute(origin, destination, { transportType: 'Walking' }),

    // Transit
    getRoute(origin, destination, { transportType: 'Transit' }),
  ])

  return {
    automobile: variants[0].status === 'fulfilled' ? variants[0].value : null,
    walking: variants[1].status === 'fulfilled' ? variants[1].value : null,
    transit: variants[2].status === 'fulfilled' ? variants[2].value : null,
  }
}

/**
 * Generate Universal Link for Apple Maps (RECOMMENDED)
 * Works on all platforms - automatically opens in app on iOS/macOS if installed
 */
export function getUniversalLink(origin: Location, destination: Location): string {
  const originStr = formatLocationForUrl(origin)
  const destinationStr = formatLocationForUrl(destination)

  const params = new URLSearchParams({
    saddr: originStr,
    daddr: destinationStr,
    dirflg: 'd', // d = driving
  })

  return `https://maps.apple.com/?${params}`
}

/**
 * Generate deep link URL for Apple Maps app
 * Opens in Apple Maps app on iOS/macOS
 * Note: Universal Links are recommended over this
 */
export function getDeepLinkUrl(origin: Location, destination: Location): string {
  const originStr = formatLocationForUrl(origin)
  const destinationStr = formatLocationForUrl(destination)

  const params = new URLSearchParams({
    saddr: originStr,
    daddr: destinationStr,
    dirflg: 'd', // driving directions
  })

  return `maps://maps.apple.com/?${params}`
}

/**
 * Generate web URL for Apple Maps
 */
export function getWebUrl(origin: Location, destination: Location): string {
  // Universal Link and Web URL are the same for Apple Maps
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

  // If it's a string address, return as-is
  return location
}
