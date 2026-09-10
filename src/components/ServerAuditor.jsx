'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { useToast } from '../context/ToastContext';

const QUICK_TESTS = [
  'hostinger.com',
  'wikipedia.org',
  'wordpress.org',
  'cloudflare.com',
  'ionos.com',
];

export const ServerAuditor = ({ isCompact = false }) => {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  const toast = useToast();

  const handleAudit = async (targetUrl) => {
    const query = (targetUrl || urlInput).trim();
    if (!query) {
      toast.error('Por favor introduce una dirección web.');
      return;
    }

    setUrlInput(query);
    setErrorMsg('');
    setResult(null);
    setLoading(true);
    setLoadingStep(1);

    // Simular pasos visuales del radar
    const stepTimer1 = setTimeout(() => setLoadingStep(2), 500);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 1100);

    try {
      const res = await fetch('/api/public/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: query }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo completar la auditoría.');
      }

      setResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un fallo de conexión.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const handleCopyCoupon = (code) => {
    if (!code) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCoupon(code);
    toast.success(`Cupón ${code} copiado al portapapeles.`);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  return (
    <div className={`server-auditor-wrapper ${isCompact ? 'compact' : ''}`}>
      <div className="auditor-box" style={{
        backgroundColor: 'var(--bg-surface)',
        border: 'var(--border-width) solid var(--border-ink)',
        boxShadow: 'var(--shadow-solid)',
        padding: isCompact ? '2rem 1.5rem' : '3rem 2rem',
        borderRadius: 'var(--radius-sm)',
        position: 'relative',
      }}>
        {/* Cabecera del Inspector */}
        <div style={{ textAlign: isCompact ? 'left' : 'center', marginBottom: '2rem' }}>
          <div className="kicker" style={{ color: 'var(--green-primary)' }}>
            INSPECTOR DE HOSTING & AUDITOR DE VELOCIDAD TTFB
          </div>
          <h2 style={{ fontSize: isCompact ? '2rem' : '2.8rem', lineHeight: 1.15, marginBottom: '0.6rem' }}>
            Inspecciona cualquier web. <span className="italic-serif">Descubre su servidor.</span>
          </h2>
          <p style={{
            maxWidth: '720px',
            margin: isCompact ? '0' : '0 auto',
            color: 'var(--text-muted)',
            fontSize: '1.05rem',
            lineHeight: 1.45
          }}>
            Introduce una URL para detectar en tiempo real su <strong>proveedor de hosting</strong> (Cloudflare, Hetzner, AWS, Hostinger...), 
            servidor web (LiteSpeed, Nginx), CMS y la <strong>velocidad exacta de respuesta (TTFB en ms)</strong>.
          </p>
        </div>

        {/* Barra de Entrada y Botón de Escaneo */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAudit();
          }}
          style={{
            maxWidth: '680px',
            margin: '0 auto 1.2rem auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.6rem',
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 320px' }}>
            <input
              type="text"
              placeholder="Escribe un dominio (ej: tuweb.com, elpais.com...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={loading}
              className="input-editorial"
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.6rem',
                fontSize: '1.05rem',
                fontFamily: 'var(--font-mono)',
              }}
            />
            <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
              <Icon name="search" size={17} />
            </span>
            {urlInput && !loading && (
              <button
                type="button"
                onClick={() => { setUrlInput(''); setResult(null); setErrorMsg(''); }}
                style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
              >
                <Icon name="close" size={15} />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '0.85rem 1.6rem',
              fontSize: '1rem',
              minWidth: '170px',
              justifyContent: 'center',
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="spinner-dot"></span>
                <span>Auditando...</span>
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Auditar Servidor</span>
                <Icon name="arrowRight" size={16} color="#fff" />
              </span>
            )}
          </button>
        </form>

        {/* Chips de Prueba Rápida */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCompact ? 'flex-start' : 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          marginBottom: '2rem'
        }}>
          <span>Probar ejemplo:</span>
          {QUICK_TESTS.map((domain) => (
            <button
              key={domain}
              type="button"
              onClick={() => handleAudit(domain)}
              disabled={loading}
              style={{
                background: 'rgba(23,20,15,0.05)',
                border: '1px solid var(--border-ink)',
                padding: '0.2rem 0.6rem',
                borderRadius: '3px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--text-ink)',
              }}
            >
              {domain}
            </button>
          ))}
        </div>

        {/* Feedback de Estado de Carga con Radar Editorial */}
        {loading && (
          <div style={{
            maxWidth: '680px',
            margin: '0 auto 2rem auto',
            backgroundColor: '#FAF7EE',
            border: '1.5px dashed var(--border-ink)',
            padding: '1.5rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '0.6rem' }}>
              <Icon name="scale" size={20} color="var(--green-primary)" />
              <strong style={{ textTransform: 'uppercase' }}>
                {loadingStep === 1 && '1/3 Resolviendo DNS e IP pública...'}
                {loadingStep === 2 && '2/3 Conectando y midiendo latencia TTFB...'}
                {loadingStep >= 3 && '3/3 Extrayendo cabeceras, CMS y servidor web...'}
              </strong>
            </div>
            <div style={{
              height: '6px',
              backgroundColor: 'rgba(23,20,15,0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
              maxWidth: '400px',
              margin: '0 auto',
            }}>
              <div style={{
                height: '100%',
                width: loadingStep === 1 ? '35%' : loadingStep === 2 ? '70%' : '95%',
                backgroundColor: 'var(--green-primary)',
                transition: 'width 0.4s ease',
              }}></div>
            </div>
          </div>
        )}

        {/* Mensaje de Error */}
        {errorMsg && (
          <div style={{
            maxWidth: '680px',
            margin: '0 auto 2rem auto',
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #EF4444',
            padding: '1.2rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            color: '#991B1B',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.88rem',
          }}>
            <Icon name="close" size={18} color="#DC2626" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Ficha de Resultados Editorial */}
        {result && !loading && (
          <div style={{
            maxWidth: '850px',
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            border: '2px solid var(--border-ink)',
            boxShadow: '4px 4px 0 var(--border-ink)',
            padding: '2rem',
            borderRadius: 'var(--radius-sm)',
            animation: 'toastIn 0.3s ease',
          }}>
            {/* Cabecera del Resultado */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1.5px solid var(--border-ink)',
              paddingBottom: '1.2rem',
              marginBottom: '1.5rem',
              gap: '1rem',
            }}>
              <div>
                <span className="badge-tag badge-green" style={{ marginBottom: '0.3rem', display: 'inline-block' }}>
                  INFORME DE AUDITORÍA TÉCNICA
                </span>
                <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{result.hostname}</h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  IP: <strong>{result.ip}</strong> {result.location ? `· ${result.location}` : ''}
                </div>
              </div>

              {/* Sello de Calificación Editorial */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: '#FAF7EE',
                border: '1.5px solid var(--border-ink)',
                padding: '0.8rem 1.2rem',
                borderRadius: 'var(--radius-sm)',
              }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Calificación Servidor
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: result.evaluation.color }}>
                    {result.evaluation.status}
                  </div>
                </div>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: result.evaluation.color,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  border: '2px solid var(--border-ink)',
                  boxShadow: '2px 2px 0 #000000',
                  flexShrink: 0,
                }}>
                  {result.evaluation.grade}
                </div>
              </div>
            </div>

            {/* Métrica Estrella: TTFB y Velocidad */}
            <div style={{
              backgroundColor: '#FAF7EE',
              border: '1px solid rgba(23,20,15,0.15)',
              padding: '1.2rem 1.5rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.8rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Tiempo de Respuesta al Primer Byte (TTFB):
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: result.evaluation.color
                }}>
                  {result.performance.ttfbMs} ms
                </span>
              </div>

              {/* Barra de progreso de latencia */}
              <div style={{ height: '10px', backgroundColor: 'rgba(23,20,15,0.1)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(Math.max((result.performance.ttfbMs / 1000) * 100, 5), 100)}%`,
                  backgroundColor: result.evaluation.color,
                  transition: 'width 0.5s ease',
                }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                <span>0 ms (Instantáneo)</span>
                <span style={{ color: 'var(--green-primary)', fontWeight: 600 }}>≤ 200 ms (Estándar Google)</span>
                <span>1000 ms+ (Penalizable)</span>
              </div>

              <p style={{ margin: '0.8rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-ink)', lineHeight: 1.4 }}>
                <strong>Dictamen Técnico:</strong> {result.evaluation.verdict}
              </p>
            </div>

            {/* Grid de Datos Detectados */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              {/* Proveedor / Hosting */}
              <div style={{ border: '1px solid var(--border-ink)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Infraestructura / Hosting
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.15rem', marginTop: '0.2rem' }}>
                  {result.provider.name}
                </div>
                <span className="badge-tag badge-green" style={{ fontSize: '0.68rem', marginTop: '0.4rem', display: 'inline-block' }}>
                  {result.provider.type}
                </span>
              </div>

              {/* Servidor Web */}
              <div style={{ border: '1px solid var(--border-ink)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Servidor Web Detectado
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.15rem', marginTop: '0.2rem' }}>
                  {result.serverWeb}
                </div>
                <span className="badge-tag" style={{ fontSize: '0.68rem', marginTop: '0.4rem', display: 'inline-block' }}>
                  {result.performance.protocol} · {result.performance.compression}
                </span>
              </div>

              {/* CMS / Tecnología */}
              <div style={{ border: '1px solid var(--border-ink)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Gestor de Contenidos (CMS)
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.15rem', marginTop: '0.2rem' }}>
                  {result.cms.name}
                </div>
                <span className="badge-tag" style={{ fontSize: '0.68rem', marginTop: '0.4rem', display: 'inline-block' }}>
                  {result.cms.badge}
                </span>
              </div>
            </div>

            {/* Recomendación Editorial Inteligente */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div style={{
                backgroundColor: '#FAF7EE',
                border: '1.5px solid var(--border-ink)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-sm)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Icon name="shield" size={18} color="var(--green-primary)" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Recomendación Editorial de Debatehosting
                  </span>
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                  ¿Buscas una infraestructura certificada con <strong>TTFB inferior a 180 ms</strong> y servidores en España, Europa o América? 
                  Estos son los proveedores auditados con mejor relación velocidad/precio:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {result.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid var(--border-ink)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{rec.name}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--green-primary)', fontWeight: 700 }}>
                            {rec.uptime}% Uptime
                          </span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                          Plan: {rec.plan}
                        </div>

                        {rec.coupon && (
                          <div style={{ marginBottom: '0.8rem' }}>
                            <button
                              type="button"
                              onClick={() => handleCopyCoupon(rec.coupon)}
                              className="coupon-copy-btn"
                              style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
                            >
                              <span>Cupón: <strong>{rec.coupon}</strong></span>
                              <Icon name={copiedCoupon === rec.coupon ? 'check' : 'copy'} size={13} />
                              <span>{copiedCoupon === rec.coupon ? '¡Copiado!' : (rec.discount || 'Copiar')}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <a
                        href={rec.affiliateUrl}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '0.4rem' }}
                      >
                        <span>Ver Oferta Oficial</span>
                        <Icon name="external" size={13} color="#fff" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
