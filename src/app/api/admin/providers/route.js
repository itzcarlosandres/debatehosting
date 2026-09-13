import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';
import { normalizeImageUrl } from '@/lib/imageHelper';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const providers = await prisma.provider.findMany({
      include: {
        coupons: true,
        _count: { select: { clickEvents: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = providers.map((p) => {
      let parsedCats = [];
      try {
        parsedCats = JSON.parse(p.categories);
      } catch (e) {
        parsedCats = [p.categories];
      }
      return { ...p, categories: parsedCats };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: 'Error al listar proveedores.' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await request.json();
    const {
      name,
      slug,
      logoUrl,
      categories,
      plan,
      priceFrom,
      priceBefore,
      period,
      scorePrecio,
      scoreRendimiento,
      scoreSoporte,
      scoreFacilidad,
      uptime,
      affiliateUrl,
      active,
      badge,
      badgeColor,
      description,
      pros,
      cons,
      verdict,
      metaTitle,
      metaDescription,
    } = body;

    if (!name || !slug || !plan || priceFrom === undefined || !affiliateUrl) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    const categoriesString = Array.isArray(categories)
      ? JSON.stringify(categories)
      : JSON.stringify([categories || 'hosting']);

    const formatList = (val) => {
      if (!val) return null;
      if (Array.isArray(val)) return JSON.stringify(val);
      if (typeof val === 'string') {
        const lines = val.split('\n').map((l) => l.trim()).filter(Boolean);
        return JSON.stringify(lines);
      }
      return null;
    };

    const provider = await prisma.provider.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        logoUrl: normalizeImageUrl(logoUrl) || null,
        categories: categoriesString,
        plan: plan.trim(),
        priceFrom: parseFloat(priceFrom),
        priceBefore: parseFloat(priceBefore || priceFrom),
        period: period || 'mes',
        scorePrecio: parseFloat(scorePrecio || 8.0),
        scoreRendimiento: parseFloat(scoreRendimiento || 8.0),
        scoreSoporte: parseFloat(scoreSoporte || 8.0),
        scoreFacilidad: parseFloat(scoreFacilidad || 8.0),
        uptime: parseFloat(uptime || 99.9),
        affiliateUrl: affiliateUrl.trim(),
        active: active !== undefined ? Boolean(active) : true,
        badge: badge ? badge.trim() : null,
        badgeColor: badgeColor ? badgeColor.trim() : null,
        description: description ? description.trim() : null,
        pros: formatList(pros),
        cons: formatList(cons),
        verdict: verdict ? verdict.trim() : null,
        metaTitle: metaTitle ? metaTitle.trim() : null,
        metaDescription: metaDescription ? metaDescription.trim() : null,
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un proveedor con ese slug o nombre.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear proveedor.' }, { status: 500 });
  }
}
