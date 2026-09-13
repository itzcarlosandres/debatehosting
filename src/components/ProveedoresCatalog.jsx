'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { normalizeImageUrl } from '@/lib/imageHelper';

export const ProveedoresCatalog = ({ providers = [], categories = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'price' | 'uptime' | 'alphabetical'
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Calcular puntuación media de cada proveedor
  const providersWithScore = useMemo(() => {
    return providers.map((p) => {
      const avgScore = (
        ((p.scorePrecio || 8) +
          (p.scoreRendimiento || 8) +
          (p.scoreSoporte || 8) +
          (p.scoreFacilidad || 8)) /
        4
      ).toFixed(1);

      let parsedCats = [];
      try {
        parsedCats = Array.isArray(p.categories) ? p.categories : JSON.parse(p.categories);
      } catch (e) {
        parsedCats = [p.categories || 'hosting'];
      }

      return {
        ...p,
        averageScore: parseFloat(avgScore),
        parsedCategories: parsedCats,
      };
    });
  }, [providers]);

  // Filtrado y ordenamiento
  const filteredProviders = useMemo(() => {
    let result = providersWithScore.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.plan && p.plan.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' ||
        p.parsedCategories.some(
          (c) => c.toLowerCase() === selectedCategory.toLowerCase()
        );

      return matchesSearch && matchesCat;
    });

    result.sort((a, b) => {
      if (sortBy === 'score') return b.averageScore - a.averageScore;
      if (sortBy === 'price') return a.priceFrom - b.priceFrom;
      if (sortBy === 'uptime') return b.uptime - a.uptime;
      if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [providersWithScore, searchTerm, selectedCategory, sortBy]);

  const faqs = [
    {
      q: '¿Cómo evalúa Debatehosting a cada proveedor?',
      a: 'Auditamos cada empresa con pruebas técnicas reales: medimos el tiempo de respuesta inicial (TTFB) con servidores LiteSpeed y Apache/Nginx, probamos el soporte técnico en español en diferentes horarios y evaluamos la transparencia de sus precios en la renovación.',
    },
    {
      q: '¿Por qué usar los enlaces de Debatehosting para contratar?',
      a: 'Al hacer clic en nuestros enlaces o cupones (/go/[slug]), se activan automáticamente las mejores ofertas y descuentos negociados para nuestra comunidad, asegurando que obtengas el precio más bajo posible sin costes extra.',
    },
    {
      q: '¿Qué proveedor es mejor para WordPress?',
      a: 'Para sitios en WordPress recomendamos proveedores con servidores web LiteSpeed, caché a nivel de servidor (LSCache) y discos NVMe de alta velocidad, como BanaHosting, Raiola Networks o Webempresa.',
    },
    {
      q: '¿Qué significa el Uptime y por qué es importante?',
      a: 'El Uptime es el porcentaje de tiempo que un servidor permanece en línea y disponible. Un 99.9% garantiza que tu sitio web sufrirá menos de 8 horas de caída acumulada en todo un año.',
    },
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      {/* Encabezado Editorial */}
      <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 3rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: '#FAF7EE',
            border: '1px solid var(--border-ink)',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-ink)',
            marginBottom: '1rem',
          }}
        >
          <Icon name="shield" size={14} color="var(--green-primary)" />
          <span>Auditoría y Directorio Editorial 2026</span>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}
        >
          Directorio Oficial de Proveedores de Hosting
        </h1>
        <p
          style={{
            fontSize: '1.08rem',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            margin: '0 auto',
          }}
        >
          Análisis exhaustivo de empresas de alojamiento web, servidores VPS y cloud.
          Comparamos velocidad real <strong>TTFB</strong>, estabilidad auditada, calidad del soporte
          y cupones activos para que elijas con total confianza.
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid var(--border-ink)',
          boxShadow: 'var(--shadow-hard)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Input de Búsqueda */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar por nombre de hosting o plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                border: '1.5px solid var(--border-ink)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#FAF7EE',
              }}
            />
          </div>

          {/* Selector de Ordenamiento */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)' }}>
              Ordenar:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.65rem 0.9rem',
                border: '1.5px solid var(--border-ink)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="score">🏆 Mayor Nota Editorial</option>
              <option value="price">💰 Precio más bajo</option>
              <option value="uptime">⚡ Mayor Uptime (%)</option>
              <option value="alphabetical">🔤 Nombre (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Píldoras de Categoría */}
        {categories && categories.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '1rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid rgba(23,20,15,0.08)',
            }}
          >
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                border: '1px solid var(--border-ink)',
                cursor: 'pointer',
                backgroundColor: selectedCategory === 'all' ? 'var(--text-ink)' : '#FAF7EE',
                color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--text-ink)',
                transition: 'all 0.15s ease',
              }}
            >
              Todos ({providers.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  border: '1px solid var(--border-ink)',
                  cursor: 'pointer',
                  backgroundColor: selectedCategory === cat.slug ? 'var(--green-primary)' : '#FAF7EE',
                  color: selectedCategory === cat.slug ? '#FFFFFF' : 'var(--text-ink)',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid de Proveedores */}
      {filteredProviders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            backgroundColor: '#FAF7EE',
            border: '1.5px dashed var(--border-ink)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Icon name="server" size={40} color="var(--text-muted)" />
          <h3 style={{ marginTop: '1rem', fontFamily: 'var(--font-serif)', fontSize: '1.35rem' }}>
            No se encontraron proveedores
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.3rem' }}>
            Intenta cambiar el término de búsqueda o seleccionar otra categoría.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '1.2rem' }}
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.75rem',
            marginBottom: '4rem',
          }}
        >
          {filteredProviders.map((p) => {
            const hasDiscount = p.priceBefore && p.priceBefore > p.priceFrom;
            const discountPct = hasDiscount
              ? Math.round(((p.priceBefore - p.priceFrom) / p.priceBefore) * 100)
              : 0;

            const couponsCount = p.coupons?.length || 0;

            return (
              <div
                key={p.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--border-ink)',
                  boxShadow: 'var(--shadow-hard)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Cabecera de la tarjeta */}
                <div
                  style={{
                    padding: '1.25rem',
                    borderBottom: '1px solid rgba(23,20,15,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FAF7EE',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {p.logoUrl ? (
                      <img
                        src={normalizeImageUrl(p.logoUrl)}
                        alt={p.name}
                        style={{
                          width: '44px',
                          height: '44px',
                          objectFit: 'contain',
                          backgroundColor: '#FFFFFF',
                          padding: '4px',
                          borderRadius: '8px',
                          border: '1px solid rgba(23,20,15,0.12)',
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          backgroundColor: '#E8E3D5',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                        }}
                      >
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          lineHeight: 1.2,
                          margin: 0,
                        }}
                      >
                        {p.name}
                      </h3>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        Plan: {p.plan || 'Estándar'}
                      </span>
                    </div>
                  </div>

                  {/* Badge de Proveedor */}
                  {p.badge && (
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor:
                          p.badgeColor === 'red'
                            ? '#DC2626'
                            : p.badgeColor === 'gold'
                            ? '#D97706'
                            : 'var(--green-primary)',
                        color: '#FFFFFF',
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>

                {/* Cuerpo con Benchmarks */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Puntuación Media y Uptime */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#FAF7EE',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(23,20,15,0.06)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        NOTA EDITORIAL
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--green-primary)' }}>
                          {p.averageScore}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>/10</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        UPTIME AUDITADO
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700 }}>
                        {p.uptime || 99.9}%
                      </span>
                    </div>
                  </div>

                  {/* Desglose de Puntuaciones */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>⚡ Rendimiento</span>
                      <strong>{p.scoreRendimiento || 9}/10</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>💬 Soporte Técnico</span>
                      <strong>{p.scoreSoporte || 9}/10</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>💰 Calidad / Precio</span>
                      <strong>{p.scorePrecio || 9}/10</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>🛠️ Facilidad de Uso</span>
                      <strong>{p.scoreFacilidad || 9}/10</strong>
                    </div>
                  </div>

                  {/* Precio y Descuento */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid rgba(23,20,15,0.08)',
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block' }}>
                        Precio desde:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800 }}>
                          ${p.priceFrom?.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          /{p.period || 'mes'}
                        </span>
                        {hasDiscount && (
                          <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--text-light)' }}>
                            ${p.priceBefore.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {hasDiscount && (
                      <span
                        style={{
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                        }}
                      >
                        -{discountPct}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones de la Tarjeta */}
                <div
                  style={{
                    padding: '0.9rem 1.25rem',
                    backgroundColor: '#FAF7EE',
                    borderTop: '1px solid rgba(23,20,15,0.08)',
                    display: 'flex',
                    gap: '0.75rem',
                  }}
                >
                  {/* Botón Ver Ficha y Análisis */}
                  <Link
                    href={`/proveedores/${p.slug}`}
                    className="btn btn-secondary btn-sm"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                    }}
                  >
                    <span>Ficha y Análisis</span>
                    <Icon name="arrowRight" size={13} />
                  </Link>

                  {/* Botón Enlace Limpio Visitar Sitio */}
                  <a
                    href={`/go/${p.slug}`}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                    }}
                  >
                    <span>Visitar Web</span>
                    <Icon name="external" size={13} color="#fff" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sección Editorial: Cómo Auditamos */}
      <div
        style={{
          backgroundColor: '#FAF7EE',
          border: '1.5px solid var(--border-ink)',
          boxShadow: 'var(--shadow-hard)',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '4rem',
        }}
      >
        <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--green-primary)', textTransform: 'uppercase' }}>
            METODOLOGÍA TRANSPARENTE
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', marginTop: '0.4rem' }}>
            ¿Cómo Evaluamos a Cada Proveedor en Debatehosting?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            A diferencia de otros comparadores que solo listan el hosting que más comisión paga, en Debatehosting
            realizamos pruebas continuas para asegurar recomendaciones veraces.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-sm)' }}>
            <Icon name="zap" size={24} color="var(--green-primary)" />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
              Test de Velocidad TTFB
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Medimos el Time to First Byte desde servidores en España, Europa y América con monitorización constante.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-sm)' }}>
            <Icon name="shield" size={24} color="var(--green-primary)" />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
              Uptime 24/7/365
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Comprobamos la estabilidad real con pings cada 60 segundos para certificar que cumplan el SLA del 99.9%.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-sm)' }}>
            <Icon name="sliders" size={24} color="var(--green-primary)" />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
              Soporte de Incógnito
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Abrimos tickets y chats técnicos sin identificarnos para evaluar el tiempo de respuesta real y la amabilidad.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-sm)' }}>
            <Icon name="scale" size={24} color="var(--green-primary)" />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
              Precios Sin Letra Pequeña
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Verificamos el coste de renovación para advertirte si el precio se duplica o triplica tras el primer año.
            </p>
          </div>
        </div>
      </div>

      {/* Preguntas Frecuentes (FAQs) */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.8rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          Preguntas Frecuentes sobre Proveedores de Hosting
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--border-ink)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--text-ink)',
                  }}
                >
                  <span>{faq.q}</span>
                  <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size={18} color="var(--text-muted)" />
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 1.25rem 1.25rem',
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      color: 'var(--text-muted)',
                      borderTop: '1px solid rgba(23,20,15,0.06)',
                      paddingTop: '0.75rem',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
