const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAll() {
  console.log('🧹 [RESET] Iniciando vaciado de contenido de Debatehosting...');

  try {
    // 1. Eliminar métricas y eventos de clics
    const delClicks = await prisma.clickEvent.deleteMany({});
    console.log(`  ✓ Eventos de clics eliminados: ${delClicks.count}`);

    // 2. Eliminar cupones
    const delCoupons = await prisma.coupon.deleteMany({});
    console.log(`  ✓ Cupones eliminados: ${delCoupons.count}`);

    // 3. Eliminar picks / elegidos
    const delPicks = await prisma.pick.deleteMany({});
    console.log(`  ✓ Elegidos eliminados: ${delPicks.count}`);

    // 4. Eliminar ticker de noticias
    const delTicker = await prisma.tickerItem.deleteMany({});
    console.log(`  ✓ Notificaciones del ticker eliminadas: ${delTicker.count}`);

    // 5. Eliminar suscriptores del newsletter
    const delSubs = await prisma.subscriber.deleteMany({});
    console.log(`  ✓ Suscriptores eliminados: ${delSubs.count}`);

    // 6. Eliminar proveedores
    const delProviders = await prisma.provider.deleteMany({});
    console.log(`  ✓ Proveedores eliminados: ${delProviders.count}`);

    // 7. Verificar o asegurar usuario administrador
    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const admin = await prisma.adminUser.create({
        data: {
          email: 'admin@debatehosting.com',
          passwordHash,
        },
      });
      console.log(`  ✓ Admin por defecto creado: ${admin.email} / admin123`);
    } else {
      console.log(`  ✓ Usuarios administradores preservados (${adminCount} existentes).`);
    }

    console.log('✨ [RESET COMPLETADO] La web ha quedado totalmente en 0.');
  } catch (error) {
    console.error('❌ Error durante el reset:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  resetAll();
}

module.exports = { resetAll };
