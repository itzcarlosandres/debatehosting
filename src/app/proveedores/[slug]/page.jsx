import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { Ticker } from '@/components/Ticker';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProveedorDetail } from '@/components/ProveedorDetail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = (resolvedParams?.slug || params?.slug || '').toLowerCase().trim();

  const provider = await prisma.provider.findUnique({
    where: { slug },
    select: {
      name: true,
      plan: true,
      priceFrom: true,
      period: true,
      uptime: true,
      active: true,
      metaTitle: true,
      metaDescription: true,
    },
  });

  if (!provider || !provider.active) {
    return {
      title: 'Proveedor No Encontrado | Debatehosting',
      description: 'El proveedor de hosting solicitado no existe o no está activo.',
    };
  }

  const settings = getSettings();
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || settings?.siteUrl || 'https://debatehosting.com').replace(/\/+$/, '');

  const finalTitle = provider.metaTitle || `${provider.name} Hosting: Opiniones, Análisis y Descuentos (2026)`;
  const finalDesc = provider.metaDescription || `Análisis técnico y opiniones de ${provider.name} en 2026. Prueba de velocidad TTFB, plan ${provider.plan} desde $${provider.priceFrom}/${provider.period} y disponibilidad del ${provider.uptime}%.`;

  return {
    title: finalTitle,
    description: finalDesc,
    alternates: {
      canonical: `${baseUrl}/proveedores/${slug}`,
    },
    openGraph: {
      title: finalTitle,
      description: finalDesc,
      url: `${baseUrl}/proveedores/${slug}`,
      type: 'article',
    },
  };
}

export default async function ProveedorDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = (resolvedParams?.slug || params?.slug || '').toLowerCase().trim();

  if (!slug) notFound();

  const settings = getSettings();

  const [provider, otherProviders, tickerItems] = await Promise.all([
    prisma.provider.findUnique({
      where: { slug },
      include: {
        coupons: {
          where: { verified: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.provider.findMany({
      where: {
        active: true,
        slug: { not: slug },
      },
      take: 4,
      orderBy: { scoreRendimiento: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        plan: true,
        uptime: true,
        priceFrom: true,
        period: true,
        scoreRendimiento: true,
        scorePrecio: true,
      },
    }),
    prisma.tickerItem.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  if (!provider || !provider.active) {
    notFound();
  }

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || settings?.siteUrl || 'https://debatehosting.com').replace(/\/+$/, '');

  const avgScore = (
    ((provider.scorePrecio || 8) +
      (provider.scoreRendimiento || 8) +
      (provider.scoreSoporte || 8) +
      (provider.scoreFacilidad || 8)) /
    4
  ).toFixed(1);

  // Schema.org de tipo Review y Product
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Proveedores',
            item: `${baseUrl}/proveedores`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: provider.name,
            item: `${baseUrl}/proveedores/${provider.slug}`,
          },
        ],
      },
      {
        '@type': 'Product',
        name: `${provider.name} Hosting`,
        description: `Servicio de alojamiento web ${provider.name} con plan ${provider.plan} y uptime del ${provider.uptime}%.`,
        image: provider.logoUrl || `${baseUrl}/logo.svg`,
        offers: {
          '@type': 'Offer',
          price: provider.priceFrom.toString(),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${baseUrl}/go/${provider.slug}`,
        },
        review: {
          '@type': 'Review',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: avgScore,
            bestRating: '10',
            worstRating: '1',
          },
          author: {
            '@type': 'Organization',
            name: 'Debatehosting Editorial',
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: avgScore,
          bestRating: '10',
          worstRating: '1',
          ratingCount: Math.max(provider.clicks || 1, 12),
        },
      },
    ],
  };

  return (
    <div className="home-layout">
      {/* Schema.org Datos Estructurados */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Ticker items={tickerItems} />
      <Header settings={settings} />
      <main>
        <ProveedorDetail provider={provider} otherProviders={otherProviders} />
      </main>
      <Footer settings={settings} />
    </div>
  );
}
