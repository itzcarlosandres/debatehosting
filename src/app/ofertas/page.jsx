import prisma from '@/lib/prisma';
import { Ticker } from '@/components/Ticker';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { OfertasCatalog } from '@/components/OfertasCatalog';

export const metadata = {
  title: 'Catálogo de Ofertas y Precios de Hosting (2026)',
  description:
    'Directorio comparativo con todas las ofertas de hosting web, servidores VPS y cloud. Compara precios mensuales reales, descuentos de renovación y especificaciones técnicas.',
  alternates: {
    canonical: '/ofertas',
  },
};

export const dynamic = 'force-dynamic';

export default async function OfertasPage() {
  const now = new Date();

  // Consultar todos los proveedores activos y titulares desde la base de datos
  const [rawProviders, tickerItems] = await Promise.all([
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
      orderBy: { priceFrom: 'asc' },
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://debatehosting.com';

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
            name: 'Ofertas de Hosting',
            item: `${baseUrl}/ofertas`,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${baseUrl}/ofertas#catalog`,
        name: 'Catálogo de Ofertas de Hosting y Servidores Web (2026)',
        description: 'Comparativa exhaustiva de precios, planes y descuentos en proveedores líderes de hosting.',
        url: `${baseUrl}/ofertas`,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: providers.length,
          itemListElement: providers.map((prov, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              name: prov.name,
              description: `Plan ${prov.plan} en ${prov.name}. Uptime auditado del ${prov.uptime}%.`,
              url: prov.affiliateUrl || `${baseUrl}/ofertas`,
              offers: {
                '@type': 'Offer',
                price: prov.priceFrom,
                priceCurrency: 'USD',
                priceSpecification: {
                  '@type': 'UnitPriceSpecification',
                  price: prov.priceFrom,
                  priceCurrency: 'USD',
                  unitText: prov.period === 'mes' ? 'MONTH' : 'YEAR',
                },
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: (prov.scoreRendimiento / 10).toFixed(1),
                bestRating: '10',
                worstRating: '1',
                ratingCount: 20,
              },
            },
          })),
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
      <Header />
      <main>
        <OfertasCatalog providers={providers} />
      </main>
      <Footer />
    </div>
  );
}
