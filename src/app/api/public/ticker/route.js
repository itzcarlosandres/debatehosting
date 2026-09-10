import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.tickerItem.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error al obtener ticker:', error);
    return NextResponse.json({ error: 'No se pudo cargar la cinta de noticias.' }, { status: 500 });
  }
}
