'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/layout/Navigation'
import Hero from '@/components/sections/Hero'
import ResumenEjecutivo from '@/components/sections/ResumenEjecutivo'
import AnalisisRequisitos from '@/components/sections/AnalisisRequisitos'
import DinamicoVsEstatico from '@/components/sections/DinamicoVsEstatico'
import Paquetes from '@/components/sections/Paquetes'
import TablaComparativa from '@/components/sections/TablaComparativa'
import Presupuesto from '@/components/sections/Presupuesto'
import MetodosPagoPublic from '@/components/sections/MetodosPagoPublic'
import Cronograma from '@/components/sections/Cronograma'
import FortalezasDelProyecto from '@/components/sections/FortalezasDelProyecto'
import ObservacionesYRecomendaciones from '@/components/sections/ObservacionesYRecomendaciones'
import Conclusion from '@/components/sections/Conclusion'
import Garantias from '@/components/sections/Garantias'
import Faq from '@/components/sections/FAQ'
import Contacto from '@/components/sections/Contacto'
import Terminos from '@/components/sections/Terminos'
import { useQuotationListener } from '@/hooks/useQuotationSync'
import type { 
  ContactoInfo, 
  ResumenEjecutivoTextos, 
  FAQItem, 
  QuotationConfig, 
  TerminosCondiciones, 
  VisibilidadConfig,
  AnalisisRequisitosData,
  FortalezasData,
  DinamicoVsEstaticoData,
  TablaComparativaData,
  PresupuestoCronogramaData,
  ObservacionesData,
  ConclusionData,
  CuotasData
} from '@/lib/types'
import type { GarantiasData } from '@/components/sections/Garantias'
import { generateCSSVariables, applyCSSVariables } from '@/lib/utils/colorSystem'
import { defaultPresupuestoCronograma } from '@/features/admin/components/content/contenido'
import { AnalyticsProvider } from '@/features/admin/contexts'
import { useEventTracking } from '@/features/admin/hooks'

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [cotizacion, setCotizacion] = useState<QuotationConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { trackProposalViewed, trackOfertaSectionViewed } = useEventTracking()
  
  // ✅ NUEVA: Escuchar eventos de activación de cotizaciones
  // Cuando una cotización es activada desde el admin, la página pública
  // recibe notificación y recarga automáticamente los datos
  useQuotationListener(
    'quotation:activated',
    useCallback((event) => {
      console.log(`🔄 Página Pública: Cotización activada`, event.quotationId)
      // Recargar cotización actual para obtener la versión activada
      const fetchCotizacion = async () => {
        try {
          const res = await fetch('/api/quotation-config')
          if (res.ok) {
            const data = await res.json()
            setCotizacion(data)
            setError(null)
          }
        } catch (error) {
          console.error('Error reloading quotation:', error)
        }
      }
      fetchCotizacion()
    }, [])
  )
  
  // ✅ Cargar cotización del usuario (middleware ya verificó autenticación)
  useEffect(() => {
    const fetchCotizacion = async () => {
      let didRedirect = false
      try {
        const res = await fetch('/api/quotation-config')

        if (res.status === 403) {
          const data = await res.json()

          // Caso específico: usuario autenticado pero sin cotización asignada
          if (
            data?.code === 'NO_QUOTATION_ASSIGNED' ||
            (typeof data?.error === 'string' &&
              data.error.toLowerCase().includes('no tiene cotización asignada'))
          ) {
            didRedirect = true
            router.replace('/sin-cotizacion')
            return
          }

          setError(data?.error || 'No tiene permisos para ver esta cotización')
          return
        }

        if (res.ok) {
          const data = await res.json()
          setCotizacion(data)
          setError(null)
        } else {
          const data = await res.json()
          setError(data.error || 'Error al cargar cotización')
        }
      } catch (error) {
        console.error('Error loading quotation:', error)
        setError('Error de conexión con el servidor')
      } finally {
        if (!didRedirect) setLoading(false)
      }
    }
    fetchCotizacion()
  }, [])

  useEffect(() => {
    const section = searchParams.get('section')
    if (section) {
      const timer = setTimeout(() => {
        const element = document.getElementById(section)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // Track proposal viewed
  useEffect(() => {
    if (cotizacion?.id && typeof trackProposalViewed === 'function') {
      try {
        trackProposalViewed(cotizacion.id, cotizacion.numero)
      } catch (error) {
        console.warn('⚠️ Analytics tracking error (proposal_viewed):', error)
      }
    }
  }, [cotizacion?.id, cotizacion?.numero, trackProposalViewed])

  // Track section visibility
  useEffect(() => {
    if (!cotizacion?.id || typeof trackOfertaSectionViewed !== 'function') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id
            try {
              trackOfertaSectionViewed(sectionId)
            } catch (error) {
              console.warn(`⚠️ Analytics error for section ${sectionId}:`, error)
            }
          }
        })
      },
      { threshold: 0.25 }
    )

    const sections = document.querySelectorAll('section[id]')
    sections.forEach(section => observer.observe(section))

    return () => observer.disconnect()
  }, [cotizacion?.id, trackOfertaSectionViewed])

  // Extraer datos del contenidoGeneral
  const contenido = cotizacion?.contenidoGeneral
  
  // Preparar datos para las secciones
  const faqData: FAQItem[] | undefined = contenido?.faq
  const faqTituloSubtitulo = contenido?.faqTituloSubtitulo
  
  const garantiasData: GarantiasData | undefined = contenido?.garantias ? {
    tituloSubtitulo: contenido.garantiasTituloSubtitulo,
    proveedorGarantiza: contenido.garantias.proveedorGarantiza,
    clienteResponsable: contenido.garantias.clienteResponsable,
    politicasCancelacion: contenido.garantias.politicasCancelacion,
    siIncumpleProveedor: contenido.garantias.siIncumpleProveedor,
  } : undefined

  const contactoData: ContactoInfo | undefined = contenido?.contacto

  const resumenData: ResumenEjecutivoTextos | undefined = contenido?.textos?.resumenEjecutivo

  const terminosData: TerminosCondiciones | undefined = contenido?.terminos

  // Visibilidad de secciones
  const visibilidadData: VisibilidadConfig | undefined = contenido?.visibilidad

  // Nombres de cliente y proveedor
  const nombreCliente = cotizacion?.empresa || 'Cliente'
  const nombreProveedor = cotizacion?.empresaProveedor || 'DGTECNOVA'

  // ==================== NUEVAS SECCIONES DE CONTENIDO ====================
  const analisisData: AnalisisRequisitosData | undefined = contenido?.analisisRequisitos
  const fortalezasData: FortalezasData | undefined = contenido?.fortalezas
  const dinamicoVsEstaticoData: DinamicoVsEstaticoData | undefined = contenido?.dinamicoVsEstatico
  const tablaComparativaData: TablaComparativaData | undefined = contenido?.tablaComparativa
  // Merge profundo para asegurar que todos los subcampos existan
  const presupuestoFromDB = contenido?.presupuestoCronograma as PresupuestoCronogramaData | undefined
  const presupuestoCronogramaData: PresupuestoCronogramaData | undefined = presupuestoFromDB ? {
    ...defaultPresupuestoCronograma,
    ...presupuestoFromDB,
    presupuesto: { ...defaultPresupuestoCronograma.presupuesto, ...presupuestoFromDB.presupuesto },
    cronograma: { ...defaultPresupuestoCronograma.cronograma, ...presupuestoFromDB.cronograma },
    caracteristicasPorPaquete: { ...defaultPresupuestoCronograma.caracteristicasPorPaquete, ...presupuestoFromDB.caracteristicasPorPaquete },
  } : undefined
  const observacionesData: ObservacionesData | undefined = contenido?.observaciones
  const conclusionData: ConclusionData | undefined = contenido?.conclusion
  
  // Cuotas (datos de métodos de pago y rangos de presupuesto)
  const cuotasData: CuotasData | undefined = contenido?.cuotas as CuotasData | undefined

  // ==================== COLORES CORPORATIVOS DINÁMICOS ====================
  // Aplicar CSS variables basadas en los colores corporativos definidos en el admin
  useEffect(() => {
    if (analisisData?.identidadVisual?.coloresCorporativos?.length) {
      const colores = analisisData.identidadVisual.coloresCorporativos
      const cssVars = generateCSSVariables(colores)
      applyCSSVariables(cssVars)
    }
  }, [analisisData?.identidadVisual?.coloresCorporativos])

  // Mostrar skeleton mientras carga la sesión O la cotización
  if (loading || !session) {
    return (
      <main className="bg-light-bg font-github min-h-screen">
        <Navigation />
        {/* Hero Skeleton - GitHub Light Style */}
        <section className="relative bg-light-bg border-b border-light-border py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              {/* Título principal skeleton */}
              <div className="mb-6">
                <div className="h-14 w-3/4 mx-auto bg-light-bg-tertiary rounded-lg animate-pulse mb-6 mt-6" />
                <div className="h-8 w-1/2 mx-auto bg-light-bg-tertiary rounded-lg animate-pulse mb-2" />
                <div className="h-7 w-1/3 mx-auto bg-light-bg-tertiary rounded-lg animate-pulse" />
                <div className="h-5 w-40 mx-auto bg-light-bg-tertiary rounded-lg animate-pulse mt-4" />
              </div>

              {/* Cards skeleton */}
              <div className="grid md:grid-cols-2 gap-8 mt-12 bg-light-bg-secondary border border-light-border rounded-lg p-8">
                {/* Card izquierda */}
                <div className="space-y-3">
                  <div className="h-6 w-48 bg-light-bg-tertiary rounded animate-pulse mb-4" />
                  {['cotiz', 'version', 'emision', 'venc', 'validez', 'presup', 'moneda'].map((item) => (
                    <div key={`skel-left-${item}`} className="flex justify-between py-2 border-b border-light-border">
                      <div className="h-4 w-24 bg-light-bg-tertiary rounded animate-pulse" />
                      <div className="h-4 w-32 bg-light-bg-tertiary rounded animate-pulse" />
                    </div>
                  ))}
                </div>

                {/* Card derecha */}
                <div className="space-y-3">
                  <div className="h-6 w-48 bg-light-bg-tertiary rounded animate-pulse mb-4" />
                  {['empresa', 'contacto', 'email', 'telefono'].map((item) => (
                    <div key={`skel-right-${item}`} className="flex justify-between py-2 border-b border-light-border">
                      <div className="h-4 w-24 bg-light-bg-tertiary rounded animate-pulse" />
                      <div className="h-4 w-40 bg-light-bg-tertiary rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  // Mostrar mensaje de error si no tiene cotización asignada
  if (error) {
    return (
      <main className="bg-light-bg font-github min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white border border-light-border rounded-lg shadow-sm">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sin Acceso</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Usuario: <span className="font-mono font-semibold">{session?.user?.username}</span>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-light-bg font-github min-h-screen">
      <Navigation cotizacion={cotizacion} />
      <Hero cotizacion={cotizacion} />
      <ResumenEjecutivo 
        data={resumenData} 
        visibilidad={visibilidadData}
        nombreCliente={nombreCliente}
        nombreProveedor={nombreProveedor}
      />
      <AnalisisRequisitos data={analisisData} />
      <FortalezasDelProyecto data={fortalezasData} />
      <DinamicoVsEstatico data={dinamicoVsEstaticoData} />
      <Presupuesto data={presupuestoCronogramaData} />
      <MetodosPagoPublic data={presupuestoCronogramaData} cuotasData={cuotasData} />
      <Cronograma data={presupuestoCronogramaData} />
      <Paquetes />
      <TablaComparativa data={tablaComparativaData} />
      <ObservacionesYRecomendaciones data={observacionesData} />
      <Garantias data={garantiasData} visibilidad={visibilidadData} />
      <Terminos data={terminosData} visibilidad={visibilidadData} />
      <Conclusion data={conclusionData} />
      <Faq data={faqData} visibilidad={visibilidadData} tituloSubtitulo={faqTituloSubtitulo} />
      <Contacto data={contactoData} visibilidad={visibilidadData} />
    </main>
  )
}

export default function Home() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="min-h-screen bg-light-bg font-github" />}>
        <AnalyticsProvider>
          <HomeContent />
        </AnalyticsProvider>
      </Suspense>
    </ProtectedRoute>
  )
}
