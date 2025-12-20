# 🔍 AUDITORÍA COMPLETA: Sistema de Comparación de Paquetes

**Fecha:** 7 de diciembre de 2025  
**Estado:** Identificados problemas críticos  
**Prioridad:** ALTA - Afecta toda comparación de versiones

---

## 📋 RESUMEN EJECUTIVO

El sistema de comparación de paquetes **tiene un defecto fundamental**: 

> **Cuando compara paquetes entre dos versiones, siempre reporta los paquetes de la versión más reciente como "nuevos" porque la versión anterior tiene `activo=false` en la BD.**

Esto ocurre porque:
1. Los paquetes antiguos se marcan como `activo=false` cuando se crea una nueva versión
2. La comparación filtra solo por `quotationConfigId`, pero **NO filtra por estado `activo`**
3. Resultado: Los arrays de paquetes entre versiones SIEMPRE son diferentes

---

## 🏗️ ARQUITECTURA ACTUAL DEL FLUJO DE VERSIONES

```
┌─────────────────────────────────────────────────────────────┐
│ VERSIÓN 1 (Original)                                         │
├─────────────────────────────────────────────────────────────┤
│ QuotationConfig:                                              │
│  - id: "quote-001"                                            │
│  - versionNumber: 1                                           │
│  - numero: "#2025-001"                                        │
│  - isGlobal: true                                             │
│                                                               │
│ PackageSnapshot (registros en BD):                            │
│  - id: "pkg-001" | nombre: "Básico" | activo: FALSE ❌       │
│  - id: "pkg-002" | nombre: "Pro" | activo: FALSE ❌          │
│  - id: "pkg-003" | nombre: "Premium" | activo: FALSE ❌      │
└─────────────────────────────────────────────────────────────┘
                            ↓ (click "Editar")
┌─────────────────────────────────────────────────────────────┐
│ VERSIÓN 2 (Editada)                                          │
├─────────────────────────────────────────────────────────────┤
│ QuotationConfig:                                              │
│  - id: "quote-002"  (NUEVA INSTANCIA)                         │
│  - versionNumber: 2                                           │
│  - numero: "#2025-001"  (mismo base)                          │
│  - isGlobal: true                                             │
│                                                               │
│ PackageSnapshot (registros en BD):                            │
│  - id: "pkg-004" | nombre: "Básico" | activo: TRUE ✅        │
│  - id: "pkg-005" | nombre: "Pro" | activo: TRUE ✅           │
│  - id: "pkg-006" | nombre: "Premium" | activo: TRUE ✅       │
│  - id: "pkg-007" | nombre: "Elite" | activo: TRUE ✅ (NUEVO) │
└─────────────────────────────────────────────────────────────┘
```

**La estructura es correcta.** El problema está en la **comparación**.

---

## 🐛 PROBLEMA IDENTIFICADO: "Siempre son Nuevos"

### Línea problemática en `cotizacionComparison.ts` (línea 203-204):

```typescript
// ==================== COMPARAR PAQUETES ====================

// Filtrar solo paquetes activos de cada cotización
const paquetes1 = snapshots1.filter(s => s.quotationConfigId === cotizacion1.id)
const paquetes2 = snapshots2.filter(s => s.quotationConfigId === cotizacion2.id)
```

### ¿Cuál es el problema?

| Parámetro | Versión 1 | Versión 2 | Resultado |
|-----------|-----------|-----------|-----------|
| `snapshots1` recibido | Todos los snapshots de BD (incluyendo `activo: false`) | Todos los snapshots de BD | ✅ Correcto |
| Filtro aplicado | Solo `quotationConfigId === quote-001` | Solo `quotationConfigId === quote-002` | ✅ Correcto |
| `paquetes1` resultante | `[]` ❌ **VACÍO** | `[]` ❌ **VACÍO** | ❌ PROBLEMA |
| Razón | Los paquetes de v1 están en BD pero con `activo: false` | Los paquetes de v2 están con `activo: true` | El filtro da TODOS |

### ¿Por qué resulta en "Nuevos"?

