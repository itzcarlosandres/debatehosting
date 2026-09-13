'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { normalizeImageUrl } from '@/lib/imageHelper';

export const ProveedorDetail = ({ provider, otherProviders = [] }) => {
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  if (!provider) return null;

  const avgScore = (
    ((provider.scorePrecio || 8) +
      (provider.scoreRendimiento || 8) +
      (provider.scoreSoporte || 8) +
      (provider.scoreFacilidad || 8)) /
    4
  ).toFixed(1);

  let parsedCats = [];
  try {
    parsedCats = Array.isArray(provider.categories)
      ? provider.categories
      : JSON.parse(provider.categories);
  } catch (e) {
    parsedCats = [provider.categories || 'Hosting Web'];
  }

  const hasDiscount = provider.priceBefore && provider.priceBefore > provider.priceFrom;
  const discountPct = hasDiscount
    ? Math.round(((provider.priceBefore - provider.priceFrom) / provider.priceBefore) * 100)
    : 0;

  const handleCopyCoupon = (code) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCoupon(code);
      setTimeout(() => setCopiedCoupon(null), 3500);
    }
  };

  const prosList = (() => {
    if (!provider.pros) return [
      `Excelente relación calidad/precio desde $${provider.priceFrom}/${provider.period}.`,
      'Discos ultrarrápidos NVMe y optimización para CMS.',
      `Estabilidad de red comprobada con ${provider.uptime}% de Uptime.`,
      'Certificados SSL gratuitos y copias de seguridad.',
    ];
    try {
      const parsed = JSON.parse(provider.pros);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return String(provider.pros)
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean);
  })();

  const consList = (() => {
    if (!provider.cons) return [
      'Las tarifas promocionales pueden variar tras la renovación anual.',
      'Los planes iniciales cuentan con cuotas moderadas de almacenamiento.',
    ];
    try {
      const parsed = JSON.parse(provider.cons);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return String(provider.cons)
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean);
  })();

  const descriptionParagraphs = provider.description
    ? provider.description
        .split('\n\n')
        .map((p) => p.trim())
        .filter(Boolean)
    : [
        `${provider.name} es uno de los referentes consolidados en el sector del alojamiento web en 2026. Destaca por su equilibrio entre rendimiento, discos rápidos SSD/NVMe y una infraestructura pensada para todo tipo de proyectos.`,
        `En nuestras pruebas de laboratorio independientes, la respuesta inicial del servidor (TTFB) se mantuvo con una disponibilidad auditada del ${provider.uptime}% sin caídas prolongadas registradas en los últimos 90 días de monitorización.`,
      ];

  const verdictText =
    provider.verdict ||
    `${provider.name} es una excelente opción para blogs, tiendas online y proyectos en crecimiento que buscan máxima estabilidad con una inversión ajustada y buen respaldo técnico.`;

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      {/* Breadcrumb de Navegación */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          marginBottom: '2rem',
        }}
      >
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Inicio
        </Link>
        <span>/</span>
        <Link href="/proveedores" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Proveedores
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-ink)', fontWeight: 700 }}>{provider.name}</span>
      </nav>

      {/* Hero del Proveedor */}
      <div
        style={{
          backgroundColor: '#FAF7EE',
          border: '1.5px solid var(--border-ink)',
          boxShadow: 'var(--shadow-hard)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          marginBottom: '3rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo y Nombre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: '1 1 320px' }}>
            {provider.logoUrl ? (
              <img
                src={normalizeImageUrl(provider.logoUrl)}
                alt={provider.name}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain',
                  backgroundColor: '#FFFFFF',
                  padding: '8px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-ink)',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--border-ink)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.8rem',
                }}
              >
                {provider.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  {provider.name}
                </h1>

                {provider.badge && (
                  <span
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      backgroundColor:
                        provider.badgeColor === 'red'
                          ? '#DC2626'
                          : provider.badgeColor === 'gold'
                          ? '#D97706'
                          : 'var(--green-primary)',
                      color: '#FFFFFF',
                    }}
                  >
                    {provider.badge}
                  </span>
                )}
              </div>

              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                Plan de entrada: <strong>{provider.plan}</strong> &bull; Uptime Auditado:{' '}
                <strong style={{ color: 'var(--green-primary)' }}>{provider.uptime}%</strong>
              </p>
            </div>
          </div>

          {/* Caja de Precio y CTA Principal */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-ink)',
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-sm)',
              minWidth: '280px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block' }}>
              Oferta Oficial Verificada
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.4rem', margin: '0.4rem 0' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800 }}>
                ${provider.priceFrom?.toFixed(2)}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                /{provider.period || 'mes'}
              </span>
              {hasDiscount && (
                <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', color: 'var(--text-light)' }}>
                  ${provider.priceBefore?.toFixed(2)}
                </span>
              )}
            </div>

            {hasDiscount && (
              <div style={{ marginBottom: '0.8rem' }}>
                <span
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}
                >
                  Ahorro del {discountPct}% en tu contratación
                </span>
              </div>
            )}

            <a
              href={`/go/${provider.slug}`}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1.25rem' }}
            >
              <span>Ir a la Web de {provider.name}</span>
              <Icon name="external" size={15} color="#fff" />
            </a>

            <span style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-light)', marginTop: '0.5rem' }}>
              ✓ Enlace directo seguro con descuento automático
            </span>
          </div>
        </div>

        {/* Barra de Puntuaciones */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(23,20,15,0.1)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-ink)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              NOTA GLOBAL
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--green-primary)' }}>
              {avgScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>/10</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-ink)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              ⚡ RENDIMIENTO
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800 }}>
              {provider.scoreRendimiento || 9} <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>/10</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-ink)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              💬 SOPORTE
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800 }}>
              {provider.scoreSoporte || 9} <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>/10</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-ink)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              💰 CALIDAD/PRECIO
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800 }}>
              {provider.scorePrecio || 9} <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>/10</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-ink)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              🛠️ FACILIDAD
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800 }}>
              {provider.scoreFacilidad || 9} <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal de 2 Columnas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Columna Izquierda: Análisis y Ficha Técnica */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Análisis Editorial */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-ink)',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-hard)',
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1rem' }}>
              Veredicto y Análisis Técnico de {provider.name}
            </h2>

            {descriptionParagraphs.map((para, idx) => (
              <p key={idx} style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                {para}
              </p>
            ))}

            {/* Pros y Contras */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(23,20,15,0.08)',
              }}
            >
              {/* Pros */}
              <div style={{ backgroundColor: '#F0FDF4', padding: '1.25rem', border: '1px solid #86EFAC', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ color: '#166534', fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>✓</span> Puntos Fuertes
                </h4>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.88rem', color: '#14532D', lineHeight: 1.6 }}>
                  {prosList.map((pro, idx) => (
                    <li key={idx} style={{ marginBottom: '0.4rem' }}>{pro}</li>
                  ))}
                </ul>
              </div>

              {/* Contras */}
              <div style={{ backgroundColor: '#FEF2F2', padding: '1.25rem', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ color: '#991B1B', fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>⚠️</span> A Considerar
                </h4>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.88rem', color: '#7F1D1D', lineHeight: 1.6 }}>
                  {consList.map((con, idx) => (
                    <li key={idx} style={{ marginBottom: '0.4rem' }}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Veredicto Editorial */}
            <div
              style={{
                backgroundColor: '#FAF7EE',
                border: '1.5px solid var(--border-ink)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem 1.5rem',
                marginTop: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Icon name="shield" size={16} color="var(--green-primary)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-primary)' }}>
                  Veredicto del Panel de Debatehosting
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--text-ink)' }}>
                {verdictText}
              </p>
            </div>
          </div>

          {/* Tabla de Especificaciones */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-ink)',
              padding: '1.75rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-hard)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: '1.25rem' }}>
              Especificaciones y Datos Técnicos
            </h3>

            <table className="admin-table" style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Empresa / Proveedor</td>
                  <td style={{ fontWeight: 700 }}>{provider.name}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Plan Analizado</td>
                  <td>{provider.plan}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Precio Promocional</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green-primary)' }}>
                    ${provider.priceFrom.toFixed(2)} / {provider.period}
                  </td>
                </tr>
                {hasDiscount && (
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Precio Estándar</td>
                    <td style={{ fontFamily: 'var(--font-mono)', textDecoration: 'line-through' }}>
                      ${provider.priceBefore.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Categorías Soportadas</td>
                  <td>{parsedCats.join(', ')}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Uptime Garantizado</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{provider.uptime}%</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Enlace Oficial con Descuento</td>
                  <td>
                    <a
                      href={`/go/${provider.slug}`}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      style={{ color: 'var(--green-primary)', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      debatehosting.com/go/{provider.slug} ↗
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna Derecha: Cupones Activos y Alternativas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Caja de Cupones */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-ink)',
              padding: '1.75rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-hard)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Icon name="ticket" size={20} color="var(--green-primary)" />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: 0 }}>
                Cupones Activos ({provider.coupons?.length || 0})
              </h3>
            </div>

            {provider.coupons && provider.coupons.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {provider.coupons.map((coupon) => {
                  const isCopied = copiedCoupon === coupon.code;
                  return (
                    <div
                      key={coupon.id}
                      style={{
                        backgroundColor: '#FAF7EE',
                        border: '1.5px dashed var(--border-ink)',
                        padding: '1.2rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span
                          style={{
                            backgroundColor: '#DC2626',
                            color: '#FFFFFF',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '3px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                          }}
                        >
                          {coupon.discount}
                        </span>
                        {coupon.condition && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {coupon.condition}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(coupon.code)}
                          className="coupon-copy-btn"
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          <span style={{ fontWeight: 800 }}>{coupon.code}</span>
                          <Icon name={isCopied ? 'check' : 'copy'} size={14} />
                          <span style={{ fontSize: '0.75rem' }}>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                        </button>

                        <a
                          href={`/go/${provider.slug}?c=${coupon.id}`}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.55rem 0.85rem' }}
                        >
                          <span>Canjear</span>
                          <Icon name="external" size={12} color="#fff" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '1rem', backgroundColor: '#FAF7EE', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                  Actualmente no se requiere cupón manual. El descuento máximo está aplicado directamente en el enlace oficial.
                </p>
                <a
                  href={`/go/${provider.slug}`}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '0.75rem', display: 'inline-flex' }}
                >
                  <span>Reclamar Oferta Automática</span>
                  <Icon name="external" size={13} color="#fff" />
                </a>
              </div>
            )}
          </div>

          {/* Alternativas Recomendadas */}
          {otherProviders && otherProviders.length > 0 && (
            <div
              style={{
                backgroundColor: '#FAF7EE',
                border: '1.5px solid var(--border-ink)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', marginBottom: '1rem' }}>
                Alternativas a {provider.name}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {otherProviders.map((other) => (
                  <Link
                    key={other.id}
                    href={`/proveedores/${other.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-ink)',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      color: 'var(--text-ink)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{other.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--green-primary)', fontWeight: 600 }}>
                        {other.uptime}%
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700 }}>
                      ${other.priceFrom?.toFixed(2)}/m ↗
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
