# WhichMap

Compare travel times across multiple navigation providers on a single screen.

---

## 📊 Project Overview

**WhichMap** compares travel times across Google Maps, Apple Maps, Waze, and other navigation providers. Users enter start and destination locations, and the app displays estimated travel times from all providers side-by-side, highlighting the fastest route.

**Vision:** Support regional navigation services worldwide (TMAP/KAKAO in South Korea, Yandex Maps in Russia, etc.)

---

## 🏗️ Tech Stack

- **Next.js 16.0.1** (App Router, Turbopack)
- **React 19.2.0**
- **Tailwind CSS v4**
- **Framer Motion** (animations)
- **Firebase v12.5.0** (Authentication + Firestore)
- **React Query v5** (API caching)
- **@googlemaps/routing v2** (Google Maps Routes API)
- **Node.js 20.9.0+** required

---

## ✅ Current Status

### Implemented Features

**Core UI**
- ✅ Floating label form inputs with Google Places Autocomplete
- ✅ Provider result cards with fastest route highlighting
- ✅ Loading states and error handling
- ✅ Smooth scroll animations (Framer Motion)
- ✅ Responsive 3-column grid layout

**Infrastructure**
- ✅ Firebase Authentication (email/password + Google OAuth)
- ✅ User preferences system (Firestore)
- ✅ API route architecture (`/api/compare`)
- ✅ Rate limiting (10 req/min per IP)
- ✅ Input validation (Zod schemas)

**Navigation Providers**
- ✅ **Google Maps** - Routes API v2 with traffic-aware routing
- ✅ **Apple Maps** - Server API integration (ETA only)
- ⏳ **Waze** - Transport SDK integration pending approval
- 🔮 **More providers** - TMAP, KAKAO, Yandex, etc. (planned)

**API Integration**
- ✅ Google Geocoding API (server-side)
- ✅ Google Places Autocomplete (debounced)
- ✅ Service layer architecture
- ✅ React Query caching (5 min)
- ✅ Universal links for all providers

### Architecture Decisions

**State Management:**
- Form state → `useState`
- API caching → React Query
- User data → Firebase/Firestore
- Preferences → **Client-side filtering only** (no API refetch on toggle)

**Key Pattern:**
- Button click → API fetches ALL providers
- Toggle preference → Filter results client-side (no refetch)
- Clean separation: data fetching vs. data filtering

---

## 🗂️ Project Structure

```
main/src/
├── app/
│   ├── api/
│   │   ├── compare/route.js      # Route comparison endpoint
│   │   ├── geocode/route.js      # Geocoding endpoint
│   │   └── autocomplete/route.js # Autocomplete endpoint
│   ├── login/page.jsx            # Authentication page
│   ├── layout.jsx                # Root layout
│   └── page.jsx                  # Main comparison page
├── components/
│   ├── AutocompleteInput.jsx     # Places autocomplete with dropdown
│   ├── Header.jsx                # Navigation with auth
│   ├── ProviderCard.jsx          # Result card component
│   └── Settings.jsx              # User preferences
├── contexts/
│   └── UserPreferencesContext.jsx # Shared preferences state
├── hooks/
│   ├── useAutocomplete.js        # Debounced autocomplete
│   └── useRouteComparison.js     # React Query hook
├── services/
│   ├── auth/authService.js
│   ├── geocoding/
│   │   ├── geocodingService.js
│   │   └── autocompleteService.js
│   └── routes/
│       ├── routeService.js       # Provider orchestrator
│       └── providers/
│           ├── googleMapsService.js
│           ├── appleMapsService.js
│           └── wazeService.js
└── lib/
    ├── appleJWT.js               # Apple Maps JWT authentication
    ├── firebase.js               # Firebase initialization
    ├── routeHelpers.js           # Route filtering logic
    └── validation.js             # Zod schemas
```

---

## 🚀 Getting Started

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

## 🔑 Key Implementation Notes

### Google Maps Routes API v2

