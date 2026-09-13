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

// 1x1 pixel PNG transparente como salvaguarda en caso de recurso no encontrado
const TRANSPARENT_1PX_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

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
      path.resolve('/app', 'public', 'uploads'),
      path.resolve(process.cwd(), 'uploads'),
    ];

    let targetPath = null;

    for (const baseDir of candidateBaseDirs) {
      const candidate = path.resolve(baseDir, ...safeSegments);
      // Validar que no se salga de la carpeta base y que el archivo exista en disco
      if (
        (candidate.startsWith(baseDir + path.sep) || candidate.startsWith(baseDir + '/')) &&
        fs.existsSync(candidate) &&
        fs.statSync(candidate).isFile()
      ) {
        targetPath = candidate;
        break;
      }
    }

    // Si el archivo existe físicamente, servirlo con su Content-Type y cabeceras de caché
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

    // FALLBACK INTELIGENTE: Si el archivo no existe físicamente en el disco (ej. volumen nuevo o recreado)
    const requestedFile = safeSegments[safeSegments.length - 1].toLowerCase();

    // 1. Si era un favicon, servir el favicon por defecto de public
    if (requestedFile.includes('favicon') || requestedFile.includes('rocket') || requestedFile.endsWith('.ico')) {
      const defaultFavicon = path.resolve(process.cwd(), 'public', 'favicon.svg');
      if (fs.existsSync(defaultFavicon)) {
        return new NextResponse(fs.readFileSync(defaultFavicon), {
          status: 200,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }

    // 2. Si era un logotipo, servir el logo por defecto de public
    if (requestedFile.includes('logo') || requestedFile.includes('brand')) {
      const defaultLogoSvg = path.resolve(process.cwd(), 'public', 'logo.svg');
      if (fs.existsSync(defaultLogoSvg)) {
        return new NextResponse(fs.readFileSync(defaultLogoSvg), {
          status: 200,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }

    // 3. Fallback genérico para imágenes
    return new NextResponse('Archivo no encontrado', { status: 404 });
  } catch (error) {
    console.error('Error sirviendo archivo subido dinámico:', error);
    return new NextResponse('Error al cargar archivo', { status: 500 });
  }
}
