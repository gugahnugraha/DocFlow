import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://docflow.vercel.app'; // Placeholder domain

  const tools = [
    'merge', 'split', 'compress', 'edit', 'watermark', 'page-numbers',
    'pdf-to-image', 'image-to-pdf', 'protect', 'unlock', 'rotate', 'reorder'
  ];

  const infoPages = ['about', 'privacy', 'faq', 'contact', 'donate', 'pricing'];

  const routes = ['', ...tools, ...infoPages].map((route) => ({
    url: `${baseUrl}/${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
