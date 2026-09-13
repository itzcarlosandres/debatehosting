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
