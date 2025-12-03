import '@/styles/tailwind.css'
import { Header } from '@/components/Header'
import { QueryProvider } from '@/providers/QueryProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext'
import { CapacitorInit } from '@/components/CapacitorInit'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s - WhichMap',
    default: 'WhichMap - Compare Travel Times Across Map Providers',
  },
  description: 'Compare travel times across popular navigation platforms.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WhichMap',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full bg-neutral-50 text-base antialiased">
      <body className="flex min-h-full flex-col">
        <CapacitorInit />
        <ErrorBoundary>
          <QueryProvider>
            <UserPreferencesProvider>
              <Header />
              {children}
            </UserPreferencesProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
