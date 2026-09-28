/**
 * The starting content for each of the 10 known pages, built from what used to be hardcoded/JSON before the
 * admin migration, so the public site renders identically the first time it reads from Redis. Pure data, no
 * Redis/argon2 calls — imported by both `scripts/seed.ts` (writes it once) and, as a fallback, by each public
 * page (see admin/README.md §Seed fallback: a page reads Redis first, and only falls back to this when
 * page:{slug} doesn't exist yet, so a fresh, unseeded Redis never serves a blank site).
 */
import imagesJson from '@/content/images.json';
import servicesJson from '@/content/services.json';
import type { Block, BlockImage, PageDoc, PageSlug, RichDoc, RichNode } from './schema';

// --- small helpers ------------------------------------------------------------------------------------------

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
    content: items.map((item) => ({
      type: 'listItem',
      content: [{ type: 'paragraph', content: [text(item)] }],
    })),
  };
}
function doc(...nodes: RichNode[]): RichDoc {
  return { type: 'doc', content: nodes };
}

type ImageManifestEntry = { src: string; width: number; height: number; alt: string; blur: string };
const images = imagesJson as Record<string, ImageManifestEntry>;

/** Reuses one of the site's existing stock placeholder photos (public/image/photo) as a BlockImage, so the
 *  seeded pages need no upload to render. An admin can replace any of these with a Cloudinary upload later. */
function stockImage(id: keyof typeof images, caption?: string): BlockImage {
  const image = images[id];
  if (!image) throw new Error(`Unknown stock image: ${id}`);
  return {
    url: image.src,
    alt: image.alt,
    width: image.width,
    height: image.height,
    blur: image.blur,
    ...(caption ? { caption } : {}),
  };
}

let blockSeq = 0;
function block<T extends Block['type']>(
  type: T,
  data: Extract<Block, { type: T }>['data'],
): Extract<Block, { type: T }> {
  blockSeq += 1;
  return { id: `${type}-${blockSeq}`, type, data } as Extract<Block, { type: T }>;
}

const cta = (label: string, href: string) => ({ label, href });

const services = servicesJson as { slug: string }[];
const serviceSlugs = services.map((s) => s.slug);

const audienceSlugs = [
  'smes-growing-businesses',
  'technology-digital-businesses',
  'regulated-organisations',
  'professional-services',
  'ai-emerging-technology',
];

const approachSteps = [
  {
    title: 'Assess',
    description: 'Understand your organisation, obligations, systems and existing controls.',
  },
  {
    title: 'Identify',
    description: 'Find the gaps and risks that matter, and rank them by their effect on you.',
  },
  {
    title: 'Design',
    description: 'Design proportionate controls, policies and documentation to close those gaps.',
  },
  {
    title: 'Implement',
    description: 'Support your team in putting the controls and processes into practice.',
  },
  {
    title: 'Monitor & Improve',
    description: 'Review how controls perform, track change and keep improving over time.',
  },
];

const now = () => new Date().toISOString();
function published(
  slug: PageSlug,
  title: string,
  seoTitle: string,
  seoDescription: string,
  blocks: Block[],
  ogImage = '',
): PageDoc {
  return {
    slug,
    title,
    seoTitle,
    seoDescription,
    ogImage,
    blocks,
    status: 'published',
    updatedAt: now(),
  };
}

// --- page: home ----------------------------------------------------------------------------------------------

