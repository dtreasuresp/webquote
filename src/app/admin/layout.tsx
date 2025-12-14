import type { ReactNode } from 'react'
import { ToastProvider } from '@/components/providers/ToastProvider'

// ✅ OPTIMIZACIÓN: Layout pass-through sin verificación server-side
// La protección se hace client-side en el page.tsx con useSession()
// Esto elimina el overhead de getServerSession en cada request
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
