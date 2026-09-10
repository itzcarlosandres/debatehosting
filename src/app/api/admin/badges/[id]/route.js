import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = params;
  try {
    const body = await request.json();
    const dataToUpdate = {};

    if (body.label !== undefined) dataToUpdate.label = body.label.trim().toUpperCase();
    if (body.slug !== undefined) {
      dataToUpdate.slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    }
    if (body.color !== undefined) dataToUpdate.color = body.color;
    if (body.order !== undefined) dataToUpdate.order = parseInt(body.order, 10);

    const updated = await prisma.badge.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe otro badge con ese identificador slug.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al actualizar el badge.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = params;
  try {
    await prisma.badge.delete({ where: { id } });
    return NextResponse.json({ message: 'Badge eliminado con éxito.' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar el badge.' }, { status: 500 });
  }
}
