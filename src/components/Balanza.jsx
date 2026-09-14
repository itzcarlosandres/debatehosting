'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from './Icon';
import { normalizeImageUrl } from '@/lib/imageHelper';
import { DEFAULT_SECTION_HEADERS } from '@/lib/settingsDefaults';

export const Balanza = ({ providers = [], settings = {}, isPage = false }) => {
  const header = {
    ...DEFAULT_SECTION_HEADERS.balanza,
    ...(settings?.sectionHeaders?.balanza || {}),
  };

  const [activePreset, setActivePreset] = useState(null);
  const [weights, setWeights] = useState({
    precio: 35,
    rendimiento: 25,
    soporte: 20,
    facilidad: 20,
  });

  const handleSliderChange = (key, value) => {
    setActivePreset(null);
    setWeights((prev) => ({
      ...prev,
      [key]: parseInt(value, 10),
    }));
  };

  const handleReset = () => {
    setActivePreset(null);
    setWeights({
      precio: 35,
      rendimiento: 25,
      soporte: 20,
      facilidad: 20,
    });
  };

  const applyPreset = (presetKey) => {
    setActivePreset(presetKey);
    switch (presetKey) {
      case 'ecommerce':
        setWeights({ precio: 15, rendimiento: 45, soporte: 25, facilidad: 15 });
        break;
      case 'speed':
        setWeights({ precio: 10, rendimiento: 60, soporte: 20, facilidad: 10 });
        break;
      case 'blog':
        setWeights({ precio: 35, rendimiento: 25, soporte: 15, facilidad: 25 });
        break;
      case 'budget':
        setWeights({ precio: 60, rendimiento: 15, soporte: 15, facilidad: 10 });
        break;
      default:
        handleReset();
    }
  };

  const rankedProviders = useMemo(() => {
    const totalWeight =
      weights.precio + weights.rendimiento + weights.soporte + weights.facilidad || 1;

    return [...providers]
      .map((p) => {
        const weightedScore =
          (p.scorePrecio * weights.precio +
            p.scoreRendimiento * weights.rendimiento +
            p.scoreSoporte * weights.soporte +
            p.scoreFacilidad * weights.facilidad) /
          totalWeight;

        return {
          ...p,
          calculatedScore: Number(weightedScore.toFixed(1)),
        };
      })
      .sort((a, b) => b.calculatedScore - a.calculatedScore);
  }, [providers, weights]);

  const handleOfferClick = async (provider) => {
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

  return (
    <section id="balanza" className="balanza-section" style={isPage ? { paddingTop: '2.5rem' } : undefined}>
      <div className="container">
        {!isPage && (
          <>
            {header.kicker && (
              <div className="kicker" style={{ color: 'var(--green-bright)' }}>
                {header.kicker}
              </div>
            )}
            <h2>
              {header.titleBefore ? `${header.titleBefore} ` : ''}
              {header.titleHighlight && (
                <span style={{ color: 'var(--green-bright)', fontStyle: 'italic' }}>
                  {header.titleHighlight}
                </span>
              )}
              {header.titleAfter ? ` ${header.titleAfter}` : ''}
            </h2>
            {header.subtitle && <p className="sub">{header.subtitle}</p>}
          </>
        )}

        {/* Barra de Presets Rápidos */}
        <div className="balanza-presets-bar">
          <span className="balanza-presets-title">⚡ Perfiles Rápidos:</span>
          <button
            type="button"
            className={`balanza-preset-chip ${activePreset === 'ecommerce' ? 'active' : ''}`}
            onClick={() => applyPreset('ecommerce')}
          >
            🛒 Tienda Online / WooCommerce
          </button>
          <button
            type="button"
            className={`balanza-preset-chip ${activePreset === 'speed' ? 'active' : ''}`}
            onClick={() => applyPreset('speed')}
          >
            ⚡ Máxima Velocidad (TTFB)
          </button>
          <button
            type="button"
            className={`balanza-preset-chip ${activePreset === 'blog' ? 'active' : ''}`}
            onClick={() => applyPreset('blog')}
          >
            📝 Blog / Web Personal
          </button>
          <button
            type="button"
            className={`balanza-preset-chip ${activePreset === 'budget' ? 'active' : ''}`}
            onClick={() => applyPreset('budget')}
          >
            💰 Máximo Ahorro
          </button>
        </div>

        <div className="balanza-grid">
          {/* Panel Izquierdo: 4 Sliders */}
          <div className="sliders-panel">
            <div className="slider-group">
              <div className="slider-header">
                <span className="slider-title">Precio y Renovación</span>
                <span className="slider-val">{weights.precio}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.precio}
                onChange={(e) => handleSliderChange('precio', e.target.value)}
                className="custom-range"
              />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span className="slider-title">Velocidad / Rendimiento</span>
                <span className="slider-val">{weights.rendimiento}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.rendimiento}
                onChange={(e) => handleSliderChange('rendimiento', e.target.value)}
                className="custom-range"
              />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span className="slider-title">Soporte Técnico</span>
                <span className="slider-val">{weights.soporte}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.soporte}
                onChange={(e) => handleSliderChange('soporte', e.target.value)}
                className="custom-range"
              />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span className="slider-title">Facilidad de Gestión</span>
                <span className="slider-val">{weights.facilidad}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.facilidad}
                onChange={(e) => handleSliderChange('facilidad', e.target.value)}
                className="custom-range"
              />
            </div>

            <button onClick={handleReset} className="sliders-reset-btn">
              Restablecer valores de fábrica
            </button>
          </div>

          {/* Panel Derecho: Tabla de Ranking Dinámica */}
          <div className="ranking-table-panel">
            <div style={{ overflowX: 'auto' }}>
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Proveedor</th>
                    <th>Puntuación</th>
                    <th>Uptime</th>
                    <th>Precio desde</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedProviders.map((prov, index) => {
                    const isLeader = index === 0;
                    return (
                      <tr key={prov.id} className={`ranking-row ${isLeader ? 'leader' : ''}`}>
                        <td className="rank-position">
                          {isLeader ? '★ 1' : `${index + 1}`}
                        </td>
                        <td>
                          <div className="provider-info-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
                                  width: '26px',
                                  height: '26px',
                                  objectFit: 'contain',
                                  backgroundColor: '#FFFFFF',
                                  borderRadius: '3px',
                                  padding: '1.5px',
                                  flexShrink: 0,
                                }}
                              />
                            ) : null}
                            <div
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '3px',
                                backgroundColor: '#FAF7EE',
                                border: '1px solid rgba(23,20,15,0.15)',
                                display: prov.logoUrl ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontWeight: 800,
                                fontSize: '0.7rem',
                                fontFamily: 'var(--font-serif)',
                                color: 'var(--text-ink)',
                              }}
                            >
                              {prov.name?.slice(0, 2)?.toUpperCase() || 'DH'}
                            </div>
                            <span className="provider-name">{prov.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="score-bar-cell">
                            <span className="score-number">{prov.calculatedScore}</span>
                            <div className="score-track">
                              <div
                                className="score-fill"
                                style={{ width: `${prov.calculatedScore * 10}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                            {prov.uptime}%
                          </span>
                        </td>
                        <td>
                          <div className="price-cell">
                            ${prov.priceFrom.toFixed(2)}
                            <span className="period">/{prov.period}</span>
                          </div>
                        </td>
                        <td>
                          <a
                            href={prov.slug ? `/go/${prov.slug}` : prov.affiliateUrl}
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            onClick={() => handleOfferClick(prov)}
                            className="btn-deal-dark"
                          >
                            <span>Oferta</span>
                            <Icon name="external" size={13} color="#0A2E1C" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
