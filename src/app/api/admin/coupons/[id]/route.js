import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = params;
  try {
    const { code, discount, condition, providerId, expiresAt, verified } = await request.json();
    const dataToUpdate = {};

    if (code !== undefined) dataToUpdate.code = code.trim().toUpperCase();
    if (discount !== undefined) dataToUpdate.discount = discount.trim();
    if (condition !== undefined) dataToUpdate.condition = condition.trim();
    if (providerId !== undefined) dataToUpdate.providerId = providerId;
    if (expiresAt !== undefined) dataToUpdate.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (verified !== undefined) dataToUpdate.verified = Boolean(verified);

    const updated = await prisma.coupon.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo actualizar el cupón.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = params;
  try {
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ message: 'Cupón eliminado correctamente.' });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo eliminar el cupón.' }, { status: 500 });
  }
}
