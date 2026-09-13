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
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [
      totalClicksEvents,
      clicksToday,
      clicks7Days,
      clicks30Days,
      last7DaysEvents,
      topProviders,
      totalSubscribers,
      activeCouponsCount,
      recentEvents,
      couponCopiesCount,
    ] = await Promise.all([
      prisma.clickEvent.count(),
      prisma.clickEvent.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.clickEvent.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.clickEvent.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.clickEvent.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, type: true },
      }),
      prisma.provider.findMany({
        take: 12,
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
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: {
          provider: { select: { name: true, slug: true } },
          coupon: { select: { code: true } },
        },
      }),
      prisma.clickEvent.count({
        where: { type: 'coupon_copy' },
      }),
    ]);

    // Agrupar clics por día en los últimos 7 días
    const daysMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
      daysMap[key] = {
        date: key,
        label: dayName.toUpperCase().slice(0, 3),
        total: 0,
        redirects: 0,
        coupons: 0,
      };
    }

    last7DaysEvents.forEach((ev) => {
      const key = ev.createdAt.toISOString().split('T')[0];
      if (daysMap[key]) {
        daysMap[key].total += 1;
        if (ev.type === 'coupon_copy') {
          daysMap[key].coupons += 1;
        } else {
          daysMap[key].redirects += 1;
        }
      }
    });

    const clicksDailyTrend = Object.values(daysMap);

    const providersAggregate = await prisma.provider.aggregate({
      _sum: { clicks: true },
    });
    const totalProviderClicks = providersAggregate._sum.clicks || 0;
    const clicksTotales = Math.max(totalClicksEvents, totalProviderClicks);

    const totalProvidersCount = await prisma.provider.count();

    return NextResponse.json({
      clicksTotales,
      clicksHoy: clicksToday,
      clicks7dias: clicks7Days,
      clicks30dias: clicks30Days,
      clicksDailyTrend,
      clicsRedireccion: Math.max(0, totalClicksEvents - couponCopiesCount),
      clicsCupones: couponCopiesCount,
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
