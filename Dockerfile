# syntax=docker/dockerfile:1

# 1. Base: Node.js 20 Debian-slim con soporte OpenSSL para el motor de Prisma
FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# 2. Dependencies: Instalar paquetes
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# 3. Builder: Generar Prisma Client y compilar Next.js Standalone
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
RUN npx prisma generate
RUN npm run build

# 4. Runner: Imagen de producción ligera y optimizada
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Instalar Prisma CLI para sincronizar esquema en arranque
RUN npm install -g prisma@6.4.1

# Copiar artefactos de compilación Standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

# Copiar prisma (schema, seed, init-data, settings)
COPY --from=builder /app/prisma ./prisma

# Copiar bcryptjs para scripts de inicialización y seed
COPY --from=deps /app/node_modules/bcryptjs ./node_modules/bcryptjs

# Copiar y preparar script de entrada
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Crear directorios para uploads
RUN mkdir -p /app/public/uploads/logos

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
