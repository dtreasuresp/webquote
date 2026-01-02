'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

/**
 * HomePage - Redireccionador inteligente
 * Si el usuario tiene una cotización asignada, redirige a /q/[id]
 * Si no, redirige a /sin-cotizacion
 */
function HomeContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkQuotation = async () => {
      try {
        const res = await fetch('/api/quotation-config')
        if (res.ok) {
          const data = await res.json()
          if (data?.id) {
            router.replace(`/q/${data.id}`)
            return
          }
        }
        router.replace('/sin-cotizacion')
      } catch (error) {
        console.error('Error checking quotation:', error)
        router.replace('/sin-cotizacion')
      } finally {
        setLoading(false)
      }
    }

    checkQuotation()
  }, [router])

  return (
    <div className="min-h-screen bg-gh-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gh-accent mx-auto"></div>
        <p className="text-gh-text-secondary animate-pulse">
          {loading ? 'Verificando tu acceso...' : 'Redirigiendo...'}
        </p>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  )
}

