import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { Ticker } from '@/components/Ticker';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Aviso de Afiliación y Ética Editorial',
  description: 'Divulgación transparente del modelo de afiliación y compromiso editorial independiente de Debatehosting.',
  alternates: {
    canonical: '/afiliados',
  },
};

export const dynamic = 'force-dynamic';

export default async function AfiliadosPage() {
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
            <span style={{ color: 'var(--text-ink)' }}>Aviso de Afiliación</span>
          </div>

          <div className="kicker">DIVULGACIÓN TRANSPARENTE — ACTUALIZADO 2026</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', marginBottom: '1.5rem', lineHeight: 1.15 }}>
            Aviso de <span className="italic-serif">Afiliación</span>
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
              1. ¿Cómo se financia Debatehosting?
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Debatehosting es un portal de acceso público y gratuito. Para sostener nuestros costes de infraestructura, servidores de prueba dedicados, proxys globales y personal técnico, participamos en programas de afiliación con diversos proveedores de hosting y servidores.
            </p>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.6rem' }}>
              2. ¿Afecta esto a las notas y al Podio?
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <strong style={{ color: 'var(--text-ink)' }}>No, categóricamente.</strong> Ningún proveedor puede pagar para mejorar su puntuación técnica de TTFB, alterar los resultados de carga o comprar una posición en «El Podio». Si un servicio falla en nuestras pruebas de estrés o presenta caídas continuadas, se refleja en su puntuación sin excepción.
            </p>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.6rem' }}>
              3. Sin sobrecoste para el lector
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Cuando haces clic en un botón de «Visitar Sitio» o utilizas uno de nuestros cupones verificados, el precio que pagas es igual o más bajo que contratando directamente con la empresa proveedora, gracias a los descuentos exclusivos negociados.
            </p>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1.5px dashed var(--border-ink)' }}>
              <Link href="/auditor#metodo" className="btn btn-primary btn-sm">
                <span>Ver Metodología de Pruebas Completa</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
