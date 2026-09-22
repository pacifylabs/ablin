/**
 * Every Redis key the admin CMS uses, in one place, exactly as specified in the build brief. Nothing outside
 * this file should write a key literal, so a typo'd key is a compile error rather than a silent miss.
 */
export const keys = {
  adminUser: 'admin:user',
  session: (token: string) => `session:${token}`,
  sessionsIndex: 'sessions:index',
  reset: (token: string) => `reset:${token}`,

  availability: 'settings:availability',
  /** Not in the original build brief's schema — added so the footer slider and frameworkIndex blocks' list of
   *  frameworks (previously fixed content/frameworks.json) can be edited from /admin/frameworks. */
  frameworks: 'settings:frameworks',

  page: (slug: string) => `page:${slug}`,
  pagesIndex: 'pages:index',

  article: (slug: string) => `insights:article:${slug}`,
  articlesIndex: 'insights:index',
  articleDrafts: 'insights:drafts',
  topicsIndex: 'topics:index',

  submission: (id: string) => `submission:${id}`,
  submissionsIndex: 'submissions:index',
  submissionsUnreadCount: 'submissions:unread_count',

  /** Not in the brief's schema; added for server-side rate limiting that holds across serverless instances
   *  (the existing in-memory limiter cannot). One counter per scope+identity, expired by Redis via its own TTL. */
  rateLimit: (scope: string, identity: string) => `ratelimit:${scope}:${identity}`,
} as const;
