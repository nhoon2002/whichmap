/**
 * Route Service - Orchestrator
 * Coordinates multiple map providers and returns unified results
 * Handles geocoding when addresses are provided instead of coordinates
 * Preferences are applied client-side only (no server-side filtering)
 */

import * as googleMapsService from './providers/googleMapsService'
import * as appleMapsService from './providers/appleMapsService'
import * as wazeService from './providers/wazeService'
import { geocodeAddress } from '../geocoding/geocodingService'
import type {
  Location,
  Coordinates,
  ProviderConfig,
  ProviderService,
  RawRouteData,
  UserPreferences,
  ProviderId,
} from '@/types'

/**
 * Provider registry
 * Maps provider ID to its service module and metadata
 */
const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  google: {
    id: 'google',
    name: 'Google Maps',
    service: googleMapsService as ProviderService,
    hasAPI: true, // Has full route API
  },
  apple: {
    id: 'apple',
    name: 'Apple Maps',
    service: appleMapsService as ProviderService,
    hasAPI: true, // Full route API available
  },
  waze: {
    id: 'waze',
    name: 'Waze',
    service: wazeService as ProviderService,
    hasAPI: false, // Universal links only (Transport SDK pending approval)
  },
}

/**
 * Normalize location to coordinates
 * Accepts either coordinates object or address string (geocodes if needed)
 */
async function normalizeLocation(location: Location): Promise<Coordinates> {
  // If already coordinates, return as-is
  if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
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
 * NOTE: Preferences parameter is DEPRECATED - preferences are applied client-side only
 */
export async function compareRoutes(
  origin: Location,
  destination: Location,
  preferences?: UserPreferences
): Promise<RawRouteData[]> {
  // Geocode addresses to coordinates if needed
  // This is required for Apple Maps ETA API which only accepts coordinates
  const originCoords = await normalizeLocation(origin)
  const destinationCoords = await normalizeLocation(destination)

  // Build array of provider requests using generic fetch function
  // ALWAYS fetch ALL providers that have API implementations
  // User preferences are applied client-side to filter results
  // This prevents unnecessary API refetches when user toggles preferences
  const requests = Object.entries(PROVIDERS)
    .filter(([_, providerConfig]) => {
      // Only check if provider has API implementation
      // Do NOT check user preferences here
      return providerConfig.hasAPI === true
    })
    .map(([providerId, providerConfig]) =>
      // Use coordinates for all providers (geocoded if needed)
      fetchRouteFromProvider(providerConfig, originCoords, destinationCoords).catch(error => ({
        provider: providerId as ProviderId,
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
 * Provider fetch result
 */
interface ProviderFetchResult {
  provider: ProviderId
  routes: RawRouteData[]
  error?: string
}

/**
 * Generic function to fetch routes from any provider
 */
async function fetchRouteFromProvider(
  providerConfig: ProviderConfig,
  origin: Coordinates,
  destination: Coordinates
): Promise<ProviderFetchResult> {
  const { id, service, hasAPI, name } = providerConfig

  // Provider has full API support (e.g., Google Maps, Apple Maps)
  if (hasAPI && service.getRoute) {
    const data = await service.getRoute(origin, destination)

    return {
      provider: id,
      routes: data.routes.map(route => ({
        ...route,
        // Use Universal Link (recommended) - works on all platforms
        link: service.getUniversalLink?.(origin, destination) || service.getWebUrl?.(origin, destination),
      })) as RawRouteData[],
    }
  }

  // Provider only has deep links (e.g., Waze with Transport SDK pending)
  return {
    provider: id,
    routes: [{
      provider: id,
      duration: 0,
      distance: 0,
      // Use Universal Link (recommended) - works on all platforms
      link: service.getUniversalLink?.(origin, destination) || service.getWebUrl?.(origin, destination),
      message: `Open in ${name} app to view route`,
    }] as RawRouteData[],
  }
}

/**
 * Get the fastest route across all providers
 */
export async function getFastestRoute(
  origin: Location,
  destination: Location,
  preferences?: UserPreferences
): Promise<RawRouteData | null> {
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
