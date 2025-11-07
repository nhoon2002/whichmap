# Firebase Authentication Setup

Complete guide for setting up Firebase authentication in WhichMap.

## Quick Start

### 1. Install Dependencies ✅

Already done! Firebase SDK is installed.

### 2. Configure Firebase

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `whichmap-eb2aa`
3. **Get your configuration**:
   - Go to Project Settings (⚙️ icon)
   - Scroll down to "Your apps"
   - Copy the `firebaseConfig` values

### 3. Set Environment Variables

1. **Copy the example file**:
   ```bash
   cd main
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local`** and add your Firebase values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=whichmap-eb2aa.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=whichmap-eb2aa
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=whichmap-eb2aa.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

### 4. Enable Authentication Methods

In Firebase Console:

1. **Go to Authentication** → **Sign-in method**
2. **Enable Email/Password**:
   - Click "Email/Password"
   - Toggle "Enable"
   - Save
3. **Enable Google Sign-In**:
   - Click "Google"
   - Toggle "Enable"
   - Add your support email
   - Save

### 5. Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## What's Included

### Files Created

1. **`src/lib/firebase.js`**
   - Firebase initialization
   - Auth instance export
   - Environment variable configuration

2. **`src/components/Header.jsx`**
   - Navigation header
   - User authentication state
   - Sign in/Sign out buttons
   - User email display

3. **`src/app/login/page.jsx`**
   - Email/password sign in
   - Email/password sign up
   - Google sign in button
   - Form validation & error handling
   - Auto-redirect if logged in

4. **`.env.local.example`**
   - Template for environment variables
   - Safe to commit to git

## Features

### Authentication Methods

✅ **Email/Password**
- Sign up with new account
- Sign in with existing account
- Password validation

✅ **Google OAuth**
- One-click sign in
- Uses Google account

### UI Features

✅ **Header Component**
- Shows "Sign In" button when logged out
- Shows user email + "Sign Out" when logged in
- Loading state during auth check
- Sticky navigation

✅ **Login Page**
- Clean, professional design
- Toggle between Sign In / Sign Up
- Error messages
- Loading states
- Auto-redirect after login

### Security

✅ **Environment Variables**
- All Firebase config in `.env.local`
- Not committed to git (in `.gitignore`)
- Safe to deploy

✅ **Protected Routes** (Optional - see below)
- Can add auth guards to specific pages
- Redirect unauthorized users

## Usage Examples

### Check if User is Logged In

```javascript
'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function MyComponent() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  if (!user) {
    return <p>Please sign in</p>
  }

  return <p>Welcome, {user.email}!</p>
}
```

### Protect a Page (Optional)

Create `src/components/ProtectedRoute.jsx`:

```javascript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)

      if (!currentUser) {
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null // Will redirect to login
  }

  return children
}
```

Use it in any page:

```javascript
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Private dashboard content</div>
    </ProtectedRoute>
  )
}
```

### Sign Out Programmatically

```javascript
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'

async function handleSignOut() {
  try {
    await signOut(auth)
    // User is now signed out
  } catch (error) {
    console.error('Sign out error:', error)
  }
}
```

## Routing

- **Home**: `/` - Main route comparison page
- **Login**: `/login` - Authentication page
- **Header**: Shows on all pages via `layout.jsx`

## Testing

### Test Email/Password Auth

1. Go to http://localhost:3000/login
2. Click "Sign Up"
3. Enter email and password
4. Should redirect to home page
5. Header should show your email
6. Click "Sign Out" to test sign out

### Test Google Auth

1. Go to http://localhost:3000/login
2. Click "Continue with Google"
3. Select Google account
4. Should redirect to home page
5. Header should show your email

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"

**Solution**: Make sure `.env.local` is created with all Firebase values.

### "Firebase: Error (auth/invalid-api-key)"

**Solution**: Double-check your `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env.local`.

### Google Sign In Not Working

**Solution**:
1. Check Firebase Console → Authentication → Sign-in method
2. Make sure Google is enabled
3. Add your domain to authorized domains

### User Not Persisting After Refresh

**Solution**: Firebase auth state persists automatically. If not working:
1. Check browser console for errors
2. Make sure `onAuthStateChanged` is set up correctly
3. Check that Firebase is initialized properly

## Next Steps

### Add User Profiles (Optional)

Store additional user data in Firestore:

```javascript
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const db = getFirestore(app)

async function createUserProfile(user) {
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    createdAt: new Date(),
    displayName: user.displayName || ''
  })
}
```

### Add Password Reset (Optional)

```javascript
import { sendPasswordResetEmail } from 'firebase/auth'

async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email)
  // Email sent!
}
```

### Save User Routes (Future Feature)

Store favorite/recent routes per user in Firestore:

```javascript
const userRoutesRef = collection(db, 'users', user.uid, 'routes')
await addDoc(userRoutesRef, {
  start: 'LA',
  end: 'SF',
  timestamp: new Date()
})
```

## Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Next.js + Firebase Tutorial](https://firebase.google.com/codelabs/firebase-nextjs)
- [Firebase Console](https://console.firebase.google.com/)
