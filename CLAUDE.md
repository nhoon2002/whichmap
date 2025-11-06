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

## Project Structure

- `mvp/` - Initial vanilla HTML/JS prototype
- `v1/` - TailwindCSS Pro Next.js template (reference only, do not modify)
- `main/` - Current Next.js production application

## Development Commands

Navigate to the `main/` directory for all development work:

```bash
cd main

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

The development server runs at `http://localhost:3000`

## Current Implementation Status

### Phase 1 - Core UI ✅ COMPLETE

The main application (`main/src/app/page.jsx`) is fully functional with:

**UI Components Built:**
- ✅ Floating label form inputs (TextInput component)
- ✅ Provider result cards with fastest highlighting (ProviderCard component)
- ✅ Loading spinner with message
- ✅ Error alerts
- ✅ Smooth scroll to results after comparison
- ✅ Responsive 3-column grid (mobile: 1 col, tablet: 2 col, desktop: 3 col)

**Features Working:**
- ✅ Form validation (requires both start and end)
- ✅ Mock data with 1.5s simulated API delay
- ✅ Fastest route detection (compares ETAs)
- ✅ Green highlighting for fastest provider
- ✅ Deep links to all 3 providers (Google Maps, Apple Maps, Waze)
- ✅ Framer Motion animations (FadeIn/FadeInStagger)
- ✅ Smooth scroll animation after results load

**Theme & Design:**
- Using **light mode** theme (bg-neutral-50 background)
- Clean, professional aesthetic matching v1 template style
- Proper contrast and accessibility

**Tech Stack:**
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- Framer Motion
- Minimal dependencies (no MDX or unnecessary packages)

### Components Structure

```
main/src/
├── app/
│   ├── layout.jsx           # Root layout with light theme
│   └── page.jsx             # Main comparison page (client component)
├── components/
│   ├── Border.jsx           # Decorative accent lines (from v1)
│   ├── Button.jsx           # Primary action button (from v1)
│   ├── Container.jsx        # Max-width wrapper (from v1)
│   ├── FadeIn.jsx           # Animation components (from v1, fixed)
│   ├── ProviderCard.jsx     # Custom result card component
│   └── TextInput.jsx        # Custom floating label input
├── lib/
│   └── helpers.js           # Global debug utilities
├── types/
│   └── global.d.ts          # TypeScript declarations for window helpers
└── styles/
    ├── tailwind.css         # Tailwind v4 theme config
    └── base.css             # Mona Sans font
```

### Global Helpers System

A debug utility system is available globally in development mode:

**Location:** `main/src/lib/helpers.js`
**Initialized:** Automatically in `page.jsx` on mount

**Available globally (no imports needed):**
```javascript
log(something, color)           // Colored console logs
logger.info(msg)                // Blue
logger.success(msg)             // Green
logger.warning(msg)             // Orange
logger.error(msg)               // Red
logger.debug(msg)               // Purple
logTime(something, color)       // With timestamp
devLog(something, color)        // Dev mode only
logObject(obj, color)           // Pretty print objects
logTrace(fn, action, data)      // Function tracing
```

Colors optimized for dark mode consoles.

### Animation Implementation Notes

**FadeIn Component:**
- Always starts with `initial="hidden"`
- Inside `FadeInStagger`: Animates immediately on mount (`animate="visible"`)
- Outside stagger groups: Uses `whileInView` for scroll-triggered animations
- Duration: 500ms with 24px upward motion

**FadeInStagger Component:**
- `animate={true}` (default): Animates immediately when mounted
- `animate={false}`: Uses scroll-triggered animation
- Stagger delay: 200ms (or 120ms with `faster` prop)
- Used for results grid to create sequential reveal effect

**Smooth Scroll:**
- Triggered 600ms after results load
- Waits for fade animation to complete before scrolling
- Uses `scrollIntoView({ behavior: 'smooth', block: 'start' })`

### Mock Data Currently in Use

```javascript
// main/src/app/page.jsx
MOCK_DATA = {
  google: { provider: 'Google Maps', eta: 25, distance: '15.2 mi' },
  apple: { provider: 'Apple Maps', eta: 23, distance: '15.1 mi' },  // Fastest
  waze: { provider: 'Waze', eta: 27, distance: '15.3 mi' }
}
```

Default form values: LA addresses (1932 Selby Ave → 111 N Broadway)

### Ready for Phase 2

**Next steps to implement:**
- [ ] Real geocoding (address → coordinates)
- [ ] Google Maps Directions API integration
- [ ] Waze API integration (if available)
- [ ] Error handling for API failures
- [ ] Caching layer
- [ ] Rate limiting

All `TODO` comments are marked in code where API integration is needed.

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
- Waze: `https://www.waze.com/live-map/directions?from={start}&to={end}` (will use coordinates when available)

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
