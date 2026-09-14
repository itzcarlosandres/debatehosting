'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { normalizeImageUrl } from '@/lib/imageHelper';

export const Footer = ({ settings: initialSettings }) => {
  const currentYear = new Date().getFullYear();
  const [branding, setBranding] = useState(
    initialSettings || {
      logoType: 'icon_text',
      logoIcon: 'rocket',
      logoTextPrefix: 'Debate',
      logoTextHighlight: 'hosting',
      logoColor: '#0E6B41',
      logoUrl: '',
      siteName: 'Debatehosting',
    }
  );

  useEffect(() => {
    if (initialSettings) {
      setBranding((prev) => ({ ...prev, ...initialSettings }));
    } else {
      fetch('/api/public/settings', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setBranding((prev) => ({ ...prev, ...data }));
          }
        })
        .catch(() => {});
    }
  }, [initialSettings]);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer">
      {/* Barra Superior Editorial de Estado */}
      <div className="footer-ticker-bar">
        <div className="container footer-ticker-inner">
          <div className="footer-status-indicator">
            <span className="footer-pulse-dot"></span>
            <span className="footer-status-text">
              OBSERVATORIO EN VIVO — AUDITORÍAS TTFB & MONITORIZACIÓN 24/7
            </span>
          </div>
          <button onClick={scrollToTop} className="footer-back-to-top" title="Volver al inicio">
            <span>Volver arriba</span>
            <Icon name="chevronUp" size={14} />
          </button>
        </div>
      </div>

      <div className="container footer-main">
        {/* Fila Principal de Columnas */}
        <div className="footer-grid">
          {/* Columna 1: Marca & Misión Editorial */}
          <div className="footer-col-brand">
            <Link href="/" className="footer-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
              {branding.logoType === 'image' && branding.logoUrl ? (
                <img
                  src={normalizeImageUrl(branding.logoUrl)}
                  alt={branding.siteName || 'Debatehosting'}
                  style={{ maxHeight: '34px', maxWidth: '170px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.svg';
                  }}
                />
              ) : branding.logoType === 'text' ? (
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, color: '#FAF7EE' }}>
                  {branding.logoTextPrefix || 'Debate'}
                  <span style={{ color: branding.logoColor || '#0E6B41' }}>
                    {branding.logoTextHighlight || 'hosting'}
                  </span>
                </span>
              ) : (
                <>
                  <div
                    className="footer-logo-icon"
                    style={{
                      backgroundColor: branding.logoColor || '#0E6B41',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    <Icon name={branding.logoIcon || 'rocket'} size={20} color="#FFFFFF" />
                  </div>
                  <span className="footer-brand-title">
                    {branding.logoTextPrefix || 'Debate'}
                    <span style={{ color: branding.logoColor || '#0E6B41' }}>
                      {branding.logoTextHighlight || 'hosting'}
                    </span>
                  </span>
                </>
              )}
              <span className="footer-brand-pill">EDITORIAL</span>
            </Link>

            <p className="footer-brand-desc">
              Publicación tecnológica independiente especializada en el análisis técnico,
              benchmarking TTFB y estrés de servidores de hosting en español. Sin patrocinios
              ocultos ni puestos comprados.
            </p>

            <div className="footer-trust-seals">
              <div className="trust-seal-pill">
                <span className="seal-check">✓</span>
                <span>Pruebas 100% Reales</span>
              </div>
              <div className="trust-seal-pill">
                <span className="seal-check">✓</span>
                <span>Auditoría TTFB Abierta</span>
              </div>
              <div className="trust-seal-pill">
                <span className="seal-check">✓</span>
                <span>Sin Publicidad Engañosa</span>
              </div>
            </div>
          </div>

          {/* Columna 2: Observatorio & Herramientas */}
          <div className="footer-nav-card">
            <div className="footer-card-header">
              <div className="footer-card-icon-wrap">
                <Icon name="scale" size={14} color="var(--green-primary)" />
              </div>
              <h5 className="footer-col-title">Observatorio</h5>
              <span className="footer-col-count">01</span>
            </div>
            <ul className="footer-links-list">
              <li>
                <Link href="/balanza" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">La Balanza (Calibrador)</span>
                  <span className="footer-pill-tag">AI PRO</span>
                </Link>
              </li>
              <li>
                <Link href="/auditor" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Auditor de Servidores</span>
                  <span className="footer-mini-badge pulse-badge">LIVE</span>
                </Link>
              </li>
              <li>
                <Link href="/proveedores" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Directorio de Proveedores</span>
                </Link>
              </li>
              <li>
                <Link href="/cupones" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Cupones Verificados</span>
                  <span className="footer-pill-tag tag-green">HOT</span>
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Radar de Ofertas</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Categorías de Infraestructura */}
          <div className="footer-nav-card">
            <div className="footer-card-header">
              <div className="footer-card-icon-wrap">
                <Icon name="server" size={14} color="var(--green-primary)" />
              </div>
              <h5 className="footer-col-title">Infraestructura</h5>
              <span className="footer-col-count">02</span>
            </div>
            <ul className="footer-links-list">
              <li>
                <Link href="/ofertas?cat=wordpress" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Hosting WordPress</span>
                </Link>
              </li>
              <li>
                <Link href="/ofertas?cat=vps" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Servidores VPS NVMe</span>
                  <span className="footer-pill-tag">NVMe</span>
                </Link>
              </li>
              <li>
                <Link href="/ofertas?cat=cloud" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Cloud de Rendimiento</span>
                </Link>
              </li>
              <li>
                <Link href="/ofertas?cat=dominios" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Registro de Dominios</span>
                </Link>
              </li>
              <li>
                <Link href="/cupones" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Descuentos Activos</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Legal & Transparencia */}
          <div className="footer-nav-card">
            <div className="footer-card-header">
              <div className="footer-card-icon-wrap">
                <Icon name="shield" size={14} color="var(--green-primary)" />
              </div>
              <h5 className="footer-col-title">Transparencia</h5>
              <span className="footer-col-count">03</span>
            </div>
            <ul className="footer-links-list">
              <li>
                <Link href="/auditor#metodo" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Metodología Editorial</span>
                </Link>
              </li>
              <li>
                <Link href="/afiliados" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Aviso de Afiliación</span>
                  <span className="footer-pill-tag">ÉTICA</span>
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Términos de Servicio</span>
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="footer-link-row">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Política de Privacidad</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="footer-link-row footer-admin-link">
                  <span className="link-arrow">→</span>
                  <span className="link-text">Consola Editorial</span>
                  <Icon name="lock" size={12} />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Caja de Divulgación y Transparencia */}
        <div className="footer-disclosure-box">
          <div className="disclosure-badge">
            <Icon name="shield" size={14} color="var(--green-primary)" />
            <span>TRANSPARENCIA FINANCIERA & AVISO LEGAL</span>
          </div>
          <p className="disclosure-text">
            Debatehosting es un medio tecnológico financiado mediante enlaces de afiliación regulados.
            Al adquirir un plan a través de nuestros botones podemos percibir una comisión de referencia que
            costea nuestros servidores de prueba, proxies de latencia y herramientas de auditoría continua, sin que
            suponga sobrecoste alguno para el usuario. Nuestras valoraciones, clasificaciones de velocidad y veredictos
            del podio se generan de manera estrictamente independiente.
          </p>
        </div>

        {/* Colofón Inferior / Barra de Derechos */}
        <div className="footer-bottom-bar">
          <div className="colophon-left">
            <span>© {currentYear} <strong>Debatehosting</strong>. Todos los derechos reservados.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
