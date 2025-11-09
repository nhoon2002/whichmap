/**
 * Google Geocoding API Route
 * Converts addresses to coordinates (and vice versa)
 * Keeps API key server-side for security
 */

import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { address, lat, lng } = body

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      )
    }

    let geocodeUrl

    // Forward geocoding (address → coordinates)
    if (address) {
      const params = new URLSearchParams({
        address,
        key: apiKey,
      })
      geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?${params}`
    }
    // Reverse geocoding (coordinates → address)
    else if (lat !== undefined && lng !== undefined) {
      const params = new URLSearchParams({
        latlng: `${lat},${lng}`,
        key: apiKey,
      })
      geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?${params}`
    } else {
      return NextResponse.json(
        { error: 'Either address or lat/lng required' },
        { status: 400 }
      )
    }

    // Call Google Geocoding API
    const response = await fetch(geocodeUrl)
    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('Google Geocoding API error:', data.status, data.error_message)
      return NextResponse.json(
        { error: data.error_message || `Geocoding failed: ${data.status}` },
        { status: 400 }
      )
    }

    if (!data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: 'No results found' },
        { status: 404 }
      )
    }

    const result = data.results[0]

    // Return normalized response
    return NextResponse.json({
      formattedAddress: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      placeId: result.place_id,
      types: result.types,
      addressComponents: result.address_components,
      viewport: result.geometry.viewport,
    })
  } catch (error) {
    console.error('Geocoding API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
