import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [
      totalClicksEvents,
      clicks7Days,
      topProviders,
      totalSubscribers,
      activeCouponsCount,
      recentEvents,
    ] = await Promise.all([
      prisma.clickEvent.count(),
      prisma.clickEvent.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.provider.findMany({
        take: 10,
        orderBy: { clicks: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          clicks: true,
          active: true,
        },
      }),
      prisma.subscriber.count(),
      prisma.coupon.count({
        where: {
          verified: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: now } },
          ],
        },
      }),
      prisma.clickEvent.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          provider: { select: { name: true } },
          coupon: { select: { code: true } },
        },
      }),
    ]);

    const providersAggregate = await prisma.provider.aggregate({
      _sum: { clicks: true },
    });
    const totalProviderClicks = providersAggregate._sum.clicks || 0;

    const totalProvidersCount = await prisma.provider.count();

    return NextResponse.json({
      clicksTotales: Math.max(totalClicksEvents, totalProviderClicks),
      clicks7dias: clicks7Days,
      totalProveedores: totalProvidersCount,
      suscriptores: totalSubscribers,
      cuponesActivos: activeCouponsCount,
      clicksPorProveedor: topProviders,
      ultimosEventos: recentEvents,
    });
  } catch (error) {
    console.error('Error al generar estadísticas:', error);
    return NextResponse.json({ error: 'No se pudieron calcular las estadísticas.' }, { status: 500 });
  }
}
