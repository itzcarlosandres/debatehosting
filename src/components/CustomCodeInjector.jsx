'use client';

import { useEffect } from 'react';

/**
 * Inyector dinámico de scripts y código personalizado en el cliente.
 * Reejecuta scripts que requieran inserción activa en el DOM de document.head.
 */
export function CustomCodeInjector({ headCode }) {
  useEffect(() => {
    if (!headCode || typeof document === 'undefined') return;

    try {
      const temp = document.createElement('div');
      temp.innerHTML = headCode;

      const addedElements = [];

      Array.from(temp.childNodes).forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        if (node.tagName === 'SCRIPT') {
          const s = document.createElement('script');
          Array.from(node.attributes).forEach((attr) => {
            s.setAttribute(attr.name, attr.value);
          });
          s.text = node.innerHTML;
          document.head.appendChild(s);
          addedElements.push(s);
        } else {
          const cloned = node.cloneNode(true);
          document.head.appendChild(cloned);
          addedElements.push(cloned);
        }
      });

      return () => {
        addedElements.forEach((el) => {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
      };
    } catch (err) {
      console.error('Error al inyectar código personalizado en <head>:', err);
    }
  }, [headCode]);

  return null;
}
