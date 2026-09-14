'use client';

import React from 'react';
import { Counter } from './Counter';
import { Icon } from './Icon';
import { DEFAULT_HERO_SETTINGS } from '@/lib/settingsDefaults';

export const Hero = ({ providers = [], couponsCount = 0, settings = {} }) => {
  const hero = { ...DEFAULT_HERO_SETTINGS, ...(settings?.hero || {}) };

  const showKicker = hero.showKicker !== false;
  const kickerText = hero.kickerText || hero.kicker || 'OBSERVATORIO DE HOSTING Y NUBE';
  const kickerIcon = hero.kickerIcon || 'sparkles';

  const titleBefore = hero.titleBefore ?? 'El gran';
  const titleHighlight = hero.titleHighlight ?? 'debate';
  const titleAfter = hero.titleAfter ?? 'del hosting.';

  const description =
    hero.description ||
    'Comparamos proveedores en vivo sin sesgos ni publicidad encubierta. Ajusta tus prioridades en La Balanza, analiza las métricas de rendimiento y decide quién se queda con tu proyecto.';

  const showPrimaryBtn = hero.showPrimaryBtn ?? (hero.primaryCtaVisible !== false);
  const primaryBtnText = hero.primaryBtnText || hero.primaryCtaText || 'Pesar Proveedores';
  const primaryBtnUrl = hero.primaryBtnUrl || hero.primaryCtaLink || '#balanza';
  const primaryBtnIcon = hero.primaryBtnIcon || hero.primaryCtaIcon || 'scale';

  const showSecondaryBtn = hero.showSecondaryBtn ?? (hero.secondaryCtaVisible !== false);
  const secondaryBtnText = hero.secondaryBtnText || hero.secondaryCtaText || 'Ver Ofertas';
  const secondaryBtnUrl = hero.secondaryBtnUrl || hero.secondaryCtaLink || '#ofertas';
  const secondaryBtnIcon = hero.secondaryBtnIcon || hero.secondaryCtaIcon || 'arrowRight';

  const showCounters = hero.showCounters !== false;
  const isAuto = (hero.countersMode || 'auto') === 'auto' || hero.stat1Auto;
  const count1 = isAuto ? (providers.length || 12) : Number(hero.counter1Value ?? hero.stat1Count ?? 12);
  const count2 = isAuto ? (couponsCount || 7) : Number(hero.counter2Value ?? hero.stat2Count ?? 7);
  const count3 = hero.counter3Value ?? hero.stat3Count ?? 0;

  const label1 = hero.counter1Label || hero.stat1Label || 'Proveedores analizados';
  const label2 = hero.counter2Label || hero.stat2Label || 'Cupones verificados';
  const label3 = hero.counter3Label || hero.stat3Label || 'Patrocinios pagados';

  const showPreview = hero.showPreviewCard !== false;
  const previewTitle = hero.previewCardTitle || hero.previewTitle || 'COMPARATIVA EDITORIAL EN VIVO';
  const previewBadge = hero.previewCardBadge || hero.previewBadge || 'EN VIVO';
  const f1Name = hero.fighter1Name || hero.previewProvider1Name || 'Hostinger';
  const f1Price = hero.fighter1Price || hero.previewProvider1Sub || '$2.49/mes';
  const f2Name = hero.fighter2Name || hero.previewProvider2Name || 'SiteGround';
  const f2Price = hero.fighter2Price || hero.previewProvider2Sub || '$3.99/mes';

  const m1Label = hero.metric1Label || 'Rendimiento web';
  const m1Scores = hero.metric1Scores || hero.previewProvider1Metric || '9.4 vs 8.8';
  const m1Fill = Math.min(100, Math.max(0, Number(hero.metric1Fill ?? hero.previewProvider1Percent ?? 74)));

  const m2Label = hero.metric2Label || 'Soporte técnico';
  const m2Scores = hero.metric2Scores || hero.previewProvider2Metric || '7.5 vs 9.5';
  const m2Fill = Math.min(100, Math.max(0, Number(hero.metric2Fill ?? hero.previewProvider2Percent ?? 85)));

  const previewBtnText = hero.previewBtnText || hero.previewFooterText || 'Explorar en La Balanza';
  const previewBtnUrl = hero.previewBtnUrl || hero.previewFooterLink || '#balanza';

  return (
    <section className="hero-section">
      <div className="container">
        <div className={`hero-grid ${!showPreview ? 'no-preview' : ''}`} style={!showPreview ? { gridTemplateColumns: '1fr', maxWidth: '820px' } : undefined}>
          {/* Columna Izquierda */}
          <div className="hero-text-content">
            {showKicker && (
              <div className="kicker" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                {kickerIcon && <Icon name={kickerIcon} size={14} />}
                <span>{kickerText}</span>
              </div>
            )}
            
            <h1 className="hero-title">
              {titleBefore && `${titleBefore} `}
              {titleHighlight && <span className="italic-serif">{titleHighlight}</span>}
              {titleAfter && ` ${titleAfter}`}
            </h1>

            <p className="hero-description">{description}</p>

            {(showPrimaryBtn || showSecondaryBtn) && (
              <div className="hero-actions">
                {showPrimaryBtn && (
                  <a href={primaryBtnUrl} className="btn btn-primary">
                    <span>{primaryBtnText}</span>
                    <Icon name={primaryBtnIcon} size={16} />
                  </a>
                )}
                {showSecondaryBtn && (
                  <a href={secondaryBtnUrl} className="btn btn-secondary">
                    <span>{secondaryBtnText}</span>
                    <Icon name={secondaryBtnIcon} size={16} />
                  </a>
                )}
              </div>
            )}

            {/* Contadores Estadísticos Animados */}
            {showCounters && (
              <div className="hero-counters">
                <div className="counter-item">
                  <Counter end={count1} />
                  <span className="counter-label">{label1}</span>
                </div>
                <div className="counter-item">
                  <Counter end={count2} />
                  <span className="counter-label">{label2}</span>
                </div>
                <div className="counter-item">
                  <Counter end={count3} />
                  <span className="counter-label">{label3}</span>
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Tarjeta Preview */}
          {showPreview && (
            <div className="hero-preview-col">
              <div className="hero-preview-card">
                <div className="preview-card-header">
                  <span className="title">{previewTitle}</span>
                  {previewBadge && <span className="badge-tag badge-green">{previewBadge}</span>}
                </div>

                <div className="preview-duel-row">
                  <div className="preview-fighter">
                    <div className="name">{f1Name}</div>
                    <div className="price">{f1Price}</div>
                  </div>
                  <div className="preview-vs">VS</div>
                  <div className="preview-fighter">
                    <div className="name">{f2Name}</div>
                    <div className="price">{f2Price}</div>
                  </div>
                </div>

                <div className="preview-bar-row">
                  <div className="preview-bar-labels">
                    <span>{m1Label}</span>
                    <span>{m1Scores}</span>
                  </div>
                  <div className="preview-progress-track">
                    <div className="preview-progress-fill" style={{ width: `${m1Fill}%` }}></div>
                  </div>
                </div>

                <div className="preview-bar-row">
                  <div className="preview-bar-labels">
                    <span>{m2Label}</span>
                    <span>{m2Scores}</span>
                  </div>
                  <div className="preview-progress-track">
                    <div className="preview-progress-fill" style={{ width: `${m2Fill}%` }}></div>
                  </div>
                </div>

                {previewBtnText && (
                  <div style={{ marginTop: '1.4rem', textAlign: 'center' }}>
                    <a href={previewBtnUrl} className="btn btn-dark btn-sm" style={{ width: '100%' }}>
                      <span>{previewBtnText}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
