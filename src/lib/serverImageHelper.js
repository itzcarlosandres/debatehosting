import fs from 'fs';
import path from 'path';
import { normalizeImageUrl, getProviderFallbackLogo } from './imageHelper.js';

/**
 * Resuelve el logo final del proveedor en el servidor.
 * Si el logo guardado es un archivo local (/uploads/...) y no existe físicamente en el disco,
 * devuelve automáticamente el logo oficial del dominio del proveedor (Google S2 128px)
 * para evitar URLs rotas o que el navegador cargue imágenes en caché del logo del sitio.
 */
export function resolveProviderLogo(provider) {
  if (!provider) return '';
  const url = provider.logoUrl ? normalizeImageUrl(provider.logoUrl) : '';

  if (url) {
    // URLs externas válidas (http, https, data)
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }

    // Archivos locales subidos (/uploads/...)
    if (url.startsWith('/uploads/')) {
      try {
        const cleanPath = url.replace(/^\/+/, '');
        const candidatePaths = [
          path.resolve(process.cwd(), 'public', cleanPath),
          path.resolve('/app', 'public', cleanPath),
          path.resolve(process.cwd(), cleanPath),
        ];
        const exists = candidatePaths.some((p) => fs.existsSync(p));
        if (exists) {
          return url;
        }
      } catch (e) {}
    }
  }

  // Fallback automático por dominio oficial
  return getProviderFallbackLogo(provider);
}

/**
 * Normaliza un proveedor con categorías parseadas y logoUrl validado contra el disco
 */
export function formatProvider(provider) {
  if (!provider) return provider;
  let cats = [];
  try {
    cats = typeof provider.categories === 'string' ? JSON.parse(provider.categories) : (provider.categories || []);
  } catch (e) {
    cats = [provider.categories];
  }

  return {
    ...provider,
    categories: cats,
    logoUrl: resolveProviderLogo(provider),
  };
}
