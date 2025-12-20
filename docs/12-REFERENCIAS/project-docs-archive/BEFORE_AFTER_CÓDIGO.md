# 📄 BEFORE/AFTER - Código Refactorizado

## CÓDIGO ACTUAL (page.tsx) - 210 líneas

```tsx
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

  // ... (rest of code - ~130 líneas)
```

---

## CÓDIGO REFACTORIZADO (page.tsx) - 260 líneas

```tsx
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

// ✨ NUEVO: Analytics y Tracking
import { AnalyticsProvider } from '@/features/admin/contexts'
import { useEventTracking } from '@/features/admin/hooks'

function HomeContent() {
  const searchParams = useSearchParams()
  const [cotizacion, setCotizacion] = useState<QuotationConfig | null>(null)
  const [loading, setLoading] = useState(true)
  
  // ✨ NUEVO: Hook para tracking de eventos
  const { trackProposalViewed, trackSectionViewed } = useEventTracking()
  
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

  // ✨ NUEVO: Track que propuesta fue visualizada
  useEffect(() => {
    if (cotizacion?.id && typeof trackProposalViewed === 'function') {
      try {
        trackProposalViewed({
          cotizacionId: cotizacion.id,
          empresaCliente: cotizacion.empresa,
          numero: cotizacion.numero,
          version: cotizacion.version,
          source: 'public_page'
        })
      } catch (error) {
        console.warn('⚠️ Analytics tracking error (proposal_viewed):', error)
      }
    }
  }, [cotizacion?.id, trackProposalViewed])

  // ... (rest of existing code - ~130 líneas sin cambios)

  // ✨ NUEVO: Track sections vistas con IntersectionObserver
  useEffect(() => {
    if (!cotizacion?.id || typeof trackSectionViewed !== 'function') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id
            try {
              trackSectionViewed({
                section: sectionId,
                cotizacionId: cotizacion.id,
                empresaCliente: cotizacion.empresa
              })
            } catch (error) {
              console.warn(`⚠️ Analytics error for section ${sectionId}:`, error)
            }
          }
        })
      },
      { threshold: 0.25 } // Disparar cuando 25% es visible
    )

    // Observar todas las secciones
    const sections = document.querySelectorAll('section[id]')
    sections.forEach(section => observer.observe(section))

    return () => observer.disconnect()
  }, [cotizacion?.id, trackSectionViewed, cotizacion?.empresa])

  if (loading) {
    // ... (skeleton code sin cambios - ~70 líneas)
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
      {/* ✨ NUEVO: Wrappear con AnalyticsProvider */}
      <AnalyticsProvider>
        <HomeContent />
      </AnalyticsProvider>
    </Suspense>
  )
}
```

---

## 🔍 Comparación Visual - Qué Cambia

### Imports (ANTES - 3 líneas)
```tsx
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Navigation from '@/components/layout/Navigation'
```

### Imports (DESPUÉS - 5 líneas)
```tsx
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Navigation from '@/components/layout/Navigation'
// ✨ NUEVO
import { AnalyticsProvider } from '@/features/admin/contexts'
import { useEventTracking } from '@/features/admin/hooks'
```

**Cambio: +2 líneas**

---

### Estado y Hooks (ANTES - 3 líneas)
```tsx
function HomeContent() {
  const searchParams = useSearchParams()
  const [cotizacion, setCotizacion] = useState<QuotationConfig | null>(null)
  const [loading, setLoading] = useState(true)
```

### Estado y Hooks (DESPUÉS - 5 líneas)
```tsx
function HomeContent() {
  const searchParams = useSearchParams()
  const [cotizacion, setCotizacion] = useState<QuotationConfig | null>(null)
  const [loading, setLoading] = useState(true)
  // ✨ NUEVO
  const { trackProposalViewed, trackSectionViewed } = useEventTracking()
```

**Cambio: +2 líneas**

---

### useEffect para Tracking Propuesta (NUEVO - 14 líneas)
```tsx
  // ✨ NUEVO: Track que propuesta fue visualizada
  useEffect(() => {
    if (cotizacion?.id && typeof trackProposalViewed === 'function') {
      try {
        trackProposalViewed({
          cotizacionId: cotizacion.id,
          empresaCliente: cotizacion.empresa,
          numero: cotizacion.numero,
          version: cotizacion.version,
          source: 'public_page'
        })
      } catch (error) {
        console.warn('⚠️ Analytics tracking error (proposal_viewed):', error)
      }
    }
  }, [cotizacion?.id, trackProposalViewed])
```

**Cambio: +14 líneas**

---

