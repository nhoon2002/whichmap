# Current Location Feature

## Overview

The "Use Current Location" feature allows users to quickly set their starting or destination point to their current GPS location with a single click, similar to Uber, Lyft, and other navigation apps.

## How It Works

### User Experience

1. **Location Button**: Each autocomplete input has a location icon button on the right side
2. **Click to Request**: User clicks the button to request their current location
3. **Browser Permission**: Browser prompts for location access (first time only)
4. **Loading State**: Button shows a spinner while getting location
5. **Success**: Input displays "Current Location" while coordinates are stored
6. **Error Handling**: Clear error messages if location access fails

### Visual States

```
┌─────────────────────────────────────────┐
│ Starting Location                   📍  │  ← Normal state
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Starting Location                   ⟳   │  ← Loading state
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Current Location                    📍  │  ← Success state
└─────────────────────────────────────────┘
```

## Implementation Details

### Component: `AutocompleteInput.jsx`

#### New Props

```javascript
{
  // Show/hide the location button (default: true)
  showLocationButton: true,
  
  // Optional callback when location is obtained
  onUseCurrentLocation: (coordinates) => {
    console.log(coordinates) // { lat: 34.0522, lng: -118.2437 }
  }
}
```

#### Geolocation API Options

```javascript
{
  enableHighAccuracy: true,  // Use GPS for better accuracy
  timeout: 10000,            // 10 second timeout
  maximumAge: 0              // Don't use cached location
}
```

### Data Flow

1. **User clicks location button**
   ```javascript
   handleUseCurrentLocation()
   ```

2. **Request browser geolocation**
   ```javascript
   navigator.geolocation.getCurrentPosition()
   ```

3. **On success, update state**
   ```javascript
   {
     address: 'Current Location',
     coordinates: { lat: 34.0522, lng: -118.2437 },
     isCurrentLocation: true
   }
   ```

4. **Parent component receives**
   - Display text: `"Current Location"`
   - Actual coordinates: `{ lat, lng }`
   - Flag: `isCurrentLocation: true`

### Error Handling

The feature handles all geolocation error codes with user-friendly messages:

| Error Code | Error Type | User Message |
|------------|-----------|--------------|
| 1 | PERMISSION_DENIED | "Location access denied. Please enable location permissions." |
| 2 | POSITION_UNAVAILABLE | "Location unavailable. Please try again." |
| 3 | TIMEOUT | "Location request timed out. Please try again." |
| - | UNSUPPORTED | "Geolocation is not supported by your browser" |

## Usage Example

### Basic Usage

```jsx
<AutocompleteInput
  label="Starting Location"
  value={startLocation}
  onChange={(value) => setStartLocation(value)}
  onSelect={(place) => {
    setStartLocation(place.address)
    setStartCoordinates(place.coordinates)
    
    // Check if it's current location
    if (place.isCurrentLocation) {
      console.log('User selected current location')
    }
  }}
/>
```

### With Callback

```jsx
<AutocompleteInput
  label="Starting Location"
  value={startLocation}
  onChange={(value) => setStartLocation(value)}
  onSelect={(place) => {
    setStartLocation(place.address)
    setStartCoordinates(place.coordinates)
  }}
  onUseCurrentLocation={(coords) => {
    // Additional logic when current location is used
    console.log('Got current location:', coords)
    trackAnalytics('current_location_used')
  }}
/>
```

### Disable Location Button

```jsx
<AutocompleteInput
  label="Destination"
  value={endLocation}
  onChange={(value) => setEndLocation(value)}
  onSelect={(place) => {
    setEndLocation(place.address)
    setEndCoordinates(place.coordinates)
  }}
  showLocationButton={false}  // Hide the location button
/>
```

## Browser Compatibility

### Geolocation API Support

- ✅ Chrome 5+
- ✅ Firefox 3.5+
- ✅ Safari 5+
- ✅ Edge (all versions)
- ✅ iOS Safari 3.2+
- ✅ Android Browser 2.1+

### HTTPS Requirement

**Important**: Geolocation API requires HTTPS in production (except localhost).

- ✅ `https://whichmap.com` - Works
- ✅ `http://localhost:3000` - Works (development)
- ❌ `http://whichmap.com` - Blocked by browser

## Privacy & Permissions

### First-Time Permission

When a user clicks the location button for the first time, the browser shows a permission prompt:

