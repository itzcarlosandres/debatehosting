import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'prisma', 'settings.json');

const DEFAULT_SETTINGS = {
  siteName: 'Debatehosting',
  siteTagline: 'El Gran Observatorio de Hosting, VPS y Cupones',
  siteUrl: 'https://debatehosting.com',
  contactEmail: 'redaccion@debatehosting.com',
  currency: '$',
  faviconUrl: '/favicon.ico',
  logoUrl: '',
  iconUrl: '/icon.png',
  ogImageUrl: '/og-image.png',
  logoType: 'icon_text', // 'icon_text' | 'image' | 'text'
  logoIcon: 'rocket',
  logoTextPrefix: 'Debate',
  logoTextHighlight: 'hosting',
  logoColor: '#0E6B41',
  defaultMetaDescription:
    'Medio editorial y comparador técnico independiente de hosting web, servidores VPS, cloud y cupones verificados. Medición real de latencia TTFB, uptime y relación calidad-precio sin tapujos.',
  defaultKeywords:
    'hosting web, mejor hosting espana, comparativa hosting, vps baratos, cupones hosting, hosting wordpress, test ttfb',
  affiliateRel: 'sponsored noopener noreferrer',
  disclosureNotice:
    'Debatehosting se financia mediante enlaces de afiliación regulados. Al contratar a través de nuestros enlaces, podemos recibir una comisión sin coste adicional para ti. Esto nunca afecta a la objetividad de nuestros análisis ni a las posiciones del ranking.',
  ttfbEngineVersion: 'v2.4 (OpenTelemetry Engine)',
  maintenanceMode: false,
  enableComments: false,
  autoVerifyCoupons: true,
  // Analítica, Search Console & Inyecciones de Código
  googleAnalyticsId: '',
  googleSearchConsoleCode: '',
  geminiApiKey: '',
  customHeadCode: '',
  customBodyCode: '',
};

export function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileData = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const parsed = JSON.parse(fileData);
      return { ...DEFAULT_SETTINGS, ...parsed };
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

