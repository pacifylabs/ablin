/**
 * The starting content for every page (DS v3), built from the site's current copy and the approved Home reference.
 * Pure data, no Redis calls: written by `pnpm seed` (only when page:{slug} is missing, or with --pages), and served
 * by the public routes when Redis has no valid page:{slug} yet, so a fresh or legacy database never shows a blank
 * site.
 *
 * Content-integrity notes (DS v3 §7.5, §11): the fact strip uses service-structure counts only (3 capability areas,
 * 8 services, 5 frameworks, 5 steps), and the contact checklist repeats statements already on the live site.
 */
import audiencesJson from '@/content/audiences.json';
import aboutJson from '@/content/about.json';
import insightsJson from '@/content/insights.json';
import { newBlock, type Background, type Block, type BlockData, type BlockType } from './blocks';
import type { RichDoc, RichNode } from './richdoc';
import type { PageDoc, PageSlug } from './schema';

// --- helpers -----------------------------------------------------------------------------------------------------

function text(t: string): RichNode {
  return { type: 'text', text: t };
}
function p(t: string): RichNode {
  return { type: 'paragraph', content: [text(t)] };
}
function h2(t: string): RichNode {
  return { type: 'heading', attrs: { level: 2 }, content: [text(t)] };
}
function ul(items: readonly string[]): RichNode {
  return {
    type: 'bulletList',
    content: items.map((item) => ({ type: 'listItem', content: [p(item)] })),
  };
}
function doc(...nodes: RichNode[]): RichDoc {
  return { type: 'doc', content: nodes };
}

function b<T extends BlockType>(
  type: T,
  id: string,
  data: BlockData<T>,
  options: { background?: Background; anchorId?: string } = {},
): Block {
  const block = newBlock(type, id);
  return {
    ...block,
    data,
    ...(options.background ? { background: options.background } : {}),
    ...(options.anchorId ? { anchorId: options.anchorId } : {}),
  } as Block;
}

const link = (label: string, href: string) => ({ label, href });
const photo = (mediaId: string, decorative = true) => ({ mediaId, decorative });

const SEED_DATE = '2026-09-28T00:00:00.000Z';
function page(
  slug: PageSlug,
  title: string,
  seoTitle: string,
  seoDescription: string,
  blocks: Block[],
  noindex = false,
): PageDoc {
  return {
    slug,
    title,
    seoTitle,
    seoDescription,
    ogImage: null,
    noindex,
    blocks,
    status: 'published',
    updatedAt: SEED_DATE,
  };
}

// --- shared copy -------------------------------------------------------------------------------------------------

const STEPS = [
  {
    title: 'Assess',
    text: 'Understand the organisation, regulatory environment, technology landscape, existing controls and risks.',
  },
  {
    title: 'Identify',
    text: 'Identify compliance gaps, vulnerabilities, control weaknesses and areas requiring improvement.',
  },
  {
    title: 'Design',
    text: 'Develop proportionate governance frameworks, controls, policies, procedures and remediation plans.',
  },
  {
    title: 'Implement',
    text: 'Support the organisation in putting the required measures into practice.',
  },
  {
    title: 'Monitor & Improve',
    text: 'Help maintain compliance, monitor risk and continuously improve governance and controls as the organisation evolves.',
  },
];

const WHY = [
  {
    icon: 'shield' as const,
    title: 'Governance first',
    text: 'We approach technology and transformation from a foundation of governance, risk and accountability.',
  },
  {
    icon: 'trend' as const,
    title: 'Practical, not just advisory',
    text: 'We help develop and implement the controls, policies, processes and frameworks needed to close the gaps.',
  },
  {
    icon: 'briefcase' as const,
    title: 'Business focused',
    text: 'Proportionate recommendations designed around your objectives, operational realities and risk profile.',
  },
  {
    icon: 'monitor' as const,
    title: 'Technology aware',
    text: 'Governance, regulatory compliance, cybersecurity, data protection and emerging technology risk together.',
  },
  {
    icon: 'bars' as const,
    title: 'Scalable support',
    text: 'From individual assessments and remediation projects to ongoing governance and compliance advisory.',
  },
];

