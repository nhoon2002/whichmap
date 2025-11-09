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
- ✅ Header with authentication state
- ✅ Login page with email/password and Google OAuth

**Features Working:**
- ✅ Form validation (requires both start and end)
- ✅ Mock data with 1.5s simulated API delay
- ✅ Fastest route detection (compares ETAs)
- ✅ Green highlighting for fastest provider
- ✅ Deep links to all 3 providers (Google Maps, Apple Maps, Waze)
- ✅ Framer Motion animations (FadeIn/FadeInStagger)
- ✅ Smooth scroll animation after results load
- ✅ Buy Me a Coffee link in footer (https://buymeacoffee.com/whichmap)
- ✅ Firebase Authentication (email/password + Google OAuth)
- ✅ API route separation for external access (`/api/compare`)

**Theme & Design:**
- Using **light mode** theme (bg-neutral-50 background)
- Clean, professional aesthetic matching v1 template style
- Proper contrast and accessibility

**Tech Stack:**
- Next.js 16.0.1 (App Router, Turbopack)
- React 19.2.0
- Tailwind CSS v4
- Framer Motion
- Firebase Authentication v12.5.0
- Node.js 20.9.0+ required
- Minimal dependencies (no MDX or unnecessary packages)

### Components Structure

```
main/
├── .env.local.example       # Firebase config template
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── compare/
│   │   │   │   └── route.js      # API endpoint for route comparison
│   │   │   ├── geocode/
│   │   │   │   └── route.js      # Google Geocoding API endpoint
│   │   │   └── autocomplete/
│   │   │       └── route.js      # Google Places Autocomplete API endpoint
│   │   ├── login/
│   │   │   └── page.jsx          # Authentication page (email/password + Google OAuth)
│   │   ├── layout.jsx            # Root layout with Header component
│   │   └── page.jsx              # Main comparison page (with autocomplete)
│   ├── components/
│   │   ├── AutocompleteInput.jsx # Google Places autocomplete input with dropdown
│   │   ├── Border.jsx            # Decorative accent lines (from v1)
│   │   ├── Button.jsx            # Primary action button (from v1)
│   │   ├── Container.jsx         # Max-width wrapper (from v1)
│   │   ├── FadeIn.jsx            # Animation components (from v1, fixed)
│   │   ├── Header.jsx            # Navigation with auth state and Sign In/Out
│   │   ├── ProviderCard.jsx      # Custom result card component
│   │   └── TextInput.jsx         # Custom floating label input
│   ├── hooks/
│   │   ├── useAutocomplete.js    # Google Places autocomplete hook with debouncing
│   │   └── useRouteComparison.js # React Query hook for route fetching
│   ├── services/
│   │   ├── geocoding/
│   │   │   ├── geocodingService.js    # Google Geocoding client service
│   │   │   └── autocompleteService.js # Google Places Autocomplete client service
│   │   └── routes/
│   │       ├── routeService.js        # Route orchestrator (coordinates all providers)
│   │       └── providers/
│   │           ├── googleMapsService.js # Google Maps Routes API v2
│   │           ├── appleMapsService.js  # Apple Maps ETA API
│   │           └── wazeService.js       # Waze (deep links only)
│   ├── lib/
│   │   ├── appleJWT.js           # Apple Maps JWT token generator & access token exchange
│   │   ├── firebase.js           # Firebase initialization and auth
│   │   ├── helpers.js            # Global debug utilities
│   │   ├── validation.js         # Zod schemas (accepts addresses OR coordinates)
│   │   └── routeHelpers.js       # Route filtering and deep link generation
│   ├── types/
│   │   └── global.d.ts           # TypeScript declarations for window helpers
│   └── styles/
│       ├── tailwind.css          # Tailwind v4 theme config
│       └── base.css              # Mona Sans font
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

### Firebase Authentication System

**Setup & Configuration:**
- Firebase SDK v12.5.0
- Configuration via environment variables (`.env.local`)
- Template provided in `.env.local.example`
- Project ID: `whichmap-eb2aa`

**Authentication Methods:**
- ✅ Email/Password sign in and sign up
- ✅ Google OAuth with popup flow
- Auto-redirect after successful authentication
- Persistent auth state across sessions

**Components:**
- `Header.jsx` - Shows auth state, Sign In/Out buttons, user email
- `login/page.jsx` - Full authentication UI with toggle between sign in/sign up
- `lib/firebase.js` - Firebase initialization and auth instance

**Environment Variables Required:**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**Setup Instructions:**
See `docs/firebase-setup.md` for complete setup guide including:
- Firebase Console configuration
- Enabling authentication methods
- Usage examples and code patterns
- Protected route implementation (optional)
- Troubleshooting guide

### API Route Architecture

**Endpoints:**

1. **`POST /api/compare`** - Route comparison across providers
   - Accepts: `{ start, end, preferences }` (start/end can be addresses or coordinates)
   - Returns: Route comparison results from enabled providers
   - Features: Rate limiting, input validation, error sanitization
   - Auto-geocodes addresses to coordinates when needed

2. **`POST /api/geocode`** - Google Geocoding API
   - Accepts: `{ address }` (forward) or `{ lat, lng }` (reverse)
   - Returns: Formatted address + coordinates
   - Server-side only (protects API key)

3. **`GET /api/autocomplete`** - Google Places Autocomplete
   - Accepts: `?input=user_query`
   - Returns: Address predictions as user types
   - Debounced on client-side (300ms)

4. **`POST /api/autocomplete`** - Get Place Details
   - Accepts: `{ placeId }`
   - Returns: Full address + coordinates for selected place

**Usage:**
```javascript
// Route comparison with autocomplete coordinates
const response = await fetch('/api/compare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    start: { lat: 37.7749, lng: -122.4194 }, // Coordinates from autocomplete
    end: { lat: 34.0522, lng: -118.2437 },
    preferences: { navServices: { google: true, apple: true } }
  })
})
const { results } = await response.json()
```

See `docs/api-usage.md` for complete API documentation including React Native examples.

### Google Places Autocomplete System

**AutocompleteInput Component:**
- Debounced search (300ms delay)
- Dropdown with predictions
- Loading indicator
- Click-outside to close
- Prevents re-opening after selection (justSelected flag)
- "Powered by Google" branding (required by ToS)

**User Flow:**
1. User types → Autocomplete shows suggestions after 300ms
2. User selects → Stores coordinates + formatted address
3. Submit → Uses coordinates directly (no geocoding needed)
4. Fallback → If user types manually, API geocodes server-side

**Cost Optimization:**
- Autocomplete: ~$2.83 per 1,000 sessions
- Geocoding: $5.00 per 1,000 requests (fallback only)
- React Query caches results for 5 minutes

### Phase 2 - Infrastructure ✅ COMPLETE

**Completed:**
- ✅ API route separation (`/api/compare`)
- ✅ Firebase Authentication system
- ✅ Header navigation with auth state
- ✅ Login page with email/password + Google OAuth
- ✅ Environment variable configuration
- ✅ Documentation for Firebase setup and API usage

### Phase 3 - API Integration & Security ✅ COMPLETE

**Completed:**
- ✅ Google Maps Routes API v2 integration
- ✅ Apple Maps Server API integration with JWT authentication (two-step: JWT → Access Token → ETA API)
- ✅ Apple Maps /v1/etas endpoint (NOTE: Only provides distance + time, no route polylines)
- ✅ Google Geocoding API integration (server-side)
- ✅ Google Places Autocomplete with debouncing (300ms)
- ✅ AutocompleteInput component with dropdown UI
- ✅ Coordinate support for all providers (geocoding when needed)
- ✅ Service layer architecture (routeService.js with normalizeLocation)
- ✅ React Query caching
- ✅ Rate limiting (10 req/min per IP)
- ✅ Input validation with Zod schemas (accepts addresses OR coordinates)
- ✅ Error sanitization (no internal details exposed)
- ✅ User preferences in Firestore (show/hide specific nav services)

**Next steps:**
- [ ] Waze API integration (no public API available)
- [ ] API key authentication for `/api/compare` endpoint (for monetization)
- [ ] Geocoding result caching in Firestore (reduce API costs)

### Phase 4 - Destination Discovery (Secondary Feature) 💡

**Concept:** "Find something near your destination" - Yelp-style search with comparison UI

**Feature Overview:**
After comparing travel times, users can search for businesses near their destination (restaurants, coffee shops, gas stations, etc.) and see Yelp + Google Places results side-by-side, using the same comparison UX pattern.

**Implementation Plan:**

1. **Search Interface**
   - Input: "Find [category] near destination"
   - Auto-suggest categories: Coffee, Restaurants, Gas, Hotels, Shopping
   - Optional: Distance filter (0.5mi, 1mi, 2mi)

2. **API Integration**
   - Yelp Fusion API for business search + reviews
   - Google Places API for business search + reviews
   - Call both APIs in parallel with destination coordinates

3. **Business Matching Algorithm**
   - Match Yelp + Google entries for same business using:
     - Name similarity (fuzzy matching, Levenshtein distance)
     - Location proximity (within 50 meters)
     - Phone number matching (if available)
     - Address normalization
   - Display matched businesses side-by-side (like nav comparison)
   - Show unmatched businesses separately

4. **UI/UX (Similar to route comparison)**
   - Side-by-side cards showing:
     - Business name
     - Yelp rating + review count | Google rating + review count
     - Price level ($$, $$$)
     - Distance from destination
     - Photos
     - Link to view on Yelp | Link to view on Google Maps
   - Highlight which platform has better reviews

5. **Data Structure**
   ```javascript
   {
     matched: [
       {
         name: "Blue Bottle Coffee",
         location: { lat, lng },
         distance: "0.3 mi",
         yelp: { rating: 4.5, reviewCount: 234, price: "$$" },
         google: { rating: 4.3, reviewCount: 180, price: "$$" }
       }
     ],
     yelpOnly: [...],
     googleOnly: [...]
   }
   ```

6. **Monetization Opportunities**
   - Affiliate links to Yelp/Google (referral revenue)
   - Promoted business listings
   - Premium API tier for more results
   - Save favorites feature (requires user account)

7. **User Preferences (Firestore)**
   - Save preferred search categories
   - Save favorite businesses
   - Search history
   - Personalized recommendations

**Dependencies:**
- Yelp Fusion API key
- Google Places API key (same as used for directions)
- Firestore for user preferences
- Fuzzy matching library (e.g., fuzzball.js)

**Future Enhancements:**
- Filter by rating, price, hours (open now)
- Show business hours, photos, menu (if available)
- Integration with reservation systems (OpenTable, Resy)
- "Plan your trip" feature - save destination + businesses

## Next.js 16 Considerations

**Important breaking changes to keep in mind:**

1. **Async APIs** - When implementing server-side features:
   - `params` and `searchParams` must be awaited: `await params`, `await searchParams`
   - Utility functions must be awaited: `await cookies()`, `await headers()`, `await draftMode()`
   - Currently not applicable to our client-side codebase

2. **Caching APIs**:
   - `revalidateTag()` requires `cacheLife` profile as 2nd argument
   - New APIs: `updateTag()` and `refresh()`

3. **Image Defaults**:
   - `minimumCacheTTL` changed from 60s → 4 hours
   - Local images with query strings require `images.localPatterns`

4. **Middleware Rename**:
   - Use `proxy.ts` instead of `middleware.ts` for future implementation

5. **Node.js Requirement**:
   - Minimum Node.js 20.9.0 (18 no longer supported)

6. **Turbopack**:
   - Now default bundler (opt out with `next build --webpack`)
   - Already configured with `--turbopack` flag in dev script

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

1. **Phase 1 - Core UI** ✅: Form inputs, result cards, loading states, animations, deep links
2. **Phase 2 - Infrastructure** ✅: Authentication, API routes, environment config, documentation
3. **Phase 3 - API Integration**: Real geocoding, Google Maps/Waze APIs, caching, user preferences (Firestore)
4. **Phase 4 - Destination Discovery** 💡: Secondary feature - Find businesses near destination (Yelp + Google Places comparison)
5. **Phase 5 - User Features**: Saved routes, favorites, search history, personalized recommendations
6. **Phase 6 - Deployment**: Public hosting, real-world testing, monitoring, analytics

## API Keys and Security

**Environment Variables:**
- All sensitive keys are stored in `.env.local` (gitignored)
- `.env.local.example` provides a template (safe to commit)
- Firebase config uses `NEXT_PUBLIC_` prefix (client-safe)
- Google Maps API key will be server-side only (protect in API routes)

**Security Considerations:**
- ✅ Firebase credentials in environment variables
- ✅ `.env.local` excluded from git
- [ ] API key authentication for `/api/compare` endpoint
- [ ] Rate limiting per user/session to prevent abuse
- [ ] Server-side API proxy for Google Maps (protect API keys)
- [ ] Input validation and sanitization

**Firebase Security:**
- Authentication state managed client-side
- Firebase handles token refresh automatically
- Auth state persists across browser sessions
- Optional: Implement protected routes (see `docs/firebase-setup.md`)

## Documentation

- `CLAUDE.md` - This file, project overview and status
- `docs/firebase-setup.md` - Complete Firebase authentication guide
- `docs/api-usage.md` - API endpoint documentation with examples
- `docs/v1-*.md` - TailwindCSS v1 template analysis
- `docs/whichmap-implementation-guide.md` - Implementation roadmap

## Notes

- Always update or modify existing docs/md when you make breaking changes or add new features
- Do not add any mention of Claude or AI generated in your commit messages