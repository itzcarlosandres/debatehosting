import prisma from '@/lib/prisma';
import { getSettings } from '@/lib/settings';

export default async function sitemap() {
  const settings = getSettings();
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || settings?.siteUrl || 'https://debatehosting.com').replace(/\/+$/, '');
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
      url: `${baseUrl}/proveedores`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
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

  const dbUrl = process.env.DATABASE_URL || '';
  const isDbConfigured = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
  const isPlaceholder = dbUrl.includes('placeholder');

  if (!isDbConfigured || isPlaceholder) {
    return staticRoutes;
  }

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

  // Rutas dinámicas por proveedores activos
  let providerRoutes = [];
  try {
    const providers = await prisma.provider.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    });

    providerRoutes = providers.map((p) => ({
      url: `${baseUrl}/proveedores/${encodeURIComponent(p.slug)}`,
      lastModified: p.updatedAt || now,
      changeFrequency: 'daily',
      priority: 0.9,
    }));
  } catch (error) {
    console.error('Error generando sitemap dinámico para proveedores:', error);
  }

  return [...staticRoutes, ...categoryRoutes, ...providerRoutes];
}
