import prisma from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { Ticker } from '@/components/Ticker';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CuponesCatalog } from '@/components/CuponesCatalog';

export const metadata = {
  title: 'Cupones de Hosting y Códigos de Descuento (2026)',
  description:
    'Directorio exclusivo con los cupones de descuento y códigos promocionales verificados para hosting, dominios y servidores VPS. Descuentos de hasta el 80% con códigos activos y probados.',
  alternates: {
    canonical: '/cupones',
  },
};

export const dynamic = 'force-dynamic';

export default async function CuponesPage() {
  const now = new Date();
  const settings = getSettings();

  // Consultar proveedores activos que tengan cupones o catálogo de cupones
  const [rawProviders, tickerItems] = await Promise.all([
    prisma.provider.findMany({
      where: {
        active: true,
        coupons: {
          some: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
        },
      },
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

  // Extraer todos los cupones activos para el schema
  const allCoupons = providers.flatMap((p) =>
    (p.coupons || []).map((c) => ({
      providerName: p.name,
      affiliateUrl: p.affiliateUrl,
      code: c.code,
      discount: c.discount,
      condition: c.condition,
    }))
  );

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
            name: 'Cupones de Descuento',
            item: `${baseUrl}/cupones`,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${baseUrl}/cupones#list`,
        name: 'Cupones y Códigos de Descuento de Hosting Verificados (2026)',
        description: 'Rebajas y códigos promocionales activos para contratación de hosting, VPS y dominios.',
        url: `${baseUrl}/cupones`,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: allCoupons.length,
          itemListElement: allCoupons.map((coupon, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Offer',
              name: `Cupón ${coupon.discount} en ${coupon.providerName}`,
              description: coupon.condition || `Descuento de ${coupon.discount} en planes seleccionados.`,
              url: coupon.affiliateUrl || `${baseUrl}/cupones`,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              seller: {
                '@type': 'Organization',
                name: coupon.providerName,
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
      <Header settings={settings} />
      <main>
        <CuponesCatalog providers={providers} />
      </main>
      <Footer settings={settings} />
    </div>
  );
}
