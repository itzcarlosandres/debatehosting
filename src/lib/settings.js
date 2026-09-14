import fs from 'fs';
import path from 'path';
import { DEFAULT_HERO_SETTINGS, DEFAULT_SECTION_HEADERS, DEFAULT_SETTINGS } from './settingsDefaults.js';

export { DEFAULT_HERO_SETTINGS, DEFAULT_SECTION_HEADERS, DEFAULT_SETTINGS };

const SETTINGS_FILE = path.join(process.cwd(), 'prisma', 'settings.json');

export function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileData = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const parsed = JSON.parse(fileData);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        hero: {
          ...DEFAULT_HERO_SETTINGS,
          ...(parsed.hero || {}),
        },
        sectionHeaders: {
          ...DEFAULT_SECTION_HEADERS,
          ...(parsed.sectionHeaders || {}),
          podio: {
            ...DEFAULT_SECTION_HEADERS.podio,
            ...(parsed.sectionHeaders?.podio || {}),
          },
          ofertas: {
            ...DEFAULT_SECTION_HEADERS.ofertas,
            ...(parsed.sectionHeaders?.ofertas || {}),
          },
          balanza: {
            ...DEFAULT_SECTION_HEADERS.balanza,
            ...(parsed.sectionHeaders?.balanza || {}),
          },
          cupones: {
            ...DEFAULT_SECTION_HEADERS.cupones,
            ...(parsed.sectionHeaders?.cupones || {}),
          },
          news: {
            ...DEFAULT_SECTION_HEADERS.news,
            ...(parsed.sectionHeaders?.news || {}),
          },
        },
      };
    }
  } catch (err) {
    console.error('Error leyendo settings.json:', err);
  }
  return { ...DEFAULT_SETTINGS };
}

export function updateSettings(newSettings) {
  try {
    const current = getSettings();
    const normalized = { ...newSettings };

    if (normalized.hero && typeof normalized.hero === 'object') {
      normalized.hero = {
        ...DEFAULT_HERO_SETTINGS,
        ...(current.hero || {}),
        ...normalized.hero,
      };
    }

    if (normalized.sectionHeaders && typeof normalized.sectionHeaders === 'object') {
      normalized.sectionHeaders = {
        ...DEFAULT_SECTION_HEADERS,
        ...(current.sectionHeaders || {}),
        ...normalized.sectionHeaders,
        podio: {
          ...DEFAULT_SECTION_HEADERS.podio,
          ...(current.sectionHeaders?.podio || {}),
          ...(normalized.sectionHeaders.podio || {}),
        },
        ofertas: {
          ...DEFAULT_SECTION_HEADERS.ofertas,
          ...(current.sectionHeaders?.ofertas || {}),
          ...(normalized.sectionHeaders.ofertas || {}),
        },
        balanza: {
          ...DEFAULT_SECTION_HEADERS.balanza,
          ...(current.sectionHeaders?.balanza || {}),
          ...(normalized.sectionHeaders.balanza || {}),
        },
        cupones: {
          ...DEFAULT_SECTION_HEADERS.cupones,
          ...(current.sectionHeaders?.cupones || {}),
          ...(normalized.sectionHeaders.cupones || {}),
        },
        news: {
          ...DEFAULT_SECTION_HEADERS.news,
          ...(current.sectionHeaders?.news || {}),
          ...(normalized.sectionHeaders.news || {}),
        },
      };
    }

    ['faviconUrl', 'logoUrl', 'iconUrl', 'ogImageUrl'].forEach((key) => {
      if (normalized[key] && typeof normalized[key] === 'string') {
        const val = normalized[key].trim();
        if (val && !val.startsWith('/') && !val.startsWith('http://') && !val.startsWith('https://') && !val.startsWith('data:')) {
          normalized[key] = `/${val}`;
        }
      }
    });

    const updated = { ...current, ...normalized, updatedAt: new Date().toISOString() };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');

    // Sincronizar automáticamente el favicon en el directorio public/
    if (updated.faviconUrl && typeof updated.faviconUrl === 'string') {
      syncFaviconFiles(updated.faviconUrl);
    }

    return updated;
  } catch (err) {
    console.error('Error guardando settings.json:', err);
    throw err;
  }
}

export function syncFaviconFiles(faviconUrl) {
  if (!faviconUrl || typeof faviconUrl !== 'string') return;
  try {
    const cleanUrl = faviconUrl.split('?')[0];
    const cleanRelative = cleanUrl.replace(/^\//, '');

    const possibleSources = [
      path.join(process.cwd(), 'public', cleanRelative),
      path.join(process.cwd(), cleanRelative),
      path.join(process.cwd(), 'prisma', cleanRelative),
      path.join(process.cwd(), 'prisma', 'uploads', cleanRelative.replace(/^uploads[\\/]/, '')),
      path.join(process.cwd(), 'uploads', cleanRelative.replace(/^uploads[\\/]/, '')),
    ];

    let foundSource = null;
    for (const src of possibleSources) {
      if (fs.existsSync(src)) {
        foundSource = src;
        break;
      }
    }

    if (foundSource) {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const targets = [
        path.join(publicDir, 'favicon.ico'),
        path.join(publicDir, 'favicon-32x32.png'),
        path.join(publicDir, 'favicon-16x16.png'),
        path.join(publicDir, 'apple-touch-icon.png'),
        path.join(publicDir, 'icon.png'),
      ];

      for (const target of targets) {
        try {
          fs.copyFileSync(foundSource, target);
        } catch (e) {}
      }

      if (cleanUrl.endsWith('.svg')) {
        try {
          fs.copyFileSync(foundSource, path.join(publicDir, 'favicon.svg'));
          fs.copyFileSync(foundSource, path.join(publicDir, 'icon.svg'));
        } catch (e) {}
      }
    }
  } catch (err) {
    console.error('Error sincronizando favicon:', err);
  }
}

