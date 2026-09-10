import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = params;
  try {
    const current = await prisma.provider.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: 'Proveedor no encontrado.' }, { status: 404 });

    const updated = await prisma.provider.update({
      where: { id },
      data: { active: !current.active },
    });

    return NextResponse.json({
      id: updated.id,
      active: updated.active,
      message: updated.active ? 'Proveedor activado' : 'Proveedor desactivado',
    });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo alternar el estado.' }, { status: 500 });
  }
}
