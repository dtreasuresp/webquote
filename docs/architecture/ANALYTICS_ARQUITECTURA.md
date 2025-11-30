# 📐 Arquitectura - Sistema de Analytics + Contenido

**Versión:** 1.0  
**Fecha:** 30 Nov 2025  
**Estado:** ✅ Implementado y Operativo

---

## 🏗️ Estructura General

```
webquote/
├── src/
│   ├── app/
│   │   └── administrador/
│   │       └── page.tsx                    ← Orquestador de tabs
│   │
│   ├── features/
│   │   └── admin/
│   │       ├── contexts/
│   │       │   └── AnalyticsContext.tsx    ← Contexto global de analytics
│   │       ├── hooks/
│   │       │   └── useEventTracking.ts     ← 50+ métodos de tracking (TTL/Debounce)
│   │       └── components/
│   │           ├── OfertaAnalyticsSection.tsx    ← Métricas de Oferta
│   │           ├── HistorialAnalyticsSection.tsx ← Métricas de Historial
│   │           └── SyncStatusIndicator.tsx       ← Indicador de estado (Hydration fix)
│   │
│   └── components/
│       ├── admin/
│       │   ├── tabs/
│       │   │   └── ContenidoTab.tsx              ← Tab central de contenido
│       │   └── content/
│       │       └── contenido/
│       │           ├── ResumenContent.tsx         ← Resumen Ejecutivo
│       │           ├── TablaComparativaContent.tsx ← Paquetes
│       │           ├── TerminosContent.tsx        ← Términos
│       │           ├── AnalisisRequisitosContent.tsx
│       │           ├── FortalezasContent.tsx
│       │           ├── DinamicoVsEstaticoContent.tsx
│       │           ├── PresupuestoCronogramaContent.tsx
│       │           ├── ObservacionesContent.tsx
│       │           └── ConclusionContent.tsx
│       └── icons/
│           └── TestLucide.tsx               ← Verificación lucide-react
```

---

## 🔄 Flujo de Analytics

### **1. TRIGGERING (Dónde se disparan eventos)**

```
Usuario interactúa en UI
    ↓
useEventTracking hook (client-side)
    ↓
Valida tipo de evento + TTL/Debounce
    ↓
Si pasa deduplicación: trackEvent() del AnalyticsContext
    ↓
Evento se agrega a state.events[]
```

### **2. DEDUPLICATION (Cómo evita duplicados)**

#### **Estrategia TTL Throttling** (Admin tabs, Historial)
```typescript
// Tracker: Map<string, number> de timestamps
lastViewTsRef.current = new Map()

shouldThrottle = (key: string, ttlMs: number) => {
  const now = Date.now()
  const last = lastViewTsRef.current.get(key) || 0
  
  if (now - last < ttlMs) return true  // Throttle activo
  
  lastViewTsRef.current.set(key, now)  // Actualiza timestamp
  return false  // Permite evento
}
```

**Ventanas de tiempo:**
- Admin tabs (trackAdminTabViewed): **60 segundos**
- Historial visto (trackHistorialViewed): **60 segundos**
- Secciones (trackOfertaSectionViewed): **2 segundos**
- Opciones pago (trackOpcionPagoAdded/Removed): **2 segundos**

#### **Estrategia Debouncing** (Cambios rápidos)
```typescript
// Tracker: Map<string, NodeJS.Timeout> de timers
debounceTimersRef.current = new Map()

debounce = (key: string, fn: () => void, delayMs: number) => {
  // Cancela timer anterior si existe
  clearTimeout(debounceTimersRef.current.get(key))
  
  // Establece nuevo timer
  const timer = setTimeout(() => {
    fn()
    debounceTimersRef.current.delete(key)
  }, delayMs)
  
  debounceTimersRef.current.set(key, timer)
}
```

**Ventanas de tiempo:**
- Descuentos (trackDescuentoConfigured): **400ms**

---

## 📊 Estructura de Eventos

