# WhichMap

Compare travel times across Google Maps, Apple Maps, and Waze on a single screen.

---

## 📊 Project Overview

**WhichMap** is a web application that compares travel times across Google Maps, Apple Maps, and Waze on a single screen. Users enter start and destination locations, and the app displays estimated travel times from all providers side-by-side, highlighting the fastest route.

---

## 📁 Repository Structure

The repository contains:

- **`main/`** - **Production application** (all development happens here)
- **`docs/`** - Comprehensive documentation
- **`README.md`** - This file

---

## 🏗️ Current Architecture (main/ directory)

### Tech Stack

- **Next.js 16.0.1** (App Router, Turbopack)
- **React 19.2.0**
- **Tailwind CSS v4** (CSS-based configuration)
- **Framer Motion** (animations)
- **Firebase v12.5.0** (Authentication + Firestore)
- **React Query v5** (API caching)
- **@googlemaps/routing v2** (Google Maps Routes API)
- **Node.js 20.9.0+** required

### Key Features Implemented ✅

**Phase 1 - Core UI (COMPLETE)**
- ✅ Floating label form inputs
- ✅ Provider result cards with fastest highlighting
- ✅ Loading spinner with message
- ✅ Error alerts
- ✅ Smooth scroll to results
- ✅ Responsive 3-column grid
- ✅ Framer Motion animations

**Phase 2 - Infrastructure (COMPLETE)**
- ✅ Firebase Authentication (email/password + Google OAuth)
- ✅ Header with auth state
- ✅ Login page
- ✅ API route separation (`/api/compare`)
- ✅ Environment variable configuration
- ✅ User preferences system (Firestore)

**Phase 3 - API Integration & Security (COMPLETE)**
- ✅ Google Maps Routes API v2 integration (working)
- ✅ Apple Maps Server API integration (ETA only - no route polylines)
- ✅ Google Geocoding API (server-side)
- ✅ Google Places Autocomplete with debouncing
- ✅ AutocompleteInput component with dropdown UI
- ✅ Service layer architecture (routeService.js)
- ✅ React Query caching
- ✅ Rate limiting (10 req/min per IP)
- ✅ Input validation with Zod schemas (accepts addresses OR coordinates)
- ✅ Error sanitization (no internal details exposed)
- ⚠️ Waze - marked as "Coming Soon" (no public API available)

---

## 🗂️ File Structure (main/src/)

```
main/src/
├── app/
│   ├── api/
│   │   ├── compare/route.js      # Route comparison endpoint (rate limited, validated)
│   │   ├── geocode/route.js      # Google Geocoding API endpoint
│   │   └── autocomplete/route.js # Google Places Autocomplete endpoint
│   ├── login/page.jsx            # Authentication page
│   ├── layout.jsx                # Root layout with ErrorBoundary
│   └── page.jsx                  # Main comparison page (with autocomplete)
├── components/
│   ├── AutocompleteInput.jsx     # Google Places autocomplete with dropdown
│   ├── Border.jsx                # Decorative accent lines
│   ├── Button.jsx                # Primary action button
│   ├── Container.jsx             # Max-width wrapper
│   ├── ErrorBoundary.jsx         # Error boundary component
│   ├── FadeIn.jsx                # Animation components
│   ├── Header.jsx                # Navigation with auth
│   ├── ProviderCard.jsx          # Result card component
│   ├── Settings.jsx              # User preferences (Coming Soon badges)
│   └── TextInput.jsx             # Floating label input
├── contexts/
│   └── UserPreferencesContext.jsx # React Context for shared user preferences
├── hooks/
│   ├── useAutocomplete.js        # Google Places autocomplete hook (debounced)
│   └── useRouteComparison.js     # React Query hook for routes
├── lib/
│   ├── appleJWT.js               # Apple Maps JWT token generator & access token exchange
│   ├── deeplinkHelpers.js        # Universal link generation for all providers
│   ├── firebase.js               # Firebase initialization
│   ├── helpers.js                # Global debug utilities
│   ├── ratelimit.js              # Rate limiting utility (Upstash/in-memory)
│   ├── routeHelpers.js           # Route filtering & business logic
│   └── validation.js             # Zod schemas (accepts addresses OR coordinates)
├── models/
│   └── User.js                   # User data model (Firestore)
├── providers/
│   └── QueryProvider.jsx         # React Query setup
├── services/
│   ├── auth/
│   │   └── authService.js        # Auth operations
│   ├── geocoding/
│   │   ├── geocodingService.js   # Google Geocoding client service
│   │   └── autocompleteService.js # Google Places Autocomplete client service
│   └── routes/
│       ├── routeService.js       # Route orchestrator (with geocoding support)
│       └── providers/
│           ├── googleMapsService.js  # Google Maps Routes API v2
│           ├── appleMapsService.js   # Apple Maps ETA API
│           └── wazeService.js        # Waze (universal links only)
└── styles/
    ├── tailwind.css              # Tailwind v4 theme
    └── base.css                  # Mona Sans font
```

---

## 🔄 State Management Architecture

The app uses a **hybrid approach**:

| Tool | Purpose | Use Cases |
|------|---------|-----------|
| **useState** | Component-scoped state | Form inputs, UI toggles |
| **Custom Hooks** | Reusable stateful logic | Firebase integration, combining states |
| **Firebase/Firestore** | Real-time user data | Auth, preferences, saved routes |
| **React Query** | External API caching | Google Maps, Waze, Yelp APIs |

---

## 🎨 Design System

**Colors:**
- Background: `bg-neutral-50` (light mode)
- Cards: `bg-white`
- Text: `text-neutral-950` (primary), `text-neutral-600` (secondary)
- Fastest highlight: `border-green-500`, `text-green-600`

