# WhichMap

Compare travel times across multiple navigation providers on a single screen.

---

## Project Overview

**WhichMap** compares travel times across Google Maps, Apple Maps, Waze, and other navigation providers. Users enter start and destination locations, and the app displays estimated travel times from all providers side-by-side, highlighting the fastest route.

**Vision:** Support regional navigation services worldwide (TMAP/KAKAO in South Korea, Yandex Maps in Russia, etc.)

---

## Tech Stack

- **Next.js 16.0.1** (App Router, Turbopack)
- **React 19.2.0**
- **Tailwind CSS v4**
- **Framer Motion** (animations)
- **Firebase v12.5.0** (Authentication + Firestore)
- **React Query v5** (API caching)
- **@googlemaps/routing v2** (Google Maps Routes API)
- **Zod v4** (input validation)
- **Node.js 20.9.0+** required

---

## Current Status

### Implemented Features

**Core UI**
- Floating label form inputs with Google Places Autocomplete
- Provider result cards with fastest route highlighting (Uber-style design)
- Split-screen layout (desktop: inputs left, results right)
- Loading states and error handling
- Smooth scroll animations (Framer Motion)
- Search history with "Use current location" feature
- Official app icons (Google Maps, Apple Maps, Waze)

**Infrastructure**
- Firebase Authentication (email/password + Google OAuth)
- User preferences system (Firestore)
- Search history (localStorage for anonymous, Firestore for logged-in)
- Commission tracking system (UTM attribution, click tracking)
- API route architecture (`/api/compare`)
- Rate limiting (10 req/min per IP)
- Input validation (Zod schemas)

**Navigation Providers**
- **Google Maps** - Routes API v2 with traffic-aware routing
- **Apple Maps** - Server API integration (ETA only)
- **Waze** - Universal links (no public API)

**API Integration**
- Google Geocoding API (server-side)
- Google Places Autocomplete (debounced)
- Service layer architecture
- React Query caching (5 min)
- Universal links for all providers

---

## Project Structure

```
main/src/
├── app/
│   ├── api/
│   │   ├── compare/route.ts      # Route comparison endpoint
│   │   ├── geocode/route.ts      # Geocoding endpoint
│   │   └── autocomplete/route.ts # Autocomplete endpoint
│   ├── login/page.tsx            # Authentication page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main comparison page
├── components/
│   ├── AutocompleteInput.tsx     # Places autocomplete + search history
│   ├── Header.tsx                # Navigation with auth
│   ├── ProviderCard.tsx          # Result card (Uber-style design)
│   └── Settings.tsx              # User preferences
├── contexts/
│   └── UserPreferencesContext.tsx # Shared preferences state
├── hooks/
│   ├── useAutocomplete.ts        # Debounced autocomplete
│   └── useRouteComparison.ts     # React Query hook
├── services/
│   ├── auth/authService.ts
│   ├── geocoding/
│   │   ├── geocodingService.ts
│   │   └── autocompleteService.ts
│   ├── searchHistory/
│   │   └── searchHistoryService.ts  # Search history (local + Firestore)
│   ├── tracking/
│   │   └── trackingService.ts       # Commission tracking system
│   └── routes/
│       ├── routeService.ts       # Provider orchestrator
│       └── providers/
│           ├── googleMapsService.ts
│           ├── appleMapsService.ts
│           └── wazeService.ts
└── lib/
    ├── appleJWT.ts               # Apple Maps JWT authentication
    ├── firebase.ts               # Firebase initialization
    ├── routeHelpers.ts           # Route filtering logic
    └── validation.ts             # Zod schemas
```

---

## Getting Started

### Prerequisites

- Node.js 20.9.0+
- Firebase account (Authentication + Firestore)
- Google Maps API key (with Routes, Geocoding, and Places APIs enabled)
- Apple Maps Server API credentials (optional)

### Installation

