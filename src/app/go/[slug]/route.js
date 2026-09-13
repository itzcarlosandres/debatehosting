import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const slug = (resolvedParams?.slug || params?.slug || '').toLowerCase().trim();

    if (!slug) {
      return NextResponse.redirect(new URL('/', request.url), 307);
    }

    const couponId = request.nextUrl.searchParams.get('c') || request.nextUrl.searchParams.get('coupon');

    const provider = await prisma.provider.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        affiliateUrl: true,
        active: true,
      },
    });

    if (!provider || !provider.active || !provider.affiliateUrl) {
      return NextResponse.redirect(new URL('/ofertas', request.url), 307);
    }

    // Registrar analítica en background (no bloquea la redirección del usuario)
    prisma.clickEvent.create({
      data: {
        providerId: provider.id,
        couponId: couponId || null,
        type: couponId ? 'coupon_link' : 'affiliate_redirect',
      },
    }).catch((err) => console.error('Error tracking clickEvent:', err));

    prisma.provider.update({
      where: { id: provider.id },
      data: { clicks: { increment: 1 } },
    }).catch((err) => console.error('Error updating provider clicks:', err));

    if (couponId) {
      prisma.coupon.update({
        where: { id: couponId },
        data: { clicks: { increment: 1 } },
      }).catch((err) => console.error('Error updating coupon clicks:', err));
    }

    // Asegurarse de que la URL de destino sea válida
    let targetUrl = provider.affiliateUrl;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    const response = NextResponse.redirect(targetUrl, 307);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  } catch (error) {
    console.error('Error en /go/[slug]:', error);
    return NextResponse.redirect(new URL('/', request.url), 307);
  }
}
