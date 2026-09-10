const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const adminCount = await prisma.adminUser.count();
    const forceSeed = process.env.FORCE_SEED === 'true';

    if (adminCount === 0 || forceSeed) {
      console.log('📦 Base de datos vacía o FORCE_SEED activado. Poblando datos iniciales...');
      await prisma.$disconnect();
      // Ejecutar seed
      require('./seed.js');
    } else {
      console.log(`✅ Base de datos ya inicializada (${adminCount} usuario(s) admin). Omitiendo seed para preservar datos.`);
      await prisma.$disconnect();
    }
  } catch (err) {
    console.error('⚠️ Error al verificar estado inicial de la base de datos:', err);
    await prisma.$disconnect();
  }
}

main();
