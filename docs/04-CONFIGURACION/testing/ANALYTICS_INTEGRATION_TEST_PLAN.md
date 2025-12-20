# Plan de Pruebas de Integración - Sistema de Analytics

**Fecha:** 30 de Noviembre de 2025  
**Versión:** 1.0  
**Estado:** ✅ Lista para ejecución

---

## 📋 Objetivo

Validar que el sistema de analytics rastreia correctamente todos los eventos del usuario sin duplicaciones, con deduplicación TTL funcionando correctamente.

---

## 🔍 Casos de Prueba

### **GRUPO 1: Admin Tab View Tracking (60s TTL)**

#### Test 1.1 - Primer vistazo a TAB
**Pasos:**
1. Abre Admin Panel (`/administrador`)
2. Navega a TAB "Oferta" → verifica console que `trackAdminTabViewed('oferta')` se ejecuta
3. Revisa que evento llega a AnalyticsContext

**Resultado esperado:**
- ✅ Evento `admin_tab_viewed` registrado en `state.events`
- ✅ Metadata: `{ tab: 'oferta', timestamp: ISO, sessionId: ... }`

#### Test 1.2 - Switch rápido a otra TAB (dentro de 60s)
**Pasos:**
1. Estando en TAB "Oferta" (desde Test 1.1)
2. Cambia a TAB "Historial" inmediatamente
3. Revisa console

**Resultado esperado:**
- ✅ Evento `admin_tab_viewed` para "historial" registrado
- ✅ Evento es **DIFERENTE** (es otro tab) por lo que se registra SIN deduplicación

#### Test 1.3 - Volver al mismo TAB dentro de 60s (TTL activo)
**Pasos:**
1. Desde "Historial", vuelve a "Oferta" (misma sesión, <60s)
2. Revisa console y AnalyticsContext

**Resultado esperado:**
- ✅ **NO** se registra nuevo evento (throttle activo por TTL=60s)
- ✅ Última vista a "Oferta" sigue siendo la del Test 1.1

#### Test 1.4 - Esperar 60s y volver al mismo TAB
**Pasos:**
1. Tras Test 1.3, espera 61 segundos
2. Vuelve a "Oferta"
3. Revisa console

**Resultado esperado:**
- ✅ **SÍ** se registra nuevo evento (TTL expirado, se permite tracking)
- ✅ Metadata: timestamp más reciente

---

### **GRUPO 2: Oferta Section Viewed (2s TTL)**

#### Test 2.1 - Primera vista a sección
**Pasos:**
1. En TAB "Oferta", navega a subsección "Servicios Base"
2. Revisa console

**Resultado esperado:**
- ✅ Evento `oferta_section_viewed` registrado
- ✅ Metadata: `{ section: 'servicios_base', ... }`

#### Test 2.2 - Cambiar a otra sección (>2s después)
**Pasos:**
1. En "Servicios Base"
2. Cambia a "Servicios Opcionales"
3. Inmediatamente revisa console

**Resultado esperado:**
- ✅ Evento registrado (distinta sección)
- ✅ Sin deduplicación (es otra sección)

#### Test 2.3 - Volver a la misma sección en <2s (throttle)
**Pasos:**
1. Desde "Servicios Opcionales", vuelve a "Servicios Base" al instante
2. Revisa console

**Resultado esperado:**
- ✅ **NO** se registra evento (TTL=2s aún activo)
- ✅ Deduplicación funcionando correctamente

---

### **GRUPO 3: Descuentos Configurados (400ms Debounce)**

#### Test 3.1 - Primer cambio de descuento
**Pasos:**
1. En TAB "Financiero", configura un descuento (ej: 10%)
2. Revisa console y state.events

**Resultado esperado:**
- ✅ Tras 400ms: evento `descuento_configured` registrado
- ✅ Metadata: `{ tipo: 'descuentoPorcentaje', porcentaje: 10, ... }`

#### Test 3.2 - Cambios rápidos (dentro de 400ms)
**Pasos:**
1. Cambia descuento a 15%
2. 150ms después, cambia a 20%
3. 150ms después, cambia a 25%
4. Espera 500ms y revisa console

**Resultado esperado:**
- ✅ **UN SOLO** evento registrado (último valor: 25%)
- ✅ Debounce correcto: eventos intermedios ignorados
- ✅ Evento final refleja el estado más reciente

---

### **GRUPO 4: Historial Visto (60s TTL)**

#### Test 4.1 - Primera vista a Historial
**Pasos:**
1. Navega a TAB "Historial"
2. Revisa console

**Resultado esperado:**
- ✅ Evento `historial_viewed` registrado
- ✅ Metadata incluye total de cotizaciones vistas

#### Test 4.2 - Revisita dentro de 60s (throttle)
**Pasos:**
1. Desde Historial, cambia a otra TAB
2. Vuelve a "Historial" en <60s

