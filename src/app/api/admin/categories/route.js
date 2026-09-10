import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = [
  { slug: 'hosting', name: 'Hosting Web', icon: 'server', order: 1 },
  { slug: 'vps', name: 'Servidores VPS', icon: 'server', order: 2 },
  { slug: 'wordpress', name: 'WordPress Gestionado', icon: 'flame', order: 3 },
  { slug: 'cloud', name: 'Cloud Hosting', icon: 'server', order: 4 },
  { slug: 'dominios', name: 'Registro de Dominios', icon: 'ticket', order: 5 },
];

export async function GET(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    let categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });

    // Seed defaults if empty
    if (categories.length === 0) {
      for (const def of DEFAULT_CATEGORIES) {
        await prisma.category.upsert({
          where: { slug: def.slug },
          update: {},
          create: def,
        });
      }
      categories = await prisma.category.findMany({
        orderBy: { order: 'asc' },
      });
    }

    // Count providers using each category
    const providers = await prisma.provider.findMany({
      select: { categories: true },
    });

    const categoryCounts = {};
    providers.forEach((p) => {
      try {
        const cats = JSON.parse(p.categories);
        if (Array.isArray(cats)) {
          cats.forEach((c) => {
            const key = String(c).toLowerCase().trim();
            categoryCounts[key] = (categoryCounts[key] || 0) + 1;
          });
        }
      } catch (e) {
        if (p.categories) {
          const key = String(p.categories).toLowerCase().trim();
          categoryCounts[key] = (categoryCounts[key] || 0) + 1;
        }
      }
    });

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      providersCount: categoryCounts[cat.slug.toLowerCase()] || 0,
    }));

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error('Error al listar categorías:', error);
    return NextResponse.json({ error: 'Error al listar categorías.' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, slug, icon, order } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'El nombre y el slug identificador son obligatorios.' }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanSlug) {
      return NextResponse.json({ error: 'Slug inválido. Usa letras, números y guiones.' }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({
      where: { slug: cleanSlug },
    });
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese identificador slug.' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        icon: icon ? icon.trim() : 'server',
        order: order !== undefined ? parseInt(order, 10) : 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return NextResponse.json({ error: 'Error al crear la categoría.' }, { status: 500 });
  }
}