const FRAMEWORK_CAPTION =
  'Advisory and readiness support only. Independent bodies carry out assessments and issue any certificate.';

type Audience = { slug: string; title: string; summary: string; description: string };
const AUDIENCES = audiencesJson as Audience[];
const AUDIENCE_ANCHOR: Record<string, string> = {
  'smes-growing-businesses': 'smes',
  'technology-digital-businesses': 'technology',
  'regulated-organisations': 'regulated',
  'professional-services': 'professional-services',
  'ai-emerging-technology': 'ai-adoption',
};

const CONTACT_CHECKLIST = [
  'A consultant reviews every enquiry',
  'Advisory and readiness support across GRC, security, data and AI',
  'Based in the United Kingdom',
];

function contactBand(id: string, title: string, sub: string): Block {
  return b(
    'contactBand',
    id,
    { title, sub, checklist: CONTACT_CHECKLIST },
    { anchorId: 'contact' },
  );
}

// --- home (DS v3 §5 order; matches the approved reference) -------------------------------------------------------

const home = page(
  'home',
  'Home',
  'Ablin Limited — Governance, Risk & Compliance Advisory',
  'Ablin Limited is a UK governance, risk, compliance and technology advisory firm helping organisations manage regulatory, information security, data and AI risk.',
  [
    b('heroFramed', 'home-hero', {
      eyebrow: 'Governance, risk & compliance advisory',
      title: 'Governance, Risk & Compliance for a Secure Digital Future',
      lead: 'Ablin Limited helps organisations navigate regulatory complexity, manage technology and information risk, strengthen compliance, protect data and adopt emerging technologies responsibly.',
      image: photo('glass-converge'),
      locationTag: 'UNITED KINGDOM',
      primaryCta: link('Explore Our Services', '/services'),
      secondaryCta: link('Speak to Our Consultants', '/contact'),
      lattice: true,
    }),
    b('capabilityPanels', 'home-capabilities', {
      panels: [
        {
          icon: 'square-check',
          title: 'Governance, Risk & Compliance',
          text: 'We help organisations establish effective governance frameworks, identify and manage risk, strengthen internal controls and prepare for regulatory and assurance requirements.',
          link: link('View service', '/services/governance-risk-compliance'),
        },
        {
          icon: 'shield-check',
          title: 'Cybersecurity & Technology Risk',
          text: 'We help organisations understand and manage cyber and technology risks through security governance, IT controls, vulnerability management, security assessments and recognised compliance frameworks.',
          link: link('View service', '/services/cybersecurity-governance'),
        },
        {
          icon: 'database',
          title: 'Data Protection & AI Governance',
          text: 'We help organisations protect personal and organisational data, meet privacy obligations and establish appropriate governance for the responsible adoption and use of artificial intelligence.',
          link: link('View service', '/services/data-protection-privacy'),
        },
      ],
    }),
    b(
      'aboutIntro',
      'home-about',
      {
        eyebrow: 'About Ablin',
        title: 'A consultancy built on governance, delivered in practice',
        paragraphs: [
          'Ablin Limited is a UK-based governance, risk, compliance and technology advisory firm. We help organisations navigate regulatory complexity, strengthen internal controls, manage technology and information risks, protect data and establish responsible governance around emerging technologies.',
          'Our consultants combine governance principles with practical implementation, moving from identifying risks and gaps to workable controls, policies and improvement programmes.',
        ],
      },
      { anchorId: 'about' },
    ),
    b('factStrip', 'home-facts', {
      facts: [
        { value: '3', label: 'Core capability areas' },
        { value: '8', label: 'Advisory and readiness services' },
        { value: '5', label: 'Frameworks we advise on' },
        { value: '5', label: 'Steps from assessment to improvement' },
      ],
      approvedByClient: true,
    }),
    b('frameworkStrip', 'home-frameworks', {
      variant: 'strip',
      eyebrow: '',
      title: '',
      frameworkIds: [],
      caption: FRAMEWORK_CAPTION,
      newTabLabel: '',
    }),
    b(
      'serviceCarousel',
      'home-services',
      {
        variant: 'carousel',
        eyebrow: 'Services',
        title: 'Eight areas of advisory work',
        lead: 'From a single assessment to ongoing governance and compliance support, scaled to your organisation.',
        serviceSlugs: [],
        cardLinkLabel: 'View service',
        prevLabel: 'Previous services',
        nextLabel: 'Next services',
        trackLabel: 'Services',
      },
      { anchorId: 'services' },
    ),
    b(
      'approachSplit',
      'home-approach',
      {
        eyebrow: 'Our approach',
        title: 'We do more than identify problems',
        lead: 'Five steps, from understanding where you are to keeping controls effective as things change.',
        image: photo('hero-stairs'),
        badge: link('Request a Consultation', '/contact'),
        steps: STEPS,
      },
      { anchorId: 'approach' },
    ),
    b(
      'audienceList',
      'home-serve',
      {
        eyebrow: 'Who we serve',
        title: 'Organisations that need clear governance over risk',
        lead: '',
        items: AUDIENCES.map((a) => ({ title: a.title, text: a.summary, anchorId: '' })),
        image: photo('geometric-facade'),
        note: {
          title: 'Not sure where you fit?',
          text: 'Tell us about your organisation and we’ll advise on where to start.',
          cta: link('Discuss Your Requirements', '/contact'),
        },
      },
      { background: 'surface', anchorId: 'serve' },
    ),
    b(
      'whyGrid',
      'home-why',
      {
        eyebrow: 'Why Ablin',
        title: 'Governance principles, practical delivery',
        intro: 'What you can expect when you work with us.',
        items: WHY,
      },
      { anchorId: 'why' },
    ),
    b(
      'topicList',
      'home-topics',
      {
        eyebrow: 'Insights',
        title: 'Guidance on the areas we advise on',
        lead: 'Articles published from the admin appear here, filed under these topics.',
        topicSlugs: [],
      },
      { anchorId: 'insights' },
    ),
    b('articleGrid', 'home-articles', {
      mode: 'latest',
      eyebrow: '',
      title: '',
      lead: '',
      count: 3,
      readMoreLabel: 'Read article',
      emptyTitle: '',
      emptyText: '',
      filterLabel: '',
      clearFilterLabel: '',
    }),
    contactBand(
      'home-contact',
      'Discuss your governance and compliance requirements',
      'Tell us what you are working towards and we will advise on where to start.',
    ),
  ],
);

