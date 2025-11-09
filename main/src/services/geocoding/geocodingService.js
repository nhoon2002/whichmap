/**
 * Google Geocoding Service
 * Converts addresses to geographic coordinates (lat/lng)
 * Documentation: https://developers.google.com/maps/documentation/geocoding
 */

/**
 * Geocode an address to coordinates
 * @param {string} address - Address string to geocode
 * @returns {Promise<object>} Geocoded location with coordinates
 */
export async function geocodeAddress(address) {
  if (!address || typeof address !== 'string') {
    throw new Error('Valid address string required')
  }

  try {
    // Call our API route (server-side geocoding to protect API key)
    const response = await fetch('/api/geocode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Geocoding failed')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Geocoding error:', error.message)
    throw error
  }
}

/**
 * Geocode multiple addresses in parallel
 * @param {string[]} addresses - Array of address strings
 * @returns {Promise<object[]>} Array of geocoded locations
 */
export async function geocodeMultiple(addresses) {
  const results = await Promise.allSettled(
    addresses.map(address => geocodeAddress(address))
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      console.error(`Failed to geocode address ${index}:`, result.reason)
      return null
    }
  })
}

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<object>} Reverse geocoded address
 */
export async function reverseGeocode(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('Valid latitude and longitude required')
  }

  try {
    const response = await fetch('/api/geocode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lng }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Reverse geocoding failed')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Reverse geocoding error:', error.message)
    throw error
  }
}
