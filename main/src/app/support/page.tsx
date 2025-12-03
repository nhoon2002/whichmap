import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with WhichMap - contact our support team.',
}

export default function SupportPage() {
  return (
    <main className="flex-auto">
      <Container className="mt-24 sm:mt-32 lg:mt-40 mb-24">
        <FadeIn animate>
          <div className="max-w-2xl mx-auto">
            <h1 className="font-display text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
              Support
            </h1>
            <p className="mt-6 text-lg text-neutral-600">
              Need help with WhichMap? We're here to assist you.
            </p>

            <div className="mt-16 space-y-12">
              {/* Contact Section */}
              <section>
                <h2 className="font-display text-2xl font-semibold text-neutral-950">
                  Contact Us
                </h2>
                <p className="mt-4 text-neutral-600">
                  For questions, feedback, or support requests, please reach out to us at:
                </p>
                <a
                  href="mailto:alex.nh.kim@gmail.com"
                  className="mt-4 inline-flex items-center gap-2 text-lg font-medium text-neutral-950 hover:text-neutral-700 transition"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  alex.nh.kim@gmail.com
                </a>
              </section>

              {/* FAQ Section */}
              <section>
                <h2 className="font-display text-2xl font-semibold text-neutral-950">
                  Frequently Asked Questions
                </h2>
                
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-neutral-950">
                      How does WhichMap work?
                    </h3>
                    <p className="mt-2 text-neutral-600">
                      WhichMap compares real-time travel estimates from Google Maps, Apple Maps, 
                      and Waze to help you choose the fastest route for your journey.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-950">
                      Why do travel times differ between apps?
                    </h3>
                    <p className="mt-2 text-neutral-600">
                      Each navigation provider uses different traffic data sources, algorithms, 
                      and route preferences, which can result in varying ETAs for the same trip.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-950">
                      Is my location data stored?
                    </h3>
                    <p className="mt-2 text-neutral-600">
                      We only store your recent search history locally on your device or in your 
                      account (if signed in) to improve your experience. See our{' '}
                      <a href="/privacy" className="text-neutral-950 underline hover:text-neutral-700">
                        Privacy Policy
                      </a>{' '}
                      for details.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-950">
                      How do I report a bug?
                    </h3>
                    <p className="mt-2 text-neutral-600">
                      Please email us at alex.nh.kim@gmail.com with a description of the issue, 
                      your device type, and any screenshots if possible.
                    </p>
                  </div>
                </div>
              </section>

              {/* Response Time */}
              <section>
                <h2 className="font-display text-2xl font-semibold text-neutral-950">
                  Response Time
                </h2>
                <p className="mt-4 text-neutral-600">
                  We typically respond to support requests within 24-48 hours. Thank you for 
                  your patience!
                </p>
              </section>
            </div>
          </div>
        </FadeIn>
      </Container>
    </main>
  )
}

