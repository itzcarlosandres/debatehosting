import { NextResponse } from 'next/server';
import dns from 'dns/promises';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Función para normalizar dominio
function cleanDomain(rawUrl) {
  let str = rawUrl.trim();
  if (!/^https?:\/\//i.test(str)) {
    str = 'https://' + str;
  }
  const parsed = new URL(str);
  return {
    fullUrl: parsed.href,
    hostname: parsed.hostname.toLowerCase(),
    protocol: parsed.protocol,
  };
}

// Mapeo conocido de proveedores por ASN/ISP o rDNS
function identifyProvider(isp, org, asname, rDNS, serverHeader) {
  const combined = `${isp || ''} ${org || ''} ${asname || ''} ${rDNS || ''} ${serverHeader || ''}`.toLowerCase();

  if (combined.includes('cloudflare')) return { name: 'Cloudflare', type: 'CDN & Edge Cloud', badge: 'Cloud' };
  if (combined.includes('hetzner')) return { name: 'Hetzner', type: 'Datacenter & Cloud', badge: 'VPS / Dedicated' };
  if (combined.includes('hostinger')) return { name: 'Hostinger', type: 'Cloud & Shared Hosting', badge: 'Hosting Web' };
  if (combined.includes('amazon') || combined.includes('aws')) return { name: 'Amazon Web Services (AWS)', type: 'Infraestructura Cloud', badge: 'Cloud' };
  if (combined.includes('google')) return { name: 'Google Cloud Platform', type: 'Infraestructura Cloud', badge: 'Cloud' };
  if (combined.includes('digitalocean')) return { name: 'DigitalOcean', type: 'Cloud VPS', badge: 'VPS' };
  if (combined.includes('ovh')) return { name: 'OVHcloud', type: 'Hosting & Dedicated', badge: 'Dedicado / VPS' };
  if (combined.includes('linode') || combined.includes('akamai')) return { name: 'Linode / Akamai', type: 'Cloud Computing', badge: 'VPS' };
  if (combined.includes('webempresa')) return { name: 'Webempresa', type: 'Hosting WordPress', badge: 'Hosting' };
  if (combined.includes('raiola')) return { name: 'Raiola Networks', type: 'Hosting & Servidores', badge: 'Hosting' };
  if (combined.includes('sered')) return { name: 'Sered Hosting', type: 'Hosting SSD', badge: 'Hosting' };
  if (combined.includes('ionos') || combined.includes('1&1')) return { name: 'IONOS (1&1)', type: 'Hosting Empresarial', badge: 'Hosting' };
  if (combined.includes('siteground')) return { name: 'SiteGround', type: 'Managed WordPress', badge: 'Hosting' };
  if (combined.includes('namecheap')) return { name: 'Namecheap Hosting', type: 'Shared & VPS', badge: 'Hosting' };
  if (combined.includes('godaddy')) return { name: 'GoDaddy', type: 'Hosting Web', badge: 'Hosting' };
  if (combined.includes('vercel')) return { name: 'Vercel', type: 'Edge Serverless Network', badge: 'Serverless' };
  if (combined.includes('fastly')) return { name: 'Fastly', type: 'Edge Cloud & CDN', badge: 'CDN' };

  return {
    name: org || isp || asname || 'Proveedor Independiente',
    type: 'Infraestructura Web',
    badge: 'Servidor',
  };
}

// Detectar servidor web
function identifyServer(serverHeader, poweredBy, litespeedHeader) {
  const s = (serverHeader || '').toLowerCase();
  const p = (poweredBy || '').toLowerCase();

  if (s.includes('litespeed') || litespeedHeader) return 'LiteSpeed Web Server (Alto Rendimiento)';
  if (s.includes('openresty')) return 'OpenResty (Nginx + Lua)';
  if (s.includes('nginx')) return 'Nginx Web Server';
  if (s.includes('apache')) return 'Apache HTTP Server';
  if (s.includes('caddy')) return 'Caddy (HTTP/3)';
  if (s.includes('cloudflare')) return 'Cloudflare Reverse Proxy (Edge)';
  if (s.includes('gse') || s.includes('google')) return 'Google Frontend (GSE)';
  if (p) return `Servidor personalizado (${poweredBy})`;
  return serverHeader || 'Servidor HTTP Oculto por Seguridad';
}

