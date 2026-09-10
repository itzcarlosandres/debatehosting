'use client';

import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Icon } from './Icon';

export const News = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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
            <div className="kicker">BOLETÍN PARA DESARROLLADORES Y CREADORES</div>
            <h3>El Debate Semanal.</h3>
            <p>
              Una entrega dominical con bajadas históricas de precios de VPS, auditorías
              de rendimiento y alertas sobre proveedores que recortan recursos en silencio.
              Cero spam, baja en un clic.
            </p>
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
