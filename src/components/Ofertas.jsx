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

export const Ofertas = ({ providers = [] }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [copiedCouponId, setCopiedCouponId] = useState(null);
  const toast = useToast();

  const filteredProviders = useMemo(() => {
    const list =
      activeTab === 'all'
        ? [...providers]
        : providers.filter((p) => {
            const cats = Array.isArray(p.categories) ? p.categories : [];
            return cats.includes(activeTab);
          });

    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [providers, activeTab]);

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

  const handleProviderLinkClick = (provider) => {
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
    <section id="ofertas" className="ofertas-section">
      <div className="container">
        <div className="kicker">RADAR Y DIRECTORIO DE HOSTING</div>
        <h2>
          Todas las ofertas, <span className="italic-serif">en una mesa.</span>
        </h2>
        <p className="sub">
          Filtra por tipo de infraestructura, compara precios reales de renovación y aprovecha
          los códigos de descuento negociados directamente con cada empresa.
        </p>

        {/* Pestañas de Categoría */}
        <div className="tabs-bar">
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`tab-btn ${activeTab === cat.id ? 'active' : ''}`}
            >
              <span>{cat.label}</span>
              <span className="count">({tabCounts[cat.id] || 0})</span>
            </button>
          ))}
        </div>

        {/* Tabla Editorial de Ofertas */}
        <div className="table-container-editorial">
          <table className="deals-table">
            <thead>
              <tr>
                <th>Proveedor y Plan</th>
                <th>Categorías</th>
                <th>Precio / Período</th>
                <th>Descuento</th>
                <th>Cupón Promocional</th>
                <th style={{ textAlign: 'right' }}>Enlace Directo</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((prov) => {
                const hasCoupon = prov.coupons && prov.coupons.length > 0;
                const coupon = hasCoupon ? prov.coupons[0] : null;
                const isCopied = coupon && copiedCouponId === coupon.id;

                const discountPct =
                  prov.priceBefore > prov.priceFrom
                    ? Math.round(((prov.priceBefore - prov.priceFrom) / prov.priceBefore) * 100)
                    : 0;

                return (
                  <tr key={prov.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {prov.logoUrl ? (
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
                        ) : null}
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '4px',
                            backgroundColor: '#FAF7EE',
                            border: '1px solid rgba(23,20,15,0.15)',
                            display: prov.logoUrl ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-serif)',
                            color: 'var(--text-ink)',
                          }}
                        >
                          {prov.name?.slice(0, 2)?.toUpperCase() || 'DH'}
                        </div>
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
                        href={prov.slug ? `/go/${prov.slug}` : prov.affiliateUrl}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        onClick={() => handleProviderLinkClick(prov)}
                        className="btn btn-secondary btn-sm"
                      >
                        <span>Ver web</span>
                        <Icon name="external" size={13} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <Link href="/ofertas" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
            <span>Ver Catálogo Completo de Ofertas ({providers.length} Proveedores)</span>
            <Icon name="arrowRight" size={16} color="#fff" />
          </Link>
        </div>
      </div>
    </section>
  );
};
