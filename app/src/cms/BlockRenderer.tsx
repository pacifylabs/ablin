import Link from 'next/link';
import { Approach } from '@/components/home/Approach';
import { Capabilities } from '@/components/home/Capabilities';
import { WhoWeServe } from '@/components/home/WhoWeServe';
import { WhyAblin } from '@/components/home/WhyAblin';
import { ServicesOverview } from '@/components/home/ServicesOverview';
import { TaglineStrip } from '@/components/home/TaglineStrip';
import { HeroSignal } from '@/components/hero-signal/HeroSignal';
import { CtaBand } from '@/components/shell/CtaBand';
import blocks from '@/components/ui/blocks.module.css';
import { FrameworkBand } from '@/components/ui/FrameworkBand';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { getAudiences, getFrameworks, getServices, serviceHref } from '@/lib/content';
import type { Block } from './schema';
import { toImageAsset } from './image';
import { RichText, splitLegalSections } from './richtext';

/**
 * Renders a page's or article's `blocks` in order, one existing public component per block (see the mapping
 * table in admin/README.md). This is the one place a Block becomes markup — the editor only ever assembles and
 * edits the data, never the JSX, which is what keeps it impossible to produce a page the design system
 * wouldn't otherwise allow.
 */
export async function BlockRenderer({ blocks: list }: { blocks: readonly Block[] }) {
  const rendered = await Promise.all(list.map((block) => renderOne(block)));
  return <>{rendered}</>;
}

/** A legal page's review status lives on its one textRich("document") block, not on the PageDoc itself — used
 *  by the four legal routes' generateMetadata to decide whether the page stays out of search indexes. */
export function getLegalReviewStatus(list: readonly Block[]): 'draft' | 'approved' {
  for (const b of list) {
    if (b.type === 'textRich' && b.data.variant === 'document') return b.data.reviewStatus;
  }
  return 'draft';
}

