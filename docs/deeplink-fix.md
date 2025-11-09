# Deeplink Implementation Documentation

## Overview

This document explains how WhichMap handles deeplinks using **Universal Links**, the recommended approach for opening map applications across all platforms.

## Why Universal Links?

Based on [Google's official documentation](https://developers.google.com/maps/documentation/urls/ios-urlscheme), Universal Links are the **recommended approach** because:

1. **Cross-platform compatibility** - Works on desktop, iOS, and Android
2. **Automatic app detection** - The OS handles app availability, no manual detection needed
3. **Graceful fallback** - Opens in browser if app isn't installed
4. **Better user experience** - No delays, failed attempts, or error messages
5. **No npm packages required** - Native browser/OS functionality

## How It Works

### Desktop
- Universal Link opens in web browser
- User gets full web experience

### Mobile (iOS/Android)
- **App installed**: OS automatically opens the native app
- **App not installed**: Opens in mobile browser

No detection code needed - the operating system handles everything!

## Universal Link Formats

### Google Maps
- **Universal Link**: `https://www.google.com/maps/dir/?api=1&origin={origin}&destination={destination}&travelmode=driving`
- **Parameters**:
  - `api=1`: Required for Universal Links
  - `origin`: Starting address or coordinates (URL encoded)
  - `destination`: Destination address or coordinates (URL encoded)
  - `travelmode`: Travel mode (driving, walking, transit, bicycling)
- **Behavior**:
  - Desktop: Opens Google Maps website
  - iOS with app: Opens Google Maps app
  - iOS without app: Opens in Safari
  - Android with app: Opens Google Maps app
  - Android without app: Opens in Chrome

### Apple Maps
- **Universal Link**: `https://maps.apple.com/?saddr={origin}&daddr={destination}`
- **Parameters**:
  - `saddr`: Starting address or coordinates (URL encoded)
  - `daddr`: Destination address or coordinates (URL encoded)
- **Behavior**:
  - Desktop: Opens Apple Maps website
  - iOS/macOS with app: Opens Apple Maps app
  - iOS/macOS without app: Opens in Safari
  - Android: Opens in browser (Apple Maps web)

### Waze
- **Universal Link**: `https://waze.com/ul?q={destination}&navigate=yes`
- **Parameters**:
  - `q`: Destination address or coordinates (URL encoded)
  - `navigate=yes`: Start navigation immediately
- **Behavior**:
  - Desktop: Opens Waze website
  - iOS with app: Opens Waze app
  - iOS without app: Opens in Safari
  - Android with app: Opens Waze app
  - Android without app: Opens in Chrome

## Legacy App Protocol URLs (Not Recommended)

While these work, Universal Links are preferred:

### Google Maps
- **App Protocol**: `comgooglemaps://?saddr={origin}&daddr={destination}&directionsmode=driving`

### Apple Maps
- **App Protocol**: `maps://maps.apple.com/?saddr={origin}&daddr={destination}&dirflg=d`

### Waze
- **App Protocol**: `waze://?q={destination}&navigate=yes`

---

## Service Implementation

The provider services already had correct implementations:

### Google Maps Service
```javascript
// main/src/services/routes/providers/googleMapsService.js
export function getDeepLinkUrl(origin, destination) {
  const params = new URLSearchParams({
    saddr: origin,
    daddr: destination,
    directionsmode: 'driving',
  })
  return `comgooglemaps://?${params}`
}
```

### Apple Maps Service
```javascript
// main/src/services/routes/providers/appleMapsService.js
export function getDeepLinkUrl(origin, destination) {
  const originStr = formatLocationForUrl(origin)
  const destinationStr = formatLocationForUrl(destination)
  
  const params = new URLSearchParams({
    saddr: originStr,
    daddr: destinationStr,
    dirflg: 'd',
  })
  
  return `maps://maps.apple.com/?${params}`
}
```

### Waze Service
```javascript
// main/src/services/routes/providers/wazeService.js
export function getDeepLinkUrl(origin, destination) {
  const params = new URLSearchParams({
    q: destination,
    navigate: 'yes',
  })
  
  return `waze://?${params}`
}
```

---

## Testing

### Desktop Browsers
On desktop browsers, app protocol URLs will:
1. Prompt to open the native app (if installed)
2. Show an error or do nothing (if app not installed)

### Mobile Browsers
On mobile browsers (iOS/Android), app protocol URLs will:
1. Automatically open the native app (if installed)
2. May show a prompt asking to open the app
3. Fall back to App Store/Play Store (if configured with fallback)

### Expected Behavior
- **iOS**: Tapping a link should open the native app directly
- **Android**: Tapping a link should show an app chooser or open the app directly
- **Desktop**: Clicking should prompt to open the app or launch it automatically

---

## Fallback Strategy

The current implementation has a three-tier fallback:

```jsx
deepLink={result.deepLink || result.webLink || generateDeepLink(result.id, startLocation, endLocation)}
```

1. **Primary**: Use `result.deepLink` from the service (app protocol)
2. **Secondary**: Use `result.webLink` from the service (web URL)
3. **Tertiary**: Generate deeplink using `generateDeepLink()` helper

This ensures that:
- Native apps are prioritized for the best user experience
- Web fallback is available if deeplinks fail
- A link is always generated even if service data is incomplete

---

## Future Enhancements

### 1. Smart Link Detection
Detect user's platform and provide appropriate links:

```javascript
function getSmartLink(provider, origin, destination) {
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
  const isIOS = /iPhone|iPad/i.test(navigator.userAgent)
  const isAndroid = /Android/i.test(navigator.userAgent)
  
  if (isMobile) {
    return getDeepLinkUrl(provider, origin, destination)
  } else {
    return getWebUrl(provider, origin, destination)
  }
}
```

### 2. Universal Links (iOS)
Use HTTPS URLs that automatically open apps on iOS:
- Google Maps: `https://maps.google.com/?...` (with proper app configuration)
- Apple Maps: Already uses universal links
- Waze: `https://waze.com/ul?...`

### 3. App Install Detection
Check if apps are installed before showing deeplinks:

```javascript
async function isAppInstalled(scheme) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 2000)
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = `${scheme}://`
    document.body.appendChild(iframe)
    
    window.addEventListener('blur', () => {
      clearTimeout(timeout)
      resolve(true)
    })
  })
}
```

### 4. Coordinate-Based Links
When coordinates are available, use them instead of addresses for more accurate routing:

```javascript
// Google Maps with coordinates
comgooglemaps://?saddr=34.0522,-118.2437&daddr=34.0092,-118.4976

// Apple Maps with coordinates  
maps://maps.apple.com/?sll=34.0522,-118.2437&dll=34.0092,-118.4976

// Waze with coordinates
waze://?ll=34.0092,-118.4976&navigate=yes
```

---

## Related Files

- `main/src/app/page.jsx` - Main page component (deeplink priority)
- `main/src/lib/routeHelpers.js` - Helper functions (deeplink generation)
- `main/src/services/routes/providers/googleMapsService.js` - Google Maps service
- `main/src/services/routes/providers/appleMapsService.js` - Apple Maps service
- `main/src/services/routes/providers/wazeService.js` - Waze service
- `main/src/components/ProviderCard.jsx` - Card component displaying links

---

## References

- [Google Maps URL Scheme](https://developers.google.com/maps/documentation/urls/ios-urlscheme)
- [Apple Maps URL Scheme](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html)
- [Waze URL Scheme](https://developers.google.com/waze/deeplinks)

