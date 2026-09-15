import { prisma } from '../src/lib/prisma.js';

async function main() {
  const schemas = await prisma.$queryRawUnsafe("SELECT schema_name FROM information_schema.schemata;");
  console.log('Schemas:', schemas);
  const tables = await prisma.$queryRawUnsafe("SELECT schemaname, tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema');");
  console.log('Tables:', tables);
  for (const t of tables) {
    const count = await prisma.$queryRawUnsafe(`SELECT count(*) FROM "${t.schemaname}"."${t.tablename}";`);
    console.log(`${t.schemaname}.${t.tablename}:`, count);
  }
}

main().finally(() => prisma.$disconnect());
