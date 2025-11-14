# Firestore Setup for Search History

## Collection Structure

### `search_history` Collection

Each document represents a single search:

```typescript
{
  userId: string          // Firebase Auth UID
  address: string         // "1600 Amphitheatre Parkway, Mountain View, CA"
  coordinates: {          // Optional geocoded coordinates
    lat: number
    lng: number
  }
  searchType: string      // 'origin' | 'destination'
  timestamp: Timestamp    // Firestore Timestamp
}
```

## Indexes Required

Create these composite indexes in Firebase Console:

1. **User History Query**
   - Collection: `search_history`
   - Fields: `userId` (Ascending), `timestamp` (Descending)
   - Query scope: Collection

## Security Rules

Copy the rules from `firestore.rules.example` to your Firebase Console:

1. Go to Firebase Console → Firestore Database → Rules
2. Paste the rules
3. Publish

## Analytics Queries

### Most Popular Destinations
```javascript
db.collection('search_history')
  .where('searchType', '==', 'destination')
  .get()
  .then(snapshot => {
    const addresses = {}
    snapshot.forEach(doc => {
      const addr = doc.data().address
      addresses[addr] = (addresses[addr] || 0) + 1
    })
    return addresses
  })
```

### User Activity Heatmap
```javascript
db.collection('search_history')
  .orderBy('timestamp', 'desc')
  .limit(1000)
  .get()
  .then(snapshot => {
    const heatmap = snapshot.docs.map(doc => ({
      lat: doc.data().coordinates?.lat,
      lng: doc.data().coordinates?.lng,
      weight: 1
    }))
    return heatmap
  })
```

### Peak Usage Times
```javascript
db.collection('search_history')
  .orderBy('timestamp', 'desc')
  .get()
  .then(snapshot => {
    const hours = {}
    snapshot.forEach(doc => {
      const hour = new Date(doc.data().timestamp.toDate()).getHours()
      hours[hour] = (hours[hour] || 0) + 1
    })
    return hours
  })
```

### User Retention
```javascript
db.collection('search_history')
  .orderBy('userId')
  .get()
  .then(snapshot => {
    const userCounts = {}
    snapshot.forEach(doc => {
      const userId = doc.data().userId
      userCounts[userId] = (userCounts[userId] || 0) + 1
    })
    
    // Users by search count
    const retention = {
      powerUsers: Object.values(userCounts).filter(c => c > 20).length,
      activeUsers: Object.values(userCounts).filter(c => c >= 5 && c <= 20).length,
      casualUsers: Object.values(userCounts).filter(c => c < 5).length,
    }
    return retention
  })
```

## Data Export for Advanced Analytics

Export to BigQuery for advanced analytics:
1. Firebase Console → Project Settings → Integrations
2. Enable BigQuery integration
3. Select `search_history` collection
4. Run SQL queries in BigQuery

### Example BigQuery Queries

```sql
-- Popular routes
SELECT 
  origin.address as origin,
  destination.address as destination,
  COUNT(*) as frequency
FROM `search_history`
JOIN `search_history` as destination ON origin.userId = destination.userId
WHERE origin.searchType = 'origin' 
  AND destination.searchType = 'destination'
  AND ABS(UNIX_SECONDS(origin.timestamp) - UNIX_SECONDS(destination.timestamp)) < 60
GROUP BY origin, destination
ORDER BY frequency DESC
LIMIT 100;

-- Geographic distribution
SELECT 
  ROUND(coordinates.lat, 2) as lat_bucket,
  ROUND(coordinates.lng, 2) as lng_bucket,
  COUNT(*) as searches
FROM `search_history`
WHERE coordinates IS NOT NULL
GROUP BY lat_bucket, lng_bucket
ORDER BY searches DESC;
```

## Privacy & Compliance

- **GDPR**: Users can delete their history via `clearSearchHistory(userId)`
- **Data Retention**: Automatically keeps last 50 searches per user
- **Anonymous Users**: Falls back to localStorage (no tracking)
- **Opt-out**: Users can disable search history in settings