- Uses official `@googlemaps/routing` SDK
- Traffic-aware routing with multiple alternatives
- ~4s response time (vs ~500ms for legacy Directions API)
- Trade-off: Better accuracy and features for slower response

### Apple Maps Server API

- Two-step authentication: JWT token → Access token → API calls
- **Limitation:** Only returns ETA (distance + time), no route polylines
- Useful for comparison but not detailed navigation

### Waze Transport SDK

- Pending app approval from Waze
- Will provide ETA data similar to other providers
- No public API; using official Transport SDK

### User Preferences

- Stored in Firestore (`users/{uid}/preferences`)
- Syncs across devices when logged in
- **Important:** Preferences filter results client-side only (no API refetch)
- Structure:
  ```javascript
  {
    navServices: {
      google: true,
      apple: true,
      waze: false
    }
  }
  ```

### Rate Limiting

- Currently: In-memory (10 req/min per IP)
- **Production TODO:** Switch to Upstash Redis for serverless compatibility

### Validation

- Zod schemas for all API inputs
- Accepts both address strings and coordinate objects:
  ```javascript
  // Both formats valid
  { start: "123 Main St, LA", end: "456 Oak Ave, LA" }
  { start: {lat: 34.05, lng: -118.24}, end: {lat: 34.06, lng: -118.25} }
  ```

### Universal Links

All providers use universal links (work on desktop and mobile):
- **Google Maps:** `https://www.google.com/maps/dir/?api=1&origin=...`
- **Apple Maps:** `https://maps.apple.com/?saddr=...&daddr=...`
- **Waze:** `https://waze.com/ul?q=...&navigate=yes`

Mobile: Opens native app if installed, otherwise web browser
Desktop: Opens web interface

---

## 📋 Roadmap

### Phase 3 - Core Features (Current)
- [x] Google Maps integration
- [x] Apple Maps integration
- [ ] Waze Transport SDK (pending approval)
- [ ] Production rate limiting (Upstash Redis)
- [ ] Geocoding result caching
- [ ] API key authentication for monetization

### Phase 4 - International Expansion
- [ ] TMAP (South Korea)
- [ ] KAKAO Map (South Korea)
- [ ] Yandex Maps (Russia)
- [ ] Baidu Maps (China)
- [ ] Additional regional providers

### Phase 5 - Destination Discovery
- [ ] Yelp business search near destination
- [ ] Google Places integration
- [ ] Side-by-side review comparison
- [ ] Business matching algorithm
- [ ] Save favorites feature

### Phase 6 - Deployment
- [ ] Production environment setup
- [ ] Monitoring and analytics
- [ ] Error tracking
- [ ] Performance optimization

---

## 🎨 Design System

**Colors:**
- Background: `bg-neutral-50`
- Cards: `bg-white`
- Text: `text-neutral-950` (primary), `text-neutral-600` (secondary)
- Fastest highlight: `border-green-500`, `text-green-600`

**Typography:**
- Font: Mona Sans (variable font)
- Headings: `font-display text-5xl sm:text-7xl`
- Metrics: `text-3xl sm:text-4xl font-display font-semibold`

**Spacing:**
- Section spacing: `mt-24 sm:mt-32 lg:mt-40`
- Grid gaps: `gap-10`

---

## 🔐 Security

- ✅ API keys server-side only
- ✅ Input validation with Zod
- ✅ Rate limiting per IP
- ✅ Error sanitization (no internal details exposed)
- ✅ Firebase Authentication
- ⏳ API key authentication for `/api/compare` (TODO)

---

## 📚 API Reference

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

## 🤝 Contributing

This is a personal project. For major changes, please open an issue first.

---

## 📄 License

MIT © 2025 Nam Kim

---

## 🔗 Links

- **Live Demo:** Coming soon
- **Buy Me a Coffee:** https://buymeacoffee.com/whichmap ☕
- **Firebase Console:** https://console.firebase.google.com/project/whichmap-eb2aa

---

## 📞 Support

For questions or issues, open an issue on GitHub or reach out via the support link.
