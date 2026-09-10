import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        provider: {
          select: { id: true, name: true, slug: true, affiliateUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: 'Error al listar cupones.' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { code, discount, condition, providerId, expiresAt, verified } = await request.json();

    if (!code || !discount || !providerId) {
      return NextResponse.json({ error: 'Código, descuento y proveedor son obligatorios.' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        discount: discount.trim(),
        condition: condition ? condition.trim() : 'Válido para nuevas contrataciones',
        providerId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        verified: verified !== undefined ? Boolean(verified) : true,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un cupón registrado con ese código.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'No se pudo crear el cupón.' }, { status: 500 });
  }
}
