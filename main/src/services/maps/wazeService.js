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
 * Generate Waze deep link URL
 * Opens in Waze app on iOS/Android
 * @param {string} origin
 * @param {string} destination
 * @returns {string} Deep link URL
 */
export function getDeepLinkUrl(origin, destination) {
  // Waze uses "navigate" parameter for destination
  // Origin is automatically detected as current location
  const params = new URLSearchParams({
    q: destination,
    navigate: 'yes',
  })

  return `waze://?${params}`
}

/**
 * Generate Waze web URL (opens in browser, redirects to app if installed)
 * @param {string} origin
 * @param {string} destination
 * @returns {string} Web URL
 */
export function getWebUrl(origin, destination) {
  const params = new URLSearchParams({
    q: destination,
    navigate: 'yes',
  })

  return `https://waze.com/ul?${params}`
}
