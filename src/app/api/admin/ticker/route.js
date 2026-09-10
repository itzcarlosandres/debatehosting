import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const items = await prisma.tickerItem.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener ticker.' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { text, hot } = await request.json();
    if (!text) return NextResponse.json({ error: 'El texto es obligatorio.' }, { status: 400 });

    const count = await prisma.tickerItem.count();
    const item = await prisma.tickerItem.create({
      data: {
        text: text.trim(),
        hot: Boolean(hot),
        order: count + 1,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo crear el titular.' }, { status: 500 });
  }
}
