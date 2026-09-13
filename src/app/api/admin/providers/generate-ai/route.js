import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

// Base de conocimiento especializado de hosting (fallback inmediato y de alta precisión)
const KNOWN_HOSTINGS = {
  alexhost: {
    name: 'Alexhost',
    plan: 'Shared Hosting Expert NVMe',
    description:
      'Alexhost es un proveedor de alojamiento web y servidores fundado en 2008 con sede e infraestructura propia en la República de Moldavia (Chisináu). Destaca en la industria por su sólida política de privacidad, soporte para hosting offshore y servidores no gestionados con control total a nivel de raíz.\n\nDispone de su propio centro de datos ubicado en un antiguo refugio militar blindado a varios metros bajo tierra, lo que le otorga una seguridad física excepcional y protección avanzada contra ataques de denegación de servicio (DDoS de hasta 500 Gbps). Es una opción muy demandada para proyectos que requieren máxima confidencialidad, libertad de contenido y flexibilidad en métodos de pago alternativos como criptomonedas.',
    pros: [
      'Centro de datos propio y blindado bajo tierra en Chisináu (Moldavia).',
      'Excelente política de privacidad y tolerancia a contenidos con soporte offshore.',
      'Protección avanzada contra ataques DDoS incluida en todos los planes.',
      'Acepta pagos anónimos con Bitcoin, Monero y múltiples criptomonedas.',
      'Precios altamente competitivos tanto en hosting compartido como en VPS NVMe.',
    ],
    cons: [
      'El soporte técnico prioritario se gestiona principalmente en inglés.',
      'No incluye cPanel por defecto en planes básicos (utiliza paneles alternativos o requiere licencia).',
    ],
    verdict:
      'Alexhost es la elección predilecta para usuarios, desarrolladores y administradores de sistemas que priorizan la privacidad absoluta, el hosting offshore y la protección contra ataques de fuerza bruta o censura. Si buscas alta tolerancia y control sin requisitos intrusivos de identidad, es de las mejores opciones del mercado.',
    metaTitle: 'Alexhost Hosting: Opiniones, Análisis y Descuentos (2026)',
    metaDescription:
      'Análisis técnico completo de Alexhost en 2026. Centro de datos propio blindado en Moldavia, máxima privacidad offshore, protección anti-DDoS y mejores ofertas.',
    scoreRendimiento: 9.1,
    scoreSoporte: 8.7,
    scorePrecio: 9.6,
    scoreFacilidad: 8.5,
    uptime: 99.95,
  },
  banahosting: {
    name: 'BanaHosting',
    plan: 'Bana-Starter LiteSpeed NVMe',
    description:
      'BanaHosting es uno de los gigantes del alojamiento web más populares en la comunidad de habla hispana, reconocido por su excelente estabilidad y relación calidad-precio. Sus planes compartidos corren sobre servidores web LiteSpeed Enterprise con discos NVMe de última generación, lo que proporciona una velocidad de carga ultrarrápida para WordPress y tiendas WooCommerce.\n\nOfrece centros de datos tanto en Estados Unidos como en Europa, permitiendo elegir la ubicación más cercana a tu audiencia objetiva. Además, incluye panel cPanel con instalador automático, certificados SSL gratuitos e ilimitados y migración gratuita de tu sitio web.',
    pros: [
      'Servidores web LiteSpeed Enterprise con caché nativa LSCache ultrarrápida.',
      'Soporte técnico en español 24/7/365 con tiempos de respuesta bajo 15 minutos.',
      'Almacenamiento NVMe de alto rendimiento y recursos dedicados.',
      'Centros de datos de baja latencia en EE.UU. y Europa.',
      'Garantía de reembolso de 30 días sin compromiso.',
    ],
    cons: [
      'No ofrece soporte telefónico directo (toda la atención es vía tickets rápidos).',
      'El registro y renovación de dominios tiene precios estándar de mercado.',
    ],
    verdict:
      'BanaHosting es el estándar de oro para proyectos de WordPress, blogs de nicho y tiendas online que buscan máximo rendimiento y estabilidad al mejor precio. Muy recomendado tanto para novatos como para webmasters experimentados.',
    metaTitle: 'BanaHosting: Opiniones, Análisis y Cupones de Descuento (2026)',
    metaDescription:
      '¿Vale la pena BanaHosting en 2026? Análisis de servidores LiteSpeed, benchmarks de velocidad TTFB, soporte 24/7 en español y cupones promocionales verificados.',
    scoreRendimiento: 9.7,
    scoreSoporte: 9.5,
    scorePrecio: 9.8,
    scoreFacilidad: 9.4,
    uptime: 99.98,
  },
  webempresa: {
    name: 'Webempresa',
    plan: 'Plan Mini Web WordPress NVMe',
    description:
      'Webempresa es la empresa de hosting especializada en WordPress, WooCommerce y Joomla líder en España y Latinoamérica. Famosa por la altísima calidad de su soporte técnico en español atendido exclusivamente por ingenieros especializados, y por sus sistemas propietarios de seguridad como CyberProtector y reglas anti-hackeo a nivel de servidor.\n\nSus servidores utilizan unidades SSD ultrarrápidas y están optimizados para ofrecer tiempos de carga reducidos con reglas de caché personalizadas y copias de seguridad automáticas cada 4 horas.',
    pros: [
      'El mejor soporte técnico especializado en WordPress del mercado en español.',
      'Copias de seguridad automáticas cada 4 horas y restauración en 1 clic.',
      'Sistemas propietarios de seguridad y aislamiento de cuentas.',
      'Centros de datos en Europa con máxima velocidad y cumplimiento de RGPD.',
    ],
    cons: [
      'Precio más elevado que la media del mercado tras la primera renovación.',
      'El espacio en disco de los planes iniciales es algo más ajustado.',
    ],
    verdict:
      'Webempresa es la opción ideal si tu prioridad absoluta es la tranquilidad: proyectos corporativos, tiendas WooCommerce y webs profesionales donde el soporte técnico inmediato y la seguridad justifiquen una inversión superior.',
    metaTitle: 'Webempresa: Análisis a Fondo, Opiniones y Ofertas (2026)',
    metaDescription:
      'Opiniones de Webempresa en 2026. Auditoría de velocidad, pruebas de soporte técnico 24/7 en español y descuentos oficiales en planes de hosting WordPress.',
    scoreRendimiento: 9.4,
    scoreSoporte: 9.9,
    scorePrecio: 8.6,
    scoreFacilidad: 9.5,
    uptime: 99.99,
  },
  hostinger: {
    name: 'Hostinger',
    plan: 'Premium Web Hosting',
    description:
      'Hostinger se ha consolidado como una de las empresas de infraestructura web de mayor crecimiento mundial gracias a una interfaz extremadamente intuitiva (hPanel) y precios de entrada muy accesibles. Cuenta con centros de datos repartidos por todo el mundo y utiliza servidores LiteSpeed para garantizar tiempos de respuesta rápidos.\n\nIncluye herramientas de inteligencia artificial para creación de páginas web, creador de logos y optimizaciones específicas para tiendas electrónicas y CMS populares.',
    pros: [
      'Panel de control hPanel moderno, rápido y muy fácil de utilizar.',
      'Precios de entrada sumamente económicos en contratos multianuales.',
      'Servidores web LiteSpeed con centros de datos en múltiples continentes.',
      'Herramientas integradas de inteligencia artificial y migración asistida.',
    ],
    cons: [
      'El mayor descuento exige contratar períodos de 24 o 48 meses.',
      'La asistencia por chat en vivo puede tener cola en horas pico.',
    ],
    verdict:
      'Recomendado para creadores que inician su primer proyecto web, pequeñas empresas y estudiantes que buscan una experiencia de usuario moderna, sencilla y asequible sin configuraciones complejas.',
    metaTitle: 'Hostinger: Opiniones, Rendimiento y Códigos Descuento (2026)',
    metaDescription:
      'Análisis técnico de Hostinger 2026: pruebas de hPanel, servidores LiteSpeed, ventajas, inconvenientes y las ofertas más baratas disponibles.',
    scoreRendimiento: 9.2,
    scoreSoporte: 9.0,
    scorePrecio: 9.6,
    scoreFacilidad: 9.8,
    uptime: 99.94,
  },
};

