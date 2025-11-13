/**
 * Waze Service
 * Placeholder for future Waze Transport SDK integration
 * Pending app approval from Waze
 */

import type { Location, ProviderRouteResponse, RouteOptions } from '@/types'

/**
 * Get route from Waze Transport SDK
 * TODO: Implement once Waze app is approved
 */
export async function getRoute(
  origin: Location,
  destination: Location,
  options?: RouteOptions
): Promise<ProviderRouteResponse> {
  // TODO: Implement Waze Transport SDK integration
  // Once approved, will provide ETA data similar to other providers
  throw new Error('Waze Transport SDK integration pending app approval')
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
 * Generate Universal Link for Waze (RECOMMENDED)
 * Works on all platforms - automatically opens in app on mobile if installed
 */
export function getUniversalLink(origin: Location, destination: Location): string {
  const destinationStr = formatLocationForUrl(destination)

  const params = new URLSearchParams({
    q: destinationStr,
    navigate: 'yes',
  })

  return `https://waze.com/ul?${params}`
}

/**
 * Generate Waze deep link URL
 * Opens in Waze app on iOS/Android
 * Note: Universal Links are recommended over this
 */
export function getDeepLinkUrl(origin: Location, destination: Location): string {
  // Waze uses "navigate" parameter for destination
  // Origin is automatically detected as current location
  const destinationStr = formatLocationForUrl(destination)

  const params = new URLSearchParams({
    q: destinationStr,
    navigate: 'yes',
  })

  return `waze://?${params}`
}

/**
 * Generate Waze web URL (opens in browser, redirects to app if installed)
 */
export function getWebUrl(origin: Location, destination: Location): string {
  // Universal Link and Web URL are the same for Waze
  return getUniversalLink(origin, destination)
}
