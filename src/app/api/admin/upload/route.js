import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No se envió ningún archivo válido.' }, { status: 400 });
    }

    // Validar tipo de archivo (por mime type y extensión)
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/avif',
    ];

    const originalName = file.name || 'logo.png';
    const ext = (path.extname(originalName) || '').toLowerCase();
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.avif'];

    const isAllowed = (file.type && allowedMimeTypes.includes(file.type)) || allowedExtensions.includes(ext);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Formato no admitido. Sube imágenes PNG, JPG, SVG o WebP.' },
        { status: 400 }
      );
    }

    // Validar tamaño máximo (5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo permitido (5MB).' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear carpeta si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
    await mkdir(uploadDir, { recursive: true });

    // Sanitizar nombre de archivo
    const safeExt = ext || '.png';
    const baseName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const safeFilename = `logo_${Date.now()}_${baseName}${safeExt}`;

    const filePath = path.join(uploadDir, safeFilename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/logos/${safeFilename}`;

    return NextResponse.json({
      url: publicUrl,
      filename: safeFilename,
      size: file.size,
      type: file.type || 'image/png',
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      { error: error?.message || 'Ocurrió un error al procesar la subida del archivo.' },
      { status: 500 }
    );
  }
}