### **Formato estándar**
```typescript
interface AnalyticsEvent {
  eventType: 'admin_tab_viewed' | 'oferta_section_viewed' | 'cotizacion_created' | ...
  timestamp: string  // ISO format
  sessionId: string
  metadata: {
    tab?: string
    section?: string
    cotizacionId?: string
    numero?: string
    // ... según eventType
  }
}
```

### **Ejemplos reales**

**Admin Tab View:**
```json
{
  "eventType": "admin_tab_viewed",
  "timestamp": "2025-11-30T15:30:45.123Z",
  "sessionId": "sess_abc123",
  "metadata": {
    "tab": "oferta",
    "source": "direct_click"
  }
}
```

**Descuentos:**
```json
{
  "eventType": "descuento_configured",
  "timestamp": "2025-11-30T15:30:50.456Z",
  "sessionId": "sess_abc123",
  "metadata": {
    "tipo": "descuentoPorcentaje",
    "porcentaje": 25,
    "cotizacionId": "cot_123"
  }
}
```

---

## 🎛️ Contenido Tab - Estructura Jerárquica

### **ContenidoTab** (Orquestador central)
```
ContenidoTab (Tab selector)
├── Sidebar (AdminSidebar)
│   ├── Resumen
│   ├── Análisis
│   ├── Fortalezas
│   ├── Comparativa
│   ├── Presupuesto
│   ├── Paquetes
│   ├── Observaciones
│   ├── Conclusión
│   ├── FAQ
│   ├── Garantías
│   ├── Contacto
│   └── Términos
│
└── Content Area (dinámico según activeItem)
    ├── ResumenContent
    │   ├── Título/Subtítulo
    │   ├── Párrafo introducción
    │   ├── Beneficios principales
    │   ├── Diferencias clave (colapsable)
    │   ├── Responsabilidades proveedor (colapsable)
    │   ├── Lo que cliente NO hace (colapsable)
    │   └── Flujo comunicación (colapsable)
    │
    ├── TablaComparativaContent
    │   ├── Título/Subtítulo
    │   ├── Paquetes (3x: Basic, Pro, Enterprise)
    │   ├── Categorías con features
    │   └── Nota al pie
    │
    ├── TerminosContent
    │   ├── Título/Subtítulo
    │   └── Párrafos de términos
    │
    └── ... (resto de secciones)
```

### **State Management por Sección**

```typescript
interface ContenidoGeneral {
  textos?: {
    resumenEjecutivo?: ResumenEjecutivoTextos
  }
  faq?: FAQItem[]
  garantias?: GarantiasData
  contacto?: ContactoInfo
  terminos?: TerminosCondiciones
  
  // Nuevas secciones
  analisisRequisitos?: AnalisisRequisitosData
  fortalezas?: FortalezasData
  dinamicoVsEstatico?: DinamicoVsEstaticoData
  presupuestoCronograma?: PresupuestoCronogramaData
  tablaComparativa?: TablaComparativaData
  observaciones?: ObservacionesData
  conclusion?: ConclusionData
  
  // Visibilidad global
  visibilidad?: VisibilidadConfig
  visibilidadAnalisis?: boolean
  visibilidadFortalezas?: boolean
  // ... etc
  
  // Estado de secciones colapsables
  seccionesColapsadas?: SeccionesColapsadasConfig
  
  // Timestamps de guardado
  updatedTimestamps?: Record<string, string>
}
```

### **Guardado Optimizado por Sección**

```typescript
// En lugar de guardar todo el config (pesado)
// Guardamos SOLO la sección modificada

const handleGuardarSeccion = async (seccion: 'resumen' | 'faq' | ...) => {
  const datosActuales = getDatosSeccion(seccion)  // Payload ~5KB
  const datosOriginales = getDatosOriginales(seccion)
  
  if (deepEqual(datosActuales, datosOriginales)) {
    toast.info('Sin cambios')
    return
  }
  
  // Enviar SOLO 5KB en lugar de 100KB
  await onSaveSeccion(cotizacionId, seccion, datosActuales, timestamp)
}
```

---

## 🛡️ Resilience & Error Handling

