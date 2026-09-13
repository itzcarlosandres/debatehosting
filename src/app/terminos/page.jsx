import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { Ticker } from '@/components/Ticker';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Términos de Servicio',
  description: 'Condiciones de uso y aviso legal de la publicación tecnológica independiente Debatehosting.',
  alternates: {
    canonical: '/terminos',
  },
};

export const dynamic = 'force-dynamic';

export default async function TerminosPage() {
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
            <span style={{ color: 'var(--text-ink)' }}>Términos de Servicio</span>
          </div>

          <div className="kicker">DOCUMENTO LEGAL — MARZO 2026</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', marginBottom: '1.5rem', lineHeight: 1.15 }}>
            Términos de <span className="italic-serif">Servicio</span>
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
              1. Naturaleza del Servicio
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Debatehosting es un observatorio y portal de análisis técnico independiente de infraestructura web, hosting y servidores. La información provista en esta plataforma tiene fines exclusivamente informativos y de comparación analítica.
            </p>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.6rem' }}>
              2. Uso del Contenido y Auditorías
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Los datos métricos de TTFB, latencia, pruebas de estrés y revisiones editoriales son propiedad de Debatehosting. Queda autorizada la cita con atribución y enlace directo al portal. No garantizamos que los precios y planes de terceros permanezcan invariables tras la fecha de publicación.
            </p>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.6rem' }}>
              3. Relación con Proveedores Externos
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Al contratar cualquier servicio mediante enlaces externos en nuestro sitio, la relación contractual y el soporte técnico corresponden única y exclusivamente a la empresa proveedora elegida por el usuario.
            </p>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.6rem' }}>
              4. Contacto y Consultas
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Para cualquier consulta sobre estos términos o aclaraciones de redacción técnica, puedes escribir a <strong style={{ color: 'var(--text-ink)' }}>redaccion@debatehosting.com</strong>.
            </p>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