const home = published(
  'home',
  'Home',
  'Ablin Limited — Governance, Risk & Compliance Advisory',
  'Ablin Limited is a UK governance, risk, compliance and technology advisory firm helping organisations manage regulatory, information security, data and AI risk.',
  [
    block('hero', {
      variant: 'home',
      eyebrow: 'Governance, risk & compliance advisory',
      title: 'Governance, Risk & Compliance for a Secure Digital Future',
      lead: 'Ablin Limited helps organisations navigate regulatory complexity, manage technology and information risk, strengthen compliance, protect data and adopt emerging technologies responsibly.',
      primary: cta('Explore our services', '/services'),
      secondary: cta('Speak to our consultants', '/contact'),
      frameworksLabel: 'Frameworks we advise on',
      frameworkNames: ['ISO 27001', 'ISO/IEC 42001', 'UK GDPR & DPA 2018', 'SOC 2', 'NIST AI RMF'],
    }),
    block('frameworkIndex', {
      title: 'Frameworks we advise on',
      lead: 'The standards and regulations our advice is built around. We help you prepare for them, and we do not issue certificates.',
      note: 'Advisory and readiness support only. Independent bodies carry out assessments and issue any certificate.',
      frameworkIds: [],
    }),
    block('capabilityGrid', {
      title: 'Core capabilities',
      lead: 'Three areas where organisations most often need clear, practical support.',
      items: [
        {
          title: 'Governance, Risk & Compliance',
          description:
            'Governance structures, risk management and compliance programmes that show leadership what is required and how it is being met.',
          serviceSlug: 'governance-risk-compliance',
          illustration: 'governance',
        },
        {
          title: 'Cybersecurity & Technology Risk',
          description:
            'Cybersecurity governance, vulnerability management and IT controls, set against the frameworks and regulations that apply to you.',
          serviceSlug: 'cybersecurity-governance',
          illustration: 'cyber',
        },
        {
          title: 'Data Protection & AI Governance',
          description:
            'Data protection and privacy obligations, and governance over how emerging technologies are adopted and used.',
          serviceSlug: 'data-protection-privacy',
          illustration: 'data',
        },
      ],
    }),
    block('serviceList', {
      variant: 'overview',
      kicker: 'Services',
      title: 'How we can help',
      lead: 'Eight areas of advisory work, each covering the obligations, risks and controls involved.',
      serviceSlugs,
    }),
    block('approachSteps', {
      kicker: 'Our approach',
      title: 'A structured approach to governance, risk and compliance',
      lead: 'Five steps, from understanding where you are to keeping controls effective as things change.',
      steps: approachSteps,
    }),
    block('audienceGrid', {
      variant: 'teaser',
      kicker: 'Who we serve',
      title: 'Organisations that need clear governance over risk',
      lead: 'Our work suits organisations that must show they manage risk well, whatever their size.',
      image: stockImage('zigzag-stairs'),
      audienceSlugs,
    }),
    block('whyList', {
      variant: 'cards',
      title: 'Why Ablin',
      lead: 'What you can expect when you work with us.',
      illustration: 'controls',
      points: [
        {
          title: 'Governance first',
          description: 'We start from your obligations and risks, not from a product or a toolset.',
        },
        {
          title: 'Practical delivery',
          description:
            'Controls and documents sized to your organisation, and usable by your team.',
        },
        {
          title: 'Technology-aware',
          description: 'We understand the systems behind the risks, including cloud, data and AI.',
        },
        {
          title: 'Advisory, not certification',
          description:
            'We prepare you for assessments such as ISO 27001 and SOC 2. Independent bodies carry out the assessments and issue certificates.',
        },
      ],
    }),
    block('ctaBand', {
      title: 'Discuss your governance, risk and compliance requirements',
      body: 'Tell us what you are working towards and we will advise on where to start.',
      primary: cta('Speak to our consultants', '/contact'),
      image: stockImage('glass-facade'),
    }),
  ],
);

// --- page: about -----------------------------------------------------------------------------------------------