/**
 * Invoca la API de Google Gemini para redactar la ficha editorial completa y optimizaciones SEO
 */
async function callGeminiApi({ apiKey, name, plan, primaryCat, priceText }) {
  const prompt = `Eres un auditor técnico, analista editorial y consultor SEO experto en infraestructura web, hosting y servidores en español.
Genera un análisis completo, objetivo, profesional y optimizado para SEO para el proveedor de hosting "${name}".

Detalles proporcionados:
- Nombre: ${name}
- Plan inicial / destacado sugerido: ${plan || 'A determinar por ti: identifica el plan más popular, representativo o destacado de este hosting'}
- Especialidad / Categoría: ${primaryCat}
- Precio de referencia: ${priceText}

Debes responder OBLIGATORIAMENTE con un objeto JSON válido (sin markdown adicional, sin comillas triples antes o después) con la siguiente estructura exacta:
{
  "name": "${name}",
  "plan": "Nombre comercial del plan más destacado o popular de ${name} (ej: Bana-Starter, Premium Web Hosting, Cloud NVMe Pro, etc.)",
  "description": "2 o 3 párrafos técnicos detallados sobre la historia del hosting, infraestructura, tipo de discos (NVMe/SSD), servidores (LiteSpeed, Apache, NGINX), panel de control (cPanel, panel propio, etc.), centros de datos y perfiles ideales de usuario.",
  "pros": [
    "Ventaja técnica 1",
    "Ventaja técnica 2",
    "Ventaja técnica 3",
    "Ventaja técnica 4",
    "Ventaja técnica 5"
  ],
  "cons": [
    "Desventaja o límite a tener en cuenta 1",
    "Desventaja o límite a tener en cuenta 2"
  ],
  "verdict": "Veredicto editorial final de 1 párrafo sintetizando para qué tipo de proyectos o presupuestos se recomienda.",
  "metaTitle": "${name}: Análisis, Opiniones y Descuentos (2026)",
  "metaDescription": "Meta descripción SEO de 140 a 155 caracteres optimizada con palabras clave y llamada a la acción.",
  "scoreRendimiento": 9.2,
  "scoreSoporte": 9.0,
  "scorePrecio": 9.3,
  "scoreFacilidad": 9.1,
  "uptime": 99.95
}

Requisitos:
- Las puntuaciones numéricas (scoreRendimiento, scoreSoporte, scorePrecio, scoreFacilidad) deben ser números decimales entre 7.0 y 9.9.
- El uptime debe ser un número entre 99.80 y 99.99.
- El tono debe ser profesional, periodístico, honesto y en español neutro.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text();
      console.warn('Gemini API returned error status:', res.status, errBody);
      return null;
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    // Limpiar posibles bloques markdown si Gemini los incluye
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      name: parsed.name || name,
      plan: parsed.plan || plan || `${name} Starter NVMe`,
      description: parsed.description || '',
      pros: Array.isArray(parsed.pros) ? parsed.pros : [],
      cons: Array.isArray(parsed.cons) ? parsed.cons : [],
      verdict: parsed.verdict || '',
      metaTitle: parsed.metaTitle || `${name}: Análisis y Opiniones (2026)`,
      metaDescription: parsed.metaDescription || '',
      scoreRendimiento: parseFloat(parsed.scoreRendimiento) || 9.1,
      scoreSoporte: parseFloat(parsed.scoreSoporte) || 9.0,
      scorePrecio: parseFloat(parsed.scorePrecio) || 9.2,
      scoreFacilidad: parseFloat(parsed.scoreFacilidad) || 9.0,
      uptime: parseFloat(parsed.uptime) || 99.95,
    };
  } catch (err) {
    console.error('Error al invocar Gemini API:', err.message);
    return null;
  }
}

export async function POST(request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { name, plan, categories, priceFrom } = await request.json();
    const cleanName = (name || '').trim();

    if (!cleanName) {
      return NextResponse.json({ error: 'El nombre del proveedor es obligatorio.' }, { status: 400 });
    }

    const key = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const parsedCats = Array.isArray(categories) ? categories : [categories || 'Hosting Web'];
    const primaryCat = parsedCats[0] || 'Hosting Web';
    const priceText = priceFrom ? `$${parseFloat(priceFrom).toFixed(2)}` : 'precios muy asequibles';

    // 1. Verificar si hay Gemini API Key configurada (en Settings o en .env)
    const settings = getSettings();
    const apiKey = (process.env.GEMINI_API_KEY || settings.geminiApiKey || '').trim();

    if (apiKey) {
      const geminiResult = await callGeminiApi({
        apiKey,
        name: cleanName,
        plan,
        primaryCat,
        priceText,
      });

      if (geminiResult) {
        return NextResponse.json({
          ok: true,
          source: 'gemini_ai',
          data: geminiResult,
        });
      }
    }

    // 2. Si existe en la base de conocimiento local específica (Alexhost, BanaHosting, etc.)
    if (KNOWN_HOSTINGS[key]) {
      return NextResponse.json({
        ok: true,
        source: 'knowledge_base',
        data: KNOWN_HOSTINGS[key],
      });
    }

    // 3. Determinar plan destacado inteligente si no se especificó
    const smartPlan = (plan && plan.trim()) || (() => {
      const catLower = primaryCat.toLowerCase();
      if (catLower.includes('vps')) return `${cleanName} Cloud VPS NVMe 1`;
      if (catLower.includes('dedicado')) return `${cleanName} Dedicated Enterprise`;
      if (catLower.includes('wordpress')) return `${cleanName} WordPress Pro SSD`;
      if (catLower.includes('cloud')) return `${cleanName} Cloud Starter`;
      return `${cleanName} Starter NVMe`;
    })();

    // 4. Fallback: Generador editorial inteligente estructurado
    const description = `${cleanName} es un proveedor especializado en ${primaryCat.toLowerCase()} y soluciones de infraestructura web, diseñado para ofrecer estabilidad y alto rendimiento a proyectos en línea en 2026.\n\nSu arquitectura de servidores cuenta con almacenamiento de estado sólido de alta velocidad, conectividad de baja latencia y optimización para los principales sistemas de gestión de contenido como WordPress, WooCommerce y plataformas personalizadas. Ofrece un entorno seguro con protección contra ataques y herramientas de gestión simplificadas que facilitan la administración de dominios, correos y bases de datos.\n\nCon un plan de entrada denominado "${smartPlan}" disponible desde ${priceText}, se posiciona como una alternativa competitiva tanto para nuevos emprendedores digitales como para proyectos en fase de crecimiento.`;

    const pros = [
      `Excelente relación coste-beneficio en planes de ${primaryCat}.`,
      'Infraestructura moderna con almacenamiento rápido SSD/NVMe y certificados SSL gratis.',
      'Compatibilidad nativa con PHP 8.x, MySQL/MariaDB y los gestores de contenido más utilizados.',
      'Panel de control intuitivo con instalador de aplicaciones en un solo clic.',
      'Protección perimetral y copias de seguridad para resguardar la información.',
    ];

    const cons = [
      'Las tarifas promocionales de bienvenida pueden variar al renovar el servicio.',
      'Los planes iniciales tienen cuotas asignadas de memoria y almacenamiento que convendrá monitorizar al escalar.',
    ];

    const verdict = `${cleanName} es una opción equilibrada para quienes buscan desplegar páginas web, tiendas virtuales o servidores de prueba con una inversión moderada y buen respaldo técnico. Recomendado para freelancers, pequeñas empresas y desarrolladores que valoran la agilidad y una configuración sin fricciones.`;

    const metaTitle = `${cleanName} Hosting: Análisis, Opiniones y Descuentos (2026)`;
    const metaDescription = `Análisis editorial completo de ${cleanName} en 2026: pruebas de velocidad, plan ${smartPlan}, características clave, pros, contras y ofertas oficiales.`;

    return NextResponse.json({
      ok: true,
      source: 'ai_engine',
      data: {
        name: cleanName,
        plan: smartPlan,
        description,
        pros,
        cons,
        verdict,
        metaTitle,
        metaDescription,
        scoreRendimiento: 9.0,
        scoreSoporte: 8.8,
        scorePrecio: 9.2,
        scoreFacilidad: 9.0,
        uptime: 99.95,
      },
    });
  } catch (error) {
    console.error('Error generando datos con IA:', error);
    return NextResponse.json({ error: 'No se pudo generar la información con IA.' }, { status: 500 });
  }
}
