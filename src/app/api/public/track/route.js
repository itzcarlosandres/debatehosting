import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { providerId, couponId, type } = await request.json();

    // Guardar en background sin bloquear
    prisma.clickEvent.create({
      data: {
        providerId: providerId || null,
        couponId: couponId || null,
        type: type || 'affiliate_link',
      },
    }).catch(() => {});

    if (providerId) {
      prisma.provider.update({
        where: { id: providerId },
        data: { clicks: { increment: 1 } },
      }).catch(() => {});
    }

    if (couponId) {
      prisma.coupon.update({
        where: { id: couponId },
        data: { clicks: { increment: 1 } },
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
