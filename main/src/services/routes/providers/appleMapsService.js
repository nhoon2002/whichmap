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
 * Supports both address strings and coordinate objects for future Google Places integration
 */

import { getAppleMapsAccessToken } from '@/lib/appleJWT'

const APPLE_MAPS_API_BASE = 'https://maps-api.apple.com/v1'

/**
 * Get route from Apple Maps Server API
 * NOTE: Apple Maps Server API only provides ETA (distance + time), not full route details
 * @param {string|object} origin - Starting location (address string or {lat, lng} object)
 * @param {string|object} destination - Ending location (address string or {lat, lng} object)
 * @param {object} options - Additional options (transportType, departureDate, etc.)
 * @returns {Promise<object>} Normalized route object
 */
export async function getRoute(origin, destination, options = {}) {
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

    // Add optional departure date if provided
    if (options.departureDate) {
      params.append('departureDate', options.departureDate)
    }

    // Call Apple Maps ETA API (GET request with query params)
    const response = await fetch(`${APPLE_MAPS_API_BASE}/etas?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        // Response is not JSON
      }

      console.error('Apple Maps API Error Details:')
      console.error('  Status:', response.status)
      console.error('  Response:', errorText)
      console.error('  Parsed:', errorData)

      throw new Error(
        `Apple Maps API error: ${response.status} - ${errorData.error?.message || errorData.message || errorText || 'Unknown error'}`
      )
    }

    const data = await response.json()

    if (!data.etas || data.etas.length === 0) {
      throw new Error('No ETA data found from Apple Maps')
    }

    // Normalize the ETA response to match our route format
    return normalizeAppleMapsEtaResponse(data, origin, destination)
  } catch (error) {
    console.error('Apple Maps API error:', error.message)
    throw error
  }
}

/**
 * Format location for Apple Maps API
 * Apple Maps ETA API requires coordinates as "lat,lng" string format
 * @param {string|object} location - Address string or {lat, lng} object
 * @returns {string} Formatted location as "lat,lng" string
 * @private
 */
function formatLocationForAPI(location) {
  // If it's a coordinate object, format as "lat,lng" string
  if (typeof location === 'object' && location.lat && location.lng) {
    return `${location.lat},${location.lng}`
  }

  // If it's a string, assume it's already in "lat,lng" format or needs geocoding
  // NOTE: Apple Maps Server API requires coordinates, not addresses
  // You'll need to geocode addresses first using /v1/geocode endpoint
  if (typeof location === 'string') {
    throw new Error('Apple Maps ETA API requires coordinates. Please geocode addresses first.')
  }

  throw new Error('Invalid location format. Must be {lat, lng} object or "lat,lng" string')
}

/**
 * Normalize Apple Maps ETA API response to our standard route format
 * NOTE: Apple only provides distance and time, no route polylines or turn-by-turn steps
 * @param {object} etaResponse - Raw Apple Maps ETA API response
 * @param {string|object} origin - Original origin input
 * @param {string|object} destination - Original destination input
 * @returns {object} Normalized route data
 * @private
 */
function normalizeAppleMapsEtaResponse(etaResponse, origin, destination) {
  const routes = etaResponse.etas.map((eta, index) => {
    // Apple returns duration in seconds and distance in meters
    const durationSeconds = eta.expectedTravelTimeSeconds || 0
    const distanceMeters = eta.distanceMeters || 0

    return {
      // Route identification
      provider: 'apple',
      routeIndex: index,
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
      startLocation: eta.destination ? { lat: eta.destination.latitude, lng: eta.destination.longitude } : null,
      endLocation: eta.destination ? { lat: eta.destination.latitude, lng: eta.destination.longitude } : null,

      // Additional info
      transportType: eta.transportType || 'Automobile',
      staticTravelTimeSeconds: eta.staticTravelTimeSeconds || durationSeconds,
      warnings: [],
      copyrights: 'Map data © Apple',

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
 * @param {string|object} location
 * @returns {string}
 * @private
 */
function formatLocationDisplay(location) {
  if (typeof location === 'object' && location.lat && location.lng) {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
  }
  return String(location)
}

/**
 * Format duration in seconds to human-readable text
 * @param {number} seconds
 * @returns {string}
 * @private
 */
function formatDuration(seconds) {
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
 * @param {number} meters
 * @returns {string}
 * @private
 */
function formatDistance(meters) {
  if (!meters) return '0 mi'

  const miles = (meters * 0.000621371).toFixed(1)
  return `${miles} mi`
}

/**
 * Get multiple ETAs with different transport types
 * @param {string|object} origin
 * @param {string|object} destination
 * @returns {Promise<object>} ETAs for different transport modes
 */
export async function getRouteVariants(origin, destination) {
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
 * @param {string|object} origin
 * @param {string|object} destination
 * @returns {string} Universal Link URL
 */
export function getUniversalLink(origin, destination) {
  const originStr = formatLocationForUrl(origin)
  const destinationStr = formatLocationForUrl(destination)

  const params = new URLSearchParams({
    saddr: originStr,
    daddr: destinationStr,
  })

  return `https://maps.apple.com/?${params}`
}

/**
 * Generate deep link URL for Apple Maps app
 * Opens in Apple Maps app on iOS/macOS
 * Note: Universal Links are recommended over this
 * @param {string|object} origin
 * @param {string|object} destination
 * @returns {string} Deep link URL
 */
export function getDeepLinkUrl(origin, destination) {
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
 * @param {string|object} origin
 * @param {string|object} destination
 * @returns {string} Web URL
 */
export function getWebUrl(origin, destination) {
  // Universal Link and Web URL are the same for Apple Maps
  return getUniversalLink(origin, destination)
}

/**
 * Format location for URL (deep link or web link)
 * @param {string|object} location - Address string or {lat, lng} object
 * @returns {string} Formatted location string for URL
 * @private
 */
function formatLocationForUrl(location) {
  // If it's a coordinate object, format as "lat,lng"
  if (typeof location === 'object' && location.lat && location.lng) {
    return `${location.lat},${location.lng}`
  }

  // If it's a string address, return as-is
  return location
}
