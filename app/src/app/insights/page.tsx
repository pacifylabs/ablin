import type { Metadata } from 'next';
import { CtaBand } from '@/components/shell/CtaBand';
import blocks from '@/components/ui/blocks.module.css';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { getImage, getInsightsPage } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Insights',
  description:
    'Practical guidance on governance, risk, compliance, data protection and AI governance from Ablin Limited.',
  alternates: { canonical: '/insights' },
};

/**
 * No articles are published yet, so this shows the honest topic-areas treatment (PRD §8.6). It never displays
 * sample or dated articles. When the publishing pipeline ships, published articles render above this block.
 */
export default async function InsightsPage() {
  const page = await getInsightsPage();
  const image = page.image ? await getImage(page.image) : undefined;

  return (
    <>
      <PageHero title={page.title} lead={page.lead} scene={page.illustration} image={image} />

      <section className="section section-surface" aria-label="Insights topics">
        <div className="container">
          <div className="card-grid cols-2">
            <article className="card">
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2rem)' }}>{page.emptyTitle}</h2>
              <p className="muted">{page.emptyBody}</p>
              <p className="card-foot">
                <Button href="/contact" variant="ghost">
                  Suggest a topic
                </Button>
              </p>
            </article>
            <article className="card">
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2rem)' }}>{page.topicsTitle}</h2>
              <p className="muted">{page.topicsLead}</p>
              <ul className={blocks.topicList}>
                {page.topics.map((topic) => (
                  <li key={topic} className={blocks.topic}>
                    {topic}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <CtaBand title={page.cta.title} body={page.cta.body} primary={page.cta.primary} />
    </>
  );
}
