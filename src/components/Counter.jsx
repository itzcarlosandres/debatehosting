'use client';

import React, { useEffect, useState } from 'react';

export const Counter = ({ end, duration = 1200, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const finalNumber = Number(end) || 0;

    if (finalNumber === 0) {
      setCount(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * finalNumber));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(finalNumber);
      }
    };

    window.requestAnimationFrame(step);
  }, [end, duration]);

  return (
    <span className="counter-number">
      {prefix}
      {count}
      {suffix}
    </span>
  );
};