// --- about -------------------------------------------------------------------------------------------------------

const about = page(
  'about',
  'About Ablin',
  'About Ablin — Governance & Risk Advisory',
  'Ablin Limited is a UK governance, risk, compliance and technology advisory firm. Our mission, vision and values.',
  [
    b('pageHeader', 'about-header', {
      eyebrow: 'About us',
      title: 'About Ablin',
      lead: 'A UK governance, risk, compliance and technology advisory firm.',
      image: photo('colleagues-desk'),
      breadcrumb: true,
      cta: null,
    }),
    b('aboutIntro', 'about-intro', {
      eyebrow: 'Who we are',
      title: 'Governance first, technology aware',
      paragraphs: [
        'Ablin Limited is a UK-based governance, risk, compliance and technology advisory firm. We help organisations navigate regulatory complexity, strengthen internal controls, manage technology and information risks, protect data and establish responsible governance around emerging technologies.',
        'Our consultants combine governance principles with practical implementation, helping organisations move from identifying risks and compliance gaps to developing workable controls, policies, processes and improvement programmes.',
      ],
    }),
    b(
      'missionVision',
      'about-mission',
      {
        eyebrow: '',
        mission: { title: aboutJson.mission.title, text: aboutJson.mission.body },
        vision: { title: aboutJson.vision.title, text: aboutJson.vision.body },
      },
      { background: 'surface' },
    ),
    b('valuesGrid', 'about-values', {
      eyebrow: 'Our values',
      title: 'How we approach every engagement',
      lead: '',
      items: [
        {
          icon: 'scale',
          title: 'Integrity',
          text: 'We give honest advice, including when it is not what you hoped to hear.',
        },
        {
          icon: 'square-check',
          title: 'Accountability',
          text: 'We say what we will do, and we do it and answer for the result.',
        },
        {
          icon: 'shield',
          title: 'Security',
          text: 'We treat the information you share with us with the care we advise you to take.',
        },
        {
          icon: 'compass',
          title: 'Practicality',
          text: 'We recommend what your organisation can realistically adopt and keep doing.',
        },
        {
          icon: 'cycle',
          title: 'Continuous improvement',
          text: 'We expect controls and our own work to be reviewed and to get better over time.',
        },
      ],
    }),
    b('whyGrid', 'about-why', {
      eyebrow: 'Why Ablin',
      title: 'Governance principles, practical delivery',
      intro: 'What you can expect when you work with us.',
      items: WHY,
    }),
    b(
      'ctaBand',
      'about-cta',
      {
        title: 'Talk to us about your requirements',
        text: 'Tell us what you are working towards and we will advise on where to start.',
        primary: link('Request a Consultation', '/contact'),
        secondary: null,
      },
      { background: 'band' },
    ),
  ],
);