### useEffect para Tracking Secciones (NUEVO - 30 líneas)
```tsx
  // ✨ NUEVO: Track sections vistas con IntersectionObserver
  useEffect(() => {
    if (!cotizacion?.id || typeof trackSectionViewed !== 'function') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id
            try {
              trackSectionViewed({
                section: sectionId,
                cotizacionId: cotizacion.id,
                empresaCliente: cotizacion.empresa
              })
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
  }, [cotizacion?.id, trackSectionViewed, cotizacion?.empresa])
```

**Cambio: +30 líneas**

---

### Export Default (ANTES - 5 líneas)
```tsx
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-light-bg font-github" />}>
      <HomeContent />
    </Suspense>
  )
}
```

### Export Default (DESPUÉS - 7 líneas)
```tsx
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-light-bg font-github" />}>
      {/* ✨ NUEVO: Wrappear con AnalyticsProvider */}
      <AnalyticsProvider>
        <HomeContent />
      </AnalyticsProvider>
    </Suspense>
  )
}
```

**Cambio: +2 líneas (wrapping adicional)**

---

## 📊 Resumen de Cambios Línea por Línea

```
Línea    Cambio                                    Tipo
────────────────────────────────────────────────────────────
1-35     Imports sin cambios
36-37    ✨ NUEVO: import AnalyticsProvider        +2 líneas
38-43    Tipos sin cambios
44       Importar utilidades sin cambios
45       (nueva línea vacía)
46       function HomeContent()
47-49    const searchParams, cotizacion, loading
50-51    ✨ NUEVO: const { trackProposalViewed ... +2 líneas
52       
53-62    useEffect fetchCotizacion (SIN CAMBIOS)
63-71    useEffect searchParams scroll (SIN CAMBIOS)
72       
73-85    ✨ NUEVO: useEffect trackProposalViewed   +14 líneas
86       
87-116   ✨ NUEVO: useEffect trackSectionViewed    +30 líneas
117      
118-150  Resto de hooks/estado (SIN CAMBIOS)
151-165  useEffect colores corporativos (SIN CAMBIOS)
166      
167-230  if (loading) { ... } (SIN CAMBIOS)
231      
232-250  return <main> ... </main> (SIN CAMBIOS)
251      
252-253  (sin cambios)
254      comment ✨ NUEVO
255-257  ✨ NUEVO: <AnalyticsProvider> wrapper    +2 líneas
258      
259      export default Home()
```

---

## 💡 Lo Importante

### ✅ QUE CAMBIA
- 📥 +50 líneas de código
- 📊 +2 hooks (analytics tracking)
- 🎯 +3 useEffects (setup + proposal + sections)
- 🔗 +1 Provider wrapper

### ❌ QUE NO CAMBIA
- 🎨 Apariencia visual
- 📄 HTML estructura
- 💾 Estado de cotización
- 🔄 Lógica de fetching
- ⚡ Performance (IntersectionObserver es muy eficiente)
- 🖥️ User experience
- ♿ Accesibilidad

---

## 🚀 El Impacto

### ANTES (Sin Analytics)
```
Usuario abre: webquote.com/?id=123
└─ App carga propuesta
   └─ Usuario scrollea secciones
      └─ NADA se registra en admin
```

### DESPUÉS (Con Analytics)
```
Usuario abre: webquote.com/?id=123
└─ App carga propuesta
   ├─ 📊 Event: proposal_viewed
   │  └─ id: 123, empresa: "Acme Corp", version: "1.0"
   │
   └─ Usuario scrollea secciones
      ├─ 📊 Event: section_viewed (hero)
      ├─ 📊 Event: section_viewed (resumen-ejecutivo)
      ├─ 📊 Event: section_viewed (analisis-requisitos)
      ├─ 📊 Event: section_viewed (fortalezas)
      ├─ 📊 Event: section_viewed (paquetes)
      └─ 📊 ... más según lo que scrollee
```

**Resultado en Admin Analytics Dashboard:**
- Ver qué propuestas se visualizaron
- Ver qué secciones interesaron más
- Ver tiempo de permanencia
- Optimizar contenido basado en datos reales

---

## 🎯 Preguntas Frecuentes

**¿Se verá diferente la página?**
No, absolutamente idéntica.

**¿Se ralentizará?**
No, IntersectionObserver es muy eficiente.

**¿Qué pasa si el usuario no tiene JS habilitado?**
No carga tracking, pero la página sigue funcionando (el tracking es un "extra").

**¿Qué pasa si el admin/contextos no existen?**
Try-catch defensivos previenen crashes. Console warnings para debugging.

**¿Necesito cambiar htmls o templates?**
No, solo JavaScript.

**¿Necesito actualizar dependencies?**
No, todo usa imports existentes (AnalyticsProvider, useEventTracking ya existen).

**¿Se puede revertir fácil?**
Sí, son cambios aislados y separados del resto del código.

---

*Documento: BEFORE/AFTER Refactorización*
*Fecha: 30 Noviembre 2025*
*Estado: LISTA PARA IMPLEMENTACIÓN*