1. **Clone and navigate**
   ```bash
   git clone <repository-url>
   cd maps/main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env.local` in `main/` directory:

   ```env
   # Firebase (client-side)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=whichmap-eb2aa.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=whichmap-eb2aa
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=whichmap-eb2aa.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google Maps (server-side only)
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Apple Maps (server-side only) - Optional
   APPLE_MAPS_TEAM_ID=your_team_id
   APPLE_MAPS_KEY_ID=your_key_id
   APPLE_MAPS_PRIVATE_KEY=your_private_key_contents
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:3000
   ```

### Development Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # Run linter
```

---

## Firebase Setup

### Firestore Collections

The app uses two Firestore collections:

#### `search_history` Collection

Stores user search history (logged-in users only; anonymous users use localStorage).

```typescript
{
  userId: string          // Firebase Auth UID
  address: string         // Search address
  coordinates?: {         // Optional geocoded coordinates
    lat: number
    lng: number
  }
  searchType: 'origin' | 'destination'
  timestamp: Timestamp
}
```

**Behavior:**
- Displays last 5 searches per user
- Retains last 50 searches for analytics
- Falls back to localStorage if Firestore fails

#### `tracking_events` Collection

Tracks user searches (one document per search).

```typescript
{
  trackingCode: string        // Unique: "wm_1234567890_abc123xyz"
  userId: string | null       // Logged-in user or null (anonymous)
  sessionId: string           // Persistent browser session (localStorage)
  
  // Search Details
  origin: string
  originCoords?: { lat: number, lng: number }
  destination: string  
  destCoords?: { lat: number, lng: number }
  
  // Results Shown
  providers: [{
    id: 'google' | 'apple' | 'waze'
    name: string
    eta: number
    distance: string
    isFastest: boolean
  }]
  
  // Attribution
  referralSource?: string
  utmParams?: {
    source?: string
    medium?: string
    campaign?: string
    content?: string
  }
  
  // Device Info
  device: {
    screenWidth: number
    screenHeight: number
    hasTouch: boolean
    platform: string
    language: string
  }
  
  // Metadata
  createdAt: Timestamp
}
```

#### `tracking_clicks` Collection

Tracks provider clicks (one document per click). Separate from events for easier analytics.

```typescript
{
  trackingCode: string        // Links to parent tracking_events document
  sessionId: string           // Denormalized for easier queries
  userId: string | null       // Denormalized for easier queries
  providerId: string          // 'google', 'apple', or 'waze'
  createdAt: Timestamp
}
```

### Required Indexes

Create these composite indexes in Firebase Console → Firestore → Indexes:

1. **Search History Query**
   - Collection: `search_history`
   - Fields: `userId` (Ascending), `timestamp` (Descending)

2. **User Tracking Events**
   - Collection: `tracking_events`
   - Fields: `userId` (Ascending), `createdAt` (Descending)

3. **Session Tracking Events**
   - Collection: `tracking_events`
   - Fields: `sessionId` (Ascending), `createdAt` (Descending)

4. **Clicks by Provider**
   - Collection: `tracking_clicks`
   - Fields: `providerId` (Ascending), `createdAt` (Descending)

5. **Clicks by User**
   - Collection: `tracking_clicks`
   - Fields: `userId` (Ascending), `createdAt` (Descending)

6. **Clicks by Session**
   - Collection: `tracking_clicks`
   - Fields: `sessionId` (Ascending), `createdAt` (Descending)

### Security Rules

Copy rules from `firestore.rules.example` to Firebase Console → Firestore → Rules.

---

## Key Implementation Notes

### Google Maps Routes API v2

- Uses official `@googlemaps/routing` SDK
- Traffic-aware routing with multiple alternatives
- ~4s response time (vs ~500ms for legacy Directions API)

### Apple Maps Server API

- Two-step authentication: JWT token → Access token → API calls
- **Limitation:** Only returns ETA (distance + time), no route polylines

### Commission Tracking

The tracking system attributes user searches and provider clicks:

1. **On search:** Creates a tracking event with search details and results
2. **On click:** Updates the event with the selected provider
3. **Storage:** Tracking code stored in sessionStorage for click attribution

### Search History

- **Logged-in users:** Firestore (syncs across devices)
- **Anonymous users:** localStorage (device-only)
- Automatic fallback if Firestore fails

### User Preferences

- Stored in Firestore (`users/{uid}/preferences`)
- Syncs across devices when logged in
- Preferences filter results client-side only (no API refetch)

### Universal Links

All providers use universal links (work on desktop and mobile):
- **Google Maps:** `https://www.google.com/maps/dir/?api=1&origin=...`
- **Apple Maps:** `https://maps.apple.com/?saddr=...&daddr=...`
- **Waze:** `https://waze.com/ul?q=...&navigate=yes`