// Detectar CMS
function identifyCMS(html = '', headers = {}) {
  const h = (html || '').slice(0, 60000).toLowerCase();
  const server = (headers.server || '').toLowerCase();
  const powered = (headers['x-powered-by'] || '').toLowerCase();

  if (h.includes('wp-content') || h.includes('wp-includes') || h.includes('content="wordpress') || headers['x-pingback']) {
    return { name: 'WordPress', badge: 'CMS' };
  }
  if (h.includes('shopify.shop') || h.includes('cdn.shopify.com')) {
    return { name: 'Shopify', badge: 'E-commerce' };
  }
  if (h.includes('prestashop')) {
    return { name: 'PrestaShop', badge: 'E-commerce' };
  }
  if (h.includes('__next_data__') || h.includes('/_next/')) {
    return { name: 'Next.js / React', badge: 'Full-Stack Framework' };
  }
  if (h.includes('joomla')) {
    return { name: 'Joomla', badge: 'CMS' };
  }
  if (h.includes('drupal')) {
    return { name: 'Drupal', badge: 'CMS' };
  }
  if (h.includes('wix.com')) {
    return { name: 'Wix', badge: 'Website Builder' };
  }
  if (h.includes('squarespace')) {
    return { name: 'Squarespace', badge: 'Website Builder' };
  }
  if (powered.includes('php')) {
    return { name: 'Sitio PHP Personalizado', badge: 'Backend' };
  }

  return { name: 'HTML / Aplicación Web Personalizada', badge: 'Desarrollo Web' };
}

