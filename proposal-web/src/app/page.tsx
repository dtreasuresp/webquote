'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
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
import ResumenTecnicoRequisitos from '@/components/ResumenTecnicoRequisitos'
import MatrizPrioridades from '@/components/MatrizPrioridades'
import GarantiasYFAQ from '@/components/GarantiasYFAQ'
import Contacto from '@/components/Contacto'

export default function Home() {
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
      <DinamicoVsEstatico />
      <Paquetes />
      <PresupuestoYCronograma />
      <FortalezasDelProyecto />
      <TablaComparativa />
      <ResumenTecnicoRequisitos />
      <ObservacionesYRecomendaciones />
      <MatrizPrioridades />
      <GarantiasYFAQ />
      <Contacto />
    </main>
  )
}
