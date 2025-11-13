/**
 * Google Geocoding Service
 * Converts addresses to geographic coordinates (lat/lng)
 * Documentation: https://developers.google.com/maps/documentation/geocoding
 */

import type { GeocodeResult } from '@/types'

/**
 * Geocode an address to coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
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

    const data: GeocodeResult = await response.json()
    return data
  } catch (error) {
    console.error('Geocoding error:', error instanceof Error ? error.message : error)
    throw error
  }
}

/**
 * Geocode multiple addresses in parallel
 */
export async function geocodeMultiple(addresses: string[]): Promise<(GeocodeResult | null)[]> {
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
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
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

    const data: GeocodeResult = await response.json()
    return data
  } catch (error) {
    console.error('Reverse geocoding error:', error instanceof Error ? error.message : error)
    throw error
  }
}
