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
    if (!initialSettings) {
      fetch('/api/public/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setBranding((prev) => ({ ...prev, ...data }));
          }
        })
        .catch(() => {});
    }
  }, [initialSettings]);

  return (
    <header className="site-header">
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

        <nav className="nav-desktop">
          <ul className="nav-links">
            <li>
              <a href="/#elegidos" className="nav-link">
                <Icon name="trophy" size={15} />
                <span>El Podio</span>
              </a>
            </li>
            <li>
              <a href="/#ofertas" className="nav-link">
                <Icon name="server" size={15} />
                <span>Ofertas</span>
              </a>
            </li>
            <li>
              <a href="/#balanza" className="nav-link">
                <Icon name="scale" size={15} />
                <span>La Balanza</span>
              </a>
            </li>
            <li>
              <Link href="/cupones" className="nav-link">
                <Icon name="ticket" size={15} />
                <span>Cupones</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-cta-group">
          <Link href="/ofertas" className="btn btn-primary btn-sm header-desktop-cta">
            <span>Ver Ofertas</span>
            <Icon name="arrowRight" size={14} />
          </Link>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-nav-drawer" id="mobile-menu">
          <div className="mobile-nav-header">
            <span className="mobile-nav-kicker">SUMARIO EDITORIAL</span>
            <span className="mobile-nav-badge">DEBATE</span>
          </div>

          <nav className="mobile-nav-list">
            <a 
              href="/#elegidos" 
              className="mobile-nav-item" 
              onClick={() => setMobileOpen(false)}
            >
              <span className="mobile-nav-icon">
                <Icon name="trophy" size={16} color="#0E6B41" />
              </span>
              <span className="mobile-nav-num">01</span>
              <span className="mobile-nav-title">El Podio Editorial</span>
              <span className="mobile-nav-arrow">→</span>
            </a>
            <a 
              href="/#ofertas" 
              className="mobile-nav-item" 
              onClick={() => setMobileOpen(false)}
            >
              <span className="mobile-nav-icon">
                <Icon name="server" size={16} color="#0E6B41" />
              </span>
              <span className="mobile-nav-num">02</span>
              <span className="mobile-nav-title">Ofertas de Hosting</span>
              <span className="mobile-nav-arrow">→</span>
            </a>
            <a 
              href="/#balanza" 
              className="mobile-nav-item" 
              onClick={() => setMobileOpen(false)}
            >
              <span className="mobile-nav-icon">
                <Icon name="scale" size={16} color="#0E6B41" />
              </span>
              <span className="mobile-nav-num">03</span>
              <span className="mobile-nav-title">La Balanza Interactiva</span>
              <span className="mobile-nav-arrow">→</span>
            </a>
            <Link 
              href="/cupones" 
              className="mobile-nav-item" 
              onClick={() => setMobileOpen(false)}
            >
              <span className="mobile-nav-icon">
                <Icon name="ticket" size={16} color="#0E6B41" />
              </span>
              <span className="mobile-nav-num">04</span>
              <span className="mobile-nav-title">Cupones Verificados</span>
              <span className="ticker-hot-pill" style={{ marginLeft: 'auto', marginRight: '0.6rem' }}>ACTIVOS</span>
              <span className="mobile-nav-arrow">→</span>
            </Link>
          </nav>

          <div className="mobile-nav-actions">
            <Link 
              href="/ofertas" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setMobileOpen(false)}
            >
              <span>Ver Catálogo Completo</span>
              <Icon name="arrowRight" size={14} color="#fff" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
