import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export async function PUT(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { orderedIds } = await request.json();
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'Se esperaba un array orderedIds.' }, { status: 400 });
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.pick.update({
          where: { id },
          data: { position: index + 1 },
        })
      )
    );

    const reordered = await prisma.pick.findMany({
      include: { provider: true },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json(reordered);
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo actualizar el orden.' }, { status: 500 });
  }
}
