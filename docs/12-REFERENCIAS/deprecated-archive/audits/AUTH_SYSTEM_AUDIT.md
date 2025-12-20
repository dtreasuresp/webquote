# 🔒 Auditoría del Sistema de Autenticación
**Fecha:** 13 de diciembre de 2025  
**Estado:** Problema de redirección después del login

---

## 📊 Resumen Ejecutivo

### Problema Principal
El usuario puede autenticarse correctamente, pero después del login el spinner se queda dando vueltas infinitamente y no redirige a la página principal `/`.

### Síntomas Observados
1. ✅ Credenciales se validan correctamente
2. ✅ JWT se genera y se almacena
3. ✅ `useSession()` detecta usuario autenticado
4. ❌ La redirección con `window.location.href = '/'` no funciona
5. ❌ Console muestra `[AUTH] Usuario ya autenticado - Redirigiendo a /` (2 veces por StrictMode)
6. ❌ Página se queda en `/login` con spinner infinito

---

## 🔍 Análisis de Componentes

### 1. ✅ Configuración de NextAuth (`src/lib/auth/index.ts`)

**Estado:** CORRECTO

```typescript
export const authOptions: NextAuthOptions = {
  providers: [CredentialsProvider({ ... })],
  callbacks: {
    jwt: async ({ token, user }) => { /* ✅ Correcto */ },
    session: async ({ session, token }) => { /* ✅ Correcto */ }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  jwt: { maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET, // ✅ Configurado en Vercel
  debug: process.env.NODE_ENV === "development"
}
```

**Observaciones:**
- ✅ Callbacks correctamente implementados
- ✅ JWT strategy configurado
- ✅ Secret configurado en todas las variables de entorno (Production, Preview, Development)
- ✅ Authorize function verifica usuario y contraseña correctamente
- ✅ Actualiza lastLogin en la base de datos

---

### 2. ✅ API Route de NextAuth (`src/app/api/auth/[...nextauth]/route.ts`)

**Estado:** CORRECTO

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Observaciones:**
- ✅ Exporta GET y POST correctamente
- ✅ Usa authOptions del archivo central
- ✅ Ruta dinámica `[...nextauth]` captura todos los endpoints de NextAuth

---

### 3. ✅ SessionProvider (`src/components/providers/AuthProvider.tsx`)

**Estado:** CORRECTO

```typescript
export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider refetchInterval={5 * 60}>
      {children}
    </SessionProvider>
  );
}
```

**Observaciones:**
- ✅ Envuelve toda la aplicación en `src/app/layout.tsx`
- ✅ RefetchInterval configurado a 5 minutos
- ✅ Es un Client Component (`"use client"`)

---

### 4. ⚠️ Middleware (`src/middleware.ts`)

**Estado:** POSIBLE PROBLEMA

```typescript
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  const isAuthenticated = !!token
  
  // 🚪 Si está autenticado e intenta acceder al login → Homepage
  if (isAuthRoute && isAuthenticated) {
    console.log('[MIDDLEWARE] Usuario autenticado intentando acceder a /login → Redirect /')
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // ... resto del código
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api|img).*)',
  ],
}
```

**Observaciones:**
- ⚠️ **POTENCIAL PROBLEMA:** El middleware excluye `/api/*` del matcher
- ⚠️ Esto significa que `/api/auth/callback/credentials` NO pasa por el middleware
- ✅ El matcher está bien configurado para evitar loops
- ⚠️ El middleware SÍ se ejecuta en `/login` y puede estar interfiriendo

**PROBLEMA IDENTIFICADO #1:**
Cuando el usuario se autentica:
1. `signIn()` llama a `/api/auth/callback/credentials`
2. NextAuth genera el JWT y establece la cookie
3. El navegador recarga `/login` para actualizar el estado
4. El middleware detecta que está autenticado
5. El middleware redirige a `/` PERO esto puede estar en conflicto con el JS del cliente

---

### 5. ❌ Login Page (`src/app/login/page.tsx`)

**Estado:** PROBLEMA ENCONTRADO