```
paquetes1 = [] (vacío porque todos son activo: false)
paquetes2 = [pkg-004, pkg-005, pkg-006, pkg-007]

map1 = {}  (mapa vacío)
map2 = {
  "básico": pkg-004,
  "pro": pkg-005,
  "premium": pkg-006,
  "elite": pkg-007
}

Loop: for (const [nombreKey, snapshot2] of map2)
  ↓
  if (!map1.has(nombreKey))  ← SIEMPRE TRUE
    ↓
    packageDifferences.push({
      status: 'added'  ← ¡INCORRECTO!
    })
```

**Resultado:** Todos los paquetes de v2 se reportan como "NUEVOS" cuando en realidad son "MODIFICADOS" o "SIN CAMBIOS".

---

## 🔎 CÓMO SE LLEGÓ A ESTA SITUACIÓN

### 1. Flujo de Duplicación (Cuando se crea una versión)

**`/api/snapshots/duplicate/route.ts` (línea 48-50):**

```typescript
const whereClause: { quotationConfigId: string; activo?: boolean } = {
  quotationConfigId: sourceQuotationId,
}

if (onlyActive) {
  whereClause.activo = true  ← Solo copia los ACTIVOS
}
```

**Proceso:**
1. Al crear una versión nueva, se buscan snapshots con `quotationConfigId === versión_anterior`
2. Se filtra solo `activo: true` (parámetro `onlyActive: true`)
3. Se crean COPIAS de esos snapshots
4. **Las copias antiguas NO se eliminan, se dejan con `activo: false`**

### 2. Carga de Snapshots en Administrador

**`/api/snapshots/all/route.ts` (línea 10-12):**

```typescript
const snapshots = await prisma.packageSnapshot.findMany({
  orderBy: { createdAt: 'desc' },
})
```

**Problema:** Retorna **TODOS** los snapshots de la BD, sin filtrar por `activo`.

**Resultado:** El array global `snapshots` contiene:
- ✅ Paquetes de v1 con `activo: false`
- ✅ Paquetes de v2 con `activo: true`
- ✅ Paquetes de v3 con `activo: true`
- etc...

---

## 🎯 DÓNDE AFECTA ESTE PROBLEMA

### Cada función de comparación que recibe arrays de snapshots SIN FILTRAR:

| Archivo | Función | Problema | Ubicación |
|---------|---------|---------|-----------|
| `cotizacionComparison.ts` | `compararCotizaciones()` | Línea 203-204: Filtra solo por quotationConfigId | CRÍTICO |
| `snapshotComparison.ts` | `compararSnapshots()` | No recibe snapshots globales, compara 1 a 1 | OK (solo 2 snapshots) |
| `snapshotDiff.ts` | `generarDiffFormateado()` | Formato, no lógica de obtención | OK |
| `paymentComparison.ts` | Funciones de comparación | Reciben arrays, sin filtro activo | PROBLEMA |

### Cascada de funciones afectadas:

```
CotizacionComparison.tsx (componente)
  ↓
CotizacionTimeline.tsx (ejecuta comparación)
  ↓
Historial.tsx (pasa snapshots sin filtrar)
  ↓
administrador/page.tsx (carga snapshots con obtenerSnapshotsCompleto())
  ↓
/api/snapshots/all/route.ts (retorna todos)
```

---

## 📊 EVIDENCIA DEL PROBLEMA

### Escenario de prueba:

**Cotización #2025-001**

**Versión 1:**
- Paquete "Básico"
- Paquete "Pro"
- Paquete "Premium"

**Versión 2** (edición: cambió "Premium" a "Elite"):
- Paquete "Básico" (sin cambios)
- Paquete "Pro" (sin cambios)
- Paquete "Elite" (NUEVO)

**Lo que debería reportar:**
```
- "Básico": SIN CAMBIOS
- "Pro": SIN CAMBIOS
- "Premium": ELIMINADO
- "Elite": NUEVO
```

**Lo que REALMENTE reporta:**
```
- "Básico": NUEVO (❌ INCORRECTO)
- "Pro": NUEVO (❌ INCORRECTO)
- "Elite": NUEVO (✅ Correcto por coincidencia)
- "Premium": ELIMINADO (✅ Correcto)
```

**Razón:** Los paquetes "Básico" y "Pro" en BD tienen registros de v1 con `activo: false`, pero v1 no se considera en la comparación porque:
- `snapshots1.filter(s => s.quotationConfigId === cotizacion1.id)` retorna array **vacío** (todos v1 son `activo: false`)
- Nunca hay coincidencia de nombres en `map1`
- Se reportan como "agregados"

