/**
 * Middleware de Next.js para protección de rutas con NextAuth
 * Verifica autenticación ANTES de renderizar páginas
 * Elimina el "flash" de contenido no autenticado
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/',
  '/paquete/constructor',
  '/paquete/obra-maestra',
  '/paquete/imperio-digital',
]

// Rutas que solo pueden acceder usuarios no autenticados
const AUTH_ROUTES = ['/login']

// Rutas de administrador (requieren rol ADMIN o SUPER_ADMIN)
const ADMIN_ROUTES = ['/administrador']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ Obtener token JWT de la sesión (verifica si está autenticado)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthenticated = !!token
  
  // Verificar rutas - usar lógica más específica
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))
  
  // Para rutas protegidas, verificar con lógica específica
  const isProtectedRoute = PROTECTED_ROUTES.some(route => {
    if (route === '/') {
      // La homepage debe ser exacta, no capturar subrutas
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })

  // 🚪 Si está autenticado e intenta acceder al login → Homepage (verificar PRIMERO)
  if (isAuthRoute && isAuthenticated) {
    console.log('[MIDDLEWARE] Usuario autenticado intentando acceder a /login → Redirect /')
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 🔒 Si intenta acceder a ruta protegida sin autenticación → Login
  if (isProtectedRoute && !isAuthenticated) {
    console.log('[MIDDLEWARE] Acceso denegado a:', pathname, '→ Redirect /login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 👨‍💼 Si intenta acceder a admin sin rol adecuado → Homepage o Login
  if (isAdminRoute) {
    if (!isAuthenticated) {
      console.log('[MIDDLEWARE] Acceso denegado a admin (no autenticado) → Redirect /login')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verificar rol de administrador
    const userRole = token?.role as string
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      console.log('[MIDDLEWARE] Acceso denegado a admin (sin permisos):', userRole, '→ Redirect /')
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // ✅ Permitir acceso
  return NextResponse.next()
}

// Configuración del matcher (rutas donde se ejecuta el middleware)
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (metadata files)
     * - /api/* (API routes - tienen su propia autenticación)
     * - /img/* (imágenes públicas)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api|img).*)',
  ],
}
