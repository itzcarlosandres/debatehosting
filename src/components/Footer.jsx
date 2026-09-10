'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from './Icon';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

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
            <Link href="/" className="footer-logo">
              <div className="footer-logo-icon">
                <Icon name="scale" size={22} color="#FFFFFF" />
              </div>
              <span className="footer-brand-title">Debatehosting</span>
              <span className="footer-brand-pill">EDITORIAL</span>
            </Link>

            <p className="footer-brand-desc">
              Publicación tecnológica independiente especializada en el análisis técnico,
              benchmarking TTFB y estrés de servidores de hosting en español. Sin patrocinios
              ocultos ni puestos comprados.
            </p>

            <div className="footer-trust-seals">
              <div className="trust-seal">
                <span className="seal-icon">✓</span>
                <span>Pruebas 100% Reales</span>
              </div>
              <div className="trust-seal">
                <span className="seal-icon">✓</span>
                <span>Auditoría TTFB Abierta</span>
              </div>
              <div className="trust-seal">
                <span className="seal-icon">✓</span>
                <span>Sin Publicidad Engañosa</span>
              </div>
            </div>
          </div>

          {/* Columna 2: Observatorio & Herramientas */}
          <div className="footer-nav-col">
            <h5 className="footer-col-title">Observatorio</h5>
            <ul className="footer-links-list">
              <li>
                <a href="/#elegidos" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>El Podio Top 3</span>
                </a>
              </li>
              <li>
                <a href="/#ofertas" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>Radar de Ofertas</span>
                </a>
              </li>
              <li>
                <a href="/#balanza" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>La Balanza Algorítmica</span>
                </a>
              </li>
              <li>
                <Link href="/auditor" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>Auditor de Servidores TTFB</span>
                  <span className="footer-mini-badge">LIVE</span>
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>Catálogo Completo 2026</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Categorías de Infraestructura */}
          <div className="footer-nav-col">
            <h5 className="footer-col-title">Infraestructura</h5>
            <ul className="footer-links-list">
              <li>
                <Link href="/ofertas?cat=wordpress" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>Hosting WordPress</span>
                </Link>
              </li>
              <li>
                <Link href="/ofertas?cat=vps" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>Servidores VPS NVMe</span>
                </Link>
              </li>
              <li>
                <Link href="/ofertas?cat=cloud" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>Cloud de Alto Rendimiento</span>
                </Link>
              </li>
              <li>
                <Link href="/ofertas?cat=dominios" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>Registro de Dominios</span>
                </Link>
              </li>
              <li>
                <Link href="/cupones" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>Cupones y Descuentos</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Legal & Ética */}
          <div className="footer-nav-col">
            <h5 className="footer-col-title">Legal & Ética</h5>
            <ul className="footer-links-list">
              <li>
                <Link href="/auditor#metodo" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>Metodología de Pruebas</span>
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>Términos de Servicio</span>
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>Política de Privacidad</span>
                </Link>
              </li>
              <li>
                <Link href="/afiliados" className="footer-link">
                  <span className="link-bullet">›</span>
                  <span>Aviso de Afiliación</span>
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
