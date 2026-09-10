'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { useToast } from '../context/ToastContext';

const CATEGORIES_LIST = [
  { id: 'all', label: 'Todos' },
  { id: 'hosting', label: 'Hosting web' },
  { id: 'vps', label: 'VPS' },
  { id: 'wordpress', label: 'WordPress' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'dominios', label: 'Dominios' },
];

export const OfertasCatalog = ({ providers = [] }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('price_asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [copiedCouponId, setCopiedCouponId] = useState(null);

  const toast = useToast();

  // Filtrado y Ordenación
  const processedProviders = useMemo(() => {
    let result = [...providers];

    // Filtro por categoría
    if (activeTab !== 'all') {
      result = result.filter((p) => {
        const cats = Array.isArray(p.categories) ? p.categories : [];
        return cats.includes(activeTab);
      });
    }

    // Filtro por texto de búsqueda
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.plan.toLowerCase().includes(q) ||
          (p.slug && p.slug.toLowerCase().includes(q))
      );
    }

    // Ordenación
    result.sort((a, b) => {
      if (sortBy === 'price_asc') {
        return a.priceFrom - b.priceFrom;
      }
      if (sortBy === 'price_desc') {
        return b.priceFrom - a.priceFrom;
      }
      if (sortBy === 'discount') {
        const discA = a.priceBefore > a.priceFrom ? (a.priceBefore - a.priceFrom) / a.priceBefore : 0;
        const discB = b.priceBefore > b.priceFrom ? (b.priceBefore - b.priceFrom) / b.priceBefore : 0;
        return discB - discA;
      }
      if (sortBy === 'score') {
        const scoreA = (a.scorePrecio + a.scoreRendimiento + a.scoreSoporte + a.scoreFacilidad) / 4;
        const scoreB = (b.scorePrecio + b.scoreRendimiento + b.scoreSoporte + b.scoreFacilidad) / 4;
        return scoreB - scoreA;
      }
      if (sortBy === 'uptime') {
        return b.uptime - a.uptime;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [providers, activeTab, search, sortBy]);

  // Conteos por categoría
  const tabCounts = useMemo(() => {
    const counts = { all: providers.length };
    CATEGORIES_LIST.forEach((cat) => {
      if (cat.id !== 'all') {
        counts[cat.id] = providers.filter((p) => {
          const cats = Array.isArray(p.categories) ? p.categories : [];
          return cats.includes(cat.id);
        }).length;
      }
    });
    return counts;
  }, [providers]);

  // Estadísticas de resumen
  const stats = useMemo(() => {
    const totalCoupons = providers.reduce((acc, p) => acc + (p.coupons ? p.coupons.length : 0), 0);
    const minPrice = providers.length > 0 ? Math.min(...providers.map((p) => p.priceFrom)) : 0;
    const maxDiscount = providers.reduce((max, p) => {
      if (p.priceBefore > p.priceFrom) {
        const d = Math.round(((p.priceBefore - p.priceFrom) / p.priceBefore) * 100);
        return d > max ? d : max;
      }
      return max;
    }, 0);
    return { totalCoupons, minPrice, maxDiscount };
  }, [providers]);

  const handleCopyCoupon = (coupon, providerId) => {
    const code = coupon.code;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code);
    } else {
      const tempInput = document.createElement('input');
      tempInput.value = code;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
    }

    setCopiedCouponId(coupon.id);
    toast.success(`Cupón ${code} copiado al portapapeles.`);

    fetch('/api/public/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId,
        couponId: coupon.id,
        type: 'coupon_copy',
      }),
    }).catch(() => {});

    setTimeout(() => {
      setCopiedCouponId(null);
    }, 2500);
  };

  const handleProviderClick = (provider) => {
    fetch('/api/public/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: provider.id,
        type: 'affiliate_link',
      }),
    }).catch(() => {});
  };

  return (
    <div className="catalog-page-wrapper">
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        
        {/* Breadcrumb editorial */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ textDecoration: 'underline' }}>Inicio</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-ink)', fontWeight: 600 }}>Catálogo Completo de Ofertas</span>
        </div>

        {/* Encabezado Principal */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="kicker">CATÁLOGO EDITORIAL COMPLETO — ACTUALIZADO 2026</div>
          <h1 style={{ fontSize: '3.4rem', marginBottom: '0.8rem', lineHeight: 1.1 }}>
            Todas las ofertas, <span className="italic-serif">en una mesa.</span>
          </h1>
          <p style={{ fontSize: '1.15rem', maxWidth: '780px', color: 'var(--text-muted)' }}>
            Listado exhaustivo de todos los proveedores auditados por nuestro laboratorio. Compara tarifas vigentes,
            porcentajes reales de descuento frente a renovación y canjea cupones exclusivos comprobados a mano.
          </p>
        </div>

        {/* Tira de Estadísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.2rem',
          marginBottom: '2.5rem',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: 'var(--border-width) solid var(--border-ink)',
            boxShadow: 'var(--shadow-solid)',
            padding: '1.2rem 1.4rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Proveedores en Catálogo
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-ink)' }}>
              {providers.length}
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: 'var(--border-width) solid var(--border-ink)',
            boxShadow: 'var(--shadow-solid)',
            padding: '1.2rem 1.4rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Cupones Verificados
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--green-primary)' }}>
              {stats.totalCoupons}
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: 'var(--border-width) solid var(--border-ink)',
            boxShadow: 'var(--shadow-solid)',
            padding: '1.2rem 1.4rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Descuento Máximo
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--red-accent)' }}>
              −{stats.maxDiscount}%
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: 'var(--border-width) solid var(--border-ink)',
            boxShadow: 'var(--shadow-solid)',
            padding: '1.2rem 1.4rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Tarifa de Entrada
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-ink)' }}>
              ${stats.minPrice.toFixed(2)}<span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>/mes</span>
            </div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: 'var(--border-width) solid var(--border-ink)',
          boxShadow: 'var(--shadow-solid)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
        }}>
          {/* Fila superior: Input búsqueda y selector orden */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por proveedor, plan o características..."
                className="input-editorial"
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  fontSize: '0.92rem',
                }}
              />
              <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                <Icon name="sliders" size={16} />
              </div>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Ordenar por:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-editorial"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  padding: '0.55rem 0.9rem',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="price_asc">Menor precio mensual</option>
                <option value="price_desc">Mayor precio</option>
                <option value="discount">Mayor % de Descuento</option>
                <option value="score">Mejor Puntuación Global</option>
                <option value="uptime">Mayor Uptime Garantizado</option>
                <option value="name">Nombre (A — Z)</option>
              </select>

              {/* Selector de Vista (Grid vs Tabla) */}
              <div style={{ display: 'flex', border: 'var(--border-width) solid var(--border-ink)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0.5rem 0.8rem',
                    backgroundColor: viewMode === 'grid' ? 'var(--text-ink)' : '#FFFFFF',
                    color: viewMode === 'grid' ? '#FAF7EE' : 'var(--text-ink)',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                  title="Vista de Tarjetas"
                >
                  Tarjetas
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '0.5rem 0.8rem',
                    backgroundColor: viewMode === 'table' ? 'var(--text-ink)' : '#FFFFFF',
                    color: viewMode === 'table' ? '#FAF7EE' : 'var(--text-ink)',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    borderLeft: '1px solid var(--border-ink)',
                  }}
                  title="Vista de Tabla"
                >
                  Tabla
                </button>
              </div>
            </div>
          </div>

          {/* Fila inferior: Pestañas de categorías */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid rgba(23,20,15,0.1)', paddingTop: '1rem' }}>
            {CATEGORIES_LIST.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`tab-btn ${activeTab === cat.id ? 'active' : ''}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              >
                <span>{cat.label}</span>
                <span className="count">({tabCounts[cat.id] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mensaje de resultados */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          <span>Mostrando <strong>{processedProviders.length}</strong> de {providers.length} ofertas disponibles</span>
          {(search || activeTab !== 'all') && (
            <button
              onClick={() => { setSearch(''); setActiveTab('all'); }}
              style={{ textDecoration: 'underline', color: 'var(--red-accent)', cursor: 'pointer' }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* ESTADO VACÍO */}
        {processedProviders.length === 0 && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: 'var(--border-width) solid var(--border-ink)',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-solid)',
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>No se encontraron ofertas</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Ningún proveedor coincide con los criterios "{search}" en la categoría seleccionada.
            </p>
            <button
              onClick={() => { setSearch(''); setActiveTab('all'); }}
              className="btn btn-secondary"
            >
              Restablecer Filtros
            </button>
          </div>
        )}

        {/* VISTA 1: GRID DE TARJETAS */}
        {viewMode === 'grid' && processedProviders.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {processedProviders.map((prov) => {
              const hasCoupon = prov.coupons && prov.coupons.length > 0;
              const coupon = hasCoupon ? prov.coupons[0] : null;
              const isCopied = coupon && copiedCouponId === coupon.id;

              const discountPct =
                prov.priceBefore > prov.priceFrom
                  ? Math.round(((prov.priceBefore - prov.priceFrom) / prov.priceBefore) * 100)
                  : 0;

              const avgScore = (
                (prov.scorePrecio + prov.scoreRendimiento + prov.scoreSoporte + prov.scoreFacilidad) / 4
              ).toFixed(1);

              return (
                <div
                  key={prov.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: 'var(--border-width) solid var(--border-ink)',
                    boxShadow: 'var(--shadow-solid)',
                    padding: '1.6rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div>
                    {/* Cabecera de la tarjeta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {prov.logoUrl && (
                          <img
                            src={prov.logoUrl}
                            alt={prov.name}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            style={{
                              width: '36px',
                              height: '36px',
                              objectFit: 'contain',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid rgba(23,20,15,0.15)',
                              borderRadius: '4px',
                              padding: '2px',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '1.5rem', lineHeight: 1.2 }}>{prov.name}</h3>
                            {prov.badge && (
                              <span className={`badge-editorial-pill color-${prov.badgeColor || 'green'}`}>
                                {prov.badge}
                              </span>
                            )}
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {prov.plan}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border-ink)', padding: '0.2rem 0.5rem', borderRadius: '3px' }}>
                        <span style={{ color: '#D97706', fontSize: '0.85rem' }}>★</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem' }}>{avgScore}</span>
                      </div>
                    </div>

                    {/* Categorías */}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                      {(prov.categories || []).map((cat, i) => (
                        <span key={i} className="badge-tag" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                          {cat}
                        </span>
                      ))}
                      <span className="badge-tag badge-green" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                        {prov.uptime}% Uptime
                      </span>
                    </div>

                    {/* Fila de Precios y Descuento */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(23,20,15,0.15)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '1.2rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.3rem' }}>
                        {prov.priceBefore > prov.priceFrom && (
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                            ${prov.priceBefore.toFixed(2)}
                          </span>
                        )}
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-ink)' }}>
                          ${prov.priceFrom.toFixed(2)}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          /{prov.period}
                        </span>
                        {discountPct > 0 && (
                          <span className="discount-tag" style={{ marginLeft: 'auto' }}>
                            −{discountPct}%
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Renovación estándar verificada por redacción
                      </div>
                    </div>
                  </div>

                  {/* Acciones: Cupón y Botón Afiliado */}
                  <div>
                    {coupon ? (
                      <div style={{ marginBottom: '0.8rem' }}>
                        <button
                          onClick={() => handleCopyCoupon(coupon, prov.id)}
                          className={`coupon-copy-btn ${isCopied ? 'copied' : ''}`}
                          style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
                          title="Copiar código promocional"
                        >
                          <Icon name={isCopied ? 'check' : 'copy'} size={14} />
                          <span>{isCopied ? '¡Cupón Copiado!' : `Cupón: ${coupon.code} (${coupon.discount})`}</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        marginBottom: '0.8rem',
                        padding: '0.4rem',
                        backgroundColor: 'rgba(23,20,15,0.03)',
                        borderRadius: '3px'
                      }}>
                        ✓ Descuento activado automáticamente
                      </div>
                    )}

                    <a
                      href={prov.affiliateUrl}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      onClick={() => handleProviderClick(prov)}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <span>Reclamar Oferta Oficial</span>
                      <Icon name="external" size={14} color="#fff" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VISTA 2: TABLA EDITORIAL COMPLETA */}
        {viewMode === 'table' && processedProviders.length > 0 && (
          <div className="table-container-editorial">
            <table className="deals-table">
              <thead>
                <tr>
                  <th>Proveedor y Plan</th>
                  <th>Categorías</th>
                  <th>Uptime</th>
                  <th>Puntuación</th>
                  <th>Precio / Período</th>
                  <th>Descuento</th>
                  <th>Cupón Promocional</th>
                  <th style={{ textAlign: 'right' }}>Enlace Directo</th>
                </tr>
              </thead>
              <tbody>
                {processedProviders.map((prov) => {
                  const hasCoupon = prov.coupons && prov.coupons.length > 0;
                  const coupon = hasCoupon ? prov.coupons[0] : null;
                  const isCopied = coupon && copiedCouponId === coupon.id;

                  const discountPct =
                    prov.priceBefore > prov.priceFrom
                      ? Math.round(((prov.priceBefore - prov.priceFrom) / prov.priceBefore) * 100)
                      : 0;

                  const avgScore = (
                    (prov.scorePrecio + prov.scoreRendimiento + prov.scoreSoporte + prov.scoreFacilidad) / 4
                  ).toFixed(1);

                  return (
                    <tr key={prov.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {prov.logoUrl && (
                            <img
                              src={prov.logoUrl}
                              alt={prov.name}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              style={{
                                width: '28px',
                                height: '28px',
                                objectFit: 'contain',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid rgba(23,20,15,0.15)',
                                borderRadius: '4px',
                                padding: '2px',
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700 }}>
                                {prov.name}
                              </span>
                              {prov.badge && (
                                <span className={`badge-editorial-pill color-${prov.badgeColor || 'green'}`}>
                                  {prov.badge}
                                </span>
                              )}
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {prov.plan}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {(prov.categories || []).map((cat, i) => (
                            <span key={i} className="badge-tag">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          {prov.uptime}%
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green-primary)' }}>
                          {avgScore} / 10
                        </span>
                      </td>
                      <td>
                        <div>
                          {prov.priceBefore > prov.priceFrom && (
                            <span className="price-before">${prov.priceBefore.toFixed(2)}</span>
                          )}
                          <span className="price-now">
                            ${prov.priceFrom.toFixed(2)}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            /{prov.period}
                          </span>
                        </div>
                      </td>
                      <td>
                        {discountPct > 0 ? (
                          <span className="discount-tag">−{discountPct}%</span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
                            Tarifa estándar
                          </span>
                        )}
                      </td>
                      <td>
                        {coupon ? (
                          <button
                            onClick={() => handleCopyCoupon(coupon, prov.id)}
                            className={`coupon-copy-btn ${isCopied ? 'copied' : ''}`}
                            title="Copiar código al portapapeles"
                          >
                            <Icon name={isCopied ? 'check' : 'copy'} size={13} />
                            <span>{isCopied ? '¡Copiado!' : coupon.code}</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-light)' }}>
                            Automático
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <a
                          href={prov.affiliateUrl}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          onClick={() => handleProviderClick(prov)}
                          className="btn btn-secondary btn-sm"
                        >
                          <span>Ver oferta</span>
                          <Icon name="external" size={13} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Nota Editorial al pie de página */}
        <div style={{
          marginTop: '4rem',
          padding: '1.8rem',
          border: '1px solid rgba(23,20,15,0.15)',
          backgroundColor: '#FAF7EE',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          gap: '1.2rem',
          alignItems: 'center',
        }}>
          <Icon name="shield" size={28} color="#0E6B41" />
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <strong>Compromiso de Transparencia de Debatehosting:</strong> Todos los precios y cupones promocionales listados son comprobados periódicamente de manera manual. Si detectas alguna tarifa desactualizada o cupón vencido, nuestro equipo editorial lo ajustará de inmediato.
          </div>
        </div>

      </div>
    </div>
  );
};
