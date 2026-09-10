import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_BADGES = [
  { slug: 'hot', label: 'HOT', color: 'red', order: 1 },
  { slug: 'mejor-precio', label: 'MEJOR PRECIO', color: 'green', order: 2 },
  { slug: 'top-rendimiento', label: 'TOP RENDIMIENTO', color: 'gold', order: 3 },
  { slug: 'eleccion-editorial', label: 'ELECCIÓN EDITORIAL', color: 'dark', order: 4 },
  { slug: 'recomendado', label: 'RECOMENDADO', color: 'green', order: 5 },
];

export async function GET(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    let badges = await prisma.badge.findMany({
      orderBy: { order: 'asc' },
    });

    // Seed defaults if empty
    if (badges.length === 0) {
      for (const def of DEFAULT_BADGES) {
        await prisma.badge.upsert({
          where: { slug: def.slug },
          update: {},
          create: def,
        });
      }
      badges = await prisma.badge.findMany({
        orderBy: { order: 'asc' },
      });
    }

    // Count providers using each badge
    const providers = await prisma.provider.findMany({
      select: { badge: true },
    });

    const badgeCounts = {};
    providers.forEach((p) => {
      if (p.badge) {
        const key = p.badge.trim();
        badgeCounts[key] = (badgeCounts[key] || 0) + 1;
      }
    });

    const badgesWithCount = badges.map((b) => ({
      ...b,
      providersCount: badgeCounts[b.label] || badgeCounts[b.slug] || 0,
    }));

    return NextResponse.json(badgesWithCount);
  } catch (error) {
    console.error('Error al listar badges:', error);
    return NextResponse.json({ error: 'Error al listar badges.' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await request.json();
    const { label, slug, color, order } = body;

    if (!label) {
      return NextResponse.json({ error: 'El texto del badge es obligatorio.' }, { status: 400 });
    }

    const cleanSlug = (slug || label).trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    const existing = await prisma.badge.findUnique({
      where: { slug: cleanSlug },
    });
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un badge con ese identificador slug.' }, { status: 400 });
    }

    const badge = await prisma.badge.create({
      data: {
        label: label.trim().toUpperCase(),
        slug: cleanSlug,
        color: color || 'green',
        order: order !== undefined ? parseInt(order, 10) : 0,
      },
    });

    return NextResponse.json(badge, { status: 201 });
  } catch (error) {
    console.error('Error al crear badge:', error);
    return NextResponse.json({ error: 'Error al crear badge.' }, { status: 500 });
  }
}
