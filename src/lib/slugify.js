export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos/diacríticos
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres no alfanuméricos
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
    .replace(/^-+/, '') // Quitar guiones iniciales
    .replace(/-+$/, ''); // Quitar guiones finales
}
