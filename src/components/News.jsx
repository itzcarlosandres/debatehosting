'use client';

import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Icon } from './Icon';
import { DEFAULT_SECTION_HEADERS } from '@/lib/settingsDefaults';

export const News = ({ settings = {} }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const header = {
    ...DEFAULT_SECTION_HEADERS.news,
    ...(settings?.sectionHeaders?.news || {}),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Por favor introduce un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/public/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al suscribirte.');

      toast.success(data.message || '¡Gracias por suscribirte a El Debate Semanal!');
      setEmail('');
    } catch (err) {
      toast.error(err.message || 'No se pudo procesar la suscripción.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-card">
          <div className="newsletter-text">
            {header.kicker && <div className="kicker">{header.kicker}</div>}
            <h3>
              {header.titleBefore ? `${header.titleBefore} ` : ''}
              {header.titleHighlight && <span className="italic-serif">{header.titleHighlight}</span>}
              {header.titleAfter ? ` ${header.titleAfter}` : ''}
            </h3>
            {header.subtitle && <p>{header.subtitle}</p>}
          </div>

          <form onSubmit={handleSubmit} className="newsletter-form">
            <div className="input-group-row">
              <input
                type="email"
                placeholder="tu.correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-editorial"
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                <span>{loading ? 'Enviando...' : 'Suscribirme'}</span>
                <Icon name="arrowRight" size={14} color="#fff" />
              </button>
            </div>
            <span className="form-disclaimer">
              Al pulsar aceptas recibir nuestro boletín dominical. Jamás venderemos tu dirección.
            </span>
          </form>
        </div>
      </div>
    </section>
  );
};
