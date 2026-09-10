# 📰 Debatehosting — Plataforma Editorial de Hosting y Nube

Sitio web editorial de afiliados para servicios de hosting, VPS, nube y dominios con enfoque de **imprenta moderna**: los proveedores se enfrentan a duelo interactivo y el usuario actúa como jurado.

Construido como un **proyecto Full-Stack unificado con Next.js + Prisma ORM**:
- Sin carpetas separadas `client/` o `server/`.
- Un solo `package.json`, un solo `.env` y un solo comando para arrancar.
- Todo corre en un único puerto: `http://localhost:3000`.
- Base de datos SQLite (preparada para cambiar a PostgreSQL en producción cambiando únicamente el `provider` en `schema.prisma`).
- Panel de Administración completo en `/admin`.

---

## 📂 Estructura del Proyecto

```text
debatehosting/
├── prisma/
│   ├── schema.prisma          # Modelos de base de datos
│   ├── seed.js                # Seed con 11 proveedores, 4 picks, cupones y admin
│   └── dev.db                 # Base de datos SQLite local
├── public/                    # Assets estáticos y favicon
├── src/
│   ├── app/
│   │   ├── api/               # Rutas de la API REST (auth, public, admin)
│   │   ├── admin/             # Panel de administración (/admin)
│   │   ├── layout.jsx         # Layout raíz con Google Fonts (Fraunces, Space Grotesk, IBM Plex Mono)
│   │   ├── page.jsx           # Portada pública editorial
│   │   └── globals.css        # Sistema de diseño en CSS puro (papel crema, sombras duras)
│   ├── components/            # Ticker, Hero, Balanza, Elegidos, Ofertas, Duelo, Cupones, Metodo, News, Footer
│   ├── context/               # ToastContext (notificaciones flotantes)
│   └── lib/                   # prisma singleton y JWT auth
├── .env                       # Configuración de base de datos y JWT
├── next.config.mjs            # Configuración de Next.js
├── package.json               # Dependencias y scripts
└── README.md
```

---

## 🚀 Inicio Rápido (Un Solo Comando)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Generar base de datos y cargar datos iniciales
```bash
npm run db:push
npm run db:seed
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```

* **Sitio Web Público**: [http://localhost:3000](http://localhost:3000)
* **Panel de Administración**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔐 Acceso al Panel de Administración

* **URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
* **Usuario**: `admin@debatehosting.com`
* **Contraseña**: `admin123`

---

## ⚡ Cómo Migrar a PostgreSQL en Producción

1. Abre `prisma/schema.prisma` y cambia el `datasource`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Edita `.env`:
   ```env
   DATABASE_URL="postgresql://usuario:password@localhost:5432/debatehosting?schema=public"
   ```
3. Ejecuta:
   ```bash
   npm run db:push
   npm run db:seed
   ```
