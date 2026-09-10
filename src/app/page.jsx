import prisma from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { Ticker } from '@/components/Ticker';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Balanza } from '@/components/Balanza';
import { Elegidos } from '@/components/Elegidos';
import { Ofertas } from '@/components/Ofertas';
import { Cupones } from '@/components/Cupones';
import { News } from '@/components/News';
import { Footer } from '@/components/Footer';

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

  // Formatear categorías
  const providers = rawProviders.map((p) => {
    let cats = [];
    try {
      cats = JSON.parse(p.categories);
    } catch (e) {
      cats = [p.categories];
    }
    return { ...p, categories: cats };
  });

  const picks = rawPicks.map((pk) => {
    let cats = [];
    try {
      cats = JSON.parse(pk.provider.categories);
    } catch (e) {
      cats = [pk.provider.categories];
    }
    return {
      ...pk,
      provider: { ...pk.provider, categories: cats },
    };
  });

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
              ratingValue: (p.provider?.scoreRendimiento ? p.provider.scoreRendimiento / 10 : 9.5).toFixed(1),
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
        <Hero providers={providers} couponsCount={totalCouponsCount} />
        <Elegidos picks={picks} />
        <Ofertas providers={providers} />
        <Balanza providers={providers} />
        <Cupones providers={providers} />
        <News />
      </main>
      <Footer />
    </div>
  );
}
