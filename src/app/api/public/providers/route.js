import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const providers = await prisma.provider.findMany({
      where: { active: true },
      include: {
        coupons: {
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { scorePrecio: 'desc' },
    });

    const formatted = providers.map((p) => {
      let cats = [];
      try {
        cats = typeof p.categories === 'string' ? JSON.parse(p.categories) : (p.categories || []);
      } catch (e) {
        cats = [p.categories];
      }
      return {
        ...p,
        categories: cats,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error al obtener proveedores públicos:', error);
    return NextResponse.json({ error: 'No se pudieron cargar los proveedores.' }, { status: 500 });
  }
}
