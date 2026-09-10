import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const s = getSettings();
    return NextResponse.json({
      siteName: s.siteName,
      siteTagline: s.siteTagline,
      siteUrl: s.siteUrl,
      currency: s.currency,
      faviconUrl: s.faviconUrl,
      logoUrl: s.logoUrl,
      iconUrl: s.iconUrl,
      ogImageUrl: s.ogImageUrl,
      logoType: s.logoType || 'icon_text',
      logoIcon: s.logoIcon || 'scale',
      logoTextPrefix: s.logoTextPrefix || 'Debate',
      logoTextHighlight: s.logoTextHighlight || 'hosting',
      logoColor: s.logoColor || '#0E6B41',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuración pública' }, { status: 500 });
  }
}
