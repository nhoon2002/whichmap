import '@/styles/tailwind.css'
import { Header } from '@/components/Header'
import { QueryProvider } from '@/providers/QueryProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s - WhichMap',
    default: 'WhichMap - Compare Travel Times Across Map Providers',
  },
  description: 'Compare travel times across popular navigation platforms.',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
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
