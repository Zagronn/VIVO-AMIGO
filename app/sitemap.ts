import type { MetadataRoute } from 'next';
import { GUATEMALA_SEO_KEYWORD_MAP } from '../config/seoKeywords';

const BASE_URL = 'https://vivoamigo.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified, changeFrequency: 'always', priority: 1.0 },
    { url: `${BASE_URL}/b2b`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/remates`, lastModified, changeFrequency: 'always', priority: 0.9 }
  ];

  const keywordPages: MetadataRoute.Sitemap = GUATEMALA_SEO_KEYWORD_MAP.map((item) => ({
    url: `${BASE_URL}/buscar/${item.slug}`,
    lastModified,
    changeFrequency: 'daily',
    priority: 0.8
  }));

  return [...staticPages, ...keywordPages];
}
