
import { lazy, Suspense } from 'react'
import { useDocumentTitle } from '../lib/useDocumentTitle'

import AboutHero from '../components/about/AboutHero'
import AboutVision from '../components/about/AboutVision'
import AboutFeatures from '../components/about/AboutFeatures'

// Lazy-load secondary sections
const AboutOpenSource = lazy(() =>
  import('../components/about/AboutOpenSource')
)

const AboutGSSoC = lazy(() =>
  import('../components/about/AboutGSSoC')
)

const AboutCommunity = lazy(() =>
  import('../components/about/AboutCommunity')
)

const AboutResources = lazy(() =>
  import('../components/about/AboutResources')
)

const AboutCta = lazy(() =>
  import('../components/about/AboutCta')
)

/**
 * AboutPage
 *
 * Dedicated About section showcasing:
 * - Project vision and mission
 * - Platform features and capabilities
 * - Open-source philosophy
 * - GSSoC 2026 participation
 * - Community contributions
 * - Learning resources and project CTA
 */

function SectionLoader() {
  return (
    <div
      className="w-full min-h-32 flex items-center justify-center"
      role="status"
      aria-label="Loading section"
    >
      <div className="h-6 w-6 rounded-full border-2 border-current border-t-transparent animate-spin" />
    </div>
  )
}

export default function AboutPage() {
  useDocumentTitle('About')

  return (
    <main
      id="about-page"
      className="
        relative
        isolate
        w-full
        max-w-6xl
        mx-auto
        px-4
        sm:px-6
        lg:px-8
        pb-16
        space-y-8
        animate-fade-in
      "
      aria-label="About our project"
    >
      {/* Hero Section */}
      <section aria-label="Introduction">
        <AboutHero />
      </section>

      {/* Project Vision */}
      <section aria-label="Our vision">
        <AboutVision />
      </section>

      {/* Platform Features */}
      <section aria-label="Platform features">
        <AboutFeatures />
      </section>

      {/* Additional About Sections */}
      <Suspense fallback={<SectionLoader />}>
        <section aria-label="Open source philosophy">
          <AboutOpenSource />
        </section>

        <section aria-label="GSSoC participation">
          <AboutGSSoC />
        </section>

        <section aria-label="Community">
          <AboutCommunity />
        </section>

        <section aria-label="Resources">
          <AboutResources />
        </section>

        <section aria-label="Get involved">
          <AboutCta />
        </section>
      </Suspense>
    </main>
  )
}
