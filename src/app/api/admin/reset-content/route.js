import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const [clicks, coupons, picks, ticker, subscribers, providers] = await Promise.all([
      prisma.clickEvent.deleteMany({}),
      prisma.coupon.deleteMany({}),
      prisma.pick.deleteMany({}),
      prisma.tickerItem.deleteMany({}),
      prisma.subscriber.deleteMany({}),
      prisma.provider.deleteMany({}),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Base de datos reiniciada a 0 correctamente.',
      summary: {
        clicksEliminados: clicks.count,
        cuponesEliminados: coupons.count,
        picksEliminados: picks.count,
        tickerEliminados: ticker.count,
        suscriptoresEliminados: subscribers.count,
        proveedoresEliminados: providers.count,
      },
    });
  } catch (error) {
    console.error('Error al resetear contenido:', error);
    return NextResponse.json(
      { error: 'Error al vaciar la base de datos: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
