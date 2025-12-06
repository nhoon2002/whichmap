/**
 * Version Service
 * Checks for app updates and reloads when new version is available
 */

interface VersionInfo {
  version: string
  buildTime: string
  hash: string
}

const VERSION_KEY = 'app_version_hash'

/**
 * Get current version from server
 */
export async function fetchCurrentVersion(): Promise<VersionInfo | null> {
  try {
    const response = await fetch('/api/version', {
      cache: 'no-store', // Always fetch fresh version
    })
    if (!response.ok) {
      console.error('Failed to fetch version:', response.statusText)
      return null
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching version:', error)
    return null
  }
}

/**
 * Get stored version hash from localStorage
 */
export function getStoredVersion(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(VERSION_KEY)
}

/**
 * Store version hash in localStorage
 */
export function storeVersion(hash: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(VERSION_KEY, hash)
}

/**
 * Check if app needs to be updated
 * Returns true if server version is different from stored version
 */
export async function checkForUpdate(): Promise<boolean> {
  const currentVersion = await fetchCurrentVersion()
  if (!currentVersion) {
    // If we can't fetch version, don't force reload
    return false
  }

  const storedHash = getStoredVersion()

  // First time loading - just store the version
  if (!storedHash) {
    storeVersion(currentVersion.hash)
    return false
  }

  // Compare hashes
  if (storedHash !== currentVersion.hash) {
    console.log(`New version detected: ${storedHash} → ${currentVersion.hash}`)
    return true
  }

  return false
}

/**
 * Reload the app to get latest version
 */
export function reloadApp(): void {
  if (typeof window === 'undefined') return

  console.log('Reloading app to get latest version...')
  window.location.reload()
}

/**
 * Check for updates and reload if available
 * Returns true if reload was triggered
 */
export async function checkAndReload(): Promise<boolean> {
  const needsUpdate = await checkForUpdate()
  if (needsUpdate) {
    reloadApp()
    return true
  }
  return false
}
