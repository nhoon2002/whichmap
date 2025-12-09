import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'WhichMap Privacy Policy - Learn how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  const lastUpdated = 'December 8, 2024'

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

              {/* Privacy at a Glance */}
              <section className="mb-10 bg-neutral-100 p-6 rounded-lg">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  Privacy at a Glance
                </h2>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  WhichMap is designed with privacy as a core principle. Here's what you need to know:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li><strong>No Cross-App Tracking:</strong> We only collect first-party analytics within our own app. We never link your data with other companies' apps or websites.</li>
                  <li><strong>No Advertising IDs:</strong> We do not use IDFA or any advertising identifiers.</li>
                  <li><strong>No Ad Networks:</strong> We do not integrate with Facebook Ads, Google Ads, or any third-party advertising services.</li>
                  <li><strong>No Data Selling:</strong> We never sell your data to data brokers or third parties.</li>
                  <li><strong>First-Party Only:</strong> All analytics are stored in our own database (Firebase Firestore) and used exclusively to improve our Service.</li>
                  <li><strong>Location Privacy:</strong> Location data is only used for route finding and is never shared with third parties for advertising.</li>
                </ul>
                <p className="text-neutral-600 leading-relaxed mt-4 italic">
                  Our goal is simple: help you find the fastest route. We collect only what's
                  necessary to provide and improve this service, and we never use your data
                  for advertising purposes.
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
                    is used only to fetch route information from navigation providers and is
                    optionally saved in your search history for convenience. Location data is
                    never used for advertising or shared with third parties for marketing purposes.
                  </li>
                  <li>
                    <strong>First-Party Analytics:</strong> We collect first-party analytics
                    about how you interact with our Service, including which navigation providers
                    you select, button clicks, and feature usage. This data is stored in our own
                    database (Firebase Firestore) and is used solely to understand user preferences
                    and improve our Service. We do not share this data with advertising networks
                    or data brokers.
                  </li>
                  <li>
                    <strong>Device Information:</strong> We collect basic device information
                    (screen size, platform, language) to optimize our user interface for different
                    devices. This information is not used for device fingerprinting, cross-app
                    tracking, or advertising purposes.
                  </li>
                  <li>
                    <strong>Marketing Attribution:</strong> We may collect referral source
                    information (which website you came from) and campaign parameters (UTM codes)
                    to understand which of our own marketing efforts are effective. This is
                    first-party attribution only - we do not link this data with other companies'
                    apps or websites, nor do we share it with third-party advertising networks.
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

              {/* First-Party Analytics Only */}
              <section className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  First-Party Analytics Only - No Cross-App Tracking
                </h2>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  We collect first-party analytics data to understand how users interact with
                  our Service. This includes tracking which navigation provider you choose to
                  open (Google Maps, Apple Maps, or Waze) after comparing routes. All analytics
                  data is stored in our own database (Firebase Firestore) and is used exclusively
                  to improve our Service.
                </p>

                <h3 className="text-lg font-semibold text-neutral-950 mt-6 mb-3">
                  What We Track (First-Party Only)
                </h3>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>Which navigation provider you select after viewing route comparisons</li>
                  <li>Search queries and route requests you make within our app</li>
                  <li>Feature usage to understand which parts of our app are most useful</li>
                  <li>Basic device information to optimize the user interface</li>
                </ul>

                <h3 className="text-lg font-semibold text-neutral-950 mt-6 mb-3">
                  What We DON'T Do
                </h3>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li><strong>No Advertising Identifiers:</strong> We do not use IDFA (Identifier for Advertisers) or any other advertising identifiers</li>
                  <li><strong>No Third-Party Ad Networks:</strong> We do not integrate with Facebook Ads, Google Ads, or any other advertising networks</li>
                  <li><strong>No Cross-App Tracking:</strong> We do not link your data with data from other companies' apps or websites</li>
                  <li><strong>No Data Brokers:</strong> We do not sell or share your data with data brokers</li>
                  <li><strong>No Device Fingerprinting:</strong> We do not use device information to uniquely identify or track you across apps</li>
                  <li><strong>No Third-Party Sharing for Advertising:</strong> We do not share your data with third parties for their advertising or marketing purposes</li>
                </ul>

                <p className="text-neutral-600 leading-relaxed mt-4">
                  Our analytics are solely for understanding how to make WhichMap better for you.
                  All data stays within our own systems and is never used for targeted advertising
                  or shared with advertising networks.
                </p>
              </section>

              {/* Third-Party Services */}
              <section className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                  Third-Party Services
                </h2>

                <h3 className="text-lg font-semibold text-neutral-950 mt-6 mb-3">
                  Infrastructure Services
                </h3>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>
                    <strong>Firebase (Google):</strong> We use Firebase Authentication for
                    user accounts and Firebase Firestore for data storage. We have disabled
                    all advertising and cross-site tracking features in Firebase. We do not
                    use Firebase Analytics, Google Analytics, or any other Google advertising
                    services. Your data is stored securely and is not shared with Google for
                    advertising purposes. Subject to{' '}
                    <a
                      href="https://firebase.google.com/support/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-950 underline hover:text-neutral-700"
                    >
                      Firebase Privacy Policy
                    </a>
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-neutral-950 mt-6 mb-3">
                  Navigation Provider APIs
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  To display route comparisons, we fetch data from third-party navigation APIs:
                </p>
                <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                  <li>
                    <strong>Google Maps API:</strong> We use Google Maps Directions API to
                    fetch route information. This is server-side only and your data is not
                    used for advertising. Subject to{' '}
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
                    <strong>Apple Maps API:</strong> We use Apple Maps Server API to fetch
                    route information. Subject to{' '}
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
                    <strong>Waze:</strong> We provide links to open routes in Waze. Subject to{' '}
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
                  When you click to open a route in Google Maps, Apple Maps, or Waze, you leave
                  our Service and become subject to that provider's privacy practices. We do not
                  receive any data back from these providers about your navigation activity.
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

