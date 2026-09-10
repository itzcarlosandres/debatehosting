import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = params;
  try {
    const { tag, titulo, veredicto, position, providerId } = await request.json();
    const dataToUpdate = {};

    if (tag !== undefined) dataToUpdate.tag = tag.trim();
    if (titulo !== undefined) dataToUpdate.titulo = titulo.trim();
    if (veredicto !== undefined) dataToUpdate.veredicto = veredicto.trim();
    if (position !== undefined) dataToUpdate.position = parseInt(position);
    if (providerId !== undefined) dataToUpdate.providerId = providerId;

    const updated = await prisma.pick.update({
      where: { id },
      data: dataToUpdate,
      include: { provider: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo actualizar el pick.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = params;
  try {
    await prisma.pick.delete({ where: { id } });
    return NextResponse.json({ message: 'Pick eliminado.' });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo eliminar el pick.' }, { status: 500 });
  }
}
