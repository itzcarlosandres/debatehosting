#!/bin/sh
set -e

echo "🚀 Iniciando Debatehosting con PostgreSQL en Dokploy..."

# 1. Asegurar directorio para logos y uploads
mkdir -p /app/public/uploads/logos

# 2. Sincronizar esquema con PostgreSQL con reintentos de conexión
echo "📦 Conectando y sincronizando esquema con PostgreSQL..."
MAX_RETRIES=20
COUNT=0

until prisma db push --skip-generate || [ $COUNT -ge $MAX_RETRIES ]; do
  echo "⏳ Esperando a que PostgreSQL acepte conexiones... reintentando en 3s ($COUNT/$MAX_RETRIES)"
  COUNT=$((COUNT + 1))
  sleep 3
done

if [ $COUNT -ge $MAX_RETRIES ]; then
  echo "❌ Error: No se pudo conectar a PostgreSQL. Verifica que el servicio de base de datos esté corriendo y la variable DATABASE_URL sea correcta."
  exit 1
fi

# 3. Inicializar datos si la base de datos es nueva (o FORCE_SEED=true)
echo "🌱 Verificando inicialización de datos..."
node prisma/init-data.js || true

# 4. Lanzar servidor Next.js standalone
echo "✨ Servidor listo en el puerto ${PORT:-3000}. Arrancando Next.js..."
exec node server.js
