/**
 * Capacitor Native Integration
 * Provides native functionality when running in the Capacitor iOS app
 */

import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { Share } from '@capacitor/share'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { checkAndReload, storeVersion, fetchCurrentVersion } from '@/services/version/versionService'

/**
 * Check if running in a native Capacitor app
 */
export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform()
}

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios'
}

/**
 * Hide the splash screen (call after app is ready)
 */
export const hideSplashScreen = async (): Promise<void> => {
  if (!isNativeApp()) return
  
  try {
    await SplashScreen.hide({
      fadeOutDuration: 300,
    })
  } catch (error) {
    console.error('Error hiding splash screen:', error)
  }
}

/**
 * Configure the status bar for iOS
 */
export const configureStatusBar = async (): Promise<void> => {
  if (!isNativeApp()) return
  
  try {
    await StatusBar.setStyle({ style: Style.Light })
  } catch (error) {
    console.error('Error configuring status bar:', error)
  }
}

/**
 * Trigger haptic feedback - light tap
 */
export const hapticLight = async (): Promise<void> => {
  if (!isNativeApp()) return
  
  try {
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch (error) {
    // Haptics might not be available on all devices
  }
}

/**
 * Trigger haptic feedback - medium impact
 */
export const hapticMedium = async (): Promise<void> => {
  if (!isNativeApp()) return
  
  try {
    await Haptics.impact({ style: ImpactStyle.Medium })
  } catch (error) {
    // Haptics might not be available on all devices
  }
}

/**
 * Trigger haptic feedback - success notification
 */
export const hapticSuccess = async (): Promise<void> => {
  if (!isNativeApp()) return
  
  try {
    await Haptics.notification({ type: NotificationType.Success })
  } catch (error) {
    // Haptics might not be available on all devices
  }
}

/**
 * Share route comparison results
 */
export const shareResults = async (
  origin: string,
  destination: string,
  fastestProvider?: string,
  fastestTime?: string
): Promise<boolean> => {
  const title = 'WhichMap Route Comparison'
  let text = `🗺️ Route from ${origin} to ${destination}`
  
  if (fastestProvider && fastestTime) {
    text += `\n\n🏆 Fastest: ${fastestProvider} (${fastestTime})`
  }
  
  text += '\n\nCompare routes at https://whichmap.xyz'

  // Use native share if available
  if (isNativeApp()) {
    try {
      await Haptics.impact({ style: ImpactStyle.Light })
      await Share.share({
        title,
        text,
        url: 'https://whichmap.xyz',
        dialogTitle: 'Share your route comparison',
      })
      return true
    } catch (error) {
      // User cancelled or share failed
      return false
    }
  }
  
  // Fallback to Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: 'https://whichmap.xyz',
      })
      return true
    } catch (error) {
      // User cancelled
      return false
    }
  }
  
  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(`${text}`)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Check if sharing is available
 */
export const canShare = (): boolean => {
  return isNativeApp() || !!navigator.share || !!navigator.clipboard
}

/**
 * Setup app resume listener to check for updates
 * When app comes back from background, check if new version is available
 */
export const setupAppResumeListener = (): void => {
  if (!isNativeApp()) return

  App.addListener('appStateChange', async ({ isActive }) => {
    if (isActive) {
      console.log('App resumed - checking for updates...')
      // Check for updates when app comes to foreground
      await checkAndReload()
    }
  })
}

/**
 * Initialize Capacitor features
 * Call this on app startup
 */
export const initializeCapacitor = async (): Promise<void> => {
  if (!isNativeApp()) return

  try {
    // Configure status bar
    await configureStatusBar()

    // Setup app resume listener for auto-updates
    setupAppResumeListener()

    // Store current version on first load
    const currentVersion = await fetchCurrentVersion()
    if (currentVersion) {
      storeVersion(currentVersion.hash)
    }

    // Hide splash screen after a short delay to ensure content is rendered
    setTimeout(async () => {
      await hideSplashScreen()
    }, 500)
  } catch (error) {
    console.error('Error initializing Capacitor:', error)
  }
}