### **Hook Resiliente**
```typescript
// useEventTracking siempre retorna un objeto válido
// Incluso si AnalyticsProvider falta

export const useEventTracking = () => {
  let trackEvent = () => {}
  let trackAction = () => {}
  
  try {
    const analytics = useAnalytics()  // Puede fallar
    trackEvent = analytics.trackEvent
    trackAction = analytics.trackAction
  } catch {
    // No-op fallback: funciones vacías
  }
  
  return {
    trackAdminTabViewed: (tab) => trackEvent('admin_tab_viewed', { tab }),
    trackHistorialViewed: (...) => {...},
    // ... 40+ métodos
  }
}
```

### **Defensive Checks en Componentes**
```typescript
useEffect(() => {
  if (typeof trackAdminTabViewed === 'function') {
    trackAdminTabViewed(activePageTab)
  }
}, [activePageTab, trackAdminTabViewed])
```

### **Hydration Fixes**
```typescript
// SyncStatusIndicator: Unified SSR/CSR rendering
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

const config = mounted
  ? getStatusConfig()              // Real state post-mount
  : { icon: FaCloud, ... }        // Stable SSR config
```

---

## 📈 Métricas Analytics

### **Oferta Analytics Section**
```
┌─ Servicios Base
│  ├─ Creados
│  ├─ Editados
│  └─ Eliminados
│
├─ Servicios Opcionales
│  ├─ Creados
│  ├─ Editados
│  └─ Eliminados
│
├─ Paquetes
│  ├─ Creados
│  ├─ Activados
│  ├─ Desactivados
│  └─ Eliminados
│
├─ Financiero
│  ├─ Descuentos configurados
│  └─ Opciones pago modificadas
│
├─ Secciones más visitadas (top 5)
│
└─ Templates utilizados
```

### **Historial Analytics Section**
```
┌─ Cotizaciones
│  ├─ Creadas
│  ├─ Editadas
│  └─ Eliminadas
│
├─ Versiones
│  ├─ Ediciones totales
│  └─ Más editada
│
├─ Activaciones
│  ├─ Activadas
│  └─ Desactivadas
│
├─ Interacciones
│  ├─ Expandidas
│  ├─ Colapsadas
│  └─ Propuestas vistas
│
├─ Vistas del Historial (total)
│
└─ Cotización más activa (interacciones)
```

---

## 🔌 API Endpoints (Diseño futuro)

```
POST /api/cotizaciones/:id/contenido/:seccion
  Body: { datos, timestamp }
  Response: { success, message, updatedAt }

POST /api/analytics/events
  Body: { events: AnalyticsEvent[] }
  Response: { saved, count }

POST /api/analytics/archive
  Body: { archiveId, retention_days }
  Response: { archived_count }

DELETE /api/analytics/clean
  Query: { keep_days: 30 }
  Response: { deleted_count }
```

---

## 📦 Dependencies

| Librería | Versión | Uso |
|----------|---------|-----|
| react | 18.3.1 | UI |
| framer-motion | 12.23.24 | Animaciones |
| react-icons | 5.5.0 | Iconos (principal) |
| lucide-react | 0.555.0 | Iconos (alternativa) |
| next | 14.2.33 | Framework |
| prisma | 6.19.0 | ORM |

---

## 🧪 Testing Strategy

### **Unit Tests** (Futuro)
- `useEventTracking.test.ts`
- `AnalyticsContext.test.ts`

### **Integration Tests** (Plan creado)
- `docs/testing/ANALYTICS_INTEGRATION_TEST_PLAN.md` (16 tests)
- `docs/testing/QUICK_START_TESTING.md` (9 tests rápidos)

### **E2E Tests** (Futuro)
- Cypress/Playwright tests para flujos completos

---

## 🚀 Deployment Checklist

- [ ] Todos los tests pasan ✅
- [ ] Code review completado
- [ ] Documentación actualizada
- [ ] No hay console.log de debug
- [ ] Performance: <10ms por evento
- [ ] No hay memory leaks
- [ ] Funciona en producción (Vercel)
- [ ] Analytics persisten en BD

---

**Arquitectura completada y validada ✨**