**Typography:**
- Font: Mona Sans (variable font)
- Headings: `font-display text-5xl sm:text-7xl`
- Body: `text-base`
- Metrics: `text-3xl sm:text-4xl font-display font-semibold`

**Spacing:**
- Section spacing: `mt-24 sm:mt-32 lg:mt-40`
- Grid gaps: `gap-10`
- Container: `max-w-7xl`

---

## 🔑 Key Implementation Details

### Google Maps Integration

- Uses **Routes API v2** (not legacy Directions API)
- Provides traffic-aware routing
- Returns multiple route alternatives
- **Performance note:** ~4s response time (vs ~500ms for legacy API)
- Trade-off: Better accuracy and features

### User Preferences System

- Stored in Firestore (`users` collection)
- Toggle visibility of nav services (Google/Apple/Waze)
- Syncs across devices when logged in
- Falls back to defaults when not logged in

### API Route Architecture

- `/api/compare` endpoint for external access
- Accepts POST (JSON) and GET (query params)
- Ready for API key authentication (TODO comments in place)
- Designed for future monetization

### Deep Links

- Google Maps: `comgooglemaps://` (app) or `https://google.com/maps/dir/` (web)
- Apple Maps: `maps://` (app only)
- Waze: `waze://` (app) or `https://waze.com/ul` (web)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- Firebase account (for authentication and Firestore)
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd maps
   ```

2. **Navigate to the main directory**
   ```bash
   cd main
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   
   Create a `.env.local` file in the `main/` directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=whichmap-eb2aa.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=whichmap-eb2aa
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=whichmap-eb2aa.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google Maps API Key (server-side only)
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:3000`

### Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 📋 Current Status & Next Steps

### What's Working

1. ✅ Full UI with animations
2. ✅ Firebase authentication
3. ✅ Google Maps Routes API integration
4. ✅ Apple Maps ETA API integration (distance + time only)
5. ✅ **Google Places Autocomplete with debouncing**
6. ✅ **Google Geocoding API (server-side)**
7. ✅ **AutocompleteInput component with dropdown**
8. ✅ User preferences (show/hide services)
9. ✅ React Query caching
10. ✅ Responsive design
11. ✅ Rate limiting (10 req/min per IP)
12. ✅ Input validation with Zod (accepts addresses OR coordinates)
13. ✅ Error boundaries
14. ✅ Refactored state management (no duplication)
15. ✅ Business logic in service layer
16. ✅ Organized services directory structure

### What's Pending

1. ⏳ Waze integration (no public API available - marked as "Coming Soon")
2. ⏳ API key authentication for `/api/compare` (for monetization)
3. ⏳ Geocoding result caching in Firestore (reduce API costs)
4. ⏳ Deployment configuration (Vercel/production)

### Phase 4 - Destination Discovery (Future)

- Yelp + Google Places business search near destination
- Side-by-side comparison of reviews/ratings
- Business matching algorithm
- Save favorites feature

---

## 🔐 Environment Variables

The app requires these environment variables:

### Firebase (Client-side - NEXT_PUBLIC_ prefix)
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID (whichmap-eb2aa)
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

### Google Maps (Server-side only)
- `GOOGLE_MAPS_API_KEY` - Google Maps API key (kept server-side for security)

### Apple Maps (Server-side only)
- `APPLE_MAPS_TEAM_ID` - Apple Developer Team ID (10 characters)
- `APPLE_MAPS_KEY_ID` - Apple Maps API Key ID (10 characters)
- `APPLE_MAPS_PRIVATE_KEY` - Apple Maps Private Key (.p8 file contents)

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

1. **`api-usage.md`** - API endpoint documentation with examples
2. **`firebase-setup.md`** - Complete Firebase setup guide
3. **`firestore-schema.md`** - Database structure and models
4. **`state-management-architecture.md`** - When to use Firebase vs React Query
5. **`whichmap-implementation-guide.md`** - Implementation roadmap
6. **`v1-analysis.md`** - TailwindCSS template analysis
7. **`v1-components-reference.md`** - Component library reference
8. **`v1-design-system.md`** - Complete design tokens

---

## 💡 Notable Patterns & Best Practices

1. **Service Layer Architecture** - Clean separation between UI and API calls
2. **Model Pattern** - User.js follows Laravel-style model pattern
3. **Custom Hooks** - Reusable logic for Firebase and React Query
4. **Global Helpers** - Debug utilities available in dev mode (`log`, `logger`, etc.)
5. **Animation System** - FadeIn/FadeInStagger with scroll triggers
6. **Responsive Design** - Mobile-first with progressive enhancement

---

## 🚀 Key Insights

1. **Apple Maps Server API is LIMITED** - Only provides ETA (distance + time), no route polylines or turn-by-turn
2. **Apple Maps requires two-step auth** - JWT token → Access token → API calls
3. **Google Places Autocomplete optimizes costs** - Geocoding only when needed (fallback)
4. **Waze has no public API** - Only universal links available for navigation
5. **Universal Links work across platforms** - Automatically open native app on mobile, web on desktop
6. **Routes API v2 is slower but more accurate** - ~4s vs ~500ms (legacy), but includes traffic
7. **React Query handles all API caching** - No need for manual cache management
8. **Firebase handles all user data** - Auth + Firestore for preferences
9. **The app is production-ready** - Just needs environment variables configured

---

## 🤝 Contributing

This is a personal project. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

MIT © 2025 Nam Kim

---

## 🔗 Links

- **Live Demo:** Coming soon
- **Buy Me a Coffee:** https://buymeacoffee.com/whichmap
- **Firebase Console:** https://console.firebase.google.com/project/whichmap-eb2aa

---

## 📞 Support

For questions or issues, please refer to the documentation in the `docs/` directory or open an issue on GitHub.


