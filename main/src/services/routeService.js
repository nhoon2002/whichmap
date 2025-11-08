/**
 * Route Service - Orchestrator
 * Coordinates multiple map providers and returns unified results
 * Respects user preferences for which services to use
 */

import * as googleMapsService from './maps/googleMapsService'
import * as appleMapsService from './maps/appleMapsService'
import * as wazeService from './maps/wazeService'

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
    hasAPI: false, // Deep links only
  },
  waze: {
    id: 'waze',
    name: 'Waze',
    service: wazeService,
    hasAPI: false, // Deep links only
  },
}

/**
 * Compare routes across multiple providers
 * @param {string} origin - Starting location
 * @param {string} destination - Ending location
 * @param {object} preferences - User preferences { navServices: { google, apple, waze } }
 * @returns {Promise<Array>} Array of route comparisons
 */
export async function compareRoutes(origin, destination, preferences = {}) {
  const enabledServices = preferences?.navServices || {
    google: true,
    apple: false, // Not implemented yet
    waze: false, // Not implemented yet
  }

  // Build array of provider requests using generic fetch function
  const requests = Object.entries(PROVIDERS)
    .filter(([providerId]) => enabledServices[providerId])
    .map(([providerId, providerConfig]) =>
      fetchRouteFromProvider(providerConfig, origin, destination).catch(error => ({
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
        // Add deep/web links from service
        deepLink: service.getDeepLinkUrl?.(origin, destination),
        webLink: service.getWebUrl?.(origin, destination),
      })),
    }
  }

  // Provider only has deep links (e.g., Apple Maps, Waze)
  return {
    provider: id,
    routes: [{
      provider: id,
      deepLink: service.getDeepLinkUrl?.(origin, destination),
      webLink: service.getWebUrl?.(origin, destination),
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
