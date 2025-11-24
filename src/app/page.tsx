'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, Suspense } from 'react'
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
import FAQ from '@/components/sections/FAQ'
import Contacto from '@/components/sections/Contacto'

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
