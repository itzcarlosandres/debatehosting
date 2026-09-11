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
    const updated = { ...current, ...newSettings, updatedAt: new Date().toISOString() };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');

    // Sincronizar automáticamente el favicon en el directorio public/ si se especificó uno personalizado
    if (newSettings.faviconUrl && typeof newSettings.faviconUrl === 'string') {
      try {
        const cleanPath = newSettings.faviconUrl.split('?')[0].replace(/^\//, '');
        const sourcePath = path.join(process.cwd(), 'public', cleanPath);
        if (fs.existsSync(sourcePath)) {
          const publicIco = path.join(process.cwd(), 'public', 'favicon.ico');
          fs.copyFileSync(sourcePath, publicIco);

          if (cleanPath.endsWith('.svg')) {
            const publicSvg = path.join(process.cwd(), 'public', 'favicon.svg');
            fs.copyFileSync(sourcePath, publicSvg);
          } else if (cleanPath.endsWith('.png')) {
            const public32 = path.join(process.cwd(), 'public', 'favicon-32x32.png');
            fs.copyFileSync(sourcePath, public32);
          }
        }
      } catch (syncErr) {
        console.error('Error sincronizando archivos de favicon:', syncErr);
      }
    }

    return updated;
  } catch (err) {
    console.error('Error guardando settings.json:', err);
    throw err;
  }
}
