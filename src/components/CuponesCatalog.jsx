'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { useToast } from '../context/ToastContext';
import { normalizeImageUrl } from '@/lib/imageHelper';

const CATEGORIES_LIST = [
  { id: 'all', label: 'Todos' },
  { id: 'hosting', label: 'Hosting web' },
  { id: 'vps', label: 'VPS' },
  { id: 'wordpress', label: 'WordPress' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'dominios', label: 'Dominios' },
];

export const CuponesCatalog = ({ providers = [] }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'tickets'
  const [copiedId, setCopiedId] = useState(null);
  const [unlockedDeals, setUnlockedDeals] = useState({});

  const toast = useToast();

  // Aplanar y procesar todos los cupones activos
  const allCoupons = useMemo(() => {
    const list = [];
    const now = new Date();

    providers.forEach((prov) => {
      if (prov.coupons && prov.coupons.length > 0) {
        prov.coupons.forEach((coupon) => {
          if (!coupon.expiresAt || new Date(coupon.expiresAt) >= now) {
            list.push({
              ...coupon,
              provider: prov,
            });
          }
        });
      }
    });

    return list;
  }, [providers]);

  // Filtrado
  const filteredCoupons = useMemo(() => {
    let result = [...allCoupons];

    // Filtro por categoría
    if (activeTab !== 'all') {
      result = result.filter((c) => {
        const cats = Array.isArray(c.provider?.categories) ? c.provider.categories : [];
        return cats.includes(activeTab);
      });
    }

    // Filtro por texto
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          (c.provider?.name && c.provider.name.toLowerCase().includes(q)) ||
          (c.condition && c.condition.toLowerCase().includes(q)) ||
          (c.discount && c.discount.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allCoupons, activeTab, search]);

  // Estadísticas globales
  const stats = useMemo(() => {
    const uniqueProviders = new Set(allCoupons.map((c) => c.providerId)).size;
    let maxDiscNum = 0;

    allCoupons.forEach((c) => {
      const match = c.discount?.match(/(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxDiscNum) maxDiscNum = val;
      }
    });

    return {
      totalCoupons: allCoupons.length,
      uniqueProviders,
      maxDiscount: maxDiscNum || 75,
    };
  }, [allCoupons]);

  // Manejo de copia de cupón
  const handleCopyCode = (coupon) => {
    const code = coupon.code;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code);
    } else {
      const temp = document.createElement('input');
      temp.value = code;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }

    setCopiedId(coupon.id);
    setUnlockedDeals((prev) => ({ ...prev, [coupon.id]: true }));

    toast.success(`¡Cupón ${code} copiado! Ya puedes canjearlo en la tienda oficial.`);

    fetch('/api/public/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        couponId: coupon.id,
        providerId: coupon.providerId,
        type: 'coupon_copy',
      }),
    }).catch(() => {});

    setTimeout(() => {
      setCopiedId(null);
    }, 3000);
  };

  const handleGoToOffer = (coupon) => {
    fetch('/api/public/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        couponId: coupon.id,
        providerId: coupon.providerId,
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
          <span style={{ color: 'var(--text-ink)', fontWeight: 600 }}>Cupones y Códigos Verificados</span>
        </div>

        {/* Encabezado Principal */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="kicker">DIRECTORIO EDITORIAL DE CUPONES — VERIFICADOS 2026</div>
          <h1 style={{ fontSize: '3.2rem', marginBottom: '0.8rem', lineHeight: 1.1 }}>
            Cupones que <span className="italic-serif">funcionan</span> de verdad.
          </h1>
          <p style={{ maxWidth: '780px', color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: 1.5 }}>
            Acuerdos negociados directamente con cada empresa y códigos comprobados manualmente. 
            Copia el código promocional para desbloquear la tarifa preferente en la plataforma oficial.
          </p>
        </div>

        {/* Tarjetas de Métricas de Cupones */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.2rem',
          marginBottom: '2.5rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: 'var(--border-width) solid var(--border-ink)',
            boxShadow: 'var(--shadow-solid)',
            padding: '1.2rem 1.4rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Cupones Verificados Activos
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
              Ahorro Máximo
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
              Proveedores con Descuento
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-ink)' }}>
              {stats.uniqueProviders}
            </div>
          </div>
        </div>

        {/* Barra de Búsqueda, Filtros y Vista */}
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
          {/* Fila superior: Input de búsqueda + Selector de Vista */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <input
                type="text"
                placeholder="Buscar por proveedor, código o palabra clave..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-editorial"
                style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.9rem' }}
              />
              <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                <Icon name="search" size={15} />
              </span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>

            {/* Alternador de Vista (Lista vs Tickets) */}
            <div style={{ display: 'flex', border: '1.5px solid var(--border-ink)', borderRadius: '3px', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('list')}
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none', borderRadius: 0, padding: '0.45rem 0.9rem' }}
                title="Vista Lista"
              >
                <Icon name="menu" size={14} />
                <span>Lista</span>
              </button>
              <button
                onClick={() => setViewMode('tickets')}
                className={`btn btn-sm ${viewMode === 'tickets' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none', borderRadius: 0, padding: '0.45rem 0.9rem' }}
                title="Vista Tickets de Imprenta"
              >
                <Icon name="sliders" size={14} />
                <span>Tickets</span>
              </button>
            </div>
          </div>

          {/* Fila inferior: Pestañas de Categoría */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid rgba(23,20,15,0.1)', paddingTop: '1rem' }}>
            {CATEGORIES_LIST.map((cat) => {
              const count = cat.id === 'all'
                ? allCoupons.length
                : allCoupons.filter((c) => {
                    const cats = Array.isArray(c.provider?.categories) ? c.provider.categories : [];
                    return cats.includes(cat.id);
                  }).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`tab-btn ${activeTab === cat.id ? 'active' : ''}`}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  <span>{cat.label}</span>
                  <span className="count">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estado Vacío */}
        {filteredCoupons.length === 0 && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: 'var(--border-width) solid var(--border-ink)',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-solid)',
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>No se encontraron cupones</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Ningún código coincide con los criterios "{search}" en la categoría seleccionada.
            </p>
            <button
              onClick={() => { setSearch(''); setActiveTab('all'); }}
              className="btn btn-secondary"
            >
              Restablecer Filtros
            </button>
          </div>
        )}

        {/* VISTA 1: LISTA HORIZONTAL EDITORIAL */}
        {viewMode === 'list' && filteredCoupons.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredCoupons.map((coupon) => {
              const prov = coupon.provider;
              const isCopied = copiedId === coupon.id;
              const isUnlocked = unlockedDeals[coupon.id];
              const expiryFormatted = coupon.expiresAt
                ? new Date(coupon.expiresAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
                : 'Permanente';

              return (
                <div
                  key={coupon.id}
                  className="coupon-list-card"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: 'var(--border-width) solid var(--border-ink)',
                    boxShadow: 'var(--shadow-solid)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.2rem',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  {/* Columna Izquierda: Logo + Nombre + Descuento */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 260px' }}>
                    {prov?.logoUrl ? (
                      <img
                        src={normalizeImageUrl(prov.logoUrl)}
                        alt={prov.name}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }
                        }}
                        style={{
                          width: '44px',
                          height: '44px',
                          objectFit: 'contain',
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid var(--border-ink)',
                          borderRadius: '4px',
                          padding: '3px',
                          flexShrink: 0,
                        }}
                      />
                    ) : null}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid var(--border-ink)',
                      borderRadius: '4px',
                      display: prov?.logoUrl ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      flexShrink: 0,
                    }}>
                      {prov?.name?.slice(0, 2).toUpperCase() || 'CP'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.3rem', margin: 0 }}>{prov?.name}</h3>
                        <span className="badge-tag badge-hot" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          {coupon.discount}
                        </span>
                      </div>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        {coupon.condition}
                      </p>
                    </div>
                  </div>

                  {/* Columna Central: Estado y Vencimiento */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', flex: '0 1 180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {coupon.verified ? (
                        <span className="badge-tag badge-green" style={{ fontSize: '0.72rem' }}>
                          ✓ Verificado hoy
                        </span>
                      ) : (
                        <span className="badge-tag" style={{ fontSize: '0.72rem' }}>
                          Promoción
                        </span>
                      )}
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Válido hasta: <strong style={{ color: 'var(--text-ink)' }}>{expiryFormatted}</strong>
                    </span>
                  </div>

                  {/* Columna Derecha: Código + Botón Copiar + Enlace a Oferta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', flex: '0 0 auto' }}>
                    <button
                      onClick={() => handleCopyCode(coupon)}
                      className={`coupon-copy-btn ${isCopied ? 'copied' : ''}`}
                      style={{
                        padding: '0.55rem 0.95rem',
                        fontSize: '0.86rem',
                        backgroundColor: isCopied ? 'var(--green-bright)' : '#FFFFFF',
                        color: isCopied ? '#0B291A' : 'var(--text-ink)',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{coupon.code}</span>
                      <Icon name={isCopied ? 'check' : 'copy'} size={14} />
                      <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                        {isCopied ? '¡Copiado!' : 'Copiar'}
                      </span>
                    </button>

                    <a
                      href={prov?.affiliateUrl}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      onClick={() => handleGoToOffer(coupon)}
                      className="btn btn-primary btn-sm"
                      style={{
                        padding: '0.55rem 0.95rem',
                        fontSize: '0.84rem',
                        opacity: isUnlocked ? 1 : 0.92,
                      }}
                    >
                      <span>{isUnlocked ? 'Ir a la Tienda' : 'Canjear'}</span>
                      <Icon name="external" size={13} color="#fff" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VISTA 2: TICKETS VINTAGE DE IMPRENTA */}
        {viewMode === 'tickets' && filteredCoupons.length > 0 && (
          <div className="cupones-grid">
            {filteredCoupons.map((coupon) => {
              const isUnlocked = unlockedDeals[coupon.id];
              const isCopied = copiedId === coupon.id;
              const prov = coupon.provider;

              const expiryFormatted = coupon.expiresAt
                ? new Date(coupon.expiresAt).toLocaleDateString('es-ES', {
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Permanente';

              return (
                <div key={coupon.id} className="coupon-ticket">
                  {/* Lado Izquierdo del Ticket */}
                  <div className="ticket-left">
                    <div className="ticket-notch-top"></div>
                    <div className="ticket-notch-bottom"></div>

                    <div>
                      <div className="ticket-discount">{coupon.discount}</div>
                      <div className="ticket-provider" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {prov?.logoUrl && (
                          <img
                            src={normalizeImageUrl(prov.logoUrl)}
                            alt={prov.name}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                          />
                        )}
                        <span>{prov?.name}</span>
                      </div>
                      <p className="ticket-condition">{coupon.condition}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="ticket-expiry">Válido hasta: {expiryFormatted}</span>
                      {coupon.verified && (
                        <span className="badge-tag badge-green">✓ Verificado</span>
                      )}
                    </div>
                  </div>

                  {/* Lado Derecho del Ticket */}
                  <div className="ticket-right">
                    <div className="ticket-code-box">{coupon.code}</div>

                    <button
                      onClick={() => handleCopyCode(coupon)}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%' }}
                    >
                      <Icon name={isCopied ? 'check' : 'copy'} size={14} />
                      <span>{isCopied ? '¡Copiado!' : 'Copiar cupón'}</span>
                    </button>

                    {isUnlocked && (
                      <a
                        href={prov?.affiliateUrl}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        onClick={() => handleGoToOffer(coupon)}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', animation: 'toastIn 0.25s ease' }}
                      >
                        <span>Ir a la oferta</span>
                        <Icon name="external" size={13} color="#fff" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
