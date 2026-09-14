'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { normalizeImageUrl } from '@/lib/imageHelper';

export const Header = ({ settings: initialSettings }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [branding, setBranding] = useState(
    initialSettings || {
      logoType: 'icon_text',
      logoIcon: 'rocket',
      logoTextPrefix: 'Debate',
      logoTextHighlight: 'hosting',
      logoColor: '#0E6B41',
      logoUrl: '',
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="site-header">
      {/* Barra de Ticker Superior / Noticiero Editorial (Configurable On/Off) */}
      {branding.showTopBar !== false && (
        <div className="header-top-ribbon">
          <div className="container header-top-inner">
            <div className="header-top-left">
              <span className="top-ticker-pulse">
                <span className="pulse-dot"></span>
                {branding.topBarBadge || 'RADAR ACTIVO'}
              </span>
              <span className="top-ticker-sep">|</span>
              <span className="top-ticker-text">
                {branding.topBarText || '14 Proveedores de Hosting bajo auditoría de rendimiento en tiempo real'}
              </span>
            </div>
            <div className="header-top-right">
              <span className="top-ticker-badge">{branding.topBarRightBadge || '100% INDEPENDIENTE'}</span>
              <span className="top-ticker-sep">•</span>
              <span className="top-ticker-date">{branding.topBarRightText || 'EDICIÓN 2026'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Navegación Principal */}
      <div className="site-header-main">
        <div className="container header-inner">
          <Link href="/" className="logo-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            {branding.logoType === 'image' && branding.logoUrl ? (
              <img
                src={normalizeImageUrl(branding.logoUrl)}
                alt={branding.siteName || 'Debatehosting'}
                style={{ maxHeight: '36px', maxWidth: '180px', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.svg';
                }}
              />
            ) : branding.logoType === 'text' ? (
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-ink)' }}>
                {branding.logoTextPrefix || 'Debate'}
                <span style={{ color: branding.logoColor || '#0E6B41' }}>
                  {branding.logoTextHighlight || 'hosting'}
                </span>
              </span>
            ) : (
              <>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: branding.logoColor || '#0E6B41',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={branding.logoIcon || 'rocket'} size={20} color="#FFFFFF" />
                </div>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-ink)' }}>
                  {branding.logoTextPrefix || 'Debate'}
                  <span style={{ color: branding.logoColor || '#0E6B41' }}>
                    {branding.logoTextHighlight || 'hosting'}
                  </span>
                </span>
              </>
            )}
            <span className="editorial" style={{ marginLeft: '0.2rem' }}>EDITORIAL</span>
          </Link>

          {/* Menú de Navegación Desktop Rediseñado con Estilo Píldora Editorial */}
          <nav className="nav-desktop">
            <ul className="nav-pill-group">
              <li>
                <Link href="/balanza" className="nav-pill-link">
                  <span className="nav-pill-icon"><Icon name="scale" size={15} /></span>
                  <span className="nav-pill-text">La Balanza</span>
                  <span className="nav-micro-badge nav-badge-accent">AI</span>
                </Link>
              </li>

              <li>
                <Link href="/proveedores" className="nav-pill-link">
                  <span className="nav-pill-icon"><Icon name="globe" size={15} /></span>
                  <span className="nav-pill-text">Proveedores</span>
                  <span className="nav-pill-count">14</span>
                </Link>
              </li>
              <li>
                <Link href="/cupones" className="nav-pill-link">
                  <span className="nav-pill-icon"><Icon name="ticket" size={15} /></span>
                  <span className="nav-pill-text">Cupones</span>
                  <span className="nav-micro-badge nav-badge-hot">🔥 -85%</span>
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="nav-pill-link">
                  <span className="nav-pill-icon"><Icon name="zap" size={15} /></span>
                  <span className="nav-pill-text">Ofertas</span>
                  <span className="nav-micro-badge nav-badge-live">FLASH</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Grupo de Acciones y CTA */}
          <div className="header-cta-group">
            <Link href="/balanza" className="header-cta-btn desktop-only">
              <span>Explorar Ranking</span>
              <Icon name="arrowRight" size={14} />
            </Link>
            <button
              className={`mobile-menu-btn ${mobileOpen ? 'is-active' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              aria-expanded={mobileOpen}
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Menú Drawer Móvil Rediseñado en Formato Revista Editorial */}
      {mobileOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setMobileOpen(false)}>
          <div className="mobile-nav-drawer" id="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <div className="mobile-nav-header-left">
                <span className="pulse-dot"></span>
                <span className="mobile-nav-kicker">SUMARIO EDITORIAL & NAVEGACIÓN</span>
              </div>
              <button 
                className="mobile-nav-close-btn"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Chips de Categorías Rápidas */}
            <div className="mobile-nav-chips">
              <Link href="/balanza" className="nav-chip" onClick={() => setMobileOpen(false)}>
                <span>⚡ VPS NVMe</span>
              </Link>
              <Link href="/proveedores" className="nav-chip" onClick={() => setMobileOpen(false)}>
                <span>🌐 WordPress</span>
              </Link>
              <Link href="/cupones" className="nav-chip nav-chip-highlight" onClick={() => setMobileOpen(false)}>
                <span>🏷️ Cupones -85%</span>
              </Link>
              <Link href="/ofertas" className="nav-chip" onClick={() => setMobileOpen(false)}>
                <span>☁️ Cloud Hosting</span>
              </Link>
            </div>

            {/* Tarjetas Editoriales de Navegación Móvil */}
            <nav className="mobile-nav-card-list">
              <Link 
                href="/balanza" 
                className="mobile-nav-card" 
                onClick={() => setMobileOpen(false)}
              >
                <div className="mobile-card-icon-box" style={{ background: '#EBF3EA', color: '#0E6B41' }}>
                  <Icon name="scale" size={18} />
                </div>
                <div className="mobile-card-content">
                  <div className="mobile-card-topline">
                    <span className="mobile-card-title">La Balanza Interactiva</span>
                    <span className="nav-micro-badge nav-badge-accent">AI PRO</span>
                  </div>
                  <p className="mobile-card-desc">Calibra precio vs velocidad y TTFB en vivo</p>
                </div>
                <span className="mobile-card-arrow"><Icon name="arrowRight" size={15} /></span>
              </Link>


              <Link 
                href="/proveedores" 
                className="mobile-nav-card" 
                onClick={() => setMobileOpen(false)}
              >
                <div className="mobile-card-icon-box" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                  <Icon name="globe" size={18} />
                </div>
                <div className="mobile-card-content">
                  <div className="mobile-card-topline">
                    <span className="mobile-card-title">Directorio de Proveedores</span>
                    <span className="nav-micro-badge">14 MARCAS</span>
                  </div>
                  <p className="mobile-card-desc">Auditorías técnicas completas y comparativas</p>
                </div>
                <span className="mobile-card-arrow"><Icon name="arrowRight" size={15} /></span>
              </Link>

              <Link 
                href="/cupones" 
                className="mobile-nav-card" 
                onClick={() => setMobileOpen(false)}
              >
                <div className="mobile-card-icon-box" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                  <Icon name="ticket" size={18} />
                </div>
                <div className="mobile-card-content">
                  <div className="mobile-card-topline">
                    <span className="mobile-card-title">Cupones Verificados</span>
                    <span className="nav-micro-badge nav-badge-hot">🔥 -85% OFF</span>
                  </div>
                  <p className="mobile-card-desc">Códigos promocionales probados hoy</p>
                </div>
                <span className="mobile-card-arrow"><Icon name="arrowRight" size={15} /></span>
              </Link>

              <Link 
                href="/ofertas" 
                className="mobile-nav-card" 
                onClick={() => setMobileOpen(false)}
              >
                <div className="mobile-card-icon-box" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <Icon name="zap" size={18} />
                </div>
                <div className="mobile-card-content">
                  <div className="mobile-card-topline">
                    <span className="mobile-card-title">Radar de Ofertas Flash</span>
                    <span className="nav-micro-badge nav-badge-live">FLASH</span>
                  </div>
                  <p className="mobile-card-desc">Descuentos temporales y planes al costo</p>
                </div>
                <span className="mobile-card-arrow"><Icon name="arrowRight" size={15} /></span>
              </Link>
            </nav>

            {/* Fila de Métricas y Transparencia */}
            <div className="mobile-nav-trust-row">
              <div className="trust-mini-item">
                <span className="trust-mini-val">14</span>
                <span className="trust-mini-label">Proveedores</span>
              </div>
              <div className="trust-mini-item">
                <span className="trust-mini-val">&lt;450ms</span>
                <span className="trust-mini-label">TTFB Promedio</span>
              </div>
              <div className="trust-mini-item">
                <span className="trust-mini-val">100%</span>
                <span className="trust-mini-label">Independiente</span>
              </div>
            </div>

            {/* Acciones Finales del Cajón */}
            <div className="mobile-nav-actions">
              <Link 
                href="/balanza" 
                className="btn btn-primary mobile-cta-full" 
                onClick={() => setMobileOpen(false)}
              >
                <span>Explorar Balanza Interactiva</span>
                <Icon name="arrowRight" size={14} color="#FFFFFF" />
              </Link>
              <div className="mobile-drawer-footnote">
                <span>DebateHosting • Periodismo tecnológico y auditorías reales de infraestructura.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
