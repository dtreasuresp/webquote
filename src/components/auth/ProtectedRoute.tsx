"use client"

/**
 * Componente para proteger rutas del lado del cliente
 * Redirige a /login si no hay sesión activa
 */

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading") return

    // Si no hay sesión, redirigir al login
    if (!session) {
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`
      router.push(loginUrl)
      return
    }

    // Si requiere admin y el usuario no es admin
    if (requireAdmin && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      router.push("/")
    }
  }, [session, status, router, pathname, requireAdmin])

  // Mostrar loading mientras verifica
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#58a6ff] mx-auto"></div>
          <p className="mt-4 text-[#8b949e]">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Si no hay sesión, no mostrar contenido (ya está redirigiendo)
  if (!session) {
    return null
  }

  // Si requiere admin y no es admin, no mostrar contenido
  if (requireAdmin && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return null
  }

  // Todo OK, mostrar el contenido protegido
  return <>{children}</>
}
