# WhichMap

Compare travel times across major map providers — Google Maps, Apple Maps, and Waze — on a single screen.

---

## 1. Overview

WhichMap allows users to enter a **starting location** and **destination**, then displays estimated travel times from multiple navigation providers side by side.

The goal: a lightweight, fast, and intuitive way to instantly see which map app will get you there fastest.

---

## 2. Core MVP Flow

### User Flow
1. User enters start and end locations.
2. App displays loading state while fetching data from providers.
3. Once all results are in:
   - Display results in a 3-card layout (Google, Apple, Waze).
   - Highlight the shortest ETA visually.
4. When a user clicks a provider card:
   - Open that route directly in the corresponding app or web page.

### MVP Features
- Input fields for start and destination.
- “Compare Routes” button.
- Loading indicator (spinner or shimmer cards).
- Cards showing:
  - Provider name
  - ETA
  - Distance (if available)
- Highlight the shortest ETA (e.g., green border or background).
- Click-to-open deep link for that provider.

---

## 3. Core Logic (Pseudocode)

```
function onCompareClick(start, end):
    showLoadingState()
    
    // Step 1: Geocode addresses
    startCoords = geocode(start)
    endCoords = geocode(end)
    
    // Step 2: Fetch data from all providers in parallel
    results = parallelFetch([
        getGoogleETA(startCoords, endCoords),
        getAppleETA(startCoords, endCoords),
        getWazeETA(startCoords, endCoords)
    ])
    
    // Step 3: Determine fastest result
    fastest = findMinByETA(results)
    
    // Step 4: Update UI
    hideLoadingState()
    renderResults(results, highlight=fastest)
```

---

## 4. Data Fetching Outline

- **Google Maps Directions API**  
  Returns ETA, distance, route summary.  
  Requires API key.

- **Apple Maps**  
  No open directions API. Use web deep links for now, or mock ETA.

- **Waze Routing API**  
  Accepts coordinates, returns route summary and estimated time.  
  No auth needed for MVP.

---

## 5. Deep Link Examples

| Provider | Example URL |
|-----------|--------------|
| Google Maps | https://www.google.com/maps/dir/?api=1&origin={start}&destination={end} |
| Apple Maps  | https://maps.apple.com/?saddr={start}&daddr={end} |
| Waze        | https://waze.com/ul?ll={lat},{lng}&navigate=yes |

---

## 6. State Management Logic (Simplified)

```
state = {
    start: "",
    end: "",
    results: [],
    isLoading: false,
    error: null
}

function handleSubmit():
    if (!start || !end): showError("Please enter both fields")
    else: onCompareClick(start, end)
```

---

## 7. MVP Development Roadmap

### Phase 1 — Core UI
- Build basic form (start/end inputs + compare button)
- Show static placeholder cards (mock data)
- Add loading state
- Add click-to-open URLs for each provider

### Phase 2 — Integrations
- Hook up geocoding (convert address → coordinates)
- Implement API fetchers for each provider
- Handle errors gracefully (timeout, rate limit, invalid input)

### Phase 3 — Logic & Highlighting
- Compare results and determine fastest
- Highlight fastest visually
- Fine-tune design (mobile-first)

### Phase 4 — Deployment
- Deploy to a public URL (any static or serverless host)
- Test real-world input variations
- Validate accuracy across providers

---

## 8. Future Developments

### A. Caching (Short-Term Optimization)
Even though routes are mostly unique, you can cache *by proximity and time*:
- Round coordinates (e.g., 2 decimal places) to group nearby routes.
- Store results with a short TTL (e.g., 60–120 seconds).
- Cache geocoding results (address → lat/lng) long-term.

```
function getCachedOrFetch(key, fetchFn):
    if (cache[key] && cache[key].fresh):
        return cache[key].data
    data = fetchFn()
    cache[key] = { data, timestamp: now }
    return data
```

### B. Scaling
- Add server-side caching (Redis, KV store).
- Add request rate limiting per user/session.
- Consolidate all provider calls behind a single `/api/compare` endpoint.

### C. Expansion Ideas
- Add more providers (Kakao, Naver, Bing, HERE, etc.)
- Support transportation modes (drive, walk, transit)
- Integrate AI summary (“Fastest + least traffic”)
- Add mobile deep linking for native app handoff
- Save frequent routes / favorite locations
- Add analytics (e.g., which provider wins most often)

---

## 9. Notes / Considerations

- ETAs are not always synchronized across services — differences of 1–2 minutes are normal.
- Handle edge cases (invalid address, API errors, missing data).
- Avoid excessive API calls: geocode once, reuse coordinates.
- In production, secure API keys and handle rate limits gracefully.

---

## 10. License

MIT © 2025 Nam Kim

