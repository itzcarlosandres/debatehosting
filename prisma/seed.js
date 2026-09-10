const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando seed de Debatehosting ---');

  // Limpiar datos previos
  await prisma.clickEvent.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.pick.deleteMany({});
  await prisma.tickerItem.deleteMany({});
  await prisma.subscriber.deleteMany({});
  await prisma.provider.deleteMany({});
  await prisma.adminUser.deleteMany({});

  // 1. Crear Administrador por defecto
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@debatehosting.com',
      passwordHash,
    },
  });
  console.log(`✓ Admin creado: ${admin.email} (pass: admin123)`);

  // 2. Proveedores y sus Cupones asociados
  const providersData = [
    {
      name: 'Hostinger',
      slug: 'hostinger',
      categories: JSON.stringify(['hosting', 'wordpress']),
      plan: 'Premium Web Hosting',
      priceFrom: 2.49,
      priceBefore: 9.99,
      period: 'mes',
      scorePrecio: 9.4,
      scoreRendimiento: 7.8,
      scoreSoporte: 7.5,
      scoreFacilidad: 9.2,
      uptime: 99.98,
      affiliateUrl: 'https://www.hostinger.es?ref=debatehosting',
      active: true,
      coupons: [
        {
          code: 'DEBATE10',
          discount: '−10% extra',
          condition: 'En planes Premium y Business de 12 a 48 meses',
          expiresAt: new Date('2026-12-31T23:59:59Z'),
          verified: true,
        },
      ],
    },
    {
      name: 'IONOS',
      slug: 'ionos',
      categories: JSON.stringify(['hosting', 'vps']),
      plan: 'Plus Hosting',
      priceFrom: 1.50,
      priceBefore: 6.00,
      period: 'mes',
      scorePrecio: 9.8,
      scoreRendimiento: 7.6,
      scoreSoporte: 8.2,
      scoreFacilidad: 7.9,
      uptime: 99.95,
      affiliateUrl: 'https://www.ionos.es?ref=debatehosting',
      active: true,
      coupons: [],
    },
    {
      name: 'SiteGround',
      slug: 'siteground',
      categories: JSON.stringify(['wordpress', 'hosting']),
      plan: 'StartUp Plan',
      priceFrom: 3.99,
      priceBefore: 17.99,
      period: 'mes',
      scorePrecio: 6.8,
      scoreRendimiento: 8.8,
      scoreSoporte: 9.5,
      scoreFacilidad: 9.0,
      uptime: 99.99,
      affiliateUrl: 'https://www.siteground.es?ref=debatehosting',
      active: true,
      coupons: [],
    },
    {
      name: 'Contabo',
      slug: 'contabo',
      categories: JSON.stringify(['vps']),
      plan: 'Cloud VPS S (4 vCPU / 8 GB RAM)',
      priceFrom: 4.50,
      priceBefore: 5.50,
      period: 'mes',
      scorePrecio: 9.6,
      scoreRendimiento: 9.0,
      scoreSoporte: 6.5,
      scoreFacilidad: 6.8,
      uptime: 99.90,
      affiliateUrl: 'https://www.contabo.com?ref=debatehosting',
      active: true,
      coupons: [
        {
          code: 'DBHVPS5',
          discount: '−5% en setup',
          condition: 'Sin permanencia mínima, aplicable en configuración inicial',
          expiresAt: new Date('2026-11-30T23:59:59Z'),
          verified: true,
        },
      ],
    },
    {
      name: 'OVHcloud',
      slug: 'ovhcloud',
      categories: JSON.stringify(['vps', 'hosting']),
      plan: 'VPS Starter Cloud',
      priceFrom: 3.50,
      priceBefore: 4.20,
      period: 'mes',
      scorePrecio: 8.8,
      scoreRendimiento: 8.6,
      scoreSoporte: 7.0,
      scoreFacilidad: 7.2,
      uptime: 99.91,
      affiliateUrl: 'https://www.ovhcloud.com?ref=debatehosting',
      active: true,
      coupons: [],
    },
    {
      name: 'Cloudways',
      slug: 'cloudways',
      categories: JSON.stringify(['cloud', 'wordpress']),
      plan: 'DigitalOcean Managed 1GB',
      priceFrom: 11.00,
      priceBefore: 14.00,
      period: 'mes',
      scorePrecio: 6.5,
      scoreRendimiento: 9.4,
      scoreSoporte: 8.6,
      scoreFacilidad: 8.4,
      uptime: 99.99,
      affiliateUrl: 'https://www.cloudways.com?ref=debatehosting',
      active: true,
      coupons: [
        {
          code: 'DEBATE30',
          discount: '30% dto. 3 meses',
          condition: 'Válido para nuevos registros en servidores DO y Linode',
          expiresAt: new Date('2026-12-31T23:59:59Z'),
          verified: true,
        },
      ],
    },
    {
      name: 'Namecheap',
      slug: 'namecheap',
      categories: JSON.stringify(['dominios', 'hosting']),
      plan: 'Stellar Shared Hosting',
      priceFrom: 2.88,
      priceBefore: 4.48,
      period: 'mes',
      scorePrecio: 9.2,
      scoreRendimiento: 7.4,
      scoreSoporte: 8.0,
      scoreFacilidad: 8.8,
      uptime: 99.96,
      affiliateUrl: 'https://www.namecheap.com?ref=debatehosting',
      active: true,
      coupons: [
        {
          code: 'DBHDOM',
          discount: '−20% en .com',
          condition: 'Primer año de registro de dominios principales',
          expiresAt: new Date('2026-10-31T23:59:59Z'),
          verified: true,
        },
      ],
    },
    {
      name: 'HostGator',
      slug: 'hostgator',
      categories: JSON.stringify(['hosting']),
      plan: 'Plan Hatchling',
      priceFrom: 2.75,
      priceBefore: 9.95,
      period: 'mes',
      scorePrecio: 8.0,
      scoreRendimiento: 7.2,
      scoreSoporte: 7.8,
      scoreFacilidad: 8.6,
      uptime: 99.93,
      affiliateUrl: 'https://www.hostgator.com?ref=debatehosting',
      active: true,
      coupons: [
        {
          code: 'HOSTDEBATE',
          discount: '−60% primer ciclo',
          condition: 'Aplica a contratación anual en planes compartidos',
          expiresAt: new Date('2026-12-31T23:59:59Z'),
          verified: true,
        },
      ],
    },
    {
      name: 'Porkbun',
      slug: 'porkbun',
      categories: JSON.stringify(['dominios']),
      plan: 'Registro Dominio .COM',
      priceFrom: 5.63,
      priceBefore: 7.06,
      period: 'año',
      scorePrecio: 9.0,
      scoreRendimiento: 7.6,
      scoreSoporte: 8.4,
      scoreFacilidad: 8.9,
      uptime: 99.98,
      affiliateUrl: 'https://www.porkbun.com?ref=debatehosting',
      active: true,
      coupons: [],
    },
    {
      name: 'DigitalOcean',
      slug: 'digitalocean',
      categories: JSON.stringify(['vps', 'cloud']),
      plan: 'Droplet Basic 1 vCPU / 1GB',
      priceFrom: 4.00,
      priceBefore: 6.00,
      period: 'mes',
      scorePrecio: 7.5,
      scoreRendimiento: 9.2,
      scoreSoporte: 8.0,
      scoreFacilidad: 7.5,
      uptime: 99.99,
      affiliateUrl: 'https://www.digitalocean.com?ref=debatehosting',
      active: true,
      coupons: [
        {
          code: 'DBHDO200',
          discount: '$200 créditos 60 días',
          condition: 'Para nuevas cuentas con verificación de tarjeta de crédito',
          expiresAt: new Date('2026-12-31T23:59:59Z'),
          verified: true,
        },
      ],
    },
    {
      name: 'Kinsta',
      slug: 'kinsta',
      categories: JSON.stringify(['wordpress']),
      plan: 'Starter Managed WP',
      priceFrom: 29.00,
      priceBefore: 35.00,
      period: 'mes',
      scorePrecio: 5.0,
      scoreRendimiento: 9.6,
      scoreSoporte: 9.2,
      scoreFacilidad: 8.8,
      uptime: 99.99,
      affiliateUrl: 'https://www.kinsta.com?ref=debatehosting',
      active: true,
      coupons: [],
    },
  ];

  const createdProviders = {};

  for (const prov of providersData) {
    const { coupons, ...pData } = prov;
    const provider = await prisma.provider.create({
      data: {
        ...pData,
        coupons: {
          create: coupons,
        },
      },
      include: {
        coupons: true,
      },
    });
    createdProviders[provider.name] = provider;
    console.log(`✓ Proveedor creado: ${provider.name} (${provider.coupons.length} cupones)`);
  }

  // 3. Picks Editoriales (Podio de 4 posiciones)
  const picksData = [
    {
      position: 1,
      providerId: createdProviders['Hostinger'].id,
      tag: 'Mejor calidad-precio global',
      titulo: 'Hostinger: El equilibrio imbatible para arrancar',
      veredicto: 'Por $2.49/mes ofrece almacenamiento NVMe, soporte 24/7 en español y un panel intuitivo que deja en evidencia a la competencia clásica.',
    },
    {
      position: 2,
      providerId: createdProviders['Contabo'].id,
      tag: 'Mejor VPS por dólar',
      titulo: 'Contabo: Potencia bruta desmedida a precio de saldo',
      veredicto: 'Ningún otro proveedor te entrega 4 vCPU y 8 GB de RAM por menos de $5 mensuales.',
    },
    {
      position: 3,
      providerId: createdProviders['SiteGround'].id,
      tag: 'Mejor soporte humano',
      titulo: 'SiteGround: Atención técnica experta y respuesta en minutos',
      veredicto: 'La mejor opción para agencias y proyectos serios donde una caída de 10 minutos cuesta dinero real.',
    },
    {
      position: 4,
      providerId: createdProviders['Namecheap'].id,
      tag: 'Mejor para dominios',
      titulo: 'Namecheap: Gestión de dominios limpia y sin trampas',
      veredicto: 'Precios honestos, whois privacy gratuito de por vida y DNS ultrarrápido sin sobrecostes ocultos.',
    },
  ];

  for (const pick of picksData) {
    await prisma.pick.create({ data: pick });
  }
  console.log(`✓ 4 Picks editoriales creados.`);

  // 4. Ticker Items (Noticias de última hora)
  const tickerData = [
    { order: 1, text: '🔥 Hostinger actualiza servidores a AMD EPYC con un 20% más de velocidad.', hot: true },
    { order: 2, text: 'SiteGround incluye CDN propio y copias automáticas diarias en todos sus planes.', hot: false },
    { order: 3, text: 'Contabo amplía almacenamiento NVMe gratuito en su gama VPS Cloud.', hot: false },
    { order: 4, text: 'Namecheap rebaja registros .com a $5.98 por tiempo limitado.', hot: false },
    { order: 5, text: 'DigitalOcean lanza nuevos droplets optimizados para memoria en Frankfurt.', hot: false },
    { order: 6, text: 'Cloudways añade soporte nativo para PHP 8.3 con migración en un clic.', hot: false },
    { order: 7, text: 'IONOS reduce su precio de entrada para proyectos iniciales a solo $1.50/mes.', hot: false },
  ];

  for (const item of tickerData) {
    await prisma.tickerItem.create({ data: item });
  }
  console.log(`✓ ${tickerData.length} Ticker items creados.`);

  // 5. Suscriptor inicial de muestra
  await prisma.subscriber.create({
    data: { email: 'lector@debatehosting.com' },
  });
  console.log('✓ Suscriptor de muestra creado.');

  console.log('--- Seed completado exitosamente ---');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
