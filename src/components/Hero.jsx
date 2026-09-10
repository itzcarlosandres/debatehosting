'use client';

import React from 'react';
import { Counter } from './Counter';
import { Icon } from './Icon';

export const Hero = ({ providers = [], couponsCount = 0 }) => {
  const activeCount = providers.length;

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Columna Izquierda */}
          <div className="hero-text-content">
            <div className="kicker">OBSERVATORIO DE HOSTING Y NUBE</div>
            <h1 className="hero-title">
              El gran <span className="italic-serif">debate</span> del hosting.
            </h1>
            <p className="hero-description">
              Comparamos proveedores en vivo sin sesgos ni publicidad encubierta.
              Ajusta tus prioridades en La Balanza, analiza las métricas de rendimiento y decide
              quién se queda con tu proyecto.
            </p>

            <div className="hero-actions">
              <a href="#balanza" className="btn btn-primary">
                <span>Pesar Proveedores</span>
                <Icon name="scale" size={16} />
              </a>
              <a href="#ofertas" className="btn btn-secondary">
                <span>Ver Ofertas</span>
                <Icon name="arrowRight" size={16} />
              </a>
            </div>

            {/* Contadores Estadísticos Animados */}
            <div className="hero-counters">
              <div className="counter-item">
                <Counter end={activeCount || 11} />
                <span className="counter-label">Proveedores analizados</span>
              </div>
              <div className="counter-item">
                <Counter end={couponsCount || 6} />
                <span className="counter-label">Cupones verificados</span>
              </div>
              <div className="counter-item">
                <Counter end={0} />
                <span className="counter-label">Patrocinios pagados</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Preview */}
          <div className="hero-preview-col">
            <div className="hero-preview-card">
              <div className="preview-card-header">
                <span className="title">COMPARATIVA EDITORIAL EN VIVO</span>
                <span className="badge-tag badge-green">EN VIVO</span>
              </div>

              <div className="preview-duel-row">
                <div className="preview-fighter">
                  <div className="name">Hostinger</div>
                  <div className="price">$2.49/mes</div>
                </div>
                <div className="preview-vs">VS</div>
                <div className="preview-fighter">
                  <div className="name">SiteGround</div>
                  <div className="price">$3.99/mes</div>
                </div>
              </div>

              <div className="preview-bar-row">
                <div className="preview-bar-labels">
                  <span>Rendimiento web</span>
                  <span>9.4 vs 8.8</span>
                </div>
                <div className="preview-progress-track">
                  <div className="preview-progress-fill" style={{ width: '74%' }}></div>
                </div>
              </div>

              <div className="preview-bar-row">
                <div className="preview-bar-labels">
                  <span>Soporte técnico</span>
                  <span>7.5 vs 9.5</span>
                </div>
                <div className="preview-progress-track">
                  <div className="preview-progress-fill" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div style={{ marginTop: '1.4rem', textAlign: 'center' }}>
                <a href="#balanza" className="btn btn-dark btn-sm" style={{ width: '100%' }}>
                  <span>Explorar en La Balanza</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
