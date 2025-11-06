# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WhichMap is a web application that compares travel times across major map providers (Google Maps, Apple Maps, and Waze) on a single screen. Users enter start and destination locations, and the app displays estimated travel times from all providers side-by-side, highlighting the fastest route.

## Architecture

The application follows a simple client-side architecture with the following core components:

### Data Flow
1. **Geocoding Layer**: Converts user-entered addresses to coordinates (lat/lng)
2. **Provider Fetchers**: Parallel API calls to Google Maps, Apple Maps (web fallback), and Waze
3. **Comparison Logic**: Determines the fastest route from returned ETAs
4. **Deep Linking**: Opens selected route in the corresponding native app or web page

### API Integration Strategy
- **Google Maps Directions API**: Returns ETA, distance, route summary (requires API key)
- **Apple Maps**: No open API; uses web deep links or mocked data
- **Waze Routing API**: Accepts coordinates, returns route summary and ETA (no auth for MVP)

### State Management Pattern
The application maintains:
- `start` and `end` location inputs
- `results` array containing provider responses
- `isLoading` boolean for loading state
- `error` for error handling

Results are fetched in parallel and the fastest ETA is determined after all responses are received.

## Development Commands

*Note: Commands will be added once the project is scaffolded with a specific framework/build tool*

## Key Implementation Considerations

### Geocoding
- Geocode addresses to coordinates only once per comparison
- Cache geocoding results (address → lat/lng) to avoid redundant API calls
- Reuse coordinates across all provider API calls

### Error Handling
- Handle invalid addresses gracefully
- Implement timeout handling for slow API responses
- Display user-friendly error messages for API failures or rate limits
- Validate both start and end inputs before making API calls

### Performance Optimization
- Fetch all provider data in parallel, not sequentially
- Consider short-term caching (60-120 seconds TTL) for nearby routes:
  - Round coordinates to ~2 decimal places for cache key grouping
  - Include timestamp to determine cache freshness
- Avoid excessive API calls by reusing geocoded coordinates

### Deep Link Format
- Google Maps: `https://www.google.com/maps/dir/?api=1&origin={start}&destination={end}`
- Apple Maps: `https://maps.apple.com/?saddr={start}&daddr={end}`
- Waze: `https://waze.com/ul?ll={lat},{lng}&navigate=yes`

## Development Phases

1. **Phase 1 - Core UI**: Form inputs, static cards, loading states, deep links
2. **Phase 2 - Integrations**: Geocoding, API fetchers, error handling
3. **Phase 3 - Logic**: Result comparison, fastest route highlighting
4. **Phase 4 - Deployment**: Public hosting, real-world testing

## API Keys and Security

- Secure API keys should never be committed to the repository
- Google Maps API key is required for Directions API
- In production, consider server-side API proxy to protect keys
- Implement rate limiting per user/session to prevent abuse
