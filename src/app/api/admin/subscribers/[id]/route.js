import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export async function DELETE(request, { params }) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = params;
  try {
    await prisma.subscriber.delete({ where: { id } });
    return NextResponse.json({ message: 'Suscriptor eliminado correctamente.' });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo eliminar el suscriptor.' }, { status: 500 });
  }
}
