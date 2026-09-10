import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = params;
  try {
    const { text, hot, order } = await request.json();
    const dataToUpdate = {};
    if (text !== undefined) dataToUpdate.text = text.trim();
    if (hot !== undefined) dataToUpdate.hot = Boolean(hot);
    if (order !== undefined) dataToUpdate.order = parseInt(order);

    const updated = await prisma.tickerItem.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo actualizar el titular.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = params;
  try {
    await prisma.tickerItem.delete({ where: { id } });
    return NextResponse.json({ message: 'Titular eliminado.' });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo eliminar el titular.' }, { status: 500 });
  }
}
