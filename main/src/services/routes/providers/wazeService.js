/**
 * Waze Service
 * Placeholder for future Waze integration
 * Waze doesn't have a public API
 * Will need to use deep linking or web scraping
 */

/**
 * Get route from Waze
 * @param {string} origin
 * @param {string} destination
 * @returns {Promise<object>} Normalized route object
 */
export async function getRoute(origin, destination) {
  // TODO: Implement Waze integration
  // Options:
  // 1. Deep linking (open in Waze app)
  // 2. Web scraping (Waze Live Map - not recommended, TOS violation)
  // 3. Wait for official API (if they ever release one)

  throw new Error('Waze integration not yet implemented')
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

/**
 * Generate Universal Link for Waze (RECOMMENDED)
 * Works on all platforms - automatically opens in app on mobile if installed
 * @param {string|object} origin
 * @param {string|object} destination
 * @returns {string} Universal Link URL
 */
export function getUniversalLink(origin, destination) {
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
 * @param {string|object} origin
 * @param {string|object} destination
 * @returns {string} Deep link URL
 */
export function getDeepLinkUrl(origin, destination) {
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
 * @param {string|object} origin
 * @param {string|object} destination
 * @returns {string} Web URL
 */
export function getWebUrl(origin, destination) {
  // Universal Link and Web URL are the same for Waze
  return getUniversalLink(origin, destination)
}