const about = published(
  'about',
  'About Ablin',
  'About Ablin — Governance & Risk Advisory',
  'Ablin Limited is a UK governance, risk, compliance and technology advisory firm. Our mission, vision and values.',
  [
    block('hero', {
      variant: 'page',
      title: 'About Ablin',
      lead: 'A UK governance, risk, compliance and technology advisory firm.',
      illustration: 'structure',
    }),
    block('textRich', {
      variant: 'split',
      heading: 'Who we are',
      doc: doc(
        p(
          'Ablin Limited helps organisations understand their obligations, manage information and technology risk, and put controls in place that people can operate.',
        ),
        p(
          'We work across governance, risk and compliance, cybersecurity governance, data protection, AI governance and technology assurance. Technology is part of the picture, but our starting point is always the organisation: what it must do, what could go wrong and who is accountable.',
        ),
      ),
    }),
    block('whyList', {
      variant: 'cells',
      title: 'Our values',
      lead: 'How we approach every engagement.',
      items: [
        {
          title: 'Integrity',
          description: 'We give honest advice, including when it is not what you hoped to hear.',
        },
        {
          title: 'Accountability',
          description: 'We say what we will do, and we do it and answer for the result.',
        },
        {
          title: 'Security',
          description:
            'We treat the information you share with us with the care we advise you to take.',
        },
        {
          title: 'Practicality',
          description:
            'We recommend what your organisation can realistically adopt and keep doing.',
        },
        {
          title: 'Continuous improvement',
          description:
            'We expect controls and our own work to be reviewed and to get better over time.',
        },
      ],
    }),
    block('approachSteps', {
      kicker: 'Our approach',
      title: 'A structured approach to governance, risk and compliance',
      lead: 'Five steps, from understanding where you are to keeping controls effective as things change.',
      steps: approachSteps,
    }),
    block('ctaBand', {
      title: 'Talk to us about your requirements',
      body: 'Tell us what you are working towards and we will advise on where to start.',
      primary: cta('Request a consultation', '/contact'),
    }),
  ],
);

// --- page: services --------------------------------------------------------------------------------------------

const servicesPage = published(
  'services',
  'Services',
  'Services — GRC, Cybersecurity, Data Protection & AI Governance',
  'Eight advisory services: governance, risk and compliance, ISO readiness, data protection, AI governance, cybersecurity governance, technology risk, SOC 2 readiness, and audit and assurance.',
  [
    block('hero', {
      variant: 'page',
      title: 'Services',
      lead: 'Governance, risk, compliance, cybersecurity, data protection and AI governance, delivered as advisory work sized to your organisation.',
      illustration: 'governance',
      image: stockImage('glass-facade'),
    }),
    block('serviceList', {
      variant: 'catalogue',
      title: 'Our services',
      lead: 'Each service page sets out what the work covers, how we approach it and who it suits.',
      serviceSlugs,
    }),
    block('frameworkIndex', {
      title: 'Frameworks we advise on',
      lead: 'The standards and regulations our advice is built around. We help you prepare for them, and we do not issue certificates.',
      note: 'Advisory and readiness support only. Independent bodies carry out assessments and issue any certificate.',
      frameworkIds: [],
    }),
    block('approachSteps', {
      kicker: 'Our approach',
      title: 'A structured approach to governance, risk and compliance',
      lead: 'Five steps, from understanding where you are to keeping controls effective as things change.',
      steps: approachSteps,
    }),
    block('ctaBand', {
      title: 'Not sure which service you need?',
      body: 'Describe what you are trying to achieve and we will tell you where we can help.',
      primary: cta('Discuss your requirements', '/contact'),
    }),
  ],
);

// --- page: who-we-serve -----------------------------------------------------------------------------------

const whoWeServe = published(
  'who-we-serve',
  'Who we serve',
  'Who We Serve',
  'The organisations Ablin Limited advises: growing businesses, technology firms, regulated organisations, professional services and organisations adopting AI.',
  [
    block('hero', {
      variant: 'page',
      title: 'Who we serve',
      lead: 'We advise organisations that need to show they manage risk, protect information and adopt technology responsibly.',
      illustration: 'structure',
    }),
    block('audienceGrid', {
      variant: 'rows',
      title: 'Find your situation',
      lead: 'Each group lists the services most relevant to it.',
      audienceSlugs,
    }),
    block('ctaBand', {
      title: 'See where you fit',
      body: 'If your organisation is not described here, tell us about it. We will say whether we can help.',
      primary: cta('Speak to our consultants', '/contact'),
    }),
  ],
);

// --- page: insights (the listing page) --------------------------------------------------------------------

