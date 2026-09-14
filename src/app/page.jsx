import prisma from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { Ticker } from '@/components/Ticker';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Elegidos } from '@/components/Elegidos';
import { Ofertas } from '@/components/Ofertas';
import { Cupones } from '@/components/Cupones';
import { News } from '@/components/News';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import Link from 'next/link';

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

        {/* Banner Teaser Editorial hacia la Herramienta La Balanza */}
        <section className="balanza-teaser-section" style={{ padding: '2.5rem 0', background: 'var(--bg-paper)', borderBottom: 'var(--border-width) solid var(--border-ink)' }}>
          <div className="container">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              flexWrap: 'wrap',
              background: 'var(--bg-surface)',
              border: '2px solid var(--border-ink)',
              boxShadow: '4px 4px 0 var(--border-ink)',
              padding: '1.75rem 2rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: '1 1 500px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '8px',
                  background: 'var(--green-tint)',
                  color: 'var(--green-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1.5px solid var(--green-primary)',
                  boxShadow: '2px 2px 0 var(--border-ink)'
                }}>
                  <Icon name="scale" size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--green-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>HERRAMIENTA ALGORÍTMICA</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', background: '#EBF3EA', color: '#0E6B41', padding: '0.08rem 0.4rem', borderRadius: '3px', fontWeight: 700, border: '1px solid rgba(14, 107, 65, 0.25)' }}>AI PRO</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-ink)', margin: 0, marginBottom: '0.2rem' }}>
                    ¿Prefieres ponderar tus propias prioridades?
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                    Calibra precio, velocidad TTFB, soporte y facilidad en vivo con nuestra Balanza Interactiva.
                  </p>
                </div>
              </div>
              <Link href="/balanza" className="btn btn-primary" style={{ flexShrink: 0, padding: '0.75rem 1.4rem' }}>
                <span>Abrir La Balanza Interactiva</span>
                <Icon name="arrowRight" size={15} />
              </Link>
            </div>
          </div>
        </section>

        <Cupones providers={providers} settings={settings} />
        <News settings={settings} />
      </main>
      <Footer settings={settings} />
    </div>
  );
}
