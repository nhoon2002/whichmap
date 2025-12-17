/**
 * Google Places Autocomplete API Route
 * Provides address suggestions as user types
 * Keeps API key server-side for security
 */

import { NextRequest, NextResponse } from 'next/server'

interface AutocompletePrediction {
  place_id: string
  description: string
  structured_formatting?: {
    main_text: string
    secondary_text: string
  }
  types?: string[]
}

interface GoogleAutocompleteResponse {
  predictions: AutocompletePrediction[]
  status: string
  error_message?: string
}

interface PlaceDetailsGeometry {
  location: {
    lat: number
    lng: number
  }
}

interface GooglePlaceDetailsResponse {
  result: {
    formatted_address: string
    geometry: PlaceDetailsGeometry
    place_id: string
    name: string
  }
  status: string
  error_message?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const input = searchParams.get('input')
    const biasLat = searchParams.get('biasLat')
    const biasLng = searchParams.get('biasLng')
    const radius = searchParams.get('radius') || '50000' // Default 50km radius

    if (!input || input.length < 2) {
      return NextResponse.json({ predictions: [] })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      )
    }

    // Build autocomplete request
    const params = new URLSearchParams({
      input,
      key: apiKey,
      // Note: Removed 'types' restriction to allow all place types (addresses, establishments, airports, etc.)
      // This enables predictions like "LAX" → "Los Angeles International Airport, 1 World Way..."
      // Restricted to US only
      components: 'country:us',
    })

    // Add location biasing if coordinates provided
    // This biases results towards a specific location (e.g., suggest POIs near destination)
    if (biasLat && biasLng) {
      params.append('location', `${biasLat},${biasLng}`)
      params.append('radius', radius)
    }

    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`

    // Call Google Places Autocomplete API
    const response = await fetch(autocompleteUrl)
    const data = await response.json() as GoogleAutocompleteResponse

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Autocomplete API error:', data.status, data.error_message)
      return NextResponse.json(
        { error: data.error_message || `Autocomplete failed: ${data.status}` },
        { status: 400 }
      )
    }

    // Map predictions to include both snake_case and camelCase for convenience
    const mappedPredictions = (data.predictions || []).map(pred => ({
      ...pred,
      placeId: pred.place_id,
      mainText: pred.structured_formatting?.main_text,
      secondaryText: pred.structured_formatting?.secondary_text,
    }))

    // Return predictions
    return NextResponse.json({
      predictions: mappedPredictions,
    })
  } catch (error) {
    console.error('Autocomplete API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get place details by place_id
 * Used after user selects an autocomplete suggestion
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { placeId } = body

    if (!placeId) {
      return NextResponse.json(
        { error: 'placeId required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      )
    }

    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'formatted_address,geometry,name,place_id',
      key: apiKey,
    })

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?${params}`

    const response = await fetch(detailsUrl)
    const data = await response.json() as GooglePlaceDetailsResponse

    if (data.status !== 'OK') {
      console.error('Google Place Details API error:', data.status, data.error_message)
      return NextResponse.json(
        { error: data.error_message || `Place details failed: ${data.status}` },
        { status: 400 }
      )
    }

    const result = data.result

    return NextResponse.json({
      formattedAddress: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      placeId: result.place_id,
      name: result.name,
    })
  } catch (error) {
    console.error('Place Details API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

