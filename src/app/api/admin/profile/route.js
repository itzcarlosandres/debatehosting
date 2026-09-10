import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword, newEmail } = await request.json();

    // Obtener usuario completo con hash
    const user = await prisma.adminUser.findUnique({
      where: { id: admin.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Si se envía contraseña actual para cambiar password o email
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'La contraseña actual no es correcta.' }, { status: 400 });
      }
    } else if (newPassword) {
      return NextResponse.json({ error: 'Debes ingresar tu contraseña actual para establecer una nueva.' }, { status: 400 });
    }

    const updateData = {};

    // Actualizar email si es válido y diferente
    if (newEmail && newEmail.trim() !== user.email) {
      const trimmedEmail = newEmail.trim().toLowerCase();
      const existing = await prisma.adminUser.findUnique({
        where: { email: trimmedEmail },
      });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: 'Ese correo electrónico ya está registrado por otra cuenta.' }, { status: 400 });
      }
      updateData.email = trimmedEmail;
    }

    // Actualizar password si se especificó
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No se realizaron cambios.' });
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, email: true, createdAt: true },
    });

    return NextResponse.json({
      message: 'Perfil de administrador actualizado correctamente.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error al actualizar perfil de admin:', error);
    return NextResponse.json({ error: 'Error interno al actualizar perfil' }, { status: 500 });
  }
}
