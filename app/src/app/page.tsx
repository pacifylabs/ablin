import type { Metadata } from 'next';
import { Approach } from '@/components/home/Approach';
import { Capabilities } from '@/components/home/Capabilities';
import { InsightsTeaser } from '@/components/home/InsightsTeaser';
import { ServicesOverview } from '@/components/home/ServicesOverview';
import { TaglineStrip } from '@/components/home/TaglineStrip';
import { WhoWeServe } from '@/components/home/WhoWeServe';
import { WhyAblin } from '@/components/home/WhyAblin';
import { HeroSignal } from '@/components/hero-signal/HeroSignal';
import { CtaBand } from '@/components/shell/CtaBand';
import { FrameworkBand } from '@/components/ui/FrameworkBand';
import { config } from '@/lib/config';
import {
  getApproach,
  getAudiences,
  getFrameworks,
  getHome,
  getImage,
  getInsightsPage,
  getServices,
} from '@/lib/content';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: `${site.name} — Governance, Risk & Compliance Advisory` },
  alternates: { canonical: '/' },
};

const organisationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: config.siteUrl,
  logo: `${config.siteUrl}/image/logo-lockup-light.png`,
  description: site.positioning,
  areaServed: 'GB',
};

export default async function HomePage() {
  const home = await getHome();
  const [
    approach,
    services,
    audiences,
    frameworks,
    insights,
    audienceImage,
    insightsImage,
    ctaImage,
  ] = await Promise.all([
    getApproach(),
    getServices(),
    getAudiences(),
    getFrameworks(),
    getInsightsPage(),
    getImage(home.audiences.image),
    getImage(home.insights.image),
    getImage(home.cta.image),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }}
      />
      <HeroSignal hero={home.hero} />
      <TaglineStrip />
      <FrameworkBand
        id="frameworks-title"
        title={home.frameworks.title}
        lead={home.frameworks.lead}
        note={home.frameworks.note}
        frameworks={frameworks}
      />
      <Capabilities data={home.capabilities} />
      <ServicesOverview data={home.services} services={services} />
      <Approach data={approach} />
      <WhoWeServe data={home.audiences} audiences={audiences} image={audienceImage} />
      <WhyAblin data={home.why} />
      <InsightsTeaser data={home.insights} topics={insights.topics} image={insightsImage} />
      <CtaBand
        title={home.cta.title}
        body={home.cta.body}
        primary={home.cta.primary}
        image={ctaImage}
      />
    </>
  );
}