```
┌──────────────────────────────────────────┐
│ whichmap.com wants to:                   │
│ Know your location                       │
│                                          │
│         [Block]        [Allow]           │
└──────────────────────────────────────────┘
```

### Permission States

1. **Prompt** (default) - User hasn't decided yet
2. **Granted** - User allowed location access
3. **Denied** - User blocked location access

### Checking Permission Status

```javascript
// Check current permission status
const result = await navigator.permissions.query({ name: 'geolocation' })
console.log(result.state) // 'granted', 'denied', or 'prompt'
```

## Best Practices

### 1. Always Provide Manual Input

Never force users to use their current location. Always allow manual address entry as an alternative.

```jsx
// ✅ Good - Both options available
<AutocompleteInput 
  showLocationButton={true}  // Location button available
  // Manual typing also works
/>

// ❌ Bad - Only current location
<button onClick={forceCurrentLocation}>
  You must use current location
</button>
```

### 2. Clear Error Messages

Provide actionable error messages that tell users what to do:

```javascript
// ✅ Good
"Location access denied. Please enable location permissions in your browser settings."

// ❌ Bad
"Error: PERMISSION_DENIED"
```

### 3. Loading States

Always show loading state while requesting location:

```jsx
{isGettingLocation ? (
  <Spinner />
) : (
  <LocationIcon />
)}
```

### 4. Timeout Handling

Set reasonable timeouts (10 seconds is standard):

```javascript
{
  timeout: 10000  // 10 seconds
}
```

## Analytics & Tracking

### Recommended Events

Track these events for insights:

```javascript
// User clicked location button
trackEvent('current_location_button_clicked')

// Location successfully obtained
trackEvent('current_location_success', {
  accuracy: position.coords.accuracy,
  time_taken: Date.now() - startTime
})

// Location access denied
trackEvent('current_location_denied', {
  error_code: error.code
})

// Location request timed out
trackEvent('current_location_timeout')
```

## Testing

### Manual Testing

1. **Test Permission Grant**
   - Click location button
   - Allow permission
   - Verify "Current Location" appears
   - Verify coordinates are stored

2. **Test Permission Deny**
   - Click location button
   - Deny permission
   - Verify error message appears

3. **Test Offline**
   - Disable GPS/location services
   - Click location button
   - Verify appropriate error message

4. **Test HTTPS Requirement**
   - Try on HTTP (should fail in production)
   - Try on HTTPS (should work)

### Automated Testing

```javascript
// Mock geolocation
beforeEach(() => {
  global.navigator.geolocation = {
    getCurrentPosition: jest.fn()
  }
})

test('successfully gets current location', async () => {
  const mockPosition = {
    coords: {
      latitude: 34.0522,
      longitude: -118.2437
    }
  }
  
  navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
    success(mockPosition)
  })
  
  // Test implementation
})
```

## Troubleshooting

### Common Issues

**Issue**: Location button doesn't appear
- **Solution**: Check `showLocationButton={true}` prop

**Issue**: Permission denied error
- **Solution**: User needs to enable location in browser settings

**Issue**: Location unavailable
- **Solution**: User may be indoors or GPS is disabled

**Issue**: Works on localhost but not production
- **Solution**: Ensure production site uses HTTPS

**Issue**: Inaccurate location
- **Solution**: Check `enableHighAccuracy: true` is set

## Future Enhancements

### Potential Improvements

1. **Location Accuracy Indicator**
   ```jsx
   <span className="text-xs text-neutral-500">
     Accurate to ±{accuracy}m
   </span>
   ```

2. **Reverse Geocoding**
   ```javascript
   // Convert coordinates to readable address
   const address = await reverseGeocode(lat, lng)
   // Display: "123 Main St, Los Angeles, CA" instead of "Current Location"
   ```

3. **Location History**
   ```javascript
   // Save recently used locations
   localStorage.setItem('recent_locations', JSON.stringify([
     { lat, lng, timestamp: Date.now() }
   ]))
   ```

4. **Watch Position**
   ```javascript
   // Continuously track location (for moving users)
   navigator.geolocation.watchPosition(callback)
   ```

## Related Files

- `/main/src/components/AutocompleteInput.jsx` - Main component
- `/main/src/app/page.jsx` - Usage example
- `/main/src/hooks/useAutocomplete.js` - Autocomplete hook

## References

- [MDN: Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [W3C: Geolocation API Specification](https://www.w3.org/TR/geolocation-API/)
- [Can I Use: Geolocation](https://caniuse.com/geolocation)

