import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/cms/site-meta';

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/api/', '/status'],
    },
    sitemap: `${await getSiteUrl()}/sitemap.xml`,
  };
}
