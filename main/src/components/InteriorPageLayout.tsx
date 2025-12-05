import { Footer } from '@/components/Footer'

interface InteriorPageLayoutProps {
  children: React.ReactNode
}

export function InteriorPageLayout({ children }: InteriorPageLayoutProps) {
  return (
    <>
      {children}
      <Footer />
    </>
  )
}

