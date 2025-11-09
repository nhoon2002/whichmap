/**
 * Deeplink Helpers
 * Smart deeplink generation with Universal Links (recommended approach)
 * Based on: https://developers.google.com/maps/documentation/urls/ios-urlscheme
 * 
 * Universal Links are the recommended approach because:
 * - They work on all platforms (desktop opens in browser, mobile opens in app if installed)
 * - No app detection needed - the OS handles fallback automatically
 * - Better user experience with no delays or failed attempts
 */

/**
 * Detect the user's platform
 * @returns {object} Platform information
 */
export function detectPlatform() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isIOS: false,
      isAndroid: false,
      isMobile: false,
      isDesktop: true,
    }
  }

  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream
  const isAndroid = /android/i.test(userAgent)
  const isMobile = isIOS || isAndroid

  return {
    isIOS,
    isAndroid,
    isMobile,
    isDesktop: !isMobile,
  }
}

/**
 * Get the best link for the user's platform
 * Prioritizes Universal Links which work on all platforms
 * @param {string} provider - Provider id (google, apple, waze)
 * @param {string|object} origin - Starting location
 * @param {string|object} destination - Destination location
 * @returns {string} Best URL for the platform
 */
export function getBestLink(provider, origin, destination) {
  const links = getAllLinks(provider, origin, destination)
  
  // Universal Links are the best option - they work everywhere
  // Desktop: Opens in browser
  // Mobile with app: Opens in app
  // Mobile without app: Opens in browser
  return links.universalLink || links.webLink || links.deepLink
}

/**
 * Generate Universal Link for Google Maps (iOS 9+)
 * These links work on all platforms and automatically open the app if installed
 * @param {string|object} origin
 * @param {string|object} destination
 * @returns {string} Universal Link URL
 */
export function getGoogleMapsUniversalLink(origin, destination) {
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
 * Open a map link in the best way for the user's platform
 * Uses Universal Links which automatically handle app detection
 * @param {string} url - The URL to open (preferably a Universal Link)
 */
export function openMapLink(url) {
  if (typeof window === 'undefined' || !url) {
    return
  }

  // Universal Links work everywhere - just open them!
  // - Desktop: Opens in browser
  // - Mobile with app installed: OS automatically opens the app
  // - Mobile without app: Opens in browser
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Format location for URL (coordinates or address)
 * @param {string|object} location - Address string or {lat, lng} object
 * @returns {string} Formatted location string
 * @private
 */
function formatLocationForUrl(location) {
  if (typeof location === 'object' && location.lat && location.lng) {
    return `${location.lat},${location.lng}`
  }
  return location
}

/**
 * Get all available link types for a provider
 * @param {string} provider - Provider id (google, apple, waze)
 * @param {string|object} origin - Starting location
 * @param {string|object} destination - Destination location
 * @returns {object} All available link types
 */
export function getAllLinks(provider, origin, destination) {
  const originStr = formatLocationForUrl(origin)
  const destinationStr = formatLocationForUrl(destination)

  switch (provider) {
    case 'google':
      return {
        deepLink: `comgooglemaps://?saddr=${encodeURIComponent(originStr)}&daddr=${encodeURIComponent(destinationStr)}&directionsmode=driving`,
        webLink: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destinationStr)}&travelmode=driving`,
        universalLink: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destinationStr)}&travelmode=driving`,
        scheme: 'comgooglemaps://',
      }

    case 'apple':
      return {
        deepLink: `maps://maps.apple.com/?saddr=${encodeURIComponent(originStr)}&daddr=${encodeURIComponent(destinationStr)}&dirflg=d`,
        webLink: `https://maps.apple.com/?saddr=${encodeURIComponent(originStr)}&daddr=${encodeURIComponent(destinationStr)}`,
        universalLink: `https://maps.apple.com/?saddr=${encodeURIComponent(originStr)}&daddr=${encodeURIComponent(destinationStr)}`,
        scheme: 'maps://',
      }

    case 'waze':
      return {
        deepLink: `waze://?q=${encodeURIComponent(destinationStr)}&navigate=yes`,
        webLink: `https://waze.com/ul?q=${encodeURIComponent(destinationStr)}&navigate=yes`,
        universalLink: `https://waze.com/ul?q=${encodeURIComponent(destinationStr)}&navigate=yes`,
        scheme: 'waze://',
      }

    default:
      return {
        deepLink: '#',
        webLink: '#',
        universalLink: '#',
        scheme: '',
      }
  }
}

