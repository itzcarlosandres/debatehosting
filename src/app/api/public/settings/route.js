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
      showTopBar: s.showTopBar !== undefined ? s.showTopBar : true,
      showTicker: s.showTicker !== undefined ? s.showTicker : true,
      topBarBadge: s.topBarBadge || 'RADAR ACTIVO',
      topBarText: s.topBarText || '14 Proveedores de Hosting bajo auditoría de rendimiento en tiempo real',
      topBarRightBadge: s.topBarRightBadge || '100% INDEPENDIENTE',
      topBarRightText: s.topBarRightText || 'EDICIÓN 2026',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuración pública' }, { status: 500 });
  }
}
