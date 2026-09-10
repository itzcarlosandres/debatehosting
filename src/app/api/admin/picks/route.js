import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const picks = await prisma.pick.findMany({
      include: { provider: true },
      orderBy: { position: 'asc' },
    });
    return NextResponse.json(picks);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener picks.' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { providerId, tag, titulo, veredicto, position } = await request.json();

    if (!providerId || !tag || !titulo || !veredicto) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
    }

    const count = await prisma.pick.count();
    const newPos = position !== undefined ? parseInt(position) : count + 1;

    const pick = await prisma.pick.create({
      data: {
        providerId,
        tag: tag.trim(),
        titulo: titulo.trim(),
        veredicto: veredicto.trim(),
        position: newPos,
      },
      include: { provider: true },
    });

    return NextResponse.json(pick, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo crear el pick.' }, { status: 500 });
  }
}
