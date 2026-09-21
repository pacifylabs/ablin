import type { Metadata } from 'next';
import { Approach } from '@/components/home/Approach';
import { CtaBand } from '@/components/shell/CtaBand';
import blocks from '@/components/ui/blocks.module.css';
import { PageHero } from '@/components/ui/PageHero';
import { config } from '@/lib/config';
import { getAbout, getApproach, getImage } from '@/lib/content';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Ablin — Governance & Risk Advisory',
  description:
    'Ablin Limited is a UK governance, risk, compliance and technology advisory firm. Our mission, vision and values.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const [about, approach] = await Promise.all([getAbout(), getApproach()]);
  const image = about.image ? await getImage(about.image) : undefined;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: config.siteUrl,
    logo: `${config.siteUrl}/image/logo-lockup-light.png`,
    description: about.intro[0],
    areaServed: 'GB',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero title={about.title} lead={about.lead} scene={about.illustration} image={image} />

      <section className="section" aria-labelledby="intro-title">
        <div className={`container ${blocks.split}`}>
          <h2 id="intro-title">{about.introTitle}</h2>
          <div className={blocks.prose}>
            {about.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-surface" aria-label="Mission and vision">
        <div className="container">
          <ul className="card-grid cols-2">
            {[about.mission, about.vision].map((item) => (
              <li key={item.title}>
                <article className="card">
                  <h2 style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2rem)' }}>{item.title}</h2>
                  <p className="lead" style={{ color: 'var(--text)' }}>
                    {item.body}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="values-title">
        <div className="container">
          <header className="section-header">
            <h2 id="values-title">{about.values.title}</h2>
            <p className="lead">{about.values.lead}</p>
          </header>
          <ul className={blocks.cells}>
            {about.values.items.map((value) => (
              <li key={value.title} className={blocks.cell}>
                <h3>{value.title}</h3>
                <p className="muted">{value.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Approach data={approach} id="about-approach-title" />
      <CtaBand title={about.cta.title} body={about.cta.body} primary={about.cta.primary} />
    </>
  );
}
