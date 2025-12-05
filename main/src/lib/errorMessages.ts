/**
 * Convert Firebase/auth errors to user-friendly messages
 */
export function getUserFriendlyError(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return 'An unexpected error occurred. Please try again.'
  }

  const err = error as { code?: string; message?: string }

  // If it's already a user-friendly message (no Firebase code), return as-is
  if (!err.code && err.message && !err.message.includes('auth/')) {
    return err.message
  }

  // Firebase error codes to user-friendly messages
  const errorMap: Record<string, string> = {
    'auth/invalid-credential': 'Incorrect email or password. Please try again.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/requires-recent-login': 'For security, please sign in again to continue.',
    'auth/user-mismatch': 'Authentication failed. Please try again.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
  }

  if (err.code && errorMap[err.code]) {
    return errorMap[err.code]
  }

  // Fallback to original message if it exists, otherwise generic error
  return err.message || 'An unexpected error occurred. Please try again.'
}

