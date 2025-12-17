import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'xyz.whichmap.app',
  appName: 'WhichMap',
  webDir: 'out',
  server: {
    // Automatically detect localhost based on environment
    // Set CAPACITOR_USE_LOCALHOST=true or NODE_ENV=development to use localhost
    // Otherwise, use production URL
    url:
      process.env.CAPACITOR_USE_LOCALHOST === 'true' ||
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://whichmap.xyz',
    cleartext:
      process.env.CAPACITOR_USE_LOCALHOST === 'true' ||
      process.env.NODE_ENV === 'development',
  },
  ios: {
    // Allow navigation to external URLs for map deep links
    allowsLinkPreview: true,
    scrollEnabled: true,
    contentInset: 'never',
    // Handle safe area properly
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      // Use native storyboard splash
      launchShowDuration: 1500,
      launchAutoHide: true, // Auto-hide after duration
      launchFadeOutDuration: 300,
      backgroundColor: '#000000',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