// Calcular nota editorial
function calculateGrade(ttfbMs) {
  if (ttfbMs <= 150) {
    return {
      grade: 'A+',
      status: 'Excelente',
      color: '#10B981',
      verdict: 'Velocidad de élite. Tu servidor responde en tiempo récord, lo que garantiza la máxima puntuación en los Core Web Vitals de Google.',
    };
  }
  if (ttfbMs <= 250) {
    return {
      grade: 'A',
      status: 'Óptimo',
      color: '#46C285',
      verdict: 'Rendimiento sobresaliente. Cumple con el estándar recomendado de Debatehosting (< 250 ms) para webs de alto tráfico.',
    };
  }
  if (ttfbMs <= 450) {
    return {
      grade: 'B',
      status: 'Aceptable',
      color: '#F59E0B',
      verdict: 'Rendimiento promedio. La máquina responde bien, pero servidores con LiteSpeed o caché a nivel de servidor pueden reducir a la mitad este tiempo.',
    };
  }
  if (ttfbMs <= 750) {
    return {
      grade: 'C',
      status: 'Lento',
      color: '#F97316',
      verdict: 'Tiempo de respuesta deficiente (> 450 ms). El servidor tarda demasiado en entregar el primer byte, lo que perjudica el posicionamiento orgánico en móviles.',
    };
  }
  return {
    grade: 'F',
    status: 'Crítico',
    color: '#EF4444',
    verdict: 'Respuesta crítica (> 750 ms). El servidor está saturado o mal dimensionado. Se recomienda una migración inmediata a infraestructura optimizada.',
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const rawUrl = body?.url;

    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json(
        { error: 'Por favor introduce una dirección web válida (ej: ejemplo.com).' },
        { status: 400 }
      );
    }

    let parsed;
    try {
      parsed = cleanDomain(rawUrl);
    } catch (e) {
      return NextResponse.json(
        { error: 'El formato de la URL no es válido. Revisa el dominio ingresado.' },
        { status: 400 }
      );
    }

    const { fullUrl, hostname, protocol } = parsed;

    // Protección contra consultas a localhost / IPs privadas
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      /^127\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname)
    ) {
      return NextResponse.json(
        { error: 'No se permite auditar direcciones locales o privadas.' },
        { status: 400 }
      );
    }

    // 1. Resolución DNS
    let ip = '';
    try {
      const lookup = await dns.lookup(hostname);
      ip = lookup.address;
    } catch (err) {
      return NextResponse.json(
        { error: `No se pudo resolver el dominio "${hostname}". Verifica que exista y esté activo.` },
        { status: 404 }
      );
    }

    // 2. DNS inverso (rDNS)
    let rDNS = '';
    try {
      const hostnames = await dns.reverse(ip);
      if (hostnames && hostnames.length > 0) {
        rDNS = hostnames[0];
      }
    } catch (e) {}

    // 3. Medición de TTFB y Fetch de Cabeceras
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const startTime = performance.now();
    let response;
    let ttfbMs = 0;
    let responseHeaders = {};
    let htmlSnippet = '';
    let httpStatus = 200;

    try {
      response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DebatehostingAuditor/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      ttfbMs = Math.max(Math.round(performance.now() - startTime), 12);
      httpStatus = response.status;

      // Extraer cabeceras
      response.headers.forEach((val, key) => {
        responseHeaders[key.toLowerCase()] = val;
      });

      try {
        htmlSnippet = await response.text();
      } catch (e) {}
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: `El servidor de "${hostname}" tardó demasiado en responder o bloqueó la conexión.` },
        { status: 504 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // 4. Datos de ISP / ASN
    let ispData = { isp: '', org: '', as: '', asname: '', country: '', city: '' };
    try {
      const ipRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,isp,org,as,asname`, {
        signal: AbortSignal.timeout(2500),
      });
      if (ipRes.ok) {
        const json = await ipRes.json();
        if (json.status === 'success') {
          ispData = json;
        }
      }
    } catch (e) {}

    // 5. Análisis e Identificación
    const providerInfo = identifyProvider(
      ispData.isp,
      ispData.org,
      ispData.asname,
      rDNS,
      responseHeaders.server
    );

    const serverWeb = identifyServer(
      responseHeaders.server,
      responseHeaders['x-powered-by'],
      responseHeaders['x-litespeed-cache']
    );

    const cmsInfo = identifyCMS(htmlSnippet, responseHeaders);
    const gradeInfo = calculateGrade(ttfbMs);

    // 6. Consultar 2 proveedores recomendados de la base de datos con cupones
    let recommendations = [];
    try {
      const provs = await prisma.provider.findMany({
        where: { active: true },
        include: {
          coupons: {
            where: { verified: true },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { scoreRendimiento: 'desc' },
        take: 2,
      });

      recommendations = provs.map((p) => ({
        id: p.id,
        name: p.name,
        logoUrl: p.logoUrl,
        plan: p.plan,
        priceFrom: p.priceFrom,
        uptime: p.uptime,
        affiliateUrl: p.affiliateUrl,
        coupon: p.coupons?.[0] ? p.coupons[0].code : null,
        discount: p.coupons?.[0] ? p.coupons[0].discount : null,
      }));
    } catch (e) {}

    // Respuesta integral
    return NextResponse.json({
      hostname,
      ip,
      rDNS: rDNS || null,
      location: ispData.country ? `${ispData.city ? ispData.city + ', ' : ''}${ispData.country}` : 'Global',
      isp: ispData.isp || ispData.org || 'Red IP Pública',
      provider: providerInfo,
      serverWeb,
      cms: cmsInfo,
      performance: {
        ttfbMs,
        httpStatus,
        protocol: protocol.replace(':', '').toUpperCase(),
        compression: responseHeaders['content-encoding'] || 'Ninguna (Sin comprimir)',
        isHttps: protocol === 'https:',
        hasBrotli: responseHeaders['content-encoding'] === 'br',
        cdnStatus: responseHeaders['cf-cache-status'] || responseHeaders['x-cache'] || null,
      },
      evaluation: gradeInfo,
      recommendations,
      auditedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error en /api/public/inspect:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado al procesar la auditoría del servidor.' },
      { status: 500 }
    );
  }
}