const insightsPage = published(
  'insights',
  'Insights',
  'Insights',
  'Practical guidance on governance, risk, compliance, data protection and AI governance from Ablin Limited.',
  [
    block('hero', {
      variant: 'page',
      title: 'Insights',
      lead: 'Practical guidance on governance, risk, compliance, data protection and AI governance.',
      illustration: 'audit',
      image: stockImage('geometric-facade'),
    }),
    block('ctaBand', {
      title: 'Suggest a topic or ask a question',
      body: 'Tell us what you would like guidance on.',
      primary: cta('Speak to our consultants', '/contact'),
    }),
  ],
);

// --- page: contact (no blocks — see admin/README.md) -------------------------------------------------------

const contactPage = published(
  'contact',
  'Contact us',
  'Contact Ablin',
  'Contact Ablin Limited about governance, risk, compliance, data protection, AI governance or cybersecurity.',
  [],
);

// --- legal pages: textRich(document) ----------------------------------------------------------------------

const privacyPolicy = published(
  'privacy-policy',
  'Privacy Policy',
  'Privacy Policy',
  'How Ablin Limited collects, uses and protects personal data.',
  [
    block('textRich', {
      variant: 'document',
      title: 'Privacy Policy',
      lead: 'This policy explains what personal data Ablin Limited collects through this website, why, and what your rights are.',
      updated: '19 September 2026',
      reviewStatus: 'draft',
      doc: doc(
        h2('Who we are'),
        p(
          'Ablin Limited is a United Kingdom governance, risk, compliance and technology advisory firm. We are the controller of the personal data described in this policy.',
        ),
        h2('What we collect'),
        p(
          'We collect personal data only when you give it to us or when your browser sends it to us.',
        ),
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
        p(
          'We will update this page if our practices change and show the date of the latest update.',
        ),
      ),
    }),
  ],
);

const cookiePolicy = published(
  'cookie-policy',
  'Cookie Policy',
  'Cookie Policy',
  'How Ablin Limited uses cookies and similar technologies on this website.',
  [
    block('textRich', {
      variant: 'document',
      title: 'Cookie Policy',
      lead: 'This policy explains which cookies and similar technologies this website uses and how you can control them.',
      updated: '19 September 2026',
      reviewStatus: 'draft',
      doc: doc(
        h2('What we use now'),
        p(
          "This website currently sets no analytics or advertising cookies. It stores one item in your browser's local storage: your light or dark theme choice. It stays on your device and is not sent to us.",
        ),
        h2('Analytics'),
        p(
          'If we introduce analytics, we will load it only after you accept it in a cookie banner, and we will update this policy to describe what it collects.',
        ),
        h2('Controlling storage'),
        p(
          'You can clear stored data or block cookies and site storage in your browser settings. The website works without them, but it will not remember your theme choice.',
        ),
      ),
    }),
  ],
);

const termsOfUse = published(
  'terms-of-use',
  'Terms of Use',
  'Terms of Use',
  'Terms that apply when you use the Ablin Limited website.',
  [
    block('textRich', {
      variant: 'document',
      title: 'Terms of Use',
      lead: 'By using this website you agree to these terms.',
      updated: '19 September 2026',
      reviewStatus: 'draft',
      doc: doc(
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
    }),
  ],
);

const accessibility = published(
  'accessibility',
  'Accessibility',
  'Accessibility',
  'Accessibility statement for the Ablin Limited website.',
  [
    block('textRich', {
      variant: 'document',
      title: 'Accessibility',
      lead: 'We want everyone to be able to use this website, including people who use assistive technology.',
      updated: '19 September 2026',
      reviewStatus: 'draft',
      doc: doc(
        h2('Our target'),
        p(
          'We are building this website to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.',
        ),
        h2('What we have done'),
        ul([
          'Semantic page structure with landmarks and a logical heading order.',
          'A skip link and full keyboard operation of navigation, the theme toggle and forms.',
          'Visible focus indicators on every interactive element.',
          'Colour contrast checked in both the light and dark themes.',
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
    }),
  ],
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
];

const bySlug = new Map(seedPages.map((page) => [page.slug, page]));

/** The seed document for one page, for the public route's fallback when Redis has no page:{slug} yet. */
export function seedPage(slug: PageSlug): PageDoc {
  const page = bySlug.get(slug);
  if (!page) throw new Error(`No seed data for page slug: ${slug}`);
  return page;
}
