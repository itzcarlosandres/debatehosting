import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { Ticker } from '@/components/Ticker';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Política de Privacidad',
  description: 'Tratamiento de datos, cookies y privacidad en el observatorio Debatehosting.',
  alternates: {
    canonical: '/privacidad',
  },
};

export const dynamic = 'force-dynamic';

export default async function PrivacidadPage() {
  const settings = getSettings();
  const tickerItems = await prisma.tickerItem.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div className="home-layout">
      <Ticker items={tickerItems} />
      <Header settings={settings} />
      <main style={{ padding: '3.5rem 0 5rem' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ textDecoration: 'underline' }}>Inicio</Link>
            <span>/</span>
            <span>Legal</span>
            <span>/</span>
            <span style={{ color: 'var(--text-ink)' }}>Política de Privacidad</span>
          </div>

          <div className="kicker">POLÍTICA DE DATOS — MARZO 2026</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', marginBottom: '1.5rem', lineHeight: 1.15 }}>
            Política de <span className="italic-serif">Privacidad</span>
          </h1>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '2px solid var(--border-ink)',
              boxShadow: 'var(--shadow-solid)',
              padding: '2.5rem',
              borderRadius: '4px',
              lineHeight: 1.7,
              fontSize: '0.98rem',
              color: 'var(--text-ink)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginTop: 0, marginBottom: '0.6rem' }}>
              1. Privacidad por Diseño
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              En Debatehosting priorizamos la privacidad absoluta del lector. No comercializamos, vendemos ni cedemos bases de datos personales a terceros bajo ninguna circunstancia.
            </p>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.6rem' }}>
              2. Datos Recopilados y Auditorías
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Al utilizar nuestra herramienta de auditoría TTFB, se procesa la dirección o dominio introducido exclusivamente para ejecutar las consultas de DNS y latencia en tiempo real. No se almacena historial de navegación personal.
            </p>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.6rem' }}>
              3. Cookies y Enlaces de Afiliación
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Utilizamos cookies técnicas estrictamente necesarias para el correcto funcionamiento del portal y el registro anónimo de derivaciones de afiliados al hacer clic en ofertas externas.
            </p>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.6rem' }}>
              4. Ejercicio de Derechos (RGPD / LOPD)
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Cualquier usuario puede solicitar la baja o rectificación de su suscripción al boletín en cualquier momento dirigiéndose a <strong style={{ color: 'var(--text-ink)' }}>privacidad@debatehosting.com</strong>.
            </p>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