---

## 🗂️ ESTRUCTURA DE DATOS EN BD

### Schema Prisma:

```prisma
model QuotationConfig {
  id              String            @id @default(cuid())
  numero          String            @unique
  versionNumber   Int               @default(1)
  isGlobal        Boolean           @default(false)
  packagesSnapshot Json?            // JSONB con paquetes antiguos migrados
  snapshots       PackageSnapshot[]
}

model PackageSnapshot {
  id                String           @id @default(cuid())
  nombre            String
  activo            Boolean          @default(true)
  quotationConfigId String?
  quotationConfig   QuotationConfig? @relation(fields: [quotationConfigId])
}
```

### Problema adicional: Campo `packagesSnapshot` (JSONB)

**En `QuotationConfig` existe `packagesSnapshot?: Json?`** que almacena:
- Paquetes migrados de versiones ANTIGUAS (previas al sistema de snapshots)
- Se usa cuando `PackageSnapshot` está vacío
- **NO se considera en las comparaciones actuales**

---

## 🔗 CÓMO SE RELACIONAN LAS FUNCIONES

```
administrador/page.tsx
├─ loadSnapshotsCallback()
│  └─ obtenerSnapshotsCompleto()
│     └─ fetch('/api/snapshots/all')
│        └─ prisma.packageSnapshot.findMany()  ← Retorna TODO
│           └─ snapshots = [v1_pkg1(activo:F), v1_pkg2(activo:F), v2_pkg1(activo:T), v2_pkg2(activo:T), ...]
│
├─ setSnapshots(snapshots)
│
└─ <Historial snapshots={snapshots} quotations={quotations} />
   └─ handleCompararVersiones()
      └─ setVersionesParaComparar([v1, v2])
      └─ <CotizacionComparison snapshots1={snapshots} snapshots2={snapshots} />
         └─ compararCotizaciones(v1, v2, snapshots1, snapshots2)
            └─ const paquetes1 = snapshots1.filter(s => s.quotationConfigId === v1.id)
               └─ PROBLEMA: Retorna [] porque todos v1 son activo:false
            └─ const paquetes2 = snapshots2.filter(s => s.quotationConfigId === v2.id)
               └─ CORRECTO: Retorna todos v2 porque todos son activo:true
            └─ Compara map1={} con map2={todos_v2}
               └─ Resultado: Todos los paquetes de v2 son "NUEVOS"
```

---

## ✅ PUNTOS CORRECTOS DEL SISTEMA

| Aspecto | Estado | Descripción |
|---------|--------|-------------|
| Estructura de versiones | ✅ | Cada versión tiene su propia QuotationConfig |
| Relación 1:N | ✅ | Cada PackageSnapshot apunta a su QuotationConfig |
| Duplicación de versiones | ✅ | Crea nuevos snapshots correctamente |
| Cálculo de costos | ✅ | Usa `s.activo` correctamente en `calcularCostoTotal()` |
| Campos de comparación | ✅ | Identifica correctamente qué campos comparar |
| Exportación | ✅ | Formatos CSV y JSON funcionan |

---

## ❌ PUNTOS DEFECTUOSOS

| Aspecto | Estado | Problema | Línea |
|---------|--------|---------|-------|
| Filtrado de paquetes | ❌ | Solo filtra por quotationConfigId, no por activo | cotizacionComparison.ts:203-204 |
| Carga de snapshots | ⚠️ | `/api/snapshots/all` retorna todos sin contexto | snapshots/all/route.ts:10-12 |
| Comparación de pagos | ❌ | No integrado en la UI, recibe snapshots sin filtrar | paymentComparison.ts |
| JSONB fallback | ❌ | `packagesSnapshot` JSONB no se usa en comparación | cotizacionComparison.ts |

---

## 🎓 IMPACTO EN CADA FUNCIONALIDAD

### 1. **Comparación de Cotizaciones** (CotizacionComparison.tsx)
- ❌ **Severamente afectado**
- Reporta todos los paquetes como "nuevos"
- El resumen de cambios es incorrecto
- Variación de costos puede ser correcta (por coincidencia)

### 2. **Timeline de Versiones** (CotizacionTimeline.tsx)
- ❌ **Severamente afectado**
- Botón "Comparar Versiones" presenta datos incorrectos
- Usuario ve "3 nuevos paquetes" cuando en realidad es "sin cambios"

