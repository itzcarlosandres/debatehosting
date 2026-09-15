'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { normalizeImageUrl } from '@/lib/imageHelper';
import { DEFAULT_SECTION_HEADERS, DEFAULT_MEJORES_SETTINGS } from '@/lib/settingsDefaults';

export const Mejores = ({ providers = [], settings = {} }) => {
  const mejoresSettings = {
    ...DEFAULT_MEJORES_SETTINGS,
    ...(settings?.mejores || {}),
  };

  if (mejoresSettings.showSection === false) {
    return null;
  }

  const header = {
    ...DEFAULT_SECTION_HEADERS.mejores,
    ...(settings?.sectionHeaders?.mejores || {}),
  };

  const rawItems = mejoresSettings.items || DEFAULT_MEJORES_SETTINGS.items;

  // Enlazar cada item con los datos reales del proveedor si existe
  const cards = rawItems.map((item) => {
    const prov =
      providers.find(
        (p) =>
          p.id === item.providerId ||
          (p.slug && item.providerSlug && p.slug.toLowerCase() === item.providerSlug.toLowerCase()) ||
          (p.name && item.providerName && p.name.toLowerCase() === item.providerName.toLowerCase())
      ) || null;

    return {
      ...item,
      provider: prov,
      displayScore: item.score ?? (prov?.scoreRendimiento ? prov.scoreRendimiento.toFixed(1) : '9.8'),
      displayPrice: item.price || (prov?.priceFrom ? `$${prov.priceFrom.toFixed(2)}/${prov.period || 'mes'}` : '$2.99/mes'),
      displayPriceBefore: item.priceBefore || (prov?.priceBefore ? `$${prov.priceBefore.toFixed(2)}/${prov.period || 'mes'}` : null),
      displayPlan: item.plan || prov?.plan || 'Plan Recomendado',
      displayName: item.providerName || prov?.name || 'Proveedor Destacado',
      displaySlug: prov?.slug || item.providerSlug || 'hosting',
      affiliateUrl: prov ? `/go/${prov.slug}` : (item.ctaUrl || '#'),
      isExternal: !prov && item.ctaUrl && item.ctaUrl.startsWith('http'),
    };
  });

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredCards = activeCategory === 'all'
    ? cards
    : cards.filter((c) => c.id === activeCategory);

  const handleTrackAffiliate = async (prov) => {
    if (!prov) return;
    try {
      await fetch('/api/public/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: prov.id,
          type: 'affiliate_link',
        }),
      });
    } catch (e) {
      // Silencioso
    }
  };

  return (
    <section className="mejores-section" id="mejores">
      <div className="container">
        {/* ENCABEZADO EDITORIAL LIMPIO */}
        <div className="section-header-editorial" style={{ marginBottom: '2rem' }}>
          {header.kicker && <div className="kicker">{header.kicker}</div>}
          <h2 className="section-title">
            {header.titleBefore && `${header.titleBefore} `}
            {header.titleHighlight && <span className="italic-serif">{header.titleHighlight}</span>}
            {header.titleAfter && ` ${header.titleAfter}`}
          </h2>
          {header.subtitle && <p className="section-subtitle">{header.subtitle}</p>}
        </div>

        {/* SELECTOR MINIMALISTA DE CATEGORÍAS */}
        {cards.length > 1 && (
          <div className="mejores-filter-wrap">
            <div className="mejores-filter-bar">
              <button
                type="button"
                className={`mejores-filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                <span>Todos ({cards.length})</span>
              </button>
              {cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={`mejores-filter-btn ${activeCategory === card.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(card.id)}
                >
                  <span>{card.categoryTitle}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PARRILLA COMPACTA DE TARJETAS */}
        <div className="mejores-grid compact">
          {filteredCards.map((card, idx) => {
            const prov = card.provider;
            const badgeTheme =
              card.badgeColor === 'gold'
                ? 'theme-gold'
                : card.badgeColor === 'red'
                ? 'theme-red'
                : card.badgeColor === 'dark'
                ? 'theme-dark'
                : 'theme-green';

            return (
              <article key={card.id || idx} className="mejores-compact-card">
                {/* CABECERA: CATEGORÍA & PUNTUACIÓN */}
                <div className="mejores-card-top">
                  <span className={`mejores-award-tag ${badgeTheme}`}>
                    <Icon name="award" size={12} />
                    <span>{card.categoryTitle}</span>
                  </span>

                  <div className="mejores-clean-score" title={`Calificación: ${card.displayScore} sobre 10`}>
                    <span className="score-num">{card.displayScore}</span>
                    <span className="score-max">/10</span>
                  </div>
                </div>

                {/* MARCA Y PLAN */}
                <div className="mejores-brand-header">
                  {prov?.logoUrl ? (
                    <img
                      src={normalizeImageUrl(prov.logoUrl)}
                      alt={card.displayName}
                      className="mejores-clean-logo"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="mejores-clean-monogram"
                    style={{ display: prov?.logoUrl ? 'none' : 'flex' }}
                  >
                    {card.displayName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="mejores-brand-meta">
                    <h3 className="mejores-clean-name">{card.displayName}</h3>
                    <span className="mejores-clean-plan">{card.displayPlan}</span>
                  </div>
                </div>

                {/* PRECIO COMPACTO */}
                <div className="mejores-clean-price-row">
                  <div className="price-amount-wrap">
                    <span className="price-lead">Desde</span>
                    <span className="price-bold">{card.displayPrice}</span>
                    {card.displayPriceBefore && (
                      <span className="price-old">{card.displayPriceBefore}</span>
                    )}
                  </div>
                </div>

                {/* ACCIONES COMPACTAS */}
                <div className="mejores-clean-actions">
                  <a
                    href={card.affiliateUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={() => handleTrackAffiliate(prov)}
                    className="btn btn-primary mejores-clean-cta"
                  >
                    <span>{card.ctaText || 'Ver Oferta'}</span>
                    <Icon name="external" size={13} />
                  </a>

                  {prov && (
                    <Link
                      href={`/proveedor/${prov.slug}`}
                      className="mejores-clean-link"
                    >
                      <span>Análisis</span>
                      <Icon name="arrowRight" size={11} />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* PIE SUTIL INFORMATIVO */}
        <div className="mejores-clean-footnote">
          <span>¿Quieres calibrar velocidad, precio y soporte con tus propios criterios?</span>
          <Link href="/balanza" className="footnote-link">
            <span>Abrir Balanza Interactiva</span>
            <Icon name="arrowRight" size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
};