// --- services index ----------------------------------------------------------------------------------------------

const servicesPage = page(
  'services',
  'Services',
  'Services — GRC, Cybersecurity, Data Protection & AI Governance',
  'Eight advisory services: governance, risk and compliance, ISO readiness, data protection, AI governance, cybersecurity governance, technology risk, SOC 2 readiness, and audit and assurance.',
  [
    b('pageHeader', 'services-header', {
      eyebrow: 'Services',
      title: 'Advisory services',
      lead: 'Governance, risk, compliance, cybersecurity, data protection and AI governance, delivered as advisory work sized to your organisation.',
      image: photo('glass-facade'),
      breadcrumb: true,
      cta: null,
    }),
    b('serviceCarousel', 'services-grid', {
      variant: 'grid',
      eyebrow: '',
      title: 'Our services',
      lead: 'Each service page sets out what the work covers and how we approach it.',
      serviceSlugs: [],
      cardLinkLabel: 'View service',
      prevLabel: 'Previous services',
      nextLabel: 'Next services',
      trackLabel: 'Services',
    }),
    b(
      'frameworkStrip',
      'services-frameworks',
      {
        variant: 'index',
        eyebrow: 'Frameworks',
        title: 'Frameworks we advise on',
        frameworkIds: [],
        caption: FRAMEWORK_CAPTION,
        newTabLabel: '(opens in a new tab)',
      },
      { background: 'surface' },
    ),
    b('approachSteps', 'services-approach', {
      eyebrow: 'Our approach',
      title: 'A structured approach to governance, risk and compliance',
      lead: 'Five steps, from understanding where you are to keeping controls effective as things change.',
      steps: STEPS,
      compact: true,
    }),
    b(
      'ctaBand',
      'services-cta',
      {
        title: 'Not sure which service you need?',
        text: 'Describe what you are trying to achieve and we will tell you where we can help.',
        primary: link('Discuss Your Requirements', '/contact'),
        secondary: null,
      },
      { background: 'band' },
    ),
  ],
);

// --- who we serve ------------------------------------------------------------------------------------------------

