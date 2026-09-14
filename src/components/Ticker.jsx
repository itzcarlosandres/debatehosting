'use client';

import React, { useState, useEffect } from 'react';

export const Ticker = ({ items = [], settings: initialSettings }) => {
  const [showTicker, setShowTicker] = useState(
    initialSettings?.showTicker !== undefined ? initialSettings.showTicker : true
  );

  useEffect(() => {
    if (initialSettings && initialSettings.showTicker !== undefined) {
      setShowTicker(initialSettings.showTicker);
    } else {
      fetch('/api/public/settings', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.showTicker !== undefined) {
            setShowTicker(data.showTicker);
          }
        })
        .catch(() => {});
    }
  }, [initialSettings]);

  if (!showTicker) return null;
  if (!items || items.length === 0) return null;

  const displayItems = [...items, ...items];

  return (
    <div className="ticker-wrap" aria-label="Noticias de última hora">
      <div className="ticker-label-container">
        <span className="ticker-label">DEBATE EN VIVO</span>
      </div>
      <div className="ticker-viewport">
        <div className="ticker-track">
          {displayItems.map((item, index) => (
            <span key={`${item.id}-${index}`} className="ticker-item">
              {item.hot && <span className="ticker-hot-pill">HOT</span>}
              <span>{item.text}</span>
              <span style={{ opacity: 0.35, margin: '0 0.8rem' }}>•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
