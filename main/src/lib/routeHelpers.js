/**
 * Route Helper Functions
 * Business logic for route filtering, deduplication, and comparison
 */

/**
 * Filter and deduplicate routes based on user preferences
 * Google returns multiple route alternatives - we only show the first (fastest) one per provider
 * @param {Array} routes - Array of route objects
 * @param {object} preferences - User preferences { navServices: { google, apple, waze } }
 * @returns {Array} Filtered and deduplicated routes
 */
export function filterRoutes(routes, preferences) {
  if (!routes || routes.length === 0) {
    return []
  }

  // First, filter by user preferences
  const preferenceFiltered = routes.filter((route) => {
    return preferences?.navServices?.[route.id] !== false
  })

  // Then, group by provider and take only the first route from each
  // This handles Google's multiple route alternatives
  const seenProviders = new Set()
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
 * @param {Array} routes - Array of route objects with eta property
 * @returns {object|null} Fastest route or null if no routes
 */
export function findFastestRoute(routes) {
  if (!routes || routes.length === 0) {
    return null
  }

  return routes.reduce((fastest, current) => {
    return current.eta < fastest.eta ? current : fastest
  })
}

/**
 * Sort routes by ETA (fastest first)
 * @param {Array} routes - Array of route objects
 * @returns {Array} Sorted routes
 */
export function sortRoutesByETA(routes) {
  if (!routes || routes.length === 0) {
    return []
  }

  return [...routes].sort((a, b) => a.eta - b.eta)
}

/**
 * Calculate time savings compared to slowest route
 * @param {Array} routes - Array of route objects
 * @returns {object} Map of provider id to time saved in minutes
 */
export function calculateTimeSavings(routes) {
  if (!routes || routes.length === 0) {
    return {}
  }

  const slowest = routes.reduce((slow, current) => {
    return current.eta > slow.eta ? current : slow
  })

  return routes.reduce((savings, route) => {
    savings[route.id] = slowest.eta - route.eta
    return savings
  }, {})
}

/**
 * Format location for URL (handles both strings and coordinate objects)
 * @param {string|object} location - Address string or {lat, lng} object
 * @returns {string} Formatted location string
 * @private
 */
function formatLocationForDeepLink(location) {
  // If it's a coordinate object, format as "lat,lng"
  if (typeof location === 'object' && location !== null && location.lat && location.lng) {
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
 * Based on: https://developers.google.com/maps/documentation/urls/ios-urlscheme
 * @param {string} provider - Provider id (google, apple, waze)
 * @param {string|object} start - Starting location (address string or {lat, lng} object)
 * @param {string|object} end - Destination location (address string or {lat, lng} object)
 * @returns {string} Universal Link URL
 */
export function generateDeepLink(provider, start, end) {
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

