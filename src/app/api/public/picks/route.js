import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const picks = await prisma.pick.findMany({
      orderBy: { position: 'asc' },
      include: {
        provider: {
          include: {
            coupons: true,
          },
        },
      },
    });

    const formatted = picks.map((pk) => {
      let parsedCategories = [];
      try {
        parsedCategories = JSON.parse(pk.provider.categories);
      } catch (e) {
        parsedCategories = [pk.provider.categories];
      }
      return {
        ...pk,
        provider: {
          ...pk.provider,
          categories: parsedCategories,
        },
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error al obtener picks:', error);
    return NextResponse.json({ error: 'No se pudieron cargar los picks editoriales.' }, { status: 500 });
  }
}
