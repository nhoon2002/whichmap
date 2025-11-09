/**
 * Google Places Autocomplete API Route
 * Provides address suggestions as user types
 * Keeps API key server-side for security
 */

import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const input = searchParams.get('input')

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
      // Optional: restrict to addresses only (not businesses)
      types: 'address',
      // Optional: bias results to US (remove or change as needed)
      components: 'country:us',
    })

    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`

    // Call Google Places Autocomplete API
    const response = await fetch(autocompleteUrl)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Autocomplete API error:', data.status, data.error_message)
      return NextResponse.json(
        { error: data.error_message || `Autocomplete failed: ${data.status}` },
        { status: 400 }
      )
    }

    // Return predictions
    return NextResponse.json({
      predictions: data.predictions || [],
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
export async function POST(request) {
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
    const data = await response.json()

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