const whoWeServe = page(
  'who-we-serve',
  'Who we serve',
  'Who We Serve',
  'The organisations Ablin Limited advises: growing businesses, technology firms, regulated organisations, professional services and organisations adopting AI.',
  [
    b('pageHeader', 'serve-header', {
      eyebrow: 'Who we serve',
      title: 'Who we serve',
      lead: 'We advise organisations that need to show they manage risk, protect information and adopt technology responsibly.',
      image: photo('zigzag-stairs'),
      breadcrumb: true,
      cta: null,
    }),
    b('audienceList', 'serve-list', {
      eyebrow: '',
      title: 'Find your situation',
      lead: 'If your organisation is not described here, tell us about it. We will say whether we can help.',
      items: AUDIENCES.map((a) => ({
        title: a.title,
        text: a.description,
        anchorId: AUDIENCE_ANCHOR[a.slug] ?? '',
      })),
      image: photo('geometric-facade'),
      note: {
        title: 'Not sure where you fit?',
        text: 'Tell us about your organisation and we’ll advise on where to start.',
        cta: link('Discuss Your Requirements', '/contact'),
      },
    }),
    b('serviceCarousel', 'serve-services', {
      variant: 'carousel',
      eyebrow: 'Services',
      title: 'The services behind this work',
      lead: '',
      serviceSlugs: [],
      cardLinkLabel: 'View service',
      prevLabel: 'Previous services',
      nextLabel: 'Next services',
      trackLabel: 'Services',
    }),
    contactBand(
      'serve-contact',
      'See where you fit',
      'Tell us what you are working towards and we will advise on where to start.',
    ),
  ],
);

// --- insights index ----------------------------------------------------------------------------------------------

const insightsPage = page(
  'insights',
  'Insights',
  'Insights',
  'Practical guidance on governance, risk, compliance, data protection and AI governance from Ablin Limited.',
  [
    b('pageHeader', 'insights-header', {
      eyebrow: 'Insights',
      title: 'Insights',
      lead: 'Practical guidance on governance, risk, compliance, data protection and AI governance.',
      image: photo('reflective-facade'),
      breadcrumb: true,
      cta: null,
    }),
    b('topicList', 'insights-topics', {
      eyebrow: '',
      title: insightsJson.topicsTitle,
      lead: insightsJson.topicsLead,
      topicSlugs: [],
    }),
    b('articleGrid', 'insights-articles', {
      mode: 'all',
      eyebrow: '',
      title: '',
      lead: '',
      count: 12,
      readMoreLabel: 'Read article',
      emptyTitle: insightsJson.emptyTitle,
      emptyText: insightsJson.emptyBody,
      filterLabel: 'Showing articles about {topic}.',
      clearFilterLabel: 'Show all articles',
    }),
    b(
      'ctaBand',
      'insights-cta',
      {
        title: 'Suggest a topic or ask a question',
        text: 'Tell us what you would like guidance on.',
        primary: link('Speak to Our Consultants', '/contact'),
        secondary: null,
      },
      { background: 'band' },
    ),
  ],
);

// --- contact -----------------------------------------------------------------------------------------------------

const contactPage = page(
  'contact',
  'Contact us',
  'Contact Ablin',
  'Contact Ablin Limited about governance, risk, compliance, data protection, AI governance or cybersecurity.',
  [
    b('pageHeader', 'contact-header', {
      eyebrow: 'Contact',
      title: 'Contact us',
      lead: 'Tell us about your organisation and what you need. A consultant will read your message and reply by email.',
      image: null,
      breadcrumb: true,
      cta: null,
    }),
    contactBand(
      'contact-form',
      'Discuss your governance and compliance requirements',
      'Tell us what you are working towards and we will advise on where to start.',
    ),
    b(
      'approachSteps',
      'contact-next',
      {
        eyebrow: '',
        title: 'What happens next',
        lead: '',
        steps: [
          {
            title: 'We read your message',
            text: 'A consultant reviews what you have told us about your organisation and requirements.',
          },
          {
            title: 'We reply by email',
            text: 'We respond to the work email address you provide, with questions or a suggested next step.',
          },
          {
            title: 'We agree how to proceed',
            text: 'If we can help, we set out the scope and approach before any work starts.',
          },
        ],
        compact: false,
      },
      { background: 'surface' },
    ),
  ],
);

