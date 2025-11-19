# WebQuote - Propuesta Web Dinámica para Urbanísima Constructora

WebQuote es una solución digital que transforma la complejidad de las cotizaciones en un proceso ágil, transparente y profesional. Diseñado para proyectos web, permite a empresas y clientes construir propuestas claras y competitivas en cuestión de minutos.

**URL en Producción**: [webquote.vercel.app](https://webquote.vercel.app)

## 🚀 Características

- **Next.js 14** con App Router y TypeScript
- **Prisma ORM** para gestión de datos
- **PostgreSQL (Neon)** como base de datos en la nube
- **Tailwind CSS** con tema corporativo personalizado
- **Responsive Design** optimizado para todos los dispositivos
- **Analytics** integrado (Vercel Analytics & Speed Insights)
- **Snapshots dinámicos** para paquetes de servicios
- **Sistema de pago flexible** con múltiples opciones
- **Despliegue automático** en Vercel y Netlify

## 📋 Requisitos Previos

- **Node.js** 18.x o superior
- **npm** 9.x o superior
- **Git** para control de versiones

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/dtreasuresp/Urbanisima_Constructora.git
cd webquote
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env.local` (NO commitar) con las credenciales de BD:

```bash
# Copiar desde Neon Dashboard (https://console.neon.tech)
STORAGE_POSTGRES_PRISMA_URL="postgresql://[user]:[password]@[host]-pooler.c-3.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require"
STORAGE_POSTGRES_URL_NON_POOLING="postgresql://[user]:[password]@[host].c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 4. Sincronizar base de datos

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. (Opcional) Ejecutar seed

```bash
npm run seed
```

## 🚀 Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 🏗️ Estructura del Proyecto

```
webquote/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Layout raíz
│   │   ├── page.tsx      # Página principal
│   │   ├── api/          # Rutas API
│   │   └── paquete/      # Páginas de paquetes
│   ├── components/       # Componentes React reutilizables
│   ├── lib/              # Utilidades y hooks
│   │   ├── prisma.ts     # Cliente Prisma
│   │   ├── snapshotApi.ts # API de snapshots
│   │   ├── types.ts      # Tipos TypeScript
│   │   └── hooks/        # Custom React hooks
│   ├── contexts/         # React Context
│   ├── styles/           # CSS global y módulos
│   └── img/              # Imágenes estáticas
├── prisma/
│   ├── schema.prisma     # Esquema de BD
│   ├── migrations/       # Histórico de migraciones
│   ├── seed.ts           # Script de datos iniciales
│   └── migrate-*.ts      # Scripts de migración específicos
├── public/               # Archivos públicos (assets)
├── scripts/              # Scripts de utilidad
├── docs/                 # Documentación adicional
├── .env                  # Variables de entorno (placeholders)
├── .env.local           # Variables locales (NO COMMITAR)
├── package.json         # Dependencias y scripts
├── tsconfig.json        # Configuración TypeScript
├── next.config.js       # Configuración Next.js
└── tailwind.config.js   # Configuración Tailwind CSS
```

## 📦 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm start` | Inicia servidor de producción |
| `npm run prisma:generate` | Genera cliente Prisma |
| `npm run prisma:migrate` | Aplica migraciones pendientes |
| `npm run migrate:payment-options` | Migra opciones de pago |
| `npm run migrate:servicios-base` | Migra servicios base |
| `npm run seed` | Carga datos iniciales |

## 🗄️ Base de Datos

### Modelo Principal: PackageSnapshot

Tabla que almacena snapshots de paquetes de servicios con:

- **Información básica**: nombre, descripción, emoji, tagline
- **Servicios**: servicios base, otros servicios (JSON)
- **Precios**: gestión, desarrollo, hosting, mailbox, dominio
- **Opciones de pago**: múltiples planes con descuentos
- **Costos**: inicial, año 1, año 2
- **Metadata**: fechas de creación/actualización, estado

## 🚢 Despliegue

### En Vercel

1. Conectar repositorio en [Vercel Dashboard](https://vercel.com)
2. Vercel detectará Next.js automáticamente
3. Configurar variables de entorno en **Settings > Environment Variables**
4. El despliegue ocurre automáticamente en cada push a `main`

```bash
# Deploy manual (si está instalado Vercel CLI)
vercel deploy --prod
```

### En Netlify

1. Conectar repositorio en [Netlify Dashboard](https://netlify.com)
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Configurar variables de entorno en **Site Settings > Build & Deploy**

```bash
# Deploy manual (si está instalado Netlify CLI)
netlify deploy --prod
```

## 🔐 Seguridad

- **Credenciales de BD**: NUNCA commitar `.env.local`
- **Variables sensibles**: Usar Vercel/Netlify Dashboard en producción
- **Prisma**: Usar directUrl para migraciones, PRISMA_URL para aplicación
- **SQL Injection**: Prisma previene esto automáticamente

## 🛡️ Vulnerabilidades

Las vulnerabilidades son auditadas y corregidas automáticamente:

```bash
npm audit fix
```

## 📊 Paquetes Principales

| Paquete | Versión | Uso |
|---------|---------|-----|
| next | 14.2.33 | Framework web |
| react | 18.3.1 | Librería UI |
| @prisma/client | 6.19.0 | ORM para BD |
| typescript | 5.6.3 | Lenguaje tipado |
| tailwindcss | 3.4.11 | Estilos CSS |
| sharp | 0.34.5 | Optimización de imágenes |

## 📝 Temas de Diseño

**Paleta corporativa** (Tailwind personalizado):

- **Primario**: Rojo #DC2626 (energía y construcción)
- **Secundario**: Negro #0F1419 (elegancia)
- **Acento**: Dorado #F59E0B (destacar ofertas)
- **Neutral**: Escala de grises completa

## 🤝 Contribuciones

1. Crear branch desde `main`
2. Hacer cambios y commits
3. Crear Pull Request con descripción
4. Esperar aprobación antes de merge

## 📞 Soporte

Para preguntas o problemas:

- Revisar [Documentación de Vercel](https://vercel.com/docs)
- Revisar [Documentación de Prisma](https://www.prisma.io/docs)
- Contactar al equipo de desarrollo

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver archivo `LICENSE` para detalles.

## 📅 Changelog

### v0.1.0 (18 Noviembre 2025)

- Proyecto inicial
- Setup Next.js + Prisma + PostgreSQL
- Tema corporativo Tailwind
- Integración Vercel/Netlify
- Snapshots dinámicos