async function renderOne(block: Block): Promise<React.ReactNode> {
  switch (block.type) {
    case 'hero': {
      if (block.data.variant === 'home') {
        return (
          <div key={block.id}>
            <HeroSignal hero={block.data} />
            <TaglineStrip />
          </div>
        );
      }
      const image = block.data.image ? toImageAsset(block.data.image) : undefined;
      return (
        <PageHero
          key={block.id}
          title={block.data.title}
          lead={block.data.lead}
          scene={block.data.illustration}
          image={image}
          kicker={block.data.kicker}
        />
      );
    }

    case 'capabilityGrid':
      return <Capabilities key={block.id} data={block.data} />;

    case 'serviceList': {
      const allServices = await getServices();
      const bySlug = new Map(allServices.map((s) => [s.slug, s]));
      const services = block.data.serviceSlugs
        .map((slug) => bySlug.get(slug))
        .filter((s) => s != null);
      if (block.data.variant === 'overview') {
        return <ServicesOverview key={block.id} data={block.data} services={services} />;
      }
      const headingId = `catalogue-${block.id}`;
      return (
        <section key={block.id} className="section section-surface" aria-labelledby={headingId}>
          <div className="container">
            <SectionHeader id={headingId} title={block.data.title} lead={block.data.lead} />
            <ul className="card-grid cols-4">
              {services.map((service) => (
                <li key={service.slug}>
                  <ServiceCard service={service} detailed />
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    }

    case 'approachSteps':
      return <Approach key={block.id} data={block.data} id={`approach-${block.id}`} />;

    case 'audienceGrid': {
      const allAudiences = await getAudiences();
      const bySlug = new Map(allAudiences.map((a) => [a.slug, a]));
      const audiences = block.data.audienceSlugs
        .map((slug) => bySlug.get(slug))
        .filter((a) => a != null);
      if (block.data.variant === 'teaser') {
        return (
          <WhoWeServe
            key={block.id}
            data={block.data}
            audiences={audiences}
            image={toImageAsset(block.data.image)}
          />
        );
      }
      const allServices = await getServices();
      const titleBySlug = new Map(allServices.map((s) => [s.slug, s.title]));
      const headingId = `groups-${block.id}`;
      return (
        <section key={block.id} className="section section-surface" aria-labelledby={headingId}>
          <div className="container">
            <SectionHeader id={headingId} title={block.data.title} lead={block.data.lead} />
            <ul className={blocks.rows}>
              {audiences.map((audience) => (
                <li key={audience.slug} id={audience.slug} className={blocks.row}>
                  <div className={blocks.rowText}>
                    <h3>{audience.title}</h3>
                    <p className="muted">{audience.description}</p>
                  </div>
                  <nav className={blocks.rowLinks} aria-label={`Services for ${audience.title}`}>
                    <p className="kicker">Relevant services</p>
                    {audience.services.map((slug) => (
                      <Link key={slug} href={serviceHref(slug)}>
                        {titleBySlug.get(slug) ?? slug}
                      </Link>
                    ))}
                  </nav>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    }

    case 'whyList': {
      if (block.data.variant === 'cards') return <WhyAblin key={block.id} data={block.data} />;
      const headingId = `values-${block.id}`;
      return (
        <section key={block.id} className="section" aria-labelledby={headingId}>
          <div className="container">
            <header className="section-header">
              <h2 id={headingId}>{block.data.title}</h2>
              <p className="lead">{block.data.lead}</p>
            </header>
            <ul className={blocks.cells}>
              {block.data.items.map((item) => (
                <li key={item.title} className={blocks.cell}>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    }

    case 'frameworkIndex': {
      const all = await getFrameworks();
      const frameworks =
        block.data.frameworkIds.length === 0
          ? all
          : block.data.frameworkIds
              .map((id) => all.find((f) => f.id === id))
              .filter((f) => f != null);
      return (
        <FrameworkBand
          key={block.id}
          id={`frameworks-${block.id}`}
          title={block.data.title}
          lead={block.data.lead}
          note={block.data.note}
          frameworks={frameworks}
        />
      );
    }

    case 'textRich': {
      if (block.data.variant === 'split') {
        const headingId = `text-${block.id}-title`;
        return (
          <section key={block.id} className="section" aria-labelledby={headingId}>
            <div className={`container ${blocks.split}`}>
              <h2 id={headingId}>{block.data.heading}</h2>
              <div className={blocks.prose}>
                <RichText doc={block.data.doc} />
              </div>
            </div>
          </section>
        );
      }
      const { title, lead, updated, reviewStatus, doc } = block.data;
      const headingId = 'page-title';
      const sections = splitLegalSections(doc);
      return (
        <section key={block.id} className="section" aria-labelledby={headingId}>
          <div
            className="container container-narrow"
            style={{ display: 'grid', gap: 'var(--space-8)' }}
          >
            <header style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <h1 id={headingId}>{title}</h1>
              <p className="lead">{lead}</p>
              <p className="small muted">Last updated {updated}</p>
              {reviewStatus === 'draft' ? (
                <p className={blocks.notice} role="note">
                  This text is a draft and is awaiting review by Ablin Limited. It should not be
                  relied on as final.
                </p>
              ) : null}
            </header>
            <div className={blocks.legal}>
              {sections.map((section, i) => (
                <section key={`${block.id}-s${i}`} className={blocks.legalSection}>
                  <h2>{section.heading}</h2>
                  <RichText doc={section.body} />
                </section>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'image': {
      const asset = toImageAsset(block.data);
      return (
        <section key={block.id} className="section" aria-label={block.data.alt || 'Image'}>
          <div className="container container-narrow">
            <figure style={{ margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
              <ImageSlot
                image={asset}
                ratio={block.data.ratio}
                sizes="(min-width: 900px) 60vw, 100vw"
              />
              {block.data.caption ? (
                <figcaption className="small muted">{block.data.caption}</figcaption>
              ) : null}
            </figure>
          </div>
        </section>
      );
    }

    case 'ctaBand': {
      const image = block.data.image ? toImageAsset(block.data.image) : undefined;
      return (
        <CtaBand
          key={block.id}
          title={block.data.title}
          body={block.data.body}
          primary={block.data.primary}
          secondary={block.data.secondary}
          image={image}
        />
      );
    }

    default: {
      // Exhaustiveness check: a new Block variant added to schema.ts without a case here is a compile error.
      const never: never = block;
      throw new Error(`Unhandled block type: ${JSON.stringify(never)}`);
    }
  }
}
