# Deploy en Vercel - Guía de Configuración

## Pasos para desplegar en Vercel

### 1. **Instalar Vercel CLI** (si no lo tienes)
```bash
npm install -g vercel
```

### 2. **Loguearme en Vercel**
```bash
vercel login
```

### 3. **Desplegar el proyecto**
Desde la raíz del repositorio (no desde `proposal-web`):
```bash
vercel deploy --prod
```

O desde el directorio `proposal-web`:
```bash
cd proposal-web
vercel deploy --prod
```

### 4. **Configurar variables de entorno en Vercel Dashboard**

Ve a https://vercel.com/dashboard y en tu proyecto:
1. **Settings** → **Environment Variables**
2. Agregar estas variables:
   - `DATABASE_URL`: Tu URL de conexión a PostgreSQL
   - `NEXT_PUBLIC_ANALYTICS_ID` (opcional): Para tracking

### 5. **Verificar que sea PostgreSQL**

La configuración en `schema.prisma` ya está lista con:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Asegúrate de que tu `DATABASE_URL` tenga el formato:
```
postgresql://user:password@host:port/database?schema=public
```

### 6. **Prisma en Producción**

- El archivo `package.json` tiene un script `prebuild` que genera el cliente Prisma automáticamente
- Las migraciones se ejecutan con: `npm run prisma:migrate`
- Vercel ejecutará `npm run build` automáticamente

### 7. **Diferencias con Netlify**

| Aspecto | Netlify | Vercel |
|--------|---------|--------|
| Framework | Next.js (con plugin) | Next.js (nativo) |
| API Routes | Serverless | Serverless |
| Database | Cualquiera | Cualquiera |
| Performance | Bueno | Excelente para Next.js |
| Cold starts | ~2s | ~1s |

### 8. **URLs después del deploy**

- **URL de preview**: https://urbanisima-{random}.vercel.app
- **URL de producción**: Tu dominio personalizado (si lo tienes)

## Troubleshooting

### Error: "DATABASE_URL is not set"
→ Asegúrate de agregar la variable en Vercel Dashboard

### Error: "Prisma Client not found"
→ Ejecutar: `npm run prisma:generate`

### API Routes retornan 404
→ Vercel soporta API Routes nativamente, debería funcionar sin problemas

## Rollback

Si necesitas volver a Netlify:
```bash
cd proposal-web
netlify deploy --prod
```
