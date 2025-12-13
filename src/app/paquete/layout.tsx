/**
 * Layout intermedio para rutas que requieren autenticación general (no admin)
 * ✅ OPTIMIZADO: Sin verificación server-side para mejor rendimiento
 * La protección se hace client-side en cada page con useSession()
 */
import type { ReactNode } from 'react'

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  // Pass-through layout sin verificación - la auth se maneja client-side
  return <>{children}</>
}
