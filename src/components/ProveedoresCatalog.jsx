'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { normalizeImageUrl } from '@/lib/imageHelper';

// Helper to safely parse pros from string, json, or array
const parseProsList = (rawPros) => {
  if (!rawPros) return [];
  if (Array.isArray(rawPros)) return rawPros.slice(0, 2);
  try {
    const parsed = JSON.parse(rawPros);
    if (Array.isArray(parsed)) return parsed.slice(0, 2);
  } catch (e) {}
  return String(rawPros)
    .split('\n')
    .map((s) => s.trim().replace(/^[-*•✓]\s*/, ''))
    .filter(Boolean)
    .slice(0, 2);
};

export const ProveedoresCatalog = ({ providers = [], categories = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'price' | 'uptime' | 'perf' | 'alphabetical'
  const [viewMode, setViewMode] = useState('dossier'); // 'dossier' | 'table'
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Calcular métricas derivadas y categorías parseadas
  const providersWithScore = useMemo(() => {
    return providers.map((p) => {
      const avgScore = (
        ((p.scorePrecio || 8) +
          (p.scoreRendimiento || 8) +
          (p.scoreSoporte || 8) +
          (p.scoreFacilidad || 8)) /
        4
      ).toFixed(1);

      let parsedCats = [];
      try {
        parsedCats = Array.isArray(p.categories) ? p.categories : JSON.parse(p.categories);
      } catch (e) {
        parsedCats = [p.categories || 'hosting'];
      }

      return {
        ...p,
        averageScore: parseFloat(avgScore),
        parsedCategories: parsedCats,
        parsedPros: parseProsList(p.pros),
      };
    });
  }, [providers]);

  // Telemetría global del observatorio
  const telemetry = useMemo(() => {
    const total = providers.length;
    if (total === 0) return { total: 0, avgUptime: '99.9%', totalCoupons: 0, avgPerf: '9.2' };
    
    const sumUptime = providers.reduce((acc, p) => acc + (p.uptime || 99.9), 0);
    const avgUptime = (sumUptime / total).toFixed(2);
    const totalCoupons = providers.reduce((acc, p) => acc + (p.coupons?.length || 0), 0);
    const sumPerf = providers.reduce((acc, p) => acc + (p.scoreRendimiento || 9), 0);
    const avgPerf = (sumPerf / total).toFixed(1);

    return { total, avgUptime, totalCoupons, avgPerf };
  }, [providers]);

  // Filtrado y ordenamiento
  const filteredProviders = useMemo(() => {
    let result = providersWithScore.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.plan && p.plan.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' ||
        p.parsedCategories.some(
          (c) => c.toLowerCase() === selectedCategory.toLowerCase()
        );

      return matchesSearch && matchesCat;
    });

    result.sort((a, b) => {
      if (sortBy === 'score') return b.averageScore - a.averageScore;
      if (sortBy === 'price') return a.priceFrom - b.priceFrom;
      if (sortBy === 'uptime') return (b.uptime || 0) - (a.uptime || 0);
      if (sortBy === 'perf') return (b.scoreRendimiento || 0) - (a.scoreRendimiento || 0);
      if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [providersWithScore, searchTerm, selectedCategory, sortBy]);

  const faqs = [
    {
      q: '¿Cómo evalúa Debatehosting a cada proveedor?',
      a: 'Auditamos cada empresa con pruebas técnicas reales en producción: medimos el Time to First Byte (TTFB) con servidores LiteSpeed y Apache/Nginx, monitorizamos la estabilidad de red 24/7/365 y testeamos el soporte técnico en español con tickets en horarios de alta y baja afluencia.',
    },
    {
      q: '¿Por qué contratar a través de los enlaces de Debatehosting?',
      a: 'Nuestros enlaces de recomendación oficial (/go/[slug]) activan automáticamente los mejores códigos de descuento y tarifas negociadas directamente con cada proveedor, garantizando el precio más bajo sin ningún sobrecoste para ti.',
    },
    {
      q: '¿Qué hosting es más recomendable para proyectos en WordPress?',
      a: 'Para sitios web en WordPress aconsejamos proveedores que utilicen servidores web LiteSpeed Enterprise con caché a nivel de servidor (LSCache) y almacenamiento NVMe de alto IOPS, tales como Raiola Networks, BanaHosting o Webempresa.',
    },
    {
      q: '¿Qué diferencia hay entre la Nota Editorial y el Uptime?',
      a: 'El Uptime mide la disponibilidad ininterrumpida de los servidores (garantía de no caída). La Nota Editorial es una ponderación exhaustiva de 4 factores: rendimiento bruto, calidad y rapidez del soporte, relación calidad/precio y facilidad de uso del panel de control.',
    },
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      {/* Migas de Pan Editoriales */}
      <div className="editorial-breadcrumbs" style={{ marginBottom: '1.25rem' }}>
        <Link href="/" className="crumb-link">
          Inicio
        </Link>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">Directorio de Proveedores</span>
      </div>

      {/* Hero Editorial */}
      <div className="proveedores-hero">
        <div className="balanza-kicker" style={{ justifyContent: 'center', marginBottom: '0.85rem' }}>
          <span className="kicker-dot" style={{ backgroundColor: 'var(--green-primary)' }}></span>
          <span>RADAR Y DIRECTORIO TÉCNICO — AUDITORÍA 2026</span>
          <span className="kicker-line"></span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.3rem, 5vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.025em',
            marginBottom: '1rem',
            color: 'var(--text-ink)',
          }}
        >
          Directorio Oficial de <span className="italic-serif">Proveedores</span> de Hosting.
        </h1>

        <p
          style={{
            fontSize: '1.08rem',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            maxWidth: '740px',
            margin: '0 auto',
          }}
        >
          Análisis exhaustivo de empresas de alojamiento web, servidores VPS y cloud hosting.
          Comparamos velocidad real <strong>TTFB</strong>, estabilidad auditada, calidad del soporte
          técnico en español y cupones de descuento verificados.
        </p>
      </div>

      {/* Tira de Telemetría Global en 4 Bloques */}
      <div className="proveedores-telemetry-grid">
        <div className="telemetry-card">
          <div className="telemetry-icon-box">
            <Icon name="server" size={20} color="var(--green-primary)" />
          </div>
          <div>
            <span className="telemetry-label">Proveedores Auditados</span>
            <div className="telemetry-val">{telemetry.total} Empresas</div>
            <div className="telemetry-sub">Fichas técnicas en vivo</div>
          </div>
        </div>

        <div className="telemetry-card">
          <div className="telemetry-icon-box">
            <Icon name="shield" size={20} color="var(--green-primary)" />
          </div>
          <div>
            <span className="telemetry-label">Uptime Promedio Red</span>
            <div className="telemetry-val">{telemetry.avgUptime}%</div>
            <div className="telemetry-sub">Disponibilidad 24/7/365</div>
          </div>
        </div>

        <div className="telemetry-card">
          <div className="telemetry-icon-box">
            <Icon name="zap" size={20} color="var(--green-primary)" />
          </div>
          <div>
            <span className="telemetry-label">Nota Media Rendimiento</span>
            <div className="telemetry-val">{telemetry.avgPerf} / 10</div>
            <div className="telemetry-sub">TTFB ultra rápido</div>
          </div>
        </div>

        <div className="telemetry-card">
          <div className="telemetry-icon-box">
            <Icon name="scale" size={20} color="var(--green-primary)" />
          </div>
          <div>
            <span className="telemetry-label">Cupones Verificados</span>
            <div className="telemetry-val">{telemetry.totalCoupons} Activos</div>
            <div className="telemetry-sub">Descuentos negociados</div>
          </div>
        </div>
      </div>

      {/* Panel de Filtros, Búsqueda y Selector de Vista */}
      <div className="proveedores-filter-panel">
        <div className="proveedores-controls-top">
          {/* Buscador Interactivo */}
          <div className="proveedores-search-wrap">
            <div className="proveedores-search-icon">
              <Icon name="search" size={16} color="var(--text-muted)" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre de hosting, plan o tecnología..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="proveedores-search-input"
            />
          </div>

          {/* Selector de Ordenamiento */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Ordenar:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.65rem 0.9rem',
                border: '1.5px solid var(--border-ink)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                fontWeight: 600,
                backgroundColor: '#FAF7EE',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="score">Mayor Nota Editorial</option>
              <option value="perf">Mayor Rendimiento (TTFB)</option>
              <option value="price">Precio más bajo</option>
              <option value="uptime">Mayor Uptime (%)</option>
              <option value="alphabetical">Nombre (A-Z)</option>
            </select>
          </div>

          {/* Selector de Vista Dual: Dossier vs Tabla */}
          <div className="proveedores-view-toggle">
            <button
              onClick={() => setViewMode('dossier')}
              className={`proveedores-view-btn ${viewMode === 'dossier' ? 'active' : ''}`}
              title="Vista Dossier con tarjetas detalladas"
            >
              <span>⊞</span>
              <span>Dossier</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`proveedores-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              title="Vista Tabla Comparativa técnica"
            >
              <span>☰</span>
              <span>Tabla</span>
            </button>
          </div>
        </div>

        {/* Píldoras de Categorías */}
        {categories && categories.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '1.15rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(23,20,15,0.08)',
            }}
          >
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                border: '1px solid var(--border-ink)',
                cursor: 'pointer',
                backgroundColor: selectedCategory === 'all' ? 'var(--text-ink)' : '#FAF7EE',
                color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--text-ink)',
                transition: 'all 0.15s ease',
              }}
            >
              Todos ({providers.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  border: '1px solid var(--border-ink)',
                  cursor: 'pointer',
                  backgroundColor: selectedCategory === cat.slug ? 'var(--green-primary)' : '#FAF7EE',
                  color: selectedCategory === cat.slug ? '#FFFFFF' : 'var(--text-ink)',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Renderizado de Proveedores: Estado Vacío */}
      {filteredProviders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1.5rem',
            backgroundColor: '#FFFFFF',
            border: '1.5px dashed var(--border-ink)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-hard)',
            marginBottom: '4rem',
          }}
        >
          <Icon name="server" size={44} color="var(--text-muted)" />
          <h3 style={{ marginTop: '1.1rem', fontFamily: 'var(--font-serif)', fontSize: '1.45rem' }}>
            No se encontraron proveedores
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginTop: '0.4rem' }}>
            No hay resultados para tu criterio de búsqueda actual o categoría seleccionada.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '1.4rem' }}
          >
            Restablecer Filtros
          </button>
        </div>
      ) : viewMode === 'dossier' ? (
        /* VISTA 1: DOSSIER (Tarjetas Enriquecidas) */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem',
          }}
        >
          {filteredProviders.map((p, idx) => {
            const hasDiscount = p.priceBefore && p.priceBefore > p.priceFrom;
            const discountPct = hasDiscount
              ? Math.round(((p.priceBefore - p.priceFrom) / p.priceBefore) * 100)
              : 0;

            const firstCoupon = p.coupons && p.coupons.length > 0 ? p.coupons[0] : null;

            return (
              <div
                key={p.id}
                className={`provider-dossier-card ${idx === 0 && sortBy === 'score' ? 'featured' : ''}`}
              >
                {/* Cabecera de la Tarjeta */}
                <div className="provider-dossier-header">
                  <div className="provider-dossier-brand">
                    {p.logoUrl ? (
                      <img
                        src={normalizeImageUrl(p.logoUrl)}
                        alt={`Logotipo oficial de ${p.name}`}
                        className="provider-dossier-logo"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="provider-dossier-fallback-logo">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="provider-dossier-title">
                        <Link href={`/proveedores/${p.slug}`}>{p.name}</Link>
                      </h3>
                      <span className="provider-dossier-plan">
                        Plan Auditado: <strong>{p.plan || 'Plan Recomendado'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Badge de Honor Editorial */}
                  {p.badge ? (
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor:
                          p.badgeColor === 'red'
                            ? '#DC2626'
                            : p.badgeColor === 'gold'
                            ? '#D97706'
                            : 'var(--green-primary)',
                        color: '#FFFFFF',
                        border: '1px solid var(--border-ink)',
                        boxShadow: '1.5px 1.5px 0 var(--border-ink)',
                      }}
                    >
                      {p.badge}
                    </span>
                  ) : idx < 3 && sortBy === 'score' ? (
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: idx === 0 ? 'var(--green-primary)' : '#FAF7EE',
                        color: idx === 0 ? '#FFFFFF' : 'var(--text-ink)',
                        border: '1px solid var(--border-ink)',
                      }}
                    >
                      {idx === 0 ? 'TOP 1 EDITORIAL' : idx === 1 ? 'TOP 2 ELECCIÓN' : 'TOP 3 AUDITADO'}
                    </span>
                  ) : null}
                </div>

                {/* Contenido Principal de la Tarjeta */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  {/* Banner de Nota Editorial y Uptime */}
                  <div className="provider-score-banner">
                    <div>
                      <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                        NOTA EDITORIAL
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginTop: '0.15rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--green-primary)' }}>
                          {p.averageScore}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>/10</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                        UPTIME AUDITADO
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem', marginTop: '0.2rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700 }}>
                          {p.uptime || 99.9}%
                        </span>
                      </div>
                    </div>
                  </div>


                  {/* Puntos Fuertes Destacados (Pros del Laboratorio) */}
                  {p.parsedPros && p.parsedPros.length > 0 && (
                    <div className="provider-pros-compact">
                      {p.parsedPros.map((pro, pIdx) => (
                        <div key={pIdx} className="provider-pro-item">
                          <span style={{ marginTop: '2px', flexShrink: 0 }}>
                            <Icon name="check" size={12} color="var(--green-primary)" />
                          </span>
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cupón / Descuento Activo */}
                  {firstCoupon ? (
                    <div className="provider-coupon-strip">
                      <Icon name="flame" size={13} color="#D97706" />
                      <span>Cupón Activo:</span>
                      <strong>{firstCoupon.code}</strong>
                      {firstCoupon.discount && <span>({firstCoupon.discount})</span>}
                    </div>
                  ) : hasDiscount ? (
                    <div className="provider-coupon-strip" style={{ backgroundColor: '#ECFDF5', borderColor: '#059669', color: '#065F46' }}>
                      <Icon name="zap" size={13} color="#059669" />
                      <span>Descuento aplicado: <strong>-{discountPct}% en tu primer periodo</strong></span>
                    </div>
                  ) : null}

                  {/* Caja de Precio */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '0.85rem',
                      borderTop: '1.5px solid rgba(23,20,15,0.08)',
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block' }}>
                        Tarifa oficial desde:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.15rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-ink)' }}>
                          ${p.priceFrom?.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          /{p.period || 'mes'}
                        </span>
                        {hasDiscount && (
                          <span style={{ fontSize: '0.82rem', textDecoration: 'line-through', color: 'var(--text-light)', marginLeft: '0.25rem' }}>
                            ${p.priceBefore.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {hasDiscount && (
                      <span
                        style={{
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '3px',
                          fontSize: '0.74rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          border: '1px solid var(--border-ink)',
                        }}
                      >
                        -{discountPct}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones de la Tarjeta */}
                <div
                  style={{
                    padding: '0.9rem 1.25rem',
                    backgroundColor: '#FAF7EE',
                    borderTop: '1.5px solid rgba(23,20,15,0.09)',
                    display: 'flex',
                    gap: '0.75rem',
                  }}
                >
                  <Link
                    href={`/proveedores/${p.slug}`}
                    className="btn btn-secondary btn-sm"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                    }}
                  >
                    <span>Ficha y Test</span>
                    <Icon name="arrowRight" size={13} />
                  </Link>

                  <a
                    href={`/go/${p.slug}`}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                    }}
                  >
                    <span>Ir a la Oferta</span>
                    <Icon name="external" size={13} color="#fff" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISTA 2: TABLA COMPARATIVA TÉCNICA */
        <div className="proveedores-table-container">
          <table className="proveedores-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}># Pos</th>
                <th>Hosting & Plan</th>
                <th>Nota Editorial</th>
                <th>Uptime Auditado</th>
                <th style={{ minWidth: '130px' }}>Rendimiento</th>
                <th>Soporte</th>
                <th>Precio Base</th>
                <th>Cupón / Promo</th>
                <th style={{ textAlign: 'right', minWidth: '180px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((p, index) => {
                const hasDiscount = p.priceBefore && p.priceBefore > p.priceFrom;
                const discountPct = hasDiscount
                  ? Math.round(((p.priceBefore - p.priceFrom) / p.priceBefore) * 100)
                  : 0;
                const firstCoupon = p.coupons && p.coupons.length > 0 ? p.coupons[0] : null;

                return (
                  <tr key={p.id}>
                    {/* Posición */}
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
                      #{index + 1}
                    </td>

                    {/* Logo + Nombre + Plan */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        {p.logoUrl ? (
                          <img
                            src={normalizeImageUrl(p.logoUrl)}
                            alt={p.name}
                            style={{
                              width: '54px',
                              height: '54px',
                              objectFit: 'contain',
                              backgroundColor: '#FFFFFF',
                              padding: '4px',
                              borderRadius: '6px',
                              border: '1.5px solid var(--border-ink)',
                              boxShadow: '1px 1px 0 rgba(23, 20, 15, 0.1)',
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '54px',
                              height: '54px',
                              backgroundColor: '#FAF7EE',
                              borderRadius: '6px',
                              border: '1.5px solid var(--border-ink)',
                              boxShadow: '1px 1px 0 rgba(23, 20, 15, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              fontSize: '1.1rem',
                              flexShrink: 0,
                            }}
                          >
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/proveedores/${p.slug}`}
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontWeight: 700,
                              fontSize: '1.05rem',
                              color: 'var(--text-ink)',
                              textDecoration: 'none',
                            }}
                          >
                            {p.name}
                          </Link>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {p.plan || 'Plan Estándar'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Nota Media */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--green-primary)' }}>
                          {p.averageScore}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          /10
                        </span>
                      </div>
                    </td>

                    {/* Uptime */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700 }}>
                          {p.uptime || 99.9}%
                        </span>
                      </div>
                    </td>

                    {/* Rendimiento */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700 }}>
                          {p.scoreRendimiento || 9}/10
                        </span>
                        <div className="benchmark-track" style={{ height: '5px' }}>
                          <div
                            className="benchmark-fill perf"
                            style={{ width: `${((p.scoreRendimiento || 9) / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Soporte */}
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700 }}>
                        {p.scoreSoporte || 9}/10
                      </span>
                    </td>

                    {/* Precio Base */}
                    <td>
                      <div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 800 }}>
                          ${p.priceFrom?.toFixed(2)}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          /{p.period || 'mes'}
                        </span>
                      </div>
                    </td>

                    {/* Cupón / Promo */}
                    <td>
                      {firstCoupon ? (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.5rem',
                            backgroundColor: '#FEF3C7',
                            border: '1px dashed #D97706',
                            borderRadius: '3px',
                            fontWeight: 700,
                            color: '#92400E',
                            display: 'inline-block',
                          }}
                        >
                          {firstCoupon.code}
                        </span>
                      ) : hasDiscount ? (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            padding: '0.15rem 0.45rem',
                            backgroundColor: '#DC2626',
                            color: '#FFFFFF',
                            borderRadius: '3px',
                            fontWeight: 700,
                          }}
                        >
                          -{discountPct}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <Link
                          href={`/proveedores/${p.slug}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
                        >
                          Ficha
                        </Link>
                        <a
                          href={`/go/${p.slug}`}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
                        >
                          Oferta ↗
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sección Editorial: Cómo Auditamos */}
      <div
        style={{
          backgroundColor: '#FAF7EE',
          border: '1.5px solid var(--border-ink)',
          boxShadow: 'var(--shadow-hard)',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '4rem',
        }}
      >
        <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'center', marginBottom: '2rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--green-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            METODOLOGÍA TRANSPARENTE
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.95rem', marginTop: '0.4rem', color: 'var(--text-ink)' }}>
            ¿Cómo Evaluamos a Cada Proveedor en Debatehosting?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
            A diferencia de otros comparadores que priorizan comisiones comerciales, en Debatehosting
            adquirimos planes anónimos y realizamos pruebas continuas de laboratorio para emitir juicios independientes.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '1.3rem', border: '1.5px solid var(--border-ink)', borderRadius: 'var(--radius-sm)' }}>
            <Icon name="zap" size={24} color="var(--green-primary)" />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
              Test de Velocidad TTFB
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Medimos el Time to First Byte con sondas independientes desde España, Europa y América en condiciones de tráfico variable.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.3rem', border: '1.5px solid var(--border-ink)', borderRadius: 'var(--radius-sm)' }}>
            <Icon name="shield" size={24} color="var(--green-primary)" />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
              Uptime Continuo 24/7
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Monitorizamos la disponibilidad con pings cada 60 segundos para contrastar el SLA contractual del 99.9% frente a la realidad.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.3rem', border: '1.5px solid var(--border-ink)', borderRadius: 'var(--radius-sm)' }}>
            <Icon name="sliders" size={24} color="var(--green-primary)" />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
              Soporte Encubierto
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Enviamos consultas técnicas complejas sin identificarnos para evaluar el conocimiento técnico real y el tiempo de respuesta.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.3rem', border: '1.5px solid var(--border-ink)', borderRadius: 'var(--radius-sm)' }}>
            <Icon name="scale" size={24} color="var(--green-primary)" />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
              Transparencia en Renovación
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Auditamos la letra pequeña para advertirte si el precio promocional se triplica al renovar y qué extras obligatorios se ocultan.
            </p>
          </div>
        </div>
      </div>

      {/* Preguntas Frecuentes (FAQs) */}
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.9rem',
            textAlign: 'center',
            marginBottom: '1.75rem',
            color: 'var(--text-ink)',
          }}
        >
          Preguntas Frecuentes sobre Proveedores de Hosting
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--border-ink)',
                  boxShadow: isOpen ? 'var(--shadow-hard)' : '2px 2px 0 var(--border-ink)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                }}
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '1.15rem 1.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.08rem',
                    fontWeight: 700,
                    color: 'var(--text-ink)',
                  }}
                >
                  <span>{faq.q}</span>
                  <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size={18} color="var(--text-muted)" />
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 1.35rem 1.35rem',
                      fontSize: '0.94rem',
                      lineHeight: 1.65,
                      color: 'var(--text-muted)',
                      borderTop: '1px solid rgba(23,20,15,0.07)',
                      paddingTop: '0.85rem',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
