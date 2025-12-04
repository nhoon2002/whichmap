/**
 * Authentication Configuration
 * Enable/disable auth providers here
 * 
 * NOTE: Disabling a provider here only hides the UI.
 * You must also configure the provider in Firebase Console.
 */

export const authConfig = {
  /**
   * Email/Password authentication
   * Requires: Firebase Console → Authentication → Sign-in method → Email/Password → Enable
   */
  emailPassword: {
    enabled: true,
    // Require email verification before allowing access
    requireEmailVerification: true,
  },

  /**
   * Google OAuth authentication
   * Requires: Firebase Console → Authentication → Sign-in method → Google → Enable
   * 
   * ⚠️ iOS App Store Note:
   * For iOS apps, Google Sign-In must use native authentication (not web popup).
   * Install @codetrix-studio/capacitor-google-auth and configure before enabling on iOS.
   * 
   * Set to false until native Google Sign-In is implemented for iOS.
   */
  google: {
    enabled: false, // Set to true when native sign-in is configured
  },

  /**
   * Apple Sign-In (coming soon)
   * Required for iOS apps that offer other social sign-in options
   */
  apple: {
    enabled: false,
  },
}

/**
 * Check if any auth method is enabled
 */
export const hasAnyAuthEnabled = (): boolean => {
  return authConfig.emailPassword.enabled || authConfig.google.enabled || authConfig.apple.enabled
}

/**
 * Check if social login options are available
 * Used to determine if we should show the "Or" divider
 */
export const hasSocialAuthEnabled = (): boolean => {
  return authConfig.google.enabled || authConfig.apple.enabled
}

