import prisma from '@/lib/prisma';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://debatehosting.com';
  const now = new Date();

  // Páginas estáticas principales
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ofertas`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cupones`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auditor`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/afiliados`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Rutas dinámicas por categorías de hosting existentes
  let categoryRoutes = [];
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });

    categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/ofertas?cat=${encodeURIComponent(cat.slug)}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error generando sitemap dinámico para categorías:', error);
  }

  return [...staticRoutes, ...categoryRoutes];
}
