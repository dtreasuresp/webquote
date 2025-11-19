'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import ResumenEjecutivo from '@/components/ResumenEjecutivo'
import AnalisisRequisitos from '@/components/AnalisisRequisitos'
import DinamicoVsEstatico from '@/components/DinamicoVsEstatico'
import Paquetes from '@/components/Paquetes'
import TablaComparativa from '@/components/TablaComparativa'
import PresupuestoYCronograma from '@/components/PresupuestoYCronograma'
import FortalezasDelProyecto from '@/components/FortalezasDelProyecto'
import ObservacionesYRecomendaciones from '@/components/ObservacionesYRecomendaciones'
import Conclusion from '@/components/Conclusion'
import Garantias from '@/components/Garantias'
import FAQ from '@/components/FAQ'
import Contacto from '@/components/Contacto'

function HomeContent() {
  const searchParams = useSearchParams()
  
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

  return (
    <main className="bg-white">
      <Navigation />
      <Hero />
      <ResumenEjecutivo />
      <AnalisisRequisitos />
      <FortalezasDelProyecto />
      <DinamicoVsEstatico />
      <PresupuestoYCronograma />
      <Paquetes />
      <TablaComparativa />
      <ObservacionesYRecomendaciones />
      <Garantias />
      <Conclusion />
      <FAQ />
      <Contacto />
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HomeContent />
    </Suspense>
  )
}