// --- legal pages: plain header on --surface + a 760px prose column (DS v3 §7.14) ---------------------------------

function legal(
  slug: PageSlug,
  title: string,
  description: string,
  lead: string,
  body: RichDoc,
): PageDoc {
  // noindex until the client's reviewer approves the text (was reviewStatus: 'draft').
  return page(
    slug,
    title,
    title,
    description,
    [
      b('pageHeader', `${slug}-header`, {
        eyebrow: '',
        title,
        lead,
        image: null,
        breadcrumb: true,
        cta: null,
      }),
      b('richText', `${slug}-body`, {
        title: '',
        meta: 'Draft for review · Last updated 19 September 2026',
        doc: body,
        layout: 'prose',
      }),
    ],
    true,
  );
}

const privacyPolicy = legal(
  'privacy-policy',
  'Privacy Policy',
  'How Ablin Limited collects, uses and protects personal data.',
  'This policy explains what personal data Ablin Limited collects through this website, why, and what your rights are.',
  doc(
    h2('Who we are'),
    p(
      'Ablin Limited is a United Kingdom governance, risk, compliance and technology advisory firm. We are the controller of the personal data described in this policy.',
    ),
    h2('What we collect'),
    p('We collect personal data only when you give it to us or when your browser sends it to us.'),
    ul([
      'Contact form details: your name, work email address, organisation, enquiry type, message and your consent.',
      "Technical data needed to keep the site secure: a hashed form of your IP address and your browser's user agent, used to detect abuse and limit repeated submissions.",
      'Your theme preference (light or dark), which is stored in your own browser and is not sent to us.',
    ]),
    h2('How we use it'),
    ul([
      'To read and respond to your enquiry.',
      'To keep the website and contact form secure and to prevent abuse.',
      'To meet our legal obligations.',
    ]),
    h2('Our lawful basis'),
    p(
      'We handle enquiry details on the basis of our legitimate interest in responding to people who contact us, and on your consent where you give it through the form. We handle security data on the basis of our legitimate interest in protecting the site.',
    ),
    h2('Who we share it with'),
    p(
      'We do not sell personal data. We use service providers, such as website hosting and email delivery, who process data on our instructions. We may disclose data where the law requires it.',
    ),
    h2('How long we keep it'),
    p(
      'We keep enquiry details for as long as we need them to respond and for a reasonable period afterwards, then delete them. Hashed security data is kept only as long as needed to detect abuse.',
    ),
    h2('Your rights'),
    p('Under UK data protection law you have the right to:'),
    ul([
      'be told how your data is used and to access a copy of it;',
      'have inaccurate data corrected;',
      'ask for your data to be erased or its use restricted in some circumstances;',
      'object to processing based on legitimate interests;',
      'withdraw consent where we rely on it.',
    ]),
    h2('Contact and complaints'),
    p(
      "To exercise a right or ask a question, use the contact form and mark your message as a data protection request. You also have the right to complain to the Information Commissioner's Office.",
    ),
    h2('Changes to this policy'),
    p('We will update this page if our practices change and show the date of the latest update.'),
  ),
);

const cookiePolicy = legal(
  'cookie-policy',
  'Cookie Policy',
  'How Ablin Limited uses cookies and similar technologies on this website.',
  'This policy explains which cookies and similar technologies this website uses and how you can control them.',
  doc(
    h2('What we use now'),
    p(
      'Essential storage on your device remembers your light or dark theme choice and your cookie preference. These stay on your device and are not used to track you across other websites.',
    ),
    h2('Analytics'),
    p(
      'If you choose Accept analytics in the cookie banner, we load Google Analytics 4 to understand how visitors use this website (pages viewed, approximate location and device type). We do not load analytics unless you accept. You can change your mind by clearing site data in your browser and choosing again.',
    ),
    h2('Controlling storage'),
    p(
      'You can clear stored data or block cookies and site storage in your browser settings. The website works without them, but it will not remember your theme choice.',
    ),
  ),
);

