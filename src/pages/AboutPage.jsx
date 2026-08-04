import { useDocumentTitle } from '../lib/useDocumentTitle'
import AboutHero from '../components/about/AboutHero'
import AboutVision from '../components/about/AboutVision'
import AboutFeatures from '../components/about/AboutFeatures'
import AboutOpenSource from '../components/about/AboutOpenSource'
import AboutGSSoC from '../components/about/AboutGSSoC'
import AboutCommunity from '../components/about/AboutCommunity'
import AboutResources from '../components/about/AboutResources'
import AboutCta from '../components/about/AboutCta'

/**
 * AboutPage
 *
 * Dedicated About Section covering project vision, platform capabilities,
 * open-source philosophy, GSSoC 2026 participation, community appreciation,
 * and key resources.
 */
export default function AboutPage() {
  useDocumentTitle('About')

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-4 pb-12">
      <AboutHero />
      <AboutVision />
      <AboutFeatures />
      <AboutOpenSource />
      <AboutGSSoC />
      <AboutCommunity />
      <AboutResources />
      <AboutCta />
    </div>
  )
}
