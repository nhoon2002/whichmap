import '@/styles/tailwind.css'
import { Header } from '@/components/Header'
import { QueryProvider } from '@/providers/QueryProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext'

export const metadata = {
  title: {
    template: '%s - WhichMap',
    default: 'WhichMap - Compare Travel Times Across Map Providers',
  },
  description: 'Compare travel times across Google Maps, Apple Maps, and Waze on a single screen.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-neutral-50 text-base antialiased">
      <body className="flex min-h-full flex-col">
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
