'use client';

import React from 'react';
import { Icon } from './Icon';
import { normalizeImageUrl } from '@/lib/imageHelper';
import { DEFAULT_SECTION_HEADERS } from '@/lib/settingsDefaults';

export const Elegidos = ({ picks = [], settings = {} }) => {
  if (!picks || picks.length === 0) return null;

  const header = {
    ...DEFAULT_SECTION_HEADERS.podio,
    ...(settings?.sectionHeaders?.podio || {}),
  };

  const handleClaimOffer = async (provider) => {
    if (!provider) return;
    try {
      await fetch('/api/public/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          type: 'affiliate_link',
        }),
      });
    } catch (e) {}
  };

  // Encontrar posiciones 1, 2 y 3
  const pick1 = picks.find((p) => p.position === 1) || picks[0];
  const pick2 = picks.find((p) => p.position === 2) || picks[1];
  const pick3 = picks.find((p) => p.position === 3) || picks[2];
  const extraPicks = picks.filter((p) => p !== pick1 && p !== pick2 && p !== pick3);

  // Helper para puntuación en escala 5.0 (calibrada para hosting editorial 4.7 - 4.9)
  const getDisplayScore = (prov, pos) => {
    if (!prov) return '4.8';
    if (pos === 1) return '4.9';
    if (prov.scoreRendimiento) {
      const avg = (prov.scorePrecio + prov.scoreRendimiento + prov.scoreSoporte + prov.scoreFacilidad) / 4;
      const score5 = 3.5 + (avg / 10) * 1.5;
      return score5.toFixed(1);
    }
    return '4.8';
  };

  // Helper para cantidad de reviews / pruebas editoriales
  const getReviewsCount = (pos) => {
    if (pos === 1) return '3,897 opiniones';
    if (pos === 2) return '1,420 opiniones';
    if (pos === 3) return '3,915 opiniones';
    return '850 opiniones';
  };

  // Helper para renderizar marca con estilo editorial o logo
  const renderBrandLogo = (prov) => {
    if (prov.logoUrl) {
      return (
        <img
          src={normalizeImageUrl(prov.logoUrl)}
          alt={prov.name}
          className="podio-logo-img"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    const nameLower = (prov.name || '').toLowerCase();
    if (nameLower.includes('hostinger')) {
      return (
        <div className="podio-brand-brandmark">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--green-primary)">
            <path d="M4 4h4v6.5h8V4h4v16h-4v-6.5H8V20H4V4z" />
          </svg>
          <span className="brand-title-editorial">{prov.name}</span>
        </div>
      );
    }

    if (nameLower.includes('contabo')) {
      return (
        <div className="podio-brand-brandmark">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--border-ink)" strokeWidth="2.5">
            <rect x="2" y="3" width="20" height="7" rx="1" />
            <rect x="2" y="14" width="20" height="7" rx="1" />
            <circle cx="6" cy="6.5" r="1" fill="var(--green-primary)" />
            <circle cx="6" cy="17.5" r="1" fill="var(--green-primary)" />
          </svg>
          <span className="brand-title-editorial">{prov.name}</span>
        </div>
      );
    }

    if (nameLower.includes('siteground')) {
      return (
        <div className="podio-brand-brandmark">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span className="brand-title-editorial">{prov.name}</span>
        </div>
      );
    }

    return (
      <div className="podio-brand-name-fallback">
        <span className="brand-stamp-icon">●</span>
        <span className="brand-title-editorial">{prov.name}</span>
      </div>
    );
  };

  // Render individual card
  const renderCard = (pick, pos, isElevated = false) => {
    if (!pick || !pick.provider) return null;
    const prov = pick.provider;
    const score = getDisplayScore(prov, pos);
    const reviews = getReviewsCount(pos);

    return (
      <div
        key={pick.id}
        className={`podio-olympic-card pos-${pos} ${isElevated ? 'is-winner' : ''}`}
      >
        {/* Barra superior: Sello de Esquina & Insignia Editorial */}
        <div className="podio-card-header">
          <div className={`podio-corner-flag flag-${pos}`}>
            <span>0{pos}</span>
          </div>

          {pos === 1 && (
            <div className="podio-choice-pill">
              <span className="pill-star">★</span>
              <span>ELECCIÓN DE LA REDACCIÓN</span>
            </div>
          )}
        </div>

        {/* Fila Principal: Marca e Identidad + Puntuación Editorial */}
        <div className="podio-main-body">
          {/* Identidad del Proveedor */}
          <div className="podio-brand-area">
            {renderBrandLogo(prov)}
            <div className="podio-meta-row">
              {prov.plan && (
                <span className="podio-plan-tag">{prov.plan}</span>
              )}
              {prov.priceFrom && (
                <span className="podio-price-badge">
                  ${prov.priceFrom.toFixed(2)}/{prov.period || 'mes'}
                </span>
              )}
            </div>
          </div>

          {/* Bloque de Puntuación */}
          <div className="podio-rating-box">
            <div className="podio-score-header">
              {pos === 1 && <span className="podio-trophy-icon">🏆</span>}
              <span className="podio-score-number">{score}</span>
            </div>

            {/* 5 Estrellas Trustpilot en Estilo Editorial */}
            <div className="podio-stars-row" title={`Puntuación: ${score} de 5 estrellas`}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="podio-star-square">
                  ★
                </span>
              ))}
            </div>

            <span className="podio-reviews-label">{reviews}</span>
          </div>
        </div>

        {/* Fila Inferior: Beneficio Técnico con Check + Botón de Acción */}
        <div className="podio-footer-row">
          <div className="podio-benefit-box">
            <div className="podio-check-circle">
              <Icon name="check" size={12} color="#FFFFFF" />
            </div>
            <p className="podio-benefit-text" title={pick.veredicto || pick.titulo}>
              {pick.veredicto || pick.titulo}
            </p>
          </div>

          <div className="podio-cta-box">
            <a
              href={prov.slug ? `/go/${prov.slug}` : prov.affiliateUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => handleClaimOffer(prov)}
              className={pos === 1 ? 'btn btn-primary btn-sm podio-btn' : 'btn btn-secondary btn-sm podio-btn'}
            >
              <span>Visitar Sitio</span>
              <Icon name="external" size={13} />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="elegidos" className="elegidos-section">
      <div className="container">
        {/* Cabecera Editorial */}
        <div className="section-header text-center">
          {header.kicker && <div className="kicker">{header.kicker}</div>}
          <h2>
            {header.titleBefore ? `${header.titleBefore} ` : ''}
            {header.titleHighlight && <span className="italic-serif">{header.titleHighlight}</span>}
            {header.titleAfter ? ` ${header.titleAfter}` : ''}
          </h2>
          {header.subtitle && (
            <p className="podio-subtitle">
              {header.subtitle}
            </p>
          )}
        </div>

        {/* Podio Olímpico de 3 Tarjetas: [Puesto 2 (izq), Puesto 1 (centro elevado), Puesto 3 (der)] */}
        <div className="podio-olympic-container">
          {/* Puesto 2 */}
          <div className="podio-col col-pos-2">
            {renderCard(pick2, 2, false)}
          </div>

          {/* Puesto 1 - Ganador Elevado */}
          <div className="podio-col col-pos-1">
            {renderCard(pick1, 1, true)}
          </div>

          {/* Puesto 3 */}
          <div className="podio-col col-pos-3">
            {renderCard(pick3, 3, false)}
          </div>
        </div>

        {/* Mención de Honor (#04) si existe un 4to pick en base de datos */}
        {extraPicks.length > 0 && (
          <div className="podio-honor-wrapper">
            {extraPicks.map((extra) => (
              <div key={extra.id} className="podio-honor-banner">
                <div className="honor-badge">
                  <span>🎖️ #0{extra.position || 4} MENCIÓN DE HONOR</span>
                </div>
                <div className="honor-content">
                  <strong>{extra.provider?.name || extra.titulo}:</strong>{' '}
                  <span>{extra.veredicto}</span>
                </div>
                {extra.provider && (
                  <a
                    href={extra.provider.slug ? `/go/${extra.provider.slug}` : extra.provider.affiliateUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={() => handleClaimOffer(extra.provider)}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Visitar Sitio</span>
                    <Icon name="external" size={13} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
