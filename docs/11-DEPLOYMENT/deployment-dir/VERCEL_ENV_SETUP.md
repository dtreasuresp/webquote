# 🚀 Configuración de Variables de Entorno en Vercel

**Fecha:** 13 de diciembre de 2025  
**Versión de despliegue:** v1.1.0 (Fase 7 - Autenticación)

---

## 🔴 Problema Actual

El despliegue en Vercel está fallando con:
```
GET /api/auth/session 500 (Internal Server Error)
[next-auth][error][CLIENT_FETCH_ERROR] There is a problem with the server configuration
```

**Causa:** Faltan variables de entorno críticas para NextAuth.js

---

## ✅ Solución: Configurar Variables de Entorno

### 1️⃣ Variables Obligatorias

#### **NEXTAUTH_SECRET** (Crítico - Sin esto NextAuth no funciona)
```bash
NEXTAUTH_SECRET="XV54aTI0SiPCskvfBMJB2z2PnsxtIiO4CSz1OI2QIkE="
```
> ⚠️ Este es tu secret generado. Guárdalo de forma segura.

#### **NEXTAUTH_URL** (URL de producción)
```bash
NEXTAUTH_URL="https://webquote.vercel.app"
```

#### **DATABASE_URL** (Neon PostgreSQL)
```bash
DATABASE_URL="postgresql://neondb_owner:npg_Lm3PMyGUgB1O@ep-lingering-wave-ahzbc1a7-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

#### **DATABASE_URL_UNPOOLED** (Opcional pero recomendado)
```bash
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_Lm3PMyGUgB1O@ep-lingering-wave-ahzbc1a7.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

---

## 📋 Pasos para Configurar en Vercel

### Opción A: Dashboard de Vercel (Recomendado)

1. **Ir a Settings**
   - URL: https://vercel.com/dgtecnova-projects/webquote/settings/environment-variables
   - O navega: Project → Settings → Environment Variables

2. **Agregar cada variable:**

   **Variable 1: NEXTAUTH_SECRET**
   ```
   Key:   NEXTAUTH_SECRET
   Value: XV54aTI0SiPCskvfBMJB2z2PnsxtIiO4CSz1OI2QIkE=
   
   ✅ Production
   ✅ Preview
   ✅ Development
   ```

   **Variable 2: NEXTAUTH_URL**
   ```
   Key:   NEXTAUTH_URL
   Value: https://webquote.vercel.app
   
   ✅ Production
   ⬜ Preview (usar auto-generated URL)
   ⬜ Development
   ```

   **Variable 3: DATABASE_URL**
   ```
   Key:   DATABASE_URL
   Value: postgresql://neondb_owner:npg_Lm3PMyGUgB1O@ep-lingering-wave-ahzbc1a7-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
   
   ✅ Production
   ✅ Preview
   ✅ Development
   ```

   **Variable 4: DATABASE_URL_UNPOOLED**
   ```
   Key:   DATABASE_URL_UNPOOLED
   Value: postgresql://neondb_owner:npg_Lm3PMyGUgB1O@ep-lingering-wave-ahzbc1a7.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
   
   ✅ Production
   ✅ Preview
   ✅ Development
   ```

3. **Click en "Add" para cada variable**

4. **Redeploy el proyecto**
   - Ve a: Deployments → Latest Deployment → "..." → Redeploy
   - O haz un nuevo push a `main`

---

### Opción B: Vercel CLI (Alternativa)

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Ir al directorio del proyecto
cd d:\dgtecnova

# Agregar variables
vercel env add NEXTAUTH_SECRET
# Pegar: XV54aTI0SiPCskvfBMJB2z2PnsxtIiO4CSz1OI2QIkE=
# Seleccionar: Production, Preview, Development

vercel env add NEXTAUTH_URL
# Pegar: https://webquote.vercel.app
# Seleccionar: Production

vercel env add DATABASE_URL
# Pegar: postgresql://neondb_owner:npg_Lm3PMyGUgB1O@ep-lingering-wave-ahzbc1a7-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
# Seleccionar: Production, Preview, Development

# Redeploy
vercel --prod
```

---

## 🧪 Verificar Configuración

Después de configurar y redesplegar, verifica:

1. **API de sesión funciona:**
   ```bash
   curl https://webquote.vercel.app/api/auth/session
   ```
   Debería retornar: `{}`  (sesión vacía) en lugar de 500

2. **Login accesible:**
   - https://webquote.vercel.app/login
   - Debería cargar sin errores de consola

3. **Middleware funciona:**
   - https://webquote.vercel.app/
   - Debería redirigir a /login si no estás autenticado

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE: No Commitear Secrets

El archivo `.gitignore` ya está configurado para ignorar:
```gitignore
.env
.env.local
.env*.local
```

### 🔄 Regenerar NEXTAUTH_SECRET (Si se compromete)

Si accidentalmente expones el secret, genera uno nuevo:

**PowerShell:**
```powershell
$bytes = New-Object byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Git Bash / Linux:**
```bash
openssl rand -base64 32
```

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Luego actualiza la variable en Vercel y redeploy.

---

## 📊 Estado del Despliegue

- ✅ Build compilado exitosamente
- ✅ TypeScript sin errores
- ✅ Prisma Client generado
- ❌ **Runtime error: Faltan variables de entorno** ← Estamos aquí
- ⏳ Próximo: Configurar variables y redeploy

---

## 🆘 Troubleshooting

### Error persiste después de configurar variables

1. **Verificar que las variables estén guardadas:**
   - Vercel Dashboard → Settings → Environment Variables
   - Deben aparecer las 4 variables

2. **Forzar redeploy:**
   ```bash
   git commit --allow-empty -m "trigger redeploy"
   git push origin main
   ```

3. **Limpiar caché de Vercel:**
   - Deployments → Latest → "..." → Redeploy
   - ✅ "Use existing Build Cache" debe estar DESMARCADO

4. **Verificar logs en tiempo real:**
   - Deployments → Latest → "View Function Logs"
   - Buscar errores relacionados con NEXTAUTH_SECRET o DATABASE_URL

### Error de conexión a base de datos

Si ves errores de Prisma:
```bash
# Verificar que DATABASE_URL es correcta
# Debe incluir ?sslmode=require al final
```

### Error de NEXTAUTH_URL

Si el login no funciona:
- Production: Debe ser `https://webquote.vercel.app` (sin trailing slash)
- Preview: Dejar vacío (Vercel lo configura automáticamente)

---

## 📚 Referencias

- [NextAuth.js Environment Variables](https://next-auth.js.org/configuration/options#environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon PostgreSQL Connection](https://neon.tech/docs/connect/connect-from-any-app)

---

## ✅ Checklist Final

Antes de cerrar este issue, verifica:

- [ ] NEXTAUTH_SECRET configurado en Production, Preview, Development
- [ ] NEXTAUTH_URL configurado en Production
- [ ] DATABASE_URL configurado en todos los entornos
- [ ] DATABASE_URL_UNPOOLED configurado en todos los entornos
- [ ] Redeploy realizado
- [ ] API `/api/auth/session` responde 200 (no 500)
- [ ] Login page carga sin errores
- [ ] Middleware redirige correctamente

---

**¿Necesitas ayuda?**  
Si después de seguir estos pasos el error persiste, revisa los logs de función en Vercel o contáctame con el mensaje de error específico.
