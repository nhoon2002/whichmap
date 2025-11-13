/**
 * Google Maps Service
 * Abstracts Google Maps Routes API operations (v2)
 * Uses the official @googlemaps/routing SDK
 *
 * PERFORMANCE NOTE: Routes API v2 is slower than legacy Directions API
 * - Legacy API: ~500ms response time
 * - Routes API v2: ~4000ms response time
 * Trade-off: Better accuracy, traffic-aware routing, more features
 */

import { RoutesClient } from '@googlemaps/routing'
import type { Location, ProviderRouteResponse, RouteOptions, RawRouteData, RouteStep } from '@/types'
import type {
  GoogleMapsLocation,
  GoogleRoutesResponse,
  GoogleRoute,
  GoogleRouteLeg,
  GoogleRouteStep,
  Duration,
  googleLatLngToCoordinates,
} from '@/types/googleMaps'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

// Initialize the Routes API client
const routesClient = new RoutesClient({
  apiKey: GOOGLE_MAPS_API_KEY,
})

/**
 * Format location for Google Maps Routes API
 * Accepts either address string or coordinate object
 */
function formatLocation(location: Location): GoogleMapsLocation {
  // If it's a coordinate object, format for Google Maps
  if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
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
 */
export async function getRoute(
  origin: Location,
  destination: Location,
  options: RouteOptions = {}
): Promise<ProviderRouteResponse> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured')
  }

  try {
    // Prepare request for Routes API
    const request = {
      origin: formatLocation(origin),
      destination: formatLocation(destination),
      travelMode: 'DRIVE' as const,
      routingPreference: 'TRAFFIC_AWARE_OPTIMAL' as const, // Use traffic data for best ETA
      computeAlternativeRoutes: true, // Get multiple route options
      routeModifiers: {
        avoidTolls: options.avoid === 'tolls',
        avoidHighways: options.avoid === 'highways',
        avoidFerries: false,
      },
      languageCode: 'en-US',
      units: 'IMPERIAL' as const,
    }

    // Call Routes API
    const [response] = await routesClient.computeRoutes(request as unknown as Parameters<typeof routesClient.computeRoutes>[0], {
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
    return normalizeRoutesApiResponse(response as unknown as GoogleRoutesResponse)
  } catch (error) {
    console.error('Google Maps Routes API error:', error)
    throw error
  }
}

/**
 * Normalize Routes API (v2) response to our standard format
 */
function normalizeRoutesApiResponse(routesResponse: GoogleRoutesResponse): ProviderRouteResponse {
  const routes: RawRouteData[] = routesResponse.routes.map((route: GoogleRoute, index: number) => {
    const leg: GoogleRouteLeg | undefined = route.legs?.[0] // First leg of the route

    // Convert duration from protobuf Duration format (e.g., "123s") to seconds
    const durationSeconds = parseDuration(route.duration)
    const distanceMeters = route.distanceMeters || 0

    return {
      // Route identification
      provider: 'google',
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
      startLocation: leg?.startLocation?.latLng
        ? { lat: leg.startLocation.latLng.latitude, lng: leg.startLocation.latLng.longitude }
        : undefined,
      endLocation: leg?.endLocation?.latLng
        ? { lat: leg.endLocation.latLng.latitude, lng: leg.endLocation.latLng.longitude }
        : undefined,

      // Warnings and additional info
      warnings: route.warnings || [],

      // Steps (if legs data is available)
      steps: leg?.steps?.map((step: GoogleRouteStep): RouteStep => ({
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
 */
function parseDuration(duration: Duration | undefined): number {
  if (!duration) return 0

  if (typeof duration === 'string') {
    return parseInt(duration.replace('s', ''), 10) || 0
  }

  if (typeof duration === 'object' && 'seconds' in duration) {
    return parseInt(String(duration.seconds), 10) || 0
  }

  return 0
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
 * Get multiple routes with different options (e.g., avoid highways, tolls)
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

/**
 * Generate Universal Link for Google Maps (RECOMMENDED)
 * Works on all platforms - desktop opens in browser, mobile opens in app if installed
 */
export function getUniversalLink(origin: Location, destination: Location): string {
  const originStr = formatLocationForUrl(origin)
  const destinationStr = formatLocationForUrl(destination)

  const params = new URLSearchParams({
    api: '1',
    origin: originStr,
    destination: destinationStr,
    travelmode: 'driving',
  })

  return `https://www.google.com/maps/dir/?${params}`
}

/**
 * Generate deep link URL for Google Maps app (iOS-specific)
 * Note: Universal Links are recommended over this
 */
export function getDeepLinkUrl(origin: Location, destination: Location): string {
  const originStr = formatLocationForUrl(origin)
  const destinationStr = formatLocationForUrl(destination)

  const params = new URLSearchParams({
    saddr: originStr,
    daddr: destinationStr,
    directionsmode: 'driving',
  })

  return `comgooglemaps://?${params}`
}

/**
 * Generate web URL for Google Maps
 */
export function getWebUrl(origin: Location, destination: Location): string {
  // Universal Link and Web URL are the same for Google Maps
  return getUniversalLink(origin, destination)
}
