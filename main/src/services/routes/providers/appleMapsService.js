/**
 * Apple Maps Service
 * Placeholder for future Apple Maps integration
 * Apple doesn't have a public REST API like Google
 * Will need to use MapKit JS or deep linking
 */

/**
 * Get route from Apple Maps
 * @param {string} origin
 * @param {string} destination
 * @returns {Promise<object>} Normalized route object
 */
export async function getRoute(origin, destination) {
  // TODO: Implement Apple Maps integration
  // Options:
  // 1. MapKit JS (requires server token generation)
  // 2. Deep linking (open in Apple Maps app)
  // 3. Third-party scraping (not recommended)

  throw new Error('Apple Maps integration not yet implemented')
}

/**
 * Generate Apple Maps deep link URL
 * Opens in Apple Maps app on iOS/macOS
 * @param {string} origin
 * @param {string} destination
 * @returns {string} Deep link URL
 */
export function getDeepLinkUrl(origin, destination) {
  const params = new URLSearchParams({
    saddr: origin,
    daddr: destination,
    dirflg: 'd', // driving directions
  })

  return `maps://maps.apple.com/?${params}`
}
