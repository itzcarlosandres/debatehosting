import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
};

export async function GET(request, { params }) {
  try {
    const rawSegments = params?.path || [];
    // Sanitización contra path traversal
    const safeSegments = rawSegments
      .map((s) => s.replace(/[^a-zA-Z0-9._-]/g, ''))
      .filter(Boolean);

    if (safeSegments.length === 0) {
      return new NextResponse('Archivo no especificado', { status: 400 });
    }

    const baseUploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    const targetPath = path.resolve(baseUploadsDir, ...safeSegments);

    // Evitar salir del directorio public/uploads
    if (!targetPath.startsWith(baseUploadsDir) || !fs.existsSync(targetPath)) {
      return new NextResponse('Archivo no encontrado', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(targetPath);
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error sirviendo archivo subido dinámico:', error);
    return new NextResponse('Error al cargar archivo', { status: 500 });
  }
}
