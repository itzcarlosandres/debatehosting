import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Debes proporcionar una dirección de correo válida.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'El formato del correo electrónico no es válido.' }, { status: 400 });
    }

    const existing = await prisma.subscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: '¡Ya estás suscrito al debate semanal! Gracias por formar parte.',
      });
    }

    await prisma.subscriber.create({
      data: { email: cleanEmail },
    });

    return NextResponse.json(
      {
        ok: true,
        message: '¡Suscripción confirmada! Recibirás los mejores análisis y cupones cada semana.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al suscribir usuario:', error);
    return NextResponse.json({ error: 'No se pudo procesar la suscripción en este momento.' }, { status: 500 });
  }
}
