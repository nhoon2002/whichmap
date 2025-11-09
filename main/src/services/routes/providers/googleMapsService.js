/**
 * Google Maps Service
 * Abstracts Google Maps Routes API operations (v2)
 * Uses the official @googlemaps/routing SDK
 * Makes it easier to swap map providers later
 *
 * PERFORMANCE NOTE: Routes API v2 is slower than legacy Directions API
 * - Legacy API: ~500ms response time
 * - Routes API v2: ~4000ms response time
 * Trade-off: Better accuracy, traffic-aware routing, more features
 */

import { RoutesClient } from '@googlemaps/routing'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

// Initialize the Routes API client
const routesClient = new RoutesClient({
  apiKey: GOOGLE_MAPS_API_KEY,
})

/**
 * Format location for Google Maps Routes API
 * Accepts either address string or coordinate object
 * @param {string|object} location - Address string or {lat, lng} object
 * @returns {object} Formatted location for Google Maps API
 * @private
 */
function formatLocation(location) {
  // If it's a coordinate object, format for Google Maps
  if (typeof location === 'object' && location.lat && location.lng) {
    return {
      location: {
        latLng: {
          latitude: location.lat,
          longitude: location.lng,
        },
      },
    }
  }

  // If it's a string address, use address format
  if (typeof location === 'string') {
    return {
      address: location,
    }
  }

  throw new Error('Invalid location format. Must be address string or {lat, lng} object')
}

/**
 * Get route from Google Maps Routes API (v2)
 * @param {string|object} origin - Starting location (address string or {lat, lng} object)
 * @param {string|object} destination - Ending location (address string or {lat, lng} object)
 * @param {object} options - Additional options (avoid, travel_mode, etc.)
 * @returns {Promise<object>} Normalized route object
 */
export async function getRoute(origin, destination, options = {}) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured')
  }

  try {
    // Prepare request for Routes API
    const request = {
      origin: formatLocation(origin),
      destination: formatLocation(destination),
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE_OPTIMAL', // Use traffic data for best ETA
      computeAlternativeRoutes: true, // Get multiple route options
      routeModifiers: {
        avoidTolls: options.avoid === 'tolls',
        avoidHighways: options.avoid === 'highways',
        avoidFerries: false,
      },
      languageCode: 'en-US',
      units: 'IMPERIAL',
    }

    // Call Routes API
    const [response] = await routesClient.computeRoutes(request, {
      otherArgs: {
        headers: {
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs,routes.description,routes.warnings,routes.localizedValues',
        },
      },
    })

    if (!response.routes || response.routes.length === 0) {
      throw new Error('No routes found')
    }

    // Normalize the response to match our format
    return normalizeRoutesApiResponse(response)
  } catch (error) {
    console.error('Google Maps Routes API error:', error)
    throw error
  }
}

/**
 * Normalize Routes API (v2) response to our standard format
 * @param {object} routesResponse - Raw Routes API response
 * @returns {object} Normalized route data
 */
function normalizeRoutesApiResponse(routesResponse) {
  const routes = routesResponse.routes.map((route, index) => {
    const leg = route.legs?.[0] // First leg of the route

    // Convert duration from protobuf Duration format (e.g., "123s") to seconds
    const durationSeconds = parseDuration(route.duration)
    const distanceMeters = route.distanceMeters || 0

    return {
      // Route identification
      provider: 'google',
      routeIndex: index,
      summary: route.description || `Route ${index + 1}`,

      // Duration (seconds)
      duration: durationSeconds,
      durationText: formatDuration(durationSeconds),
      durationInTraffic: durationSeconds, // Routes API already uses traffic-aware routing
      durationInTrafficText: formatDuration(durationSeconds),

      // Distance
      distance: distanceMeters,
      distanceText: formatDistance(distanceMeters),

      // Start/End locations (from leg if available)
      startAddress: leg?.startLocation?.address || 'Start',
      endAddress: leg?.endLocation?.address || 'End',
      startLocation: leg?.startLocation?.latLng,
      endLocation: leg?.endLocation?.latLng,

      // Warnings and additional info
      warnings: route.warnings || [],
      copyrights: 'Map data ©2024 Google',

      // Steps (if legs data is available)
      steps: leg?.steps?.map(step => ({
        instruction: step.navigationInstruction?.instructions || '',
        distance: formatDistance(step.distanceMeters || 0),
        duration: formatDuration(parseDuration(step.staticDuration)),
        maneuver: step.navigationInstruction?.maneuver || '',
      })) || [],

      // Polyline for map display (encoded)
      polyline: route.polyline?.encodedPolyline || '',
    }
  })

  return {
    routes,
    status: 'OK',
  }
}

/**
 * Parse protobuf Duration format (e.g., "123s") to seconds
 * @param {string|object} duration - Duration in protobuf format
 * @returns {number} Duration in seconds
 */
function parseDuration(duration) {
  if (!duration) return 0

  if (typeof duration === 'string') {
    return parseInt(duration.replace('s', ''), 10) || 0
  }

  if (typeof duration === 'object' && duration.seconds) {
    return parseInt(duration.seconds, 10) || 0
  }

  return 0
}

/**
 * Format duration in seconds to human-readable text
 * @param {number} seconds
 * @returns {string}
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
 */
function formatDistance(meters) {
  if (!meters) return '0 mi'

  const miles = (meters * 0.000621371).toFixed(1)
  return `${miles} mi`
}

/**
 * Get multiple routes with different options (e.g., avoid highways, tolls)
 * @param {string} origin
 * @param {string} destination
 * @returns {Promise<object>} Routes with different options
 */
export async function getRouteVariants(origin, destination) {
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

/**
 * Generate deep link URL for Google Maps app
 * @param {string} origin
 * @param {string} destination
 * @returns {string} Deep link URL
 */
export function getDeepLinkUrl(origin, destination) {
  const params = new URLSearchParams({
    saddr: origin,
    daddr: destination,
    directionsmode: 'driving',
  })

  return `comgooglemaps://?${params}`
}

/**
 * Generate web URL for Google Maps
 * @param {string} origin
 * @param {string} destination
 * @returns {string} Web URL
 */
export function getWebUrl(origin, destination) {
  const params = new URLSearchParams({
    api: '1',
    origin,
    destination,
    travelmode: 'driving',
  })

  return `https://www.google.com/maps/dir/?${params}`
}
