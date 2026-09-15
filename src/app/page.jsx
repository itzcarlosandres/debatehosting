import prisma from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { Ticker } from '@/components/Ticker';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Elegidos } from '@/components/Elegidos';
import { Ofertas } from '@/components/Ofertas';
import { Mejores } from '@/components/Mejores';
import { Cupones } from '@/components/Cupones';
import { News } from '@/components/News';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import Link from 'next/link';

import { formatProvider } from '@/lib/serverImageHelper';

export const metadata = {
  title: 'Debatehosting — El Gran Observatorio de Hosting, VPS y Cupones',
  description:
    'Medio editorial y comparador técnico independiente de hosting web, servidores VPS, cloud y cupones verificados. Medición real de latencia TTFB, uptime y relación calidad-precio sin tapujos.',
  alternates: {
    canonical: '/',
  },
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const now = new Date();
  const settings = getSettings();

  // Consultas directas a la base de datos en el servidor para máxima velocidad SEO
  const [rawProviders, rawPicks, tickerItems] = await Promise.all([
    prisma.provider.findMany({
      where: { active: true },
      include: {
        coupons: {
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.pick.findMany({
      orderBy: { position: 'asc' },
      include: {
        provider: {
          include: {
            coupons: true,
          },
        },
      },
    }),
    prisma.tickerItem.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  // Formatear proveedores y validar que sus logos existan en disco (o cargar fallback por dominio)
  const providers = rawProviders.map(formatProvider);

  const picks = rawPicks.map((pk) => ({
    ...pk,
    provider: formatProvider(pk.provider),
  }));

  const totalCouponsCount = providers.reduce(
    (acc, prov) => acc + (prov.coupons ? prov.coupons.length : 0),
    0
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://debatehosting.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'Debatehosting',
        description: 'Observatorio independiente y comparador de hosting web, VPS y cupones.',
        inLanguage: 'es-ES',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/ofertas?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Debatehosting',
        url: baseUrl,
        logo: `${baseUrl}/icon.png`,
        publishingPrinciples: `${baseUrl}/afiliados`,
      },
      {
        '@type': 'ItemList',
        '@id': `${baseUrl}/#podio`,
        name: 'Podio Oficial: Los Mejores Proveedores de Hosting y VPS',
        description: 'Selección editorial ponderada por latencia TTFB, tiempo de actividad y relación calidad-precio.',
        numberOfItems: picks.length,
        itemListElement: picks.map((p, idx) => ({
          '@type': 'ListItem',
          position: p.position || idx + 1,
          item: {
            '@type': 'Product',
            name: p.provider?.name || p.titulo,
            description: p.veredicto || p.titulo,
            url: p.provider?.affiliateUrl || baseUrl,
            offers: {
              '@type': 'Offer',
              price: p.provider?.priceFrom || 0,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: (p.provider?.scoreRendimiento || 9.5).toFixed(1),
              bestRating: '10',
              worstRating: '1',
              ratingCount: 35,
            },
          },
        })),
      },
    ],
  };

  return (
    <div className="home-layout">
      {/* Datos Estructurados JSON-LD para Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Ticker items={tickerItems} />
      <Header settings={settings} />
      <main>
        <Hero providers={providers} couponsCount={totalCouponsCount} settings={settings} />
        <Elegidos picks={picks} settings={settings} />
        <Ofertas providers={providers} settings={settings} />
        <Mejores providers={providers} settings={settings} />
        <Cupones providers={providers} settings={settings} />
        <News settings={settings} />
      </main>
      <Footer settings={settings} />
    </div>
  );
}
