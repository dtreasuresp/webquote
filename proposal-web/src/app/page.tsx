'use client'

import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import ResumenEjecutivo from '@/components/ResumenEjecutivo'
import AnalisisRequisitos from '@/components/AnalisisRequisitos'
import DinamicoVsEstatico from '@/components/DinamicoVsEstatico'
import Paquetes from '@/components/Paquetes'
import TablaComparativa from '@/components/TablaComparativa'
import GarantiasYFAQ from '@/components/GarantiasYFAQ'
import Contacto from '@/components/Contacto'

export default function Home() {
  return (
    <main className="bg-white">
      <Navigation />
      <Hero />
      <ResumenEjecutivo />
      <AnalisisRequisitos />
      <DinamicoVsEstatico />
      <Paquetes />
      <TablaComparativa />
      <GarantiasYFAQ />
      <Contacto />
    </main>
  )
}
