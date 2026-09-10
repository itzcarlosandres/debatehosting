import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');

  try {
    const subs = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const csvRows = ['ID,Email,Fecha_Registro'];
      subs.forEach((s) => {
        csvRows.push(`"${s.id}","${s.email}","${s.createdAt.toISOString()}"`);
      });
      const csvContent = csvRows.join('\n');

      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="suscriptores_debatehosting.csv"',
        },
      });
    }

    return NextResponse.json(subs);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener suscriptores.' }, { status: 500 });
  }
}
