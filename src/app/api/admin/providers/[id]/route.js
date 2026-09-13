import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';
import { normalizeImageUrl } from '@/lib/imageHelper';

export async function PUT(request, { params }) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = params;
  try {
    const body = await request.json();
    const dataToUpdate = {};

    if (body.name !== undefined) dataToUpdate.name = body.name.trim();
    if (body.slug !== undefined) dataToUpdate.slug = body.slug.trim().toLowerCase();
    if (body.logoUrl !== undefined) dataToUpdate.logoUrl = normalizeImageUrl(body.logoUrl) || null;
    if (body.categories !== undefined) {
      dataToUpdate.categories = Array.isArray(body.categories)
        ? JSON.stringify(body.categories)
        : JSON.stringify([body.categories]);
    }
    if (body.plan !== undefined) dataToUpdate.plan = body.plan.trim();
    if (body.priceFrom !== undefined) dataToUpdate.priceFrom = parseFloat(body.priceFrom);
    if (body.priceBefore !== undefined) dataToUpdate.priceBefore = parseFloat(body.priceBefore);
    if (body.period !== undefined) dataToUpdate.period = body.period;
    if (body.scorePrecio !== undefined) dataToUpdate.scorePrecio = parseFloat(body.scorePrecio);
    if (body.scoreRendimiento !== undefined) dataToUpdate.scoreRendimiento = parseFloat(body.scoreRendimiento);
    if (body.scoreSoporte !== undefined) dataToUpdate.scoreSoporte = parseFloat(body.scoreSoporte);
    if (body.scoreFacilidad !== undefined) dataToUpdate.scoreFacilidad = parseFloat(body.scoreFacilidad);
    if (body.uptime !== undefined) dataToUpdate.uptime = parseFloat(body.uptime);
    if (body.affiliateUrl !== undefined) dataToUpdate.affiliateUrl = body.affiliateUrl.trim();
    if (body.active !== undefined) dataToUpdate.active = Boolean(body.active);
    if (body.badge !== undefined) dataToUpdate.badge = body.badge ? body.badge.trim() : null;
    if (body.badgeColor !== undefined) dataToUpdate.badgeColor = body.badgeColor ? body.badgeColor.trim() : null;

    const formatList = (val) => {
      if (!val) return null;
      if (Array.isArray(val)) return JSON.stringify(val);
      if (typeof val === 'string') {
        const lines = val.split('\n').map((l) => l.trim()).filter(Boolean);
        return JSON.stringify(lines);
      }
      return null;
    };

    if (body.description !== undefined) dataToUpdate.description = body.description ? body.description.trim() : null;
    if (body.pros !== undefined) dataToUpdate.pros = formatList(body.pros);
    if (body.cons !== undefined) dataToUpdate.cons = formatList(body.cons);
    if (body.verdict !== undefined) dataToUpdate.verdict = body.verdict ? body.verdict.trim() : null;
    if (body.metaTitle !== undefined) dataToUpdate.metaTitle = body.metaTitle ? body.metaTitle.trim() : null;
    if (body.metaDescription !== undefined) dataToUpdate.metaDescription = body.metaDescription ? body.metaDescription.trim() : null;

    const updated = await prisma.provider.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar proveedor.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = params;
  try {
    await prisma.provider.delete({ where: { id } });
    return NextResponse.json({ message: 'Proveedor eliminado correctamente.' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar proveedor.' }, { status: 500 });
  }
}