```typescript
// useEffect que redirige si ya está autenticado
useEffect(() => {
  if (status === 'authenticated' && session?.user && !isSubmitting) {
    console.log('[AUTH] Usuario ya autenticado - Redirigiendo a /')
    window.location.href = '/'
  }
}, [status, session, isSubmitting])

// handleSubmit después de autenticación exitosa
if (result?.ok) {
  console.log('[LOGIN] SignIn exitoso, esperando callback...')
  setSuccess(true)
  await new Promise(resolve => setTimeout(resolve, 1000))
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  console.log('[LOGIN] Redirigiendo a:', callbackUrl)
  window.location.href = callbackUrl
}
```

**PROBLEMA IDENTIFICADO #2:**
- ❌ `window.location.href` NO funciona en Vercel/Next.js de forma confiable
- ❌ Hay un conflicto entre el useEffect y el handleSubmit
- ❌ Ambos intentan redirigir, causando race conditions
- ❌ El log `[LOGIN] SignIn exitoso...` probablemente nunca se muestra

**Por qué falla:**
1. Next.js usa **Single Page Application (SPA)** routing
2. `window.location.href = '/'` intenta hacer un reload completo
3. Pero el middleware ya está redirigiendo del lado del servidor
4. El navegador se confunde y se queda en loop

---

### 6. ✅ Variables de Entorno

**Estado:** CORRECTAMENTE CONFIGURADAS

```bash
# Vercel Environment Variables (verificadas)
✅ NEXTAUTH_SECRET    → Production, Preview, Development
✅ NEXTAUTH_URL        → Production (https://webquote.vercel.app)
✅ DATABASE_URL        → Production, Preview, Development
✅ DATABASE_URL_UNPOOLED → Production, Preview, Development
```

**Observaciones:**
- ✅ Todas las variables críticas están configuradas
- ✅ NEXTAUTH_SECRET está en los 3 entornos
- ✅ NEXTAUTH_URL solo en Production (correcto, Vercel auto-configura en Preview/Dev)

---

## 🐛 Problemas Identificados

### Problema #1: Conflicto entre Middleware y Client-Side Redirect
**Severidad:** CRÍTICO

**Descripción:**
El middleware del servidor y el JavaScript del cliente están compitiendo para redirigir al usuario:

```
Usuario autentica
  ↓
NextAuth genera JWT + cookie
  ↓
[SERVIDOR] Middleware detecta autenticación → intenta redirect a /
  ↓  
[CLIENTE] useEffect detecta autenticación → intenta redirect a /
  ↓
CONFLICTO: Ambos intentan redirigir simultáneamente
  ↓
Resultado: Spinner infinito en /login
```

### Problema #2: Uso de `window.location.href` en SPA
**Severidad:** ALTO

**Descripción:**
Next.js usa routing SPA (Single Page Application), y `window.location.href` fuerza un reload completo del navegador, lo cual:
- Es más lento
- Puede causar conflictos con el middleware
- No es la forma recomendada de navegar en Next.js

**Forma correcta:**
```typescript
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/') // ✅ Usa el router de Next.js
router.refresh() // ✅ Forzar re-fetch de datos del servidor
```

### Problema #3: Race Condition en handleSubmit
**Severidad:** MEDIO

**Descripción:**
Después de `signIn()`, el código espera 1 segundo artificialmente:
```typescript
await new Promise(resolve => setTimeout(resolve, 1000))
```

Esto es una **mala práctica** porque:
- No garantiza que NextAuth complete el callback
- Es tiempo arbitrario (puede ser muy corto o muy largo)
- No maneja errores si el callback falla

---

## 🔧 Soluciones Propuestas

### Solución #1: Simplificar el flujo de autenticación (RECOMENDADO)

**Estrategia:** Dejar que NextAuth y el middleware manejen TODO el flujo

```typescript
// src/app/login/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  
  // ✅ SIMPLIFICADO: redirect=true deja que NextAuth maneje la redirección
  await signIn('credentials', {
    username,
    password,
    redirect: true, // ← NextAuth maneja la redirección
    callbackUrl: searchParams.get('callbackUrl') || '/',
  })
  
  // Si llegamos aquí, hubo un error (signIn no redirigió)
  setError('Error al iniciar sesión')
  setLoading(false)
}

// ✅ ELIMINAR el useEffect que redirige
// Ya no es necesario, NextAuth + middleware lo manejan
```

