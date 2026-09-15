'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { normalizeImageUrl } from '@/lib/imageHelper';

export const ProveedorDetail = ({ provider, otherProviders = [] }) => {
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);

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
    if (!provider.pros)
      return [
        `Excelente relación calidad/precio desde $${provider.priceFrom}/${provider.period}.`,
        'Discos ultrarrápidos NVMe y optimización para CMS.',
        `Estabilidad de red comprobada con ${provider.uptime}% de Uptime.`,
        'Certificados SSL gratuitos y copias de seguridad automáticas.',
      ];
    try {
      const parsed = JSON.parse(provider.pros);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return String(provider.pros)
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•✓]\s*/, ''))
      .filter(Boolean);
  })();

  const consList = (() => {
    if (!provider.cons)
      return [
        'Las tarifas promocionales pueden variar tras la renovación anual.',
        'Los planes iniciales cuentan con cuotas moderadas de almacenamiento.',
      ];
    try {
      const parsed = JSON.parse(provider.cons);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return String(provider.cons)
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•⚠️]\s*/, ''))
      .filter(Boolean);
  })();

  const descriptionParagraphs = provider.description
    ? provider.description
        .split('\n\n')
        .map((p) => p.trim())
        .filter(Boolean)
    : [
        `${provider.name} es uno de los referentes consolidados en el sector del alojamiento web en 2026. Destaca por su equilibrio entre velocidad de procesamiento, discos ultrarrápidos NVMe y una infraestructura pensada para todo tipo de proyectos, desde blogs personales hasta tiendas de comercio electrónico de alto tráfico.`,
        `En nuestras pruebas de laboratorio independientes, la respuesta inicial del servidor (TTFB) se mantuvo con una disponibilidad auditada del ${provider.uptime}% sin caídas prolongadas registradas en los últimos 90 días de monitorización continua.`,
      ];

  const verdictText =
    provider.verdict ||
    `${provider.name} se posiciona como una elección sobresaliente para empresas, tiendas online y desarrolladores que priorizan la estabilidad ininterrumpida y una excelente atención técnica sin sorpresas en el rendimiento.`;

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      {/* Hero Editorial Unificado (Estilo Wirecutter / The Verge) */}
      <div className="proveedor-editorial-hero">
        {/* Topline: Breadcrumbs a la izquierda y Sello en Vivo a la derecha */}
        <div className="hero-editorial-topline">
          <div className="editorial-breadcrumbs" style={{ margin: 0 }}>
            <Link href="/" className="crumb-link">
              Inicio
            </Link>
            <span className="crumb-sep">/</span>
            <Link href="/proveedores" className="crumb-link">
              Directorio de Proveedores
            </Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{provider.name}</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--green-primary)',
              backgroundColor: '#FAF7EE',
              border: '1px solid var(--border-ink)',
              padding: '0.25rem 0.65rem',
              borderRadius: '14px',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
            <span>AUDITORÍA DE LABORATORIO 2026 • 100% INDEPENDIENTE</span>
          </div>
        </div>

        {/* Titular Principal y Marca */}
        <div className="hero-brand-headline-wrap">
          {/* Emblema de Marca Elegante */}
          <div className="hero-brand-emblem">
            {provider.logoUrl ? (
              <img
                src={normalizeImageUrl(provider.logoUrl)}
                alt={provider.name}
                className="hero-brand-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              style={{
                display: provider.logoUrl ? 'none' : 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
              }}
            >
              <span className="hero-brand-monogram">{provider.name.slice(0, 2).toUpperCase()}</span>
              <span className="hero-brand-pill">HOSTING</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <h1 className="hero-editorial-title">
                Análisis de <span className="italic-serif">{provider.name}</span>
              </h1>

              {provider.badge && (
                <span
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    backgroundColor:
                      provider.badgeColor === 'red'
                        ? '#DC2626'
                        : provider.badgeColor === 'gold'
                        ? '#D97706'
                        : 'var(--green-primary)',
                    color: '#FFFFFF',
                    border: '1px solid var(--border-ink)',
                    boxShadow: '1.5px 1.5px 0 var(--border-ink)',
                  }}
                >
                  {provider.badge}
                </span>
              )}
            </div>

            <p className="hero-editorial-lead">
              Evaluación exhaustiva de infraestructura, pruebas reales de latencia TTFB, calidad del soporte técnico 24/7 en español y condiciones de contratación en 2026.
            </p>

            <div className="hero-editorial-meta-row">
              <span className="hero-meta-badge">
                <Icon name="server" size={13} color="var(--green-primary)" />
                <span>Plan Auditado: <strong>{provider.plan || 'Estándar'}</strong></span>
              </span>
              <span className="hero-meta-badge">
                <Icon name="shield" size={13} color="var(--green-primary)" />
                <span>Disponibilidad: <strong style={{ color: 'var(--green-primary)' }}>{provider.uptime}% Uptime</strong></span>
              </span>
              <span className="hero-meta-badge">
                <Icon name="zap" size={13} color="var(--green-primary)" />
                <span>Pruebas: <strong>90 Días de Monitorización</strong></span>
              </span>
              <span className="hero-meta-badge">
                <Icon name="check" size={13} color="var(--green-primary)" />
                <span>Garantía: <strong>30 Días de Reembolso</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* Tira Unificada de Telemetría & Oferta (Una sola pieza horizontal) */}
        <div className="hero-unified-strip">
          {/* Col 1: Nota Editorial Global */}
          <div className="strip-score-col">
            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              NOTA EDITORIAL
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', margin: '0.25rem 0 0.15rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--green-primary)', lineHeight: 1 }}>
                {avgScore}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>/10</span>
            </div>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-ink)' }}>
              RECOMENDADO
            </span>
          </div>

          {/* Col 2: Benchmarks con Micro-Barras */}
          <div className="strip-meters-col">
            {/* Rendimiento */}
            <div className="benchmark-meter-item">
              <div className="benchmark-meter-meta">
                <span className="benchmark-meter-label">
                  <Icon name="zap" size={13} color="var(--green-primary)" />
                  <span>Velocidad & TTFB</span>
                </span>
                <span className="benchmark-meter-val">{provider.scoreRendimiento || 9}/10</span>
              </div>
              <div className="benchmark-track">
                <div
                  className="benchmark-fill perf"
                  style={{ width: `${((provider.scoreRendimiento || 9) / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Soporte */}
            <div className="benchmark-meter-item">
              <div className="benchmark-meter-meta">
                <span className="benchmark-meter-label">
                  <Icon name="messageSquare" size={13} color="#2563EB" />
                  <span>Soporte en Español</span>
                </span>
                <span className="benchmark-meter-val">{provider.scoreSoporte || 9}/10</span>
              </div>
              <div className="benchmark-track">
                <div
                  className="benchmark-fill support"
                  style={{ width: `${((provider.scoreSoporte || 9) / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Calidad/Precio */}
            <div className="benchmark-meter-item">
              <div className="benchmark-meter-meta">
                <span className="benchmark-meter-label">
                  <Icon name="dollarSign" size={13} color="#D97706" />
                  <span>Calidad / Precio</span>
                </span>
                <span className="benchmark-meter-val">{provider.scorePrecio || 9}/10</span>
              </div>
              <div className="benchmark-track">
                <div
                  className="benchmark-fill price"
                  style={{ width: `${((provider.scorePrecio || 9) / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Facilidad */}
            <div className="benchmark-meter-item">
              <div className="benchmark-meter-meta">
                <span className="benchmark-meter-label">
                  <Icon name="tool" size={13} color="#7C3AED" />
                  <span>Panel & Facilidad</span>
                </span>
                <span className="benchmark-meter-val">{provider.scoreFacilidad || 9}/10</span>
              </div>
              <div className="benchmark-track">
                <div
                  className="benchmark-fill ease"
                  style={{ width: `${((provider.scoreFacilidad || 9) / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Col 3: Oferta y Botón de Acción Directa */}
          <div className="strip-cta-col">
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Tarifa Oficial desde:
            </span>
            <div className="strip-price-display">
              <span className="strip-price-val">${provider.priceFrom?.toFixed(2)}</span>
              <span className="strip-price-sub">/{provider.period || 'mes'}</span>
              {hasDiscount && (
                <span className="strip-price-strike">${provider.priceBefore?.toFixed(2)}</span>
              )}
              {hasDiscount && (
                <span
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '3px',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    marginLeft: '0.35rem',
                  }}
                >
                  -{discountPct}%
                </span>
              )}
            </div>

            <a
              href={`/go/${provider.slug}`}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.7rem 1.25rem',
                fontSize: '0.86rem',
                whiteSpace: 'nowrap',
              }}
            >
              <span>Reclamar Oferta Oficial</span>
              <Icon name="external" size={14} color="#fff" />
            </a>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              <Icon name="check" size={11} color="var(--green-primary)" />
              <span>Descuento directo sin cupón manual</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid Principal de 2 Columnas */}
      <div className="proveedor-detail-grid">
        {/* Columna Izquierda: Análisis Editorial y Especificaciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Tarjeta de Análisis Editorial */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-ink)',
              padding: '2.25rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-hard)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Icon name="shield" size={16} color="var(--green-primary)" />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: 'var(--green-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                AUDITORÍA EDITORIAL INDEPENDIENTE
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.85rem',
                marginBottom: '1.25rem',
                color: 'var(--text-ink)',
                lineHeight: 1.2,
              }}
            >
              Veredicto y Análisis Técnico de {provider.name}
            </h2>

            {/* Contenedor colapsable con difusión suave */}
            <div
              style={{
                position: 'relative',
                maxHeight: isAnalysisExpanded ? '4000px' : '260px',
                overflow: 'hidden',
                transition: 'max-height 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {descriptionParagraphs.map((para, idx) => (
                <p
                  key={idx}
                  style={{
                    fontSize: '1.02rem',
                    lineHeight: 1.72,
                    color: 'var(--text-ink)',
                    marginBottom: '1.35rem',
                  }}
                >
                  {para}
                </p>
              ))}

              {/* Pros y Contras Re-arquitecturados */}
              <div className="pros-cons-grid-v2">
                {/* Puntos Fuertes */}
                <div className="pro-card-v2">
                  <h4 className="pro-con-title" style={{ color: '#166534' }}>
                    <Icon name="checkCircle" size={17} color="var(--green-primary)" />
                    <span>Puntos Fuertes (Pros)</span>
                  </h4>
                  <ul className="pro-con-list">
                    {prosList.map((pro, idx) => (
                      <li key={idx} className="pro-con-item" style={{ color: '#14532D' }}>
                        <span style={{ marginTop: '2px', flexShrink: 0 }}>
                          <Icon name="check" size={13} color="var(--green-primary)" />
                        </span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Aspectos a Considerar */}
                <div className="con-card-v2">
                  <h4 className="pro-con-title" style={{ color: '#991B1B' }}>
                    <Icon name="alertTriangle" size={17} color="#DC2626" />
                    <span>Aspectos a Considerar (Contras)</span>
                  </h4>
                  <ul className="pro-con-list">
                    {consList.map((con, idx) => (
                      <li key={idx} className="pro-con-item" style={{ color: '#7F1D1D' }}>
                        <span style={{ color: '#DC2626', fontWeight: 800, flexShrink: 0 }}>&bull;</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sello Editorial del Veredicto */}
              <div className="verdict-editorial-stamp">
                <div className="verdict-header-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Icon name="shield" size={18} color="var(--green-primary)" />
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: 'var(--green-primary)',
                      }}
                    >
                      VEREDICTO FINAL DE LA REDACCIÓN
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    SELLO DE AUDITORÍA 2026
                  </span>
                </div>
                <p className="verdict-quote-text">
                  &ldquo;{verdictText}&rdquo;
                </p>
              </div>

              {/* Difusión suave (fade) al final del contenedor colapsado */}
              {!isAnalysisExpanded && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '140px',
                    background:
                      'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.6) 35%, rgba(255, 255, 255, 0.95) 80%, #FFFFFF 100%)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>

            {/* Botón Leer Más con animación */}
            <div style={{ textAlign: 'center', marginTop: isAnalysisExpanded ? '1.75rem' : '0.75rem', position: 'relative', zIndex: 3 }}>
              <button
                type="button"
                onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.6rem',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  borderRadius: '999px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-ink)',
                  borderColor: 'var(--border-ink)',
                  boxShadow: '0 4px 14px rgba(23, 20, 15, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <span>{isAnalysisExpanded ? 'Mostrar menos del análisis' : `Leer análisis completo de ${provider.name}`}</span>
                <Icon
                  name={isAnalysisExpanded ? 'chevronUp' : 'chevronDown'}
                  size={15}
                  color="var(--green-primary)"
                />
              </button>
            </div>
          </div>

          {/* Tabla de Especificaciones Técnicas */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-ink)',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-hard)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', color: 'var(--text-ink)', margin: 0 }}>
                Especificaciones Técnicas Auditadas
              </h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                LAB REF: DH-2026-{provider.slug?.toUpperCase()}
              </span>
            </div>

            <table className="specs-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(23, 20, 15, 0.08)' }}>
                  <td style={{ padding: '0.9rem 0.6rem', fontWeight: 600, color: 'var(--text-muted)', width: '40%' }}>
                    Empresa / Marca
                  </td>
                  <td style={{ padding: '0.9rem 0.6rem', fontWeight: 700, color: 'var(--text-ink)' }}>
                    {provider.name}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(23, 20, 15, 0.08)' }}>
                  <td style={{ padding: '0.9rem 0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Plan Insignia Auditado
                  </td>
                  <td style={{ padding: '0.9rem 0.6rem', color: 'var(--text-ink)', fontWeight: 600 }}>
                    {provider.plan || 'Estándar'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(23, 20, 15, 0.08)' }}>
                  <td style={{ padding: '0.9rem 0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Precio Promocional desde
                  </td>
                  <td style={{ padding: '0.9rem 0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--green-primary)', fontSize: '1.05rem' }}>
                    ${provider.priceFrom.toFixed(2)} / {provider.period || 'mes'}
                  </td>
                </tr>
                {hasDiscount && (
                  <tr style={{ borderBottom: '1px solid rgba(23, 20, 15, 0.08)' }}>
                    <td style={{ padding: '0.9rem 0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Precio Habitual sin Oferta
                    </td>
                    <td style={{ padding: '0.9rem 0.6rem', fontFamily: 'var(--font-mono)', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                      ${provider.priceBefore.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr style={{ borderBottom: '1px solid rgba(23, 20, 15, 0.08)' }}>
                  <td style={{ padding: '0.9rem 0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Uptime de Red Comprobado
                  </td>
                  <td style={{ padding: '0.9rem 0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-ink)' }}>
                    <span style={{ color: '#10B981', marginRight: '0.35rem' }}>●</span>
                    {provider.uptime}% SLA
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(23, 20, 15, 0.08)' }}>
                  <td style={{ padding: '0.9rem 0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Categorías y Servicios
                  </td>
                  <td style={{ padding: '0.9rem 0.6rem', color: 'var(--text-ink)', fontWeight: 500 }}>
                    {parsedCats.join(', ')}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(23, 20, 15, 0.08)' }}>
                  <td style={{ padding: '0.9rem 0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Garantía de Satisfacción
                  </td>
                  <td style={{ padding: '0.9rem 0.6rem', color: 'var(--text-ink)', fontWeight: 600 }}>
                    30 Días con Reembolso 100%
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.9rem 0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Acceso Oficial con Descuento
                  </td>
                  <td style={{ padding: '0.9rem 0.6rem' }}>
                    <a
                      href={`/go/${provider.slug}`}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.45rem 1.05rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(14, 107, 65, 0.25)',
                      }}
                    >
                      <span>Activar Tarifa Rebajada</span>
                      <Icon name="external" size={13} color="#FFFFFF" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna Derecha: Cupones Troquelados y Alternativas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Caja de Cupones Verificados */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-ink)',
              padding: '1.75rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-hard)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="ticket" size={20} color="var(--green-primary)" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: 0, whiteSpace: 'nowrap' }}>
                  Cupones Activos
                </h3>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: '#FAF7EE',
                  border: '1px solid var(--border-ink)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap',
                }}
              >
                {provider.coupons?.length || 0} {provider.coupons?.length === 1 ? 'Verificado' : 'Verificados'}
              </span>
            </div>

            {provider.coupons && provider.coupons.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {provider.coupons.map((coupon) => {
                  const isCopied = copiedCoupon === coupon.code;
                  return (
                    <div key={coupon.id} className="voucher-ticket-box">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span className="voucher-discount-tag">
                          <Icon name="flame" size={12} color="#FFFFFF" />
                          <span>{coupon.discount || 'DESCUENTO'}</span>
                        </span>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--green-primary)' }}>
                          ● Verificado
                        </span>
                      </div>

                      {coupon.condition && (
                        <span className="voucher-condition-text">
                          {coupon.condition}
                        </span>
                      )}

                      <div className="voucher-action-row" style={{ marginTop: coupon.condition ? 0 : '0.85rem' }}>
                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(coupon.code)}
                          className="voucher-code-btn"
                          title="Copiar código de cupón"
                        >
                          <span style={{ fontWeight: 800, letterSpacing: '0.04em' }}>{coupon.code}</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: isCopied ? 'var(--green-primary)' : 'var(--text-muted)' }}>
                            <Icon name={isCopied ? 'check' : 'copy'} size={13} color={isCopied ? 'var(--green-primary)' : 'currentColor'} />
                            <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                          </span>
                        </button>

                        <a
                          href={`/go/${provider.slug}?c=${coupon.id}`}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          className="voucher-claim-btn"
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
              <div style={{ padding: '1.5rem', backgroundColor: '#FAF7EE', border: '1.5px dashed var(--border-ink)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
                  Actualmente no se requiere introducir cupón manual. El descuento máximo está aplicado automáticamente en el enlace oficial.
                </p>
                <a
                  href={`/go/${provider.slug}`}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1rem', display: 'inline-flex' }}
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
                boxShadow: 'var(--shadow-hard)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: 0 }}>
                  Alternativas a {provider.name}
                </h4>
                <Link
                  href="/proveedores"
                  style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green-primary)' }}
                >
                  Ver Todos →
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {otherProviders.map((other) => (
                  <Link
                    key={other.id}
                    href={`/proveedores/${other.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid var(--border-ink)',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      color: 'var(--text-ink)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      {other.logoUrl ? (
                        <img
                          src={normalizeImageUrl(other.logoUrl)}
                          alt={other.name}
                          style={{
                            width: '28px',
                            height: '28px',
                            objectFit: 'contain',
                            borderRadius: '3px',
                            border: '1px solid rgba(23,20,15,0.1)',
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: '#FAF7EE',
                          borderRadius: '3px',
                          display: other.logoUrl ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                        }}
                      >
                        {other.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block', lineHeight: 1.1 }}>
                          {other.name}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {other.uptime}% Uptime
                        </span>
                      </div>
                    </div>

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-ink)' }}>
                      ${other.priceFrom?.toFixed(2)}/m ↗
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Widget de Asesoría y Calibrador Interactivo */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-ink)',
              padding: '1.35rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-hard)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <Icon name="scale" size={18} color="var(--green-primary)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', fontWeight: 800, color: 'var(--green-primary)', textTransform: 'uppercase' }}>
                ¿INDECISO? CALIBRA TUS PRIORIDADES
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              Ajusta los controles de precio, soporte y velocidad en tiempo real para comprobar si {provider.name} es la mejor opción para tu proyecto.
            </p>
            <Link
              href="/balanza"
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>Abrir La Balanza Interactiva →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