---

## API Reference

### POST /api/compare

Compare routes across all navigation providers.

**Request:**
```json
{
  "start": "1932 Selby Ave, Los Angeles, CA",
  "end": "111 N Broadway, Los Angeles, CA"
}
```

**Response:**
```json
{
  "success": true,
  "start": "1932 Selby Ave, Los Angeles, CA",
  "end": "111 N Broadway, Los Angeles, CA",
  "results": [
    {
      "id": "google",
      "provider": "Google Maps",
      "eta": 25,
      "distance": "15.2 mi",
      "unit": "min",
      "link": "https://www.google.com/maps/dir/...",
      "durationText": "25 min",
      "summary": "Via I-405 N"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Rate Limit:** 10 requests per minute per IP

---

## Testing

### Manual Test Flow

1. Open `http://localhost:3000`
2. Enter start and destination addresses
3. Click "Compare Routes"
4. Verify results appear with ETAs
5. Click a provider card to open the map

### Test Search History

**Logged-in user:**
1. Sign in
2. Search for locations
3. Clear input → see "Recently searched"
4. Check Firestore console → verify documents

**Anonymous user:**
1. Sign out
2. Search for locations
3. Clear input → see "Recently searched"
4. Check localStorage → verify saved data

### Test Tracking

1. Search for a route
2. Click a provider card
3. Check Firestore `tracking_events` → verify `providerClicked` is set

### Test UTM Parameters

Visit: `http://localhost:3000/?utm_source=google&utm_campaign=test`

Tracking event should include UTM parameters.

---

## Troubleshooting

### "Missing index" error
Firebase will show a link in the error. Click it to auto-create the index.

### Tracking code not found
Check sessionStorage in browser DevTools for key: `whichmap_current_tracking_code`

### Search history not appearing
- Logged-in: Check Firestore `search_history` collection
- Anonymous: Check localStorage key: `whichmap_search_history`

---

## Roadmap

### Completed
- [x] Google Maps integration
- [x] Apple Maps integration
- [x] Search history (local + Firestore)
- [x] Commission tracking system
- [x] UTM campaign attribution
- [x] Uber-style UI design

### In Progress
- [ ] Admin dashboard for analytics
- [ ] Production rate limiting (Upstash Redis)
- [ ] Geocoding result caching

### Planned
- [ ] TMAP (South Korea)
- [ ] KAKAO Map (South Korea)
- [ ] Additional regional providers

---

## Security

- API keys server-side only
- Input validation with Zod
- Rate limiting per IP
- Error sanitization (no internal details exposed)
- Firebase Authentication

---

## Documentation

- **README.md** (this file) - Project overview and setup
- **CLAUDE.md** - Development guide for AI assistants
- **FIRESTORE_SETUP.md** - Firebase/Firestore configuration guide
- **firestore.rules.example** - Security rules template

---

## Contributing

This is a personal project. For major changes, please open an issue first.

---

## License

MIT © 2025 Nam Kim

---

## Support

For questions or issues, open an issue on GitHub.
