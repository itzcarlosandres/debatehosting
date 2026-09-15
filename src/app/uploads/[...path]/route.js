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

export async function GET(request, context) {
  try {
    let rawSegments = [];
    const resolvedParams = context?.params instanceof Promise ? await context.params : context?.params;

    if (resolvedParams?.path) {
      rawSegments = Array.isArray(resolvedParams.path) ? resolvedParams.path : [resolvedParams.path];
    }

    // Fallback: extraer segmentos desde la URL de la petición si params no vino poblado
    if (rawSegments.length === 0) {
      try {
        const url = new URL(request.url);
        const subPath = url.pathname.replace(/^\/?uploads\/?/, '');
        rawSegments = subPath.split('/').filter(Boolean);
      } catch (e) {
        rawSegments = [];
      }
    }

    // Sanitización contra path traversal
    const safeSegments = rawSegments
      .map((s) => s.replace(/[^a-zA-Z0-9._-]/g, ''))
      .filter(Boolean);

    if (safeSegments.length === 0) {
      return new NextResponse('Archivo no especificado', { status: 400 });
    }

    // Rutas base candidatas donde se pueden almacenar los uploads en diferentes entornos
    const candidateBaseDirs = [
      path.resolve(process.cwd(), 'public', 'uploads'),
      path.resolve(process.cwd(), 'public', 'uploads', 'logos'),
      path.resolve('/app', 'public', 'uploads'),
      path.resolve('/app', 'public', 'uploads', 'logos'),
      path.resolve(process.cwd(), 'uploads'),
      path.resolve(process.cwd(), 'uploads', 'logos'),
      path.resolve('/app', 'uploads'),
      path.resolve('/app', 'uploads', 'logos'),
    ];

    const filename = safeSegments[safeSegments.length - 1];
    let targetPath = null;

    for (const baseDir of candidateBaseDirs) {
      // 1. Coincidencia directa con los segmentos de ruta recibidos
      const candidateDirect = path.resolve(baseDir, ...safeSegments);
      if (
        (candidateDirect.startsWith(baseDir + path.sep) || candidateDirect.startsWith(baseDir + '/')) &&
        fs.existsSync(candidateDirect) &&
        fs.statSync(candidateDirect).isFile()
      ) {
        targetPath = candidateDirect;
        break;
      }

      // 2. Coincidencia dentro de subcarpeta 'logos'
      const candidateInLogos = path.resolve(baseDir, 'logos', ...safeSegments);
      if (
        (candidateInLogos.startsWith(baseDir + path.sep) || candidateInLogos.startsWith(baseDir + '/')) &&
        fs.existsSync(candidateInLogos) &&
        fs.statSync(candidateInLogos).isFile()
      ) {
        targetPath = candidateInLogos;
        break;
      }

      // 3. Coincidencia directa por nombre de archivo
      const candidateFile = path.resolve(baseDir, filename);
      if (
        (candidateFile.startsWith(baseDir + path.sep) || candidateFile.startsWith(baseDir + '/')) &&
        fs.existsSync(candidateFile) &&
        fs.statSync(candidateFile).isFile()
      ) {
        targetPath = candidateFile;
        break;
      }

      // 4. Coincidencia por nombre de archivo dentro de subcarpeta 'logos'
      const candidateFileInLogos = path.resolve(baseDir, 'logos', filename);
      if (
        (candidateFileInLogos.startsWith(baseDir + path.sep) || candidateFileInLogos.startsWith(baseDir + '/')) &&
        fs.existsSync(candidateFileInLogos) &&
        fs.statSync(candidateFileInLogos).isFile()
      ) {
        targetPath = candidateFileInLogos;
        break;
      }
    }

    // Si el archivo subido existe físicamente en el disco, servirlo con su Content-Type y cabeceras de caché
    if (targetPath) {
      const fileBuffer = fs.readFileSync(targetPath);
      const ext = path.extname(targetPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      });
    }

    // Si no existe físicamente en el disco, responder con 404 (NUNCA sustituir por favicon ni por el logo del sitio)
    return new NextResponse('Archivo no encontrado', { status: 404 });
  } catch (error) {
    console.error('Error sirviendo archivo subido dinámico:', error);
    return new NextResponse('Error al cargar archivo', { status: 500 });
  }
}
