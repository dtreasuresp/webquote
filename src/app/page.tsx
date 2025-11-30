'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Navigation from '@/components/layout/Navigation'
import Hero from '@/components/sections/Hero'
import ResumenEjecutivo from '@/components/sections/ResumenEjecutivo'
import AnalisisRequisitos from '@/components/sections/AnalisisRequisitos'
import DinamicoVsEstatico from '@/components/sections/DinamicoVsEstatico'
import Paquetes from '@/components/sections/Paquetes'
import TablaComparativa from '@/components/sections/TablaComparativa'
import PresupuestoYCronograma from '@/components/sections/PresupuestoYCronograma'
import FortalezasDelProyecto from '@/components/sections/FortalezasDelProyecto'
import ObservacionesYRecomendaciones from '@/components/sections/ObservacionesYRecomendaciones'
import Conclusion from '@/components/sections/Conclusion'
import Garantias from '@/components/sections/Garantias'
import Faq from '@/components/sections/FAQ'
import Contacto from '@/components/sections/Contacto'
import Terminos from '@/components/sections/Terminos'
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
  ConclusionData
} from '@/lib/types'
import type { GarantiasData } from '@/components/sections/Garantias'
import { generateCSSVariables, applyCSSVariables } from '@/lib/utils/colorSystem'

function HomeContent() {
  const searchParams = useSearchParams()
  const [cotizacion, setCotizacion] = useState<QuotationConfig | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Cargar cotización activa al montar
  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const res = await fetch('/api/quotation-config')
        if (res.ok) {
          const data = await res.json()
          setCotizacion(data)
        }
      } catch (error) {
        console.error('Error loading quotation:', error)
      } finally {
        setLoading(false)
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
  const presupuestoCronogramaData: PresupuestoCronogramaData | undefined = contenido?.presupuestoCronograma
  const observacionesData: ObservacionesData | undefined = contenido?.observaciones
  const conclusionData: ConclusionData | undefined = contenido?.conclusion

  // ==================== COLORES CORPORATIVOS DINÁMICOS ====================
  // Aplicar CSS variables basadas en los colores corporativos definidos en el admin
  useEffect(() => {
    if (analisisData?.identidadVisual?.coloresCorporativos?.length) {
      const colores = analisisData.identidadVisual.coloresCorporativos
      const cssVars = generateCSSVariables(colores)
      applyCSSVariables(cssVars)
    }
  }, [analisisData?.identidadVisual?.coloresCorporativos])

  if (loading) {
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
                <div className="space-y-6">
                  <div>
                    <div className="h-6 w-24 bg-light-bg-tertiary rounded animate-pulse mb-4" />
                    <div className="space-y-2">
                      {['empresa', 'sector', 'ubicacion'].map((item) => (
                        <div key={`skel-para-${item}`} className="h-4 w-full bg-light-bg-tertiary rounded animate-pulse" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="h-6 w-20 bg-light-bg-tertiary rounded animate-pulse mb-4" />
                    <div className="space-y-2">
                      {['prof', 'emp', 'email', 'whats', 'ubic'].map((item) => (
                        <div key={`skel-de-${item}`} className="h-4 w-full bg-light-bg-tertiary rounded animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="bg-light-bg font-github min-h-screen">
      <Navigation />
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
      <PresupuestoYCronograma data={presupuestoCronogramaData} />
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
    <Suspense fallback={<div className="min-h-screen bg-light-bg font-github" />}>
      <HomeContent />
    </Suspense>
  )
}
