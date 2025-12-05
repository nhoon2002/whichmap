import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'WhichMap Privacy Policy - Learn how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  const lastUpdated = 'December 3, 2024'

  return (
    <main className="flex-auto pt-[calc(4rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5.5rem+env(safe-area-inset-top,0px))]">
      <Container className="mt-8 sm:mt-10 lg:mt-12 mb-24">
        <FadeIn animate>
          <div className="max-w-2xl mx-auto">
            <h1 className="font-display text-5xl font-medium tracking-tight text-neutral-950">
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm text-neutral-500">
              Last updated: {lastUpdated}
            </p>

            <div className="mt-8 prose prose-neutral max-w-none">
              {/* Introduction */}
              <section className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  Introduction
                </h2>
                <p className="text-neutral-600 leading-relaxed">
                  WhichMap ("we," "our," or "us") respects your privacy and is committed to 
                  protecting your personal data. This Privacy Policy explains how we collect, 
                  use, and safeguard your information when you use our application and website 
                  (collectively, the "Service").
                </p>
              </section>

              {/* Information We Collect */}
              <section className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  Information We Collect
                </h2>
                
                <h3 className="text-lg font-semibold text-neutral-950 mt-6 mb-3">
                  Information You Provide
                </h3>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>
                    <strong>Account Information:</strong> If you create an account, we collect 
                    your email address and authentication credentials.
                  </li>
                  <li>
                    <strong>Search History:</strong> Addresses and locations you search for 
                    to provide personalized suggestions.
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-neutral-950 mt-6 mb-3">
                  Information Collected Automatically
                </h3>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>
                    <strong>Location Data:</strong> With your permission, we access your 
                    device's location to provide "Current Location" functionality. This data 
                    is used only to fetch route information and is not stored on our servers.
                  </li>
                  <li>
                    <strong>Usage Analytics:</strong> We collect anonymized data about how you 
                    interact with our Service, including which navigation providers you select, 
                    button clicks, and feature usage. This helps us understand user preferences 
                    and improve our Service.
                  </li>
                  <li>
                    <strong>Device Information:</strong> Basic device information such as 
                    device type, operating system, and browser type for compatibility and 
                    optimization purposes.
                  </li>
                </ul>
              </section>

              {/* How We Use Your Information */}
              <section className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  How We Use Your Information
                </h2>
                <p className="text-neutral-600 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>Provide, maintain, and improve our Service</li>
                  <li>Display route comparisons from third-party navigation providers</li>
                  <li>Remember your search history for convenience</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Understand which navigation providers users prefer (aggregate analytics)</li>
                  <li>Respond to your support requests</li>
                  <li>Detect and prevent technical issues or abuse</li>
                </ul>
              </section>

              {/* Analytics and Click Tracking */}
              <section className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  Analytics and Click Tracking
                </h2>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  We collect analytics data to understand how users interact with our Service. 
                  This includes tracking which navigation provider you choose to open (Google Maps, 
                  Apple Maps, or Waze) after comparing routes. This data helps us:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>Understand user preferences and behavior patterns</li>
                  <li>Measure the effectiveness of our route comparison features</li>
                  <li>Make data-driven improvements to our Service</li>
                </ul>
                <p className="text-neutral-600 leading-relaxed mt-4">
                  This analytics data is collected in accordance with applicable privacy laws. 
                  We do not sell this data to third parties. Analytics data may be aggregated 
                  and anonymized for reporting purposes.
                </p>
              </section>

              {/* Third-Party Services */}
              <section className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  Third-Party Services
                </h2>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  Our Service integrates with third-party navigation providers:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>
                    <strong>Google Maps:</strong> Subject to{' '}
                    <a 
                      href="https://policies.google.com/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-neutral-950 underline hover:text-neutral-700"
                    >
                      Google's Privacy Policy
                    </a>
                  </li>
                  <li>
                    <strong>Apple Maps:</strong> Subject to{' '}
                    <a 
                      href="https://www.apple.com/legal/privacy/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-neutral-950 underline hover:text-neutral-700"
                    >
                      Apple's Privacy Policy
                    </a>
                  </li>
                  <li>
                    <strong>Waze:</strong> Subject to{' '}
                    <a 
                      href="https://www.waze.com/legal/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-neutral-950 underline hover:text-neutral-700"
                    >
                      Waze's Privacy Policy
                    </a>
                  </li>
                </ul>
                <p className="text-neutral-600 leading-relaxed mt-4">
                  When you choose to open a route in one of these apps, you leave our Service 
                  and become subject to that provider's privacy practices.
                </p>
              </section>

              {/* Data Storage and Security */}
              <section className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  Data Storage and Security
                </h2>
                <p className="text-neutral-600 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect 
                  your personal data. Search history for non-authenticated users is stored 
                  locally on your device. For authenticated users, data is stored securely 
                  using Firebase with encryption in transit and at rest.
                </p>
              </section>

              {/* Data Retention */}
              <section className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  Data Retention
                </h2>
                <p className="text-neutral-600 leading-relaxed">
                  We retain your personal data only for as long as necessary to provide our 
                  Service and fulfill the purposes described in this policy. Search history 
                  is retained until you clear it or delete your account. Analytics data is 
                  retained in anonymized form for up to 24 months.
                </p>
              </section>

              {/* Your Rights */}
              <section className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  Your Rights
                </h2>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Correct inaccurate personal data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Opt out of certain data collection</li>
                  <li>Withdraw consent at any time</li>
                </ul>
                <p className="text-neutral-600 leading-relaxed mt-4">
                  To exercise these rights, please contact us at{' '}
                  <a 
                    href="mailto:alex.nh.kim@gmail.com"
                    className="text-neutral-950 underline hover:text-neutral-700"
                  >
                    alex.nh.kim@gmail.com
                  </a>.
                </p>
              </section>

              {/* Children's Privacy */}
              <section className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  Children's Privacy
                </h2>
                <p className="text-neutral-600 leading-relaxed">
                  Our Service is not intended for children under 13. We do not knowingly 
                  collect personal data from children under 13. If you believe we have 
                  collected such data, please contact us immediately.
                </p>
              </section>

              {/* Changes to This Policy */}
              <section className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  Changes to This Policy
                </h2>
                <p className="text-neutral-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you 
                  of any material changes by posting the new policy on this page and updating 
                  the "Last updated" date.
                </p>
              </section>

              {/* Contact Us */}
              <section className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  Contact Us
                </h2>
                <p className="text-neutral-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="mt-4">
                  <a 
                    href="mailto:alex.nh.kim@gmail.com"
                    className="text-neutral-950 font-medium hover:text-neutral-700"
                  >
                    alex.nh.kim@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </FadeIn>
      </Container>
    </main>
  )
}