**Resultado esperado:**
- ✅ **NO** se registra nuevo evento
- ✅ Deduplicación TTL funcionando

---

### **GRUPO 5: CRUD de Cotizaciones (2s TTL)**

#### Test 5.1 - Crear nueva cotización
**Pasos:**
1. En TAB "Historial", click en "Nueva Cotización"
2. Revisa console

**Resultado esperado:**
- ✅ Evento `cotizacion_created` registrado
- ✅ Metadata: `{ numero: 'ID', ...}`

#### Test 5.2 - Editar cotización
**Pasos:**
1. Click en cotización existente, modifica campos
2. Revisa console

**Resultado esperado:**
- ✅ Evento `cotizacion_edited` registrado (después de 2s sin cambios)
- ✅ Throttle de 2s preventivo

#### Test 5.3 - Eliminar cotización
**Pasos:**
1. Click derecho en cotización, "Eliminar"
2. Confirma dialog
3. Revisa console

**Resultado esperado:**
- ✅ Evento `cotizacion_deleted` registrado
- ✅ Metadata con ID de cotización

---

### **GRUPO 6: Validación General**

#### Test 6.1 - Ningún evento es undefined
**Pasos:**
1. Ejecuta en console:
   ```typescript
   const { state } = useAnalytics()
   console.table(state.events.map(e => ({ 
     type: e.eventType, 
     timestamp: e.timestamp,
     hasMetadata: !!e.metadata 
   })))
   ```
2. Valida que todos tengan type y timestamp

**Resultado esperado:**
- ✅ Todos los eventos completos (sin undefined)
- ✅ Timestamps válidos (ISO format)

#### Test 6.2 - No hay eventos duplicados por TTL
**Pasos:**
1. Ejecuta en console:
   ```typescript
   const grouped = state.events.reduce((acc, e) => {
     const key = `${e.eventType}-${e.metadata?.tab || e.metadata?.section || ''}`
     acc[key] = (acc[key] || 0) + 1
     return acc
   }, {})
   Object.entries(grouped).filter(([_, count]) => count > 1)
   ```
2. Debería retornar vacío o solo duplicados esperados (diferentes timestamps)

**Resultado esperado:**
- ✅ Sin duplicados dentro de ventana TTL
- ✅ Deduplicación correcta

---

## 🛠️ Herramientas

### Console Tools
```typescript
// Ver todos los eventos
useAnalytics().state.events

// Ver eventos últimos 5 minutos
const now = Date.now()
useAnalytics().state.events.filter(e => 
  now - new Date(e.timestamp).getTime() < 5 * 60 * 1000
)

// Contar por tipo
const count = useAnalytics().state.events.reduce((acc, e) => {
  acc[e.eventType] = (acc[e.eventType] || 0) + 1
  return acc
}, {})
```

### DevTools
- F12 → Console (ver logs de `[DEBUG]` y `[TRACKING]`)
- F12 → Application → Local Storage → `analytics_*` keys
- Network tab → buscar `POST /api/analytics` (si hay endpoint)

---

## ✅ Criterios de Aceptación

✅ **TODOS los tests deben pasar:**
1. TTL de 60s respetado en admin tabs
2. TTL de 2s respetado en secciones
3. Debounce de 400ms respetado en descuentos
4. Ningún evento duplicado dentro de TTL
5. Todos los eventos completos (type, timestamp, metadata)
6. No hay crasheos al switchear tabs/secciones rápidamente
7. Hook resiliente (no crashea si falta AnalyticsProvider)

---

## 📊 Métricas a Validar

| Métrica | Esperado | Actual |
|---------|----------|--------|
| Total eventos (sesión 10min) | 15-40 | ___ |
| Eventos duplicados por TTL | 0 | ___ |
| Eventos sin metadata | 0 | ___ |
| Tiempo prom/evento (ms) | <10ms | ___ |
| Errores de tracking | 0 | ___ |

---

## 🚀 Ejecución

1. **Pre-requisitos:**
   - ✅ Servidor corriendo (`npm run dev`)
   - ✅ Admin panel accesible
   - ✅ DevTools abierto

2. **Ejecución:**
   - Ejecutar GRUPO 1 primero (validar base)
   - Luego GRUPO 2, 3, 4 (comportamientos específicos)
   - Luego GRUPO 5 (CRUD)
   - Finalizar con GRUPO 6 (validación general)

3. **Reporteo:**
   - Marcar ✅ o ❌ en cada test
   - Si ❌: captura console y describe el issue
   - Crear ticket/issue si hay anomalía

---

**Status:** ⏳ Pendiente ejecución manual  
**Responsable:** Usuario / QA  
**Fecha planeada:** 30 Nov - 1 Dic 2025