const termsOfUse = legal(
  'terms-of-use',
  'Terms of Use',
  'Terms that apply when you use the Ablin Limited website.',
  'By using this website you agree to these terms.',
  doc(
    h2('About this website'),
    p(
      'This website is operated by Ablin Limited. The information on it is general in nature and is not legal, regulatory or professional advice for your circumstances. Take advice before acting on it.',
    ),
    h2('No certification'),
    p(
      'Ablin Limited advises and prepares organisations for standards and assessments. We are not a certification or accreditation body and do not issue certificates.',
    ),
    h2('Intellectual property'),
    p(
      'The content and design of this website belong to Ablin Limited or its licensors. You may view and print pages for your own use, but you may not copy or reuse them commercially without our written permission.',
    ),
    h2('Acceptable use'),
    p(
      'You must not use the website in a way that is unlawful or that could damage or interfere with it, including by:',
    ),
    ul([
      'attempting to gain unauthorised access to the site or its systems;',
      'sending automated or repeated submissions through the contact form;',
      'introducing malicious code.',
    ]),
    h2('Links to other sites'),
    p('We are not responsible for the content or practices of websites we link to.'),
    h2('Liability'),
    p(
      'We take reasonable care to keep the website accurate and available but provide it as is. To the extent the law allows, we are not liable for loss arising from your use of it. Nothing in these terms limits liability that cannot be limited by law.',
    ),
    h2('Governing law'),
    p('These terms are governed by the law of England and Wales.'),
  ),
);

const accessibility = legal(
  'accessibility',
  'Accessibility',
  'Accessibility statement for the Ablin Limited website.',
  'We want everyone to be able to use this website, including people who use assistive technology.',
  doc(
    h2('Our target'),
    p(
      'We are building this website to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.',
    ),
    h2('What we have done'),
    ul([
      'Semantic page structure with landmarks and a logical heading order.',
      'A skip link and full keyboard operation of navigation, the theme toggle, the service carousel and forms.',
      'Visible focus indicators on every interactive element.',
      'Colour contrast checked in both the light and dark themes, including text over photographs.',
      'Labelled form fields, with errors described in text and linked to their fields.',
      'Respect for the reduced-motion and colour-scheme settings of your device.',
    ]),
    h2('Testing and known limitations'),
    p(
      'We test with automated tools and keyboard checks. We have not yet completed an independent accessibility audit, so we do not claim full conformance. We will update this statement when one has been carried out.',
    ),
    h2('Tell us about a problem'),
    p(
      'If you find something you cannot use or read, tell us through the contact form and describe the page and the difficulty. We will respond and work to fix it.',
    ),
  ),
);

// --- availability pages: SEO only; the gate's text lives in settings:availability -------------------------------

const comingSoon = page(
  'coming-soon',
  'Coming soon',
  'Coming soon',
  'Ablin Limited is preparing a new website.',
  [],
  true,
);
const underConstruction = page(
  'under-construction',
  'Scheduled maintenance',
  'Scheduled maintenance',
  'The Ablin Limited website is temporarily offline for maintenance.',
  [],
  true,
);

export const seedPages: readonly PageDoc[] = [
  home,
  about,
  servicesPage,
  whoWeServe,
  insightsPage,
  contactPage,
  privacyPolicy,
  cookiePolicy,
  termsOfUse,
  accessibility,
  comingSoon,
  underConstruction,
];

const bySlug = new Map(seedPages.map((doc) => [doc.slug, doc]));

/** The seed document for one page, for the public route's fallback when Redis has no valid page:{slug}. */
export function seedPage(slug: PageSlug): PageDoc {
  const found = bySlug.get(slug);
  if (!found) throw new Error(`No seed data for page slug: ${slug}`);
  return found;
}
