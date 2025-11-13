/**
 * Google Places Autocomplete Service
 * Provides address suggestions as user types
 */

import type { AutocompletePrediction, Place } from '@/types'

/**
 * Get autocomplete predictions for an input string
 */
export async function getAutocompletePredictions(input: string): Promise<AutocompletePrediction[]> {
  if (!input || input.length < 2) {
    return []
  }

  try {
    const params = new URLSearchParams({ input })
    const response = await fetch(`/api/autocomplete?${params}`)

    if (!response.ok) {
      throw new Error('Autocomplete request failed')
    }

    const data = await response.json()
    return data.predictions || []
  } catch (error) {
    console.error('Autocomplete error:', error)
    return []
  }
}

/**
 * Get place details (coordinates) for a selected place
 */
export async function getPlaceDetails(placeId: string): Promise<Place> {
  if (!placeId) {
    throw new Error('placeId required')
  }

  try {
    const response = await fetch('/api/autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ placeId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get place details')
    }

    const data: Place = await response.json()
    return data
  } catch (error) {
    console.error('Place details error:', error)
    throw error
  }
}