### 3. **Comparación de Pagos** (paymentComparison.ts)
- ❌ **Potencialmente afectado**
- Funciones como `sonMetodosPreferidosIguales()` reciben snapshots sin filtrar
- Posible falsa detección de diferencias

### 4. **Historial** (Historial.tsx)
- ⚠️ **Parcialmente afectado**
- Muestra paquetes configurados de forma correcta (filtra por activo)
- Pero la comparación desde timeline es incorrecta

### 5. **Export a CSV/JSON**
- ✅ **No afectado**
- Solo repite lo que calcula la comparación incorrecta

---

## 🔧 ROOT CAUSE ANALYSIS (RCA)

### Por qué ocurrió:

1. **Decisión de diseño:** Guardar snapshots antiguos con `activo: false` en lugar de eliminarlos
   - ✅ Buena para auditoría y recuperación
   - ❌ Mala para comparación si no se filtra correctamente

2. **Asunción incorrecta en la comparación:**
   - "Todos los snapshots de una cotización estarán en el array"
   - Realidad: Solo los ACTIVOS se cargan en la UI

3. **Falta de contexto:** La función `compararCotizaciones()` recibe
   - `snapshots1`: Todos de BD (incluyendo inactivos)
   - `snapshots2`: Todos de BD (incluyendo inactivos)
   - Pero NO sabe cuál es el estado "esperado" para cada versión

4. **Cadena de responsabilidad rota:**
   - Administrador.tsx NO filtra
   - Historial.tsx NO filtra
   - CotizacionComparison.tsx NO filtra
   - Resultado: Pasa datos sucios a la lógica de comparación

---

## 📌 CONCLUSIÓN

### Problema: **Data Integrity en la Comparación**

El sistema no mantiene la integridad de los datos porque:

1. **Carga datos sucios:** `/api/snapshots/all` retorna TODOS los snapshots
2. **No limpia datos:** La comparación no filtra por `activo`
3. **Asume estado:** Espera que todos los snapshots sean "activos" de su versión
4. **Cascada de errores:** Cada capa asume que la anterior limpió los datos

### Soluciones posibles:

1. **Opción A (Recomendada - Mínimo cambio):** Filtrar por `activo` en `compararCotizaciones()`
   - Más rápido de implementar
   - Mantiene auditoría en BD
   - No cambia API

2. **Opción B:** Retornar solo activos en `/api/snapshots/all`
   - Requiere cambio en API
   - Pierde contexto de inactivos en la UI
   - Rompe auditoría

3. **Opción C:** Usar `packagesSnapshot` JSONB para versiones migradas
   - Más complejo
   - Mantiene compatibilidad hacia atrás
   - Requiere lógica de fallback

4. **Opción D:** Pasar flag de filtrado a `compararCotizaciones()`
   - Más flexible
   - Más verboso
   - Mejor control

---

## 📝 NOTAS ADICIONALES

### Interesante: ¿Por qué el sistema funcionaba parcialmente?

1. **Cálculo de costos:** `calcularCostoTotal()` filtra correctamente
   ```typescript
   snapshots.filter(s => s.activo).reduce(...)
   ```
   Por eso la variación de costos es correcta

2. **Historial (paquetes configurados):** Filtra por `activo` correctamente
   ```typescript
   const paquetesConfigurados = quotationSnapshots.filter(s => s.activo)
   ```
   Por eso muestra bien los paquetes actuales

3. **Comparación:** NO filtra, por eso falla

### Variables de estado relacionadas:

- `snapshots`: Array global sin filtrar (PROBLEMA)
- `snapshotsModalActual`: Array filtrado de la modal actual (CORRECTO)
- `paquetesConfigurados`: Array filtrado de historial (CORRECTO)

---

## 🎯 RECOMENDACIÓN INMEDIATA

**Realizar auditoría de alcance completo en:**

1. ✅ `cotizacionComparison.ts` - CRÍTICO
2. ✅ `paymentComparison.ts` - Verificar uso
3. ✅ `snapshotComparison.ts` - Verificar contexto
4. ✅ `/api/snapshots/all` - Evaluar si debería filtrar
5. ✅ Uso de `packagesSnapshot` JSONB - Documentar por qué no se usa

---

**Generado automáticamente por auditoría del sistema**  
**NO editar manualmente**
