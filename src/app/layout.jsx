import './globals.css';
import { ToastProvider } from '../context/ToastContext';
import { getSettings } from '@/lib/settings';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://debatehosting.com';

function getFaviconMime(url) {
  if (!url) return undefined;
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.ico')) return 'image/x-icon';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  return undefined;
}

export async function generateMetadata() {
  const settings = getSettings();
  const rawFavicon = settings.faviconUrl || '/favicon.svg';
  const version = settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now();
  const faviconWithVersion = rawFavicon.includes('?') ? rawFavicon : `${rawFavicon}?v=${version}`;
  const isCustomFavicon = Boolean(
    settings.faviconUrl &&
    settings.faviconUrl !== '/favicon.svg' &&
    settings.faviconUrl !== '/favicon.ico'
  );
  const siteName = settings.siteName || 'Debatehosting';
  const tagline = settings.siteTagline || 'El Gran Observatorio de Hosting, VPS y Cupones';
  const description =
    settings.defaultMetaDescription ||
    'Medio editorial y comparador técnico independiente de hosting web, servidores VPS, cloud y cupones verificados. Medición real de latencia TTFB, uptime y relación calidad-precio sin tapujos.';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${siteName} — ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      'hosting web',
      'mejor hosting espana',
      'comparativa hosting',
      'vps baratos',
      'cupones hosting',
      'hosting wordpress',
      'servidores dedicados',
      'test ttfb',
      'hosting litespeed',
      'webempresa vs banahosting',
      'hostinger opiniones',
      'descuentos hosting 2026',
    ],
    authors: [{ name: `Redacción ${siteName}`, url: baseUrl }],
    creator: siteName,
    publisher: siteName,
    category: 'technology',
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: baseUrl,
      siteName,
      title: `${siteName} — ${tagline}`,
      description,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${siteName} — Comparativas de Hosting y VPS`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteName} — ${tagline}`,
      description,
      images: ['/og-image.png'],
      creator: '@debatehosting',
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: isCustomFavicon
        ? [
            {
              url: faviconWithVersion,
              type: getFaviconMime(rawFavicon),
            },
          ]
        : [
            { url: `/favicon.svg?v=${version}`, type: 'image/svg+xml' },
            { url: `/favicon-32x32.png?v=${version}`, type: 'image/png', sizes: '32x32' },
            { url: `/favicon.ico?v=${version}`, sizes: 'any' },
          ],
      shortcut: faviconWithVersion,
      apple: settings.iconUrl || faviconWithVersion || '/apple-touch-icon.png',
    },
  };
}

export default function RootLayout({ children }) {
  const settings = getSettings();
  const rawFavicon = settings.faviconUrl || '/favicon.svg';
  const version = settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now();
  const faviconWithVersion = rawFavicon.includes('?') ? rawFavicon : `${rawFavicon}?v=${version}`;
  const isCustomFavicon = Boolean(
    settings.faviconUrl &&
    settings.faviconUrl !== '/favicon.svg' &&
    settings.faviconUrl !== '/favicon.ico'
  );
  const icon = settings.iconUrl || faviconWithVersion || '/apple-touch-icon.png';
  const mimeType = getFaviconMime(rawFavicon);

  return (
    <html lang="es">
      <head>
        {isCustomFavicon ? (
          <>
            <link rel="icon" href={faviconWithVersion} type={mimeType} />
            <link rel="shortcut icon" href={faviconWithVersion} type={mimeType} />
          </>
        ) : (
          <>
            <link rel="icon" href={`/favicon.svg?v=${version}`} type="image/svg+xml" />
            <link rel="icon" href={`/favicon-32x32.png?v=${version}`} type="image/png" sizes="32x32" />
            <link rel="alternate icon" href={`/favicon.ico?v=${version}`} />
          </>
        )}
        <link rel="apple-touch-icon" href={icon} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