**Ventajas:**
- ✅ Flujo estándar de NextAuth
- ✅ No hay conflictos entre servidor y cliente
- ✅ No hay race conditions
- ✅ Más simple y mantenible

### Solución #2: Usar Router de Next.js con refresh

**Estrategia:** Si necesitas control manual, usa el router correctamente

```typescript
import { useRouter } from 'next/navigation'

const router = useRouter()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  
  const result = await signIn('credentials', {
    username,
    password,
    redirect: false,
  })
  
  if (result?.ok) {
    // ✅ Usar router de Next.js
    router.push('/')
    router.refresh() // Forzar re-fetch del servidor
  } else {
    setError(result?.error || 'Error al iniciar sesión')
    setLoading(false)
  }
}

// ✅ Simplificar useEffect
useEffect(() => {
  if (status === 'authenticated') {
    router.push('/')
  }
}, [status, router])
```

### Solución #3: Deshabilitar middleware en /login durante autenticación

**Estrategia:** Evitar que el middleware interfiera durante el proceso de login

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // ✅ NUEVO: No redirigir si viene de un callback de auth
  const isAuthCallback = pathname.includes('/api/auth/callback')
  if (isAuthCallback) {
    return NextResponse.next()
  }
  
  // ... resto del código
}
```

---

## 📋 Plan de Acción Recomendado

### Paso 1: Implementar Solución #1 (Más Simple)
1. Modificar `src/app/login/page.tsx`
2. Cambiar `redirect: false` → `redirect: true`
3. Eliminar el useEffect de redirección
4. Eliminar el setTimeout artificial
5. Dejar que NextAuth maneje todo

### Paso 2: Probar en Local
1. `npm run dev`
2. Probar login con credenciales correctas
3. Verificar que redirige a `/` sin spinner infinito

### Paso 3: Verificar Middleware
1. Revisar logs de `[MIDDLEWARE]` en consola
2. Asegurar que no hay conflictos

### Paso 4: Deploy a Producción
1. `git commit` + `git push`
2. Esperar deploy de Vercel
3. Probar en producción

---

## 🧪 Tests de Validación

Después de implementar la solución, verificar:

### Test 1: Login Exitoso
- [ ] Ingresar credenciales correctas
- [ ] Spinner aparece brevemente (~200ms)
- [ ] Redirección automática a `/`
- [ ] No hay spinner infinito
- [ ] No hay errores en consola

### Test 2: Login Fallido
- [ ] Ingresar credenciales incorrectas
- [ ] Mostrar mensaje de error
- [ ] No hay redirección
- [ ] Formulario se resetea

### Test 3: Usuario Ya Autenticado
- [ ] Estando autenticado, visitar `/login`
- [ ] Redirección automática a `/`
- [ ] No mostrar formulario de login

### Test 4: Callback URL
- [ ] Visitar `/login?callbackUrl=/paquete/constructor`
- [ ] Hacer login exitoso
- [ ] Redirigir a `/paquete/constructor` (no a `/`)

### Test 5: Middleware Protection
- [ ] Sin autenticación, visitar `/`
- [ ] Redirección automática a `/login?callbackUrl=/`
- [ ] Hacer login
- [ ] Redirección a `/` (la callbackUrl)

---

## 📚 Documentación de Referencia

- [NextAuth.js - Credentials Provider](https://next-auth.js.org/providers/credentials)
- [NextAuth.js - Session Management](https://next-auth.js.org/configuration/options#session)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Router](https://nextjs.org/docs/app/api-reference/functions/use-router)

---

## 🔑 Conclusión

El problema principal es un **conflicto arquitectónico** entre:
1. Redirección del lado del servidor (middleware)
2. Redirección del lado del cliente (useEffect + handleSubmit)
3. Uso de `window.location.href` que no es compatible con el routing SPA de Next.js

**La solución más simple y robusta es dejar que NextAuth maneje TODO el flujo** con `redirect: true`, eliminando la complejidad del código cliente.

---

**Próximos Pasos:** Implementar Solución #1 y probar.
