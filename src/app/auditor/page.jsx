import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Ticker } from '@/components/Ticker';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ServerAuditor } from '@/components/ServerAuditor';
import { Metodo } from '@/components/Metodo';

export const metadata = {
  title: 'Auditor de Servidores y Test TTFB en Vivo',
  description:
    'Inspecciona cualquier dominio en tiempo real: detecta su hosting real, servidor web (LiteSpeed, Nginx, Apache), CMS instalado y mide la latencia de respuesta TTFB en milisegundos.',
  alternates: {
    canonical: '/auditor',
  },
};

export const dynamic = 'force-dynamic';

export default async function AuditorPage() {
  const tickerItems = await prisma.tickerItem.findMany({
    orderBy: { order: 'asc' },
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
            name: 'Auditor de Servidores y TTFB',
            item: `${baseUrl}/auditor`,
          },
        ],
      },
      {
        '@type': 'WebApplication',
        '@id': `${baseUrl}/auditor#app`,
        name: 'Auditor de Servidores y Medidor TTFB Debatehosting',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        url: `${baseUrl}/auditor`,
        description: 'Herramienta técnica para auditar en tiempo real la infraestructura de un dominio: hosting real, servidor web, CMS y latencia TTFB.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${baseUrl}/auditor#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: '¿Qué es el TTFB (Time to First Byte) y por qué es crítico para el SEO?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'El TTFB (Time to First Byte) es el tiempo en milisegundos que transcurre desde que el cliente solicita una página hasta que el servidor web entrega el primer byte de respuesta. Es un indicador directo de la potencia y optimización del hosting, impactando directamente en los Core Web Vitals de Google.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Cómo detecta Debatehosting el proveedor de hosting real de un sitio?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Cruzamos las cabeceras HTTP de respuesta, registros DNS, bloques CIDR y números de Sistema Autónomo (ASN) con nuestra base de datos de firmas de infraestructura en tiempo real.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Influyen los acuerdos de afiliación en las puntuaciones y auditorías?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Las auditorías técnicas de latencia, uptime y las posiciones del podio son calculadas mediante telemetría objetiva y criterios técnicos verificables. Ningún proveedor puede pagar por alterar sus métricas en Debatehosting.',
            },
          },
        ],
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
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
          {/* Breadcrumb editorial */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ textDecoration: 'underline' }}>Inicio</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-ink)', fontWeight: 600 }}>Auditor de Servidores y Metodología</span>
          </div>

          <ServerAuditor isCompact={false} />

          {/* Metodología de Pruebas, Ética Editorial y Transparencia */}
          <div style={{ marginTop: '4rem' }}>
            <Metodo />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
