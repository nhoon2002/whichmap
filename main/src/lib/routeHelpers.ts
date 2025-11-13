/**
 * Route Helper Functions
 * Business logic for route filtering, deduplication, and comparison
 */

import type { RouteResult, UserPreferences, Location, ProviderId } from '@/types'

/**
 * Filter and deduplicate routes based on user preferences
 * Google returns multiple route alternatives - we only show the first (fastest) one per provider
 */
export function filterRoutes(
  routes: RouteResult[] | undefined | null,
  preferences: UserPreferences | undefined | null
): RouteResult[] {
  if (!routes || routes.length === 0) {
    return []
  }

  // First, filter by user preferences
  const preferenceFiltered = routes.filter((route) => {
    return preferences?.navServices?.[route.id] !== false
  })

  // Then, group by provider and take only the first route from each
  // This handles Google's multiple route alternatives
  const seenProviders = new Set<string>()
  return preferenceFiltered.filter((route) => {
    if (seenProviders.has(route.id)) {
      return false // Skip duplicate providers
    }
    seenProviders.add(route.id)
    return true
  })
}

/**
 * Find the fastest route from an array of routes
 */
export function findFastestRoute(routes: RouteResult[] | undefined | null): RouteResult | null {
  if (!routes || routes.length === 0) {
    return null
  }

  return routes.reduce((fastest, current) => {
    return current.eta < fastest.eta ? current : fastest
  })
}

/**
 * Sort routes by ETA (fastest first)
 */
export function sortRoutesByETA(routes: RouteResult[] | undefined | null): RouteResult[] {
  if (!routes || routes.length === 0) {
    return []
  }

  return [...routes].sort((a, b) => a.eta - b.eta)
}

/**
 * Calculate time savings compared to slowest route
 */
export function calculateTimeSavings(routes: RouteResult[] | undefined | null): Record<string, number> {
  if (!routes || routes.length === 0) {
    return {}
  }

  const slowest = routes.reduce((slow, current) => {
    return current.eta > slow.eta ? current : slow
  })

  return routes.reduce((savings, route) => {
    savings[route.id] = slowest.eta - route.eta
    return savings
  }, {} as Record<string, number>)
}

/**
 * Format location for URL (handles both strings and coordinate objects)
 */
function formatLocationForDeepLink(location: Location): string {
  // If it's a coordinate object, format as "lat,lng"
  if (typeof location === 'object' && location !== null && 'lat' in location && 'lng' in location) {
    return `${location.lat},${location.lng}`
  }

  // If it's a string, return as-is
  if (typeof location === 'string') {
    return location
  }

  // Fallback for unexpected types
  return String(location)
}

/**
 * Generate Universal Link for a provider (RECOMMENDED)
 * Universal Links work on all platforms - desktop opens in browser, mobile opens in app if installed
 */
export function generateDeepLink(provider: ProviderId | string, start: Location, end: Location): string {
  // Format locations to handle both strings and coordinate objects
  const startStr = formatLocationForDeepLink(start)
  const endStr = formatLocationForDeepLink(end)

  const encodedStart = encodeURIComponent(startStr)
  const encodedEnd = encodeURIComponent(endStr)

  switch (provider) {
    case 'google':
      return `https://www.google.com/maps/dir/?api=1&origin=${encodedStart}&destination=${encodedEnd}&travelmode=driving`
    case 'apple':
      return `https://maps.apple.com/?saddr=${encodedStart}&daddr=${encodedEnd}&dirflg=d`
    case 'waze':
      return `https://waze.com/ul?q=${encodedEnd}&navigate=yes`
    default:
      return '#'
  }
}
