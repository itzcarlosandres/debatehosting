import prisma from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { Ticker } from '@/components/Ticker';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Balanza } from '@/components/Balanza';
import Link from 'next/link';

export const metadata = {
  title: 'La Balanza Interactiva — Calibrador de Hosting y Servidores (2026)',
  description:
    'Ajusta los 4 controles según las prioridades de tu web: precio, velocidad TTFB, soporte técnico y facilidad de uso. Nuestra balanza algorítmica recalcula en tiempo real el ranking ideal para tu proyecto.',
  alternates: {
    canonical: '/balanza',
  },
};

export const dynamic = 'force-dynamic';

export default async function BalanzaPage() {
  const now = new Date();
  const settings = getSettings();

  // Consultar todos los proveedores activos desde la base de datos
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
            name: 'La Balanza Interactiva',
            item: `${baseUrl}/balanza`,
          },
        ],
      },
      {
        '@type': 'WebApplication',
        name: 'La Balanza Interactiva de Hosting',
        url: `${baseUrl}/balanza`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All',
        description:
          'Herramienta interactiva de calibración algorítmica de hosting web y servidores VPS basada en pruebas de estrés reales.',
      },
    ],
  };

  return (
    <div className="catalog-page-wrapper">
      {/* Datos Estructurados JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Ticker items={tickerItems} settings={settings} />
      <Header settings={settings} />

      <main>
        {/* Encabezado Editorial Idéntico a Cupones y Ofertas */}
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
          {/* Breadcrumb editorial con separación limpia */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ textDecoration: 'underline' }}>Inicio</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-ink)', fontWeight: 600 }}>La Balanza Interactiva</span>
          </div>

          {/* Encabezado Principal de la Herramienta */}
          <div style={{ marginBottom: '1rem' }}>
            <div className="kicker">CALIBRADOR EDITORIAL DE HOSTING — OBSERVATORIO 2026</div>
            <h1 style={{ fontSize: '3.4rem', marginBottom: '0.8rem', lineHeight: 1.1 }}>
              El Calibrador <span className="italic-serif">Personalizado</span> de Hosting.
            </h1>
            <p style={{ fontSize: '1.15rem', maxWidth: '780px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              No existe el &quot;mejor hosting universal&quot;: ajusta los 4 controles según las prioridades de tu web (precio de renovación, velocidad de carga TTFB, soporte en español o facilidad de uso). La balanza recalcula matemáticamente el ranking en tiempo real con datos de pruebas de estrés reales.
            </p>
          </div>
        </div>

        {/* Componente Interactivo de La Balanza con Presets */}
        <Balanza providers={providers} settings={settings} isPage={true} />
      </main>

      <Footer settings={settings} />
    </div>
  );
}
