/**
 * Utilidad para normalizar URLs de imágenes y logos
 * Asegura que cualquier ruta relativa local comience con '/'
 * para evitar que el navegador la resuelva de forma relativa en subpáginas (/admin, /ofertas, etc.)
 */
export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  return `/${trimmed}`;
}

/**
 * Obtiene el dominio del proveedor a partir de su affiliateUrl o slug
 */
export function getProviderDomain(prov) {
  if (!prov) return '';
  if (prov.affiliateUrl && typeof prov.affiliateUrl === 'string') {
    try {
      const url = new URL(prov.affiliateUrl);
      const host = url.hostname.replace(/^www\./, '');
      if (host && !host.includes('debatehosting.com')) {
        return host;
      }
    } catch (e) {}
  }
  if (prov.slug && typeof prov.slug === 'string') {
    return `${prov.slug.replace(/[^a-z0-9-]/gi, '')}.com`;
  }
  return '';
}

/**
 * Devuelve un logo de fallback automático basado en el dominio oficial del proveedor (Google S2 128px)
 */
export function getProviderFallbackLogo(prov) {
  const domain = getProviderDomain(prov);
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
  return '';
}

