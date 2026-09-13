import prisma from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { Ticker } from '@/components/Ticker';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProveedoresCatalog } from '@/components/ProveedoresCatalog';

export const metadata = {
  title: 'Directorio de Proveedores de Hosting Web (Edición 2026) | Comparativas y Auditoría',
  description:
    'Directorio exhaustivo y comparativa técnica de las mejores empresas de hosting y servidores VPS en 2026. Benchmarks de velocidad TTFB, estabilidad de red, soporte técnico en español y ofertas auditadas.',
  alternates: {
    canonical: '/proveedores',
  },
};

export const dynamic = 'force-dynamic';

export default async function ProveedoresPage() {
  const settings = getSettings();
  const [rawProviders, categories, tickerItems] = await Promise.all([
    prisma.provider.findMany({
      where: { active: true },
      include: {
        coupons: {
          where: { verified: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { scoreRendimiento: 'desc' },
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
    }),
    prisma.tickerItem.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || settings?.siteUrl || 'https://debatehosting.com').replace(/\/+$/, '');

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
            name: 'Proveedores de Hosting',
            item: `${baseUrl}/proveedores`,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${baseUrl}/proveedores#list`,
        name: 'Directorio Oficial de Proveedores de Hosting Web (2026)',
        description:
          'Comparativa independiente de las principales empresas de alojamiento web y servidores VPS auditadas con pruebas técnicas reales.',
        url: `${baseUrl}/proveedores`,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: rawProviders.length,
          itemListElement: rawProviders.map((prov, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Organization',
              name: prov.name,
              url: `${baseUrl}/proveedores/${prov.slug}`,
              description: `Alojamiento web con plan ${prov.plan} desde $${prov.priceFrom}/${prov.period}. Uptime auditado del ${prov.uptime}%.`,
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
        <ProveedoresCatalog providers={rawProviders} categories={categories} />
      </main>
      <Footer settings={settings} />
    </div>
  );
}
