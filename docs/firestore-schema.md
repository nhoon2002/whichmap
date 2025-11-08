# Firestore Database Schema

Complete guide to WhichMap's Firestore database structure and data models.

## Database Setup

### 1. Enable Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `whichmap-eb2aa`
3. Click **Firestore Database** → **Create database**
4. Choose **Production mode**
5. Select location: `us-central` (or closest region)

### 2. Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**To update rules:**
Firebase Console → Firestore Database → Rules → Publish

## Collections & Documents

### `users` Collection

Stores user profiles and preferences.

**Document ID:** Firebase Auth UID (e.g., `abc123xyz`)

**Schema:**
```typescript
{
  email: string;              // User's email from Firebase Auth
  createdAt: Timestamp;       // Account creation date
  preferences: {
    navServices: {
      google: boolean;        // Show Google Maps results
      apple: boolean;         // Show Apple Maps results
      waze: boolean;          // Show Waze results
    }
  }
}
```

**Example:**
```json
{
  "email": "user@example.com",
  "createdAt": "2025-11-07T08:00:00Z",
  "preferences": {
    "navServices": {
      "google": true,
      "apple": false,
      "waze": true
    }
  }
}
```

## Data Models

### User Model

Located at: `src/models/User.js`

**Usage:**

```javascript
import { User } from '@/models/User'

// Find a user by ID
const user = await User.find(userId)

// Create a new user
const newUser = await User.create(userId, {
  email: 'user@example.com',
  preferences: User.defaultPreferences
})

// Find or create (like Laravel's firstOrCreate)
const user = await User.findOrCreate(userId, { email: 'user@example.com' })

// Update preferences
await user.updatePreferences({
  navServices: { google: true, apple: true, waze: false }
})

// Toggle a specific service
await user.toggleNavService('google')

// Save changes
await user.save()

// Get as plain object
const userData = user.toJSON()
```

### Hooks (Alternative Pattern)

Located at: `src/hooks/useUserPreferences.js`

**Usage in React components:**

```javascript
import { useUserPreferences } from '@/hooks/useUserPreferences'

function MyComponent() {
  const { preferences, toggleNavService, loading } = useUserPreferences()

  // preferences.navServices.google
  // toggleNavService('google')
}
```

## Future Collections

### `savedRoutes` (Planned)

Store user's saved/favorite routes.

**Structure:**
```
users/{userId}/savedRoutes/{routeId}
```

**Schema:**
```typescript
{
  startLocation: string;
  endLocation: string;
  startCoords: { lat: number, lng: number };
  endCoords: { lat: number, lng: number };
  createdAt: Timestamp;
  lastUsed: Timestamp;
  name?: string;            // Optional custom name
}
```

### `searchHistory` (Planned)

Track user's search history for personalization.

**Structure:**
```
users/{userId}/searchHistory/{searchId}
```

**Schema:**
```typescript
{
  category: string;         // "coffee", "restaurants", etc.
  location: string;
  timestamp: Timestamp;
}
```

### `favoriteBusinesses` (Planned - Phase 4)

Store businesses user has favorited from destination discovery.

**Structure:**
```
users/{userId}/favoriteBusinesses/{businessId}
```

**Schema:**
```typescript
{
  name: string;
  yelpId?: string;
  googlePlaceId?: string;
  location: { lat: number, lng: number };
  category: string;
  addedAt: Timestamp;
}
```

## Indexes

Currently no composite indexes needed. Firestore will prompt if needed when queries fail.

## Data Migration

When adding new fields to existing documents:

```javascript
// Use merge: true to add fields without overwriting
await setDoc(doc(db, 'users', userId), {
  newField: 'value'
}, { merge: true })
```

## Best Practices

1. **Always use merge: true** when updating to avoid overwriting
2. **Use subcollections** for one-to-many relationships (user → savedRoutes)
3. **Denormalize when needed** - Firestore is NoSQL, duplication is OK
4. **Use timestamps** for createdAt/updatedAt fields
5. **Keep documents small** - Max 1MB per document
6. **Use batch writes** when updating multiple documents

## Model vs Hook Pattern

**Use Models when:**
- You need reusable data operations
- Working with multiple collections
- Building API routes (server-side)
- Need validation/business logic

**Use Hooks when:**
- Working in React components
- Need reactive updates
- Want automatic re-rendering on data changes

**Best of both worlds:**
Use Models in hooks for data operations, hooks for React integration.

## Testing Data

You can add test data via Firebase Console:

1. Go to Firestore Database
2. Click **Start collection**
3. Collection ID: `users`
4. Document ID: Your Firebase Auth UID
5. Add fields manually

Or use the Firebase Emulator Suite for local development.
