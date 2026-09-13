'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { useToast } from '../context/ToastContext';
import { normalizeImageUrl } from '@/lib/imageHelper';

export const Cupones = ({ providers = [] }) => {
  const [unlockedDeals, setUnlockedDeals] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const toast = useToast();

  const activeCoupons = useMemo(() => {
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

  // Tomar exactamente las 2 primeras filas para el home
  const topCoupons = useMemo(() => {
    return activeCoupons.slice(0, 2);
  }, [activeCoupons]);

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

  if (activeCoupons.length === 0) return null;

  return (
    <section id="cupones" className="cupones-section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <div className="kicker">CUPONES Y CÓDIGOS DE DESCUENTO</div>
            <h2>
              Cupones que <span className="italic-serif">funcionan</span> de verdad.
            </h2>
            <p style={{ maxWidth: '640px', marginTop: '0.4rem', fontSize: '1.05rem', color: 'var(--text-muted)' }}>
              Acuerdos directos y rebajas comprobadas a mano. Copia el código para desbloquear
              el acceso preferente a la plataforma de cada proveedor.
            </p>
          </div>

          <Link href="/cupones" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Ver todos los cupones ({activeCoupons.length})</span>
            <Icon name="arrowRight" size={15} />
          </Link>
        </div>

        {/* 2 Filas en estilo lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {topCoupons.map((coupon) => {
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
              <div
                key={coupon.id}
                className="coupon-list-row"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: 'var(--border-width) solid var(--border-ink)',
                  boxShadow: 'var(--shadow-solid)',
                  padding: '1.25rem 1.6rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.2rem',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {/* Logo + Nombre + Descuento */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flex: '1 1 280px' }}>
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
                        width: '46px',
                        height: '46px',
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
                    width: '46px',
                    height: '46px',
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
                      <h3 style={{ fontSize: '1.35rem', margin: 0 }}>{prov?.name}</h3>
                      <span className="badge-tag badge-hot" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        {coupon.discount}
                      </span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                      {coupon.condition}
                    </p>
                  </div>
                </div>

                {/* Válido hasta + Verificado */}
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

                {/* Código de Cupón + Botón Copiar + Botón Ir a la Oferta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', flex: '0 0 auto' }}>
                  <button
                    onClick={() => handleCopyCode(coupon)}
                    className={`coupon-copy-btn ${isCopied ? 'copied' : ''}`}
                    style={{
                      padding: '0.55rem 1rem',
                      fontSize: '0.88rem',
                      backgroundColor: isCopied ? 'var(--green-bright)' : '#FFFFFF',
                      color: isCopied ? '#0B291A' : 'var(--text-ink)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{coupon.code}</span>
                    <Icon name={isCopied ? 'check' : 'copy'} size={14} />
                    <span style={{ fontSize: '0.76rem', opacity: 0.85 }}>
                      {isCopied ? '¡Copiado!' : 'Copiar'}
                    </span>
                  </button>

                  <a
                    href={prov?.slug ? `/go/${prov.slug}?c=${coupon.id}` : prov?.affiliateUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={() => handleGoToOffer(coupon)}
                    className="btn btn-primary btn-sm"
                    style={{
                      padding: '0.55rem 1rem',
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

        {/* Botón inferior editorial centrado */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            href="/cupones"
            className="btn btn-secondary"
            style={{
              padding: '0.85rem 2rem',
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: 'var(--shadow-solid)',
            }}
          >
            <span>Explorar los {activeCoupons.length} cupones verificados en el directorio</span>
            <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};
