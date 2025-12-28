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
import { QuotationInteractionWidget } from '@/features/public/components/QuotationInteractionWidget'
import DialogoClienteAceptar from '@/features/public/components/DialogoClienteAceptar'
import DialogoClienteRechazar from '@/features/public/components/DialogoClienteRechazar'
import DialogoClienteProponer from '@/features/public/components/DialogoClienteProponer'
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
  
  // ✅ Estados para los dialogs de respuesta del cliente
  const [aceptarDialogOpen, setAceptarDialogOpen] = useState(false)
  const [rechazarDialogOpen, setRechazarDialogOpen] = useState(false)
  const [proponerDialogOpen, setProponerDialogOpen] = useState(false)
  const [respuestaCargando, setRespuestaCargando] = useState(false)
  
  // ✅ Calcular tiempo restante para aceptar la cotización
  const calcularTiempoRestante = useCallback(() => {
    if (!cotizacion?.fechaVencimiento) return null
    
    const vencimiento = new Date(cotizacion.fechaVencimiento)
    const ahora = new Date()
    const diff = vencimiento.getTime() - ahora.getTime()
    
    if (diff <= 0) {
      return null // Cotización expirada
    }
    
    const diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return diasRestantes
  }, [cotizacion?.fechaVencimiento])

  // ✅ Handler para enviar respuesta del cliente a la API
  const handleClientResponse = useCallback(
    async (
      responseType: 'ACEPTADA' | 'RECHAZADA' | 'NUEVA_PROPUESTA',
      clientName: string,
      clientEmail: string,
      mensaje: string = ''
    ) => {
      if (!cotizacion?.id) {
        console.error('No quotation ID available')
        return
      }

      try {
        setRespuestaCargando(true)
        const response = await fetch(`/api/quotations/${cotizacion.id}/client-response`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responseType,
            clientName,
            clientEmail,
            mensaje,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Error al enviar respuesta')
        }

        // ✅ Cerrar dialogs
        setAceptarDialogOpen(false)
        setRechazarDialogOpen(false)
        setProponerDialogOpen(false)

        // ✅ Mostrar feedback y redirigir
        const data = await response.json()
        console.log('✅ Respuesta enviada:', data)

        // Esperar 1.5 segundos antes de redirigir para que vea el mensaje de éxito
        setTimeout(() => {
          router.push('/cotizacion-expirada')
        }, 1500)
      } catch (error) {
        console.error('Error al enviar respuesta:', error)
        alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      } finally {
        setRespuestaCargando(false)
      }
    },
    [cotizacion?.id, router]
  )

  // ✅ Handlers específicos para cada tipo de respuesta
  const handleAceptar = useCallback(
    async (clientName: string, clientEmail: string) => {
      await handleClientResponse('ACEPTADA', clientName, clientEmail)
    },
    [handleClientResponse]
  )

  const handleRechazar = useCallback(
    async (clientName: string, clientEmail: string, razon: string) => {
      await handleClientResponse('RECHAZADA', clientName, clientEmail, razon)
    },
    [handleClientResponse]
  )

  const handleProponer = useCallback(
    async (clientName: string, clientEmail: string, sugerencias: string) => {
      await handleClientResponse('NUEVA_PROPUESTA', clientName, clientEmail, sugerencias)
    },
    [handleClientResponse]
  )
  
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
  
  // ✅ Validar que cotización esté ACTIVA (publicada)
  useEffect(() => {
    if (cotizacion?.id && cotizacion?.estado !== 'ACTIVA') {
      console.log('⚠️ Cotización no publicada - Estado:', cotizacion.estado)
      router.replace('/sin-cotizacion?reason=not-published')
    }
  }, [cotizacion?.id, cotizacion?.estado, router])
  
  // ✅ Redirigir a página expirada si la cotización venció
  useEffect(() => {
    if (cotizacion?.fechaVencimiento && !loading) {
      const vencimiento = new Date(cotizacion.fechaVencimiento)
      const ahora = new Date()
      
      if (ahora > vencimiento) {
        console.log('📅 Cotización expirada - Redirigiendo a /cotizacion-expirada')
        router.push('/cotizacion-expirada')
      }
    }
  }, [cotizacion?.fechaVencimiento, loading, router])
  
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
  const presupuestoFromDB = contenido?.presupuestoCronograma
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
  const cuotasData = contenido?.cuotas

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
      {/* ✅ Widget integrado: contador + botones de respuesta */}
      {cotizacion?.fechaVencimiento && calcularTiempoRestante() && cotizacion?.id && cotizacion?.estado === 'ACTIVA' && (
        <QuotationInteractionWidget
          diasRestantes={calcularTiempoRestante()!}
          expiradoEn={cotizacion.fechaVencimiento}
          quotationId={cotizacion.id}
          quotationNumber={cotizacion.numero}
          onAceptar={() => setAceptarDialogOpen(true)}
          onRechazar={() => setRechazarDialogOpen(true)}
          onNuevaProuesta={() => setProponerDialogOpen(true)}
          disabled={respuestaCargando}
        />
      )}

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

      {/* ✅ Dialogs para respuestas del cliente */}
      {cotizacion?.id && (
        <>
          <DialogoClienteAceptar
            isOpen={aceptarDialogOpen}
            quotationId={cotizacion.id}
            quotationNumber={cotizacion.numero}
            onClose={() => setAceptarDialogOpen(false)}
            onSubmit={handleAceptar}
            isLoading={respuestaCargando}
          />
          <DialogoClienteRechazar
            isOpen={rechazarDialogOpen}
            quotationId={cotizacion.id}
            quotationNumber={cotizacion.numero}
            onClose={() => setRechazarDialogOpen(false)}
            onSubmit={handleRechazar}
            isLoading={respuestaCargando}
          />
          <DialogoClienteProponer
            isOpen={proponerDialogOpen}
            quotationId={cotizacion.id}
            quotationNumber={cotizacion.numero}
            onClose={() => setProponerDialogOpen(false)}
            onSubmit={handleProponer}
            isLoading={respuestaCargando}
          />
        </>
      )}
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
