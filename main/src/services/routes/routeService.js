/**
 * Route Service - Orchestrator
 * Coordinates multiple map providers and returns unified results
 * Respects user preferences for which services to use
 * Handles geocoding when addresses are provided instead of coordinates
 */

import * as googleMapsService from './providers/googleMapsService'
import * as appleMapsService from './providers/appleMapsService'
import * as wazeService from './providers/wazeService'
import { geocodeAddress } from '../geocoding/geocodingService'

/**
 * Provider registry
 * Maps provider ID to its service module and metadata
 */
const PROVIDERS = {
  google: {
    id: 'google',
    name: 'Google Maps',
    service: googleMapsService,
    hasAPI: true, // Has full route API
  },
  apple: {
    id: 'apple',
    name: 'Apple Maps',
    service: appleMapsService,
    hasAPI: true, // Full route API available
  },
  waze: {
    id: 'waze',
    name: 'Waze',
    service: wazeService,
    hasAPI: false, // Deep links only
  },
}

/**
 * Normalize location to coordinates
 * Accepts either coordinates object or address string (geocodes if needed)
 * @param {string|object} location - Address string or {lat, lng} object
 * @returns {Promise<object>} {lat, lng} coordinates
 * @private
 */
async function normalizeLocation(location) {
  // If already coordinates, return as-is
  if (typeof location === 'object' && location.lat && location.lng) {
    return location
  }

  // If string address, geocode it
  if (typeof location === 'string') {
    const geocoded = await geocodeAddress(location)
    return geocoded.coordinates
  }

  throw new Error('Invalid location format. Must be address string or {lat, lng} object')
}

/**
 * Compare routes across multiple providers
 * @param {string|object} origin - Starting location (address string or {lat, lng} object)
 * @param {string|object} destination - Ending location (address string or {lat, lng} object)
 * @param {object} preferences - User preferences { navServices: { google, apple, waze } }
 * @returns {Promise<Array>} Array of route comparisons
 */
export async function compareRoutes(origin, destination, preferences = {}) {
  const navServices = preferences?.navServices || {}

  // Geocode addresses to coordinates if needed
  // This is required for Apple Maps ETA API which only accepts coordinates
  const originCoords = await normalizeLocation(origin)
  const destinationCoords = await normalizeLocation(destination)

  // Build array of provider requests using generic fetch function
  // Filter by TWO conditions:
  // 1. Provider has API implementation (hasAPI === true)
  // 2. User has enabled the service in preferences (default to false if not specified)
  const requests = Object.entries(PROVIDERS)
    .filter(([providerId, providerConfig]) => {
      // Check if provider has API implementation
      const isImplemented = providerConfig.hasAPI === true

      // Check if user has enabled this service in preferences
      // If not specified in preferences, default to false (opt-in)
      const isEnabledByUser = navServices[providerId] === true

      // Only include if BOTH conditions are met
      return isImplemented && isEnabledByUser
    })
    .map(([providerId, providerConfig]) =>
      // Use coordinates for all providers (geocoded if needed)
      fetchRouteFromProvider(providerConfig, originCoords, destinationCoords).catch(error => ({
        provider: providerId,
        error: error.message,
        routes: [],
      }))
    )

  // Fetch all routes in parallel
  const results = await Promise.all(requests)

  // Filter out failed requests and flatten all routes
  // Note: Google returns multiple alternatives (we keep them all for future use)
  return results
    .filter(result => !result.error)
    .flatMap(result => result.routes)
}

/**
 * Generic function to fetch routes from any provider
 * @param {object} providerConfig - Provider configuration from PROVIDERS registry
 * @param {string} origin - Starting location
 * @param {string} destination - Ending location
 * @returns {Promise<object>} Provider routes
 * @private
 */
async function fetchRouteFromProvider(providerConfig, origin, destination) {
  const { id, service, hasAPI } = providerConfig

  // Provider has full API support (e.g., Google Maps)
  if (hasAPI && service.getRoute) {
    const data = await service.getRoute(origin, destination)

    return {
      provider: id,
      routes: data.routes.map(route => ({
        ...route,
        // Use Universal Link (recommended) - works on all platforms
        link: service.getUniversalLink?.(origin, destination) || service.getWebUrl?.(origin, destination),
      })),
    }
  }

  // Provider only has deep links (e.g., Apple Maps, Waze)
  return {
    provider: id,
    routes: [{
      provider: id,
      // Use Universal Link (recommended) - works on all platforms
      link: service.getUniversalLink?.(origin, destination) || service.getWebUrl?.(origin, destination),
      message: `Open in ${providerConfig.name} app to view route`,
    }],
  }
}

/**
 * Get the fastest route across all providers
 * @param {string} origin
 * @param {string} destination
 * @param {object} preferences
 * @returns {Promise<object>} Fastest route with provider info
 */
export async function getFastestRoute(origin, destination, preferences) {
  const routes = await compareRoutes(origin, destination, preferences)

  if (routes.length === 0) {
    return null
  }

  // Sort by duration in traffic (or regular duration if not available)
  const sorted = routes.sort((a, b) => {
    const durationA = a.durationInTraffic || a.duration
    const durationB = b.durationInTraffic || b.duration
    return durationA - durationB
  })

  return sorted[0]
}
