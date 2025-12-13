# REFACTORIZACIÓN DETALLADA: De `descuento` a `configDescuentos`

## Patron

 1: INPUT DE DESCUENTO SIMPLE (PaqueteSection.tsx)

### ANTES:
```typescript
value={paqueteActual.descuento}
onChange={(e) =>
  setPaqueteActual({
    ...paqueteActual,
    descuento: Number.parseFloat(e.target.value) || 0,
  })
}
```

### DESPUÉS:
```typescript
value={paqueteActual.configDescuentos?.descuentoGeneral?.porcentaje || 0}
onChange={(e) => {
  const nuevoDescuento = Number.parseFloat(e.target.value) || 0
  setPaqueteActual({
    ...paqueteActual,
    configDescuentos: {
      ...paqueteActual.configDescuentos,
      tipoDescuento: 'general',
      descuentoGeneral: {
        ...paqueteActual.configDescuentos?.descuentoGeneral,
        porcentaje: nuevoDescuento,
        aplicarA: {
          desarrollo: true,
          serviciosBase: false,
          otrosServicios: false
        }
      }
    }
  })
}}
```

**CAMBIOS**: 3 líneas → 17 líneas (mucho más código)

---

## Patrón 2: DISPLAY DE DESCUENTO (PaqueteSection.tsx:132)

### ANTES:
```typescript
<p className="text-2xl font-semibold text-gh-warning">{paqueteActual.descuento.toFixed(1)}%</p>
```

### DESPUÉS:
```typescript
<p className="text-2xl font-semibold text-gh-warning">
  {(paqueteActual.configDescuentos?.descuentoGeneral?.porcentaje || 0).toFixed(1)}%
</p>
```

**CAMBIOS**: 1 línea → 3 líneas, pero FRÁGIL (qué si es granular?)

---

## Patrón 3: CÁLCULO CON DESCUENTO (performanceOptimizations.ts)

### ANTES:
```typescript
const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
```

### DESPUÉS:
```typescript
// Necesitas función helper que calcule el descuento efectivo
function getDesarrolloConDescuento(snapshot: PackageSnapshot): number {
  const config = snapshot.paquete.configDescuentos
  if (!config || config.tipoDescuento === 'ninguno') {
    return snapshot.paquete.desarrollo
  }
  
  let descuentoAplicado = 0
  if (config.tipoDescuento === 'general' && config.descuentoGeneral.aplicarA.desarrollo) {
    descuentoAplicado = config.descuentoGeneral.porcentaje
  } else if (config.tipoDescuento === 'granular') {
    descuentoAplicado = config.descuentosGranulares.desarrollo || 0
  }
  
  return snapshot.paquete.desarrollo * (1 - descuentoAplicado / 100)
}

// Luego uso:
const desarrolloConDescuento = getDesarrolloConDescuento(snapshot)
```

**CAMBIOS**: 1 línea → 16 líneas de función helper

---

## Patrón 4: CÁLCULO EN PDF (pdf-export/generator.ts:68)

### ANTES:
```typescript
if (snapshot.paquete.descuento > 0) {
    doc.text(`Descuento: ${snapshot.paquete.descuento}%`, 20, yPosition)
}
```

### DESPUÉS:
```typescript
// Necesitas calcular descuento efectivo de configDescuentos
function getDescuentoEffectivo(config: ConfigDescuentos): number {
  if (!config || config.tipoDescuento === 'ninguno') return 0
  if (config.tipoDescuento === 'general') return config.descuentoGeneral.porcentaje
  if (config.tipoDescuento === 'granular') {
    // ¿Qué muestras? ¿El de desarrollo? ¿El promedio de todos?
    return config.descuentosGranulares.desarrollo || 0
  }
  return 0
}

const descuentoEfectivo = getDescuentoEffectivo(snapshot.paquete.configDescuentos)
if (descuentoEfectivo > 0) {
    doc.text(`Descuento: ${descuentoEfectivo}%`, 20, yPosition)
}
```

**CAMBIOS**: 3 líneas → 15 líneas

**PROBLEMA**: ¿Qué descuento muestras si hay granular? ¿Qué valor es "el descuento"?

---

## Patrón 5: COMPARACIÓN DE CAMBIOS (useSnapshotCRUD.ts:125)

### ANTES:
```typescript
datosActuales.descuento === datosSnapshot.descuento &&
```

### DESPUÉS:
```typescript
JSON.stringify(datosActuales.configDescuentos) === JSON.stringify(datosSnapshot.configDescuentos) &&
```

**CAMBIOS**: 1 línea → 1 línea (fácil)

---

## Patrón 6: MAPEO DE VARIABLES (variableMappers.ts:50)

### ANTES:
```typescript
descuento: snapshot.paquete.descuento,
```

### DESPUÉS:
```typescript
descuento: snapshot.paquete.configDescuentos?.descuentoGeneral?.porcentaje || 0,
```

**CAMBIOS**: 1 línea → 1 línea (medio-fácil)

**PERO**: ¿Y si es granular? ¿Devuelves 0? ¿Devuelves el promedio?

---

## Patrón 7: DISPLAY EN TABLA (SnapshotsTableSection.tsx:300-301)

### ANTES:
```typescript
{(snapshot.paquete.descuento ?? 0) > 0 && (
  <p className="text-sm text-white/90">
    <strong className="text-white">Descuento:</strong> {snapshot.paquete.descuento}%
  </p>
)}
```

### DESPUÉS:
```typescript
{(() => {
  const config = snapshot.paquete.configDescuentos
  const hasDescuento = config && config.tipoDescuento !== 'ninguno'
  const descuentoText = config?.tipoDescuento === 'general' 
    ? `${config.descuentoGeneral.porcentaje}%`
    : config?.tipoDescuento === 'granular'
    ? 'Granular'
    : 'Ninguno'
  
  return hasDescuento && (
    <p className="text-sm text-white/90">
      <strong className="text-white">Descuento:</strong> {descuentoText}
    </p>
  )
})()}
```

**CAMBIOS**: 5 líneas → 14 líneas (IIFE helper)

---

## ANÁLISIS DE DIFICULTAD

| Tipo | Ubicaciones | Cambio | Dificultad | Notas |
|------|-----------|--------|-----------|-------|
| INPUT | 1 (PaqueteSection) | 3 → 17 líneas | 🔴 ALTA | Lógica compleja de setState |
| DISPLAY | 3 (PaqueteSection, History, etc) | 1 → 3 líneas | 🟡 MEDIA | Frágil si mixes tipos |
| CÁLCULO | 7 (performanceOpts, preview) | 1 → 16 líneas | 🔴 ALTA | Necesita función helper |
| PDF | 2 (pdf-export) | 3 → 15 líneas | 🔴 ALTA | ¿Qué descuento mostrar? |
| COMPARACIÓN | 3 (CRUD hooks) | 1 → 1 línea | 🟢 BAJA | Directo reemplazo |
| MAPEO | 5 (variableMappers) | 1 → 1 línea | 🟢 BAJA | Pero necesita lógica fallback |
| TABLA | 3 (SnapshotsTableSection) | 5 → 14 líneas | 🔴 ALTA | Condicionales complejos |

---

## FUNCIONES HELPER NECESARIAS

### 1. Extraer Descuento Efectivo

```typescript
export function getEffectiveDiscount(config: ConfigDescuentos | undefined): {
  valor: number
  tipo: 'ninguno' | 'general' | 'granular'
  para: 'desarrollo' | 'serviciosBase' | 'otrosServicios' // para 'desarrollo'
} {
  if (!config || config.tipoDescuento === 'ninguno') {
    return { valor: 0, tipo: 'ninguno', para: 'desarrollo' }
  }
  
  if (config.tipoDescuento === 'general') {
    return {
      valor: config.descuentoGeneral.porcentaje,
      tipo: 'general',
      para: 'desarrollo'
    }
  }
  
  return {
    valor: config.descuentosGranulares.desarrollo || 0,
    tipo: 'granular',
    para: 'desarrollo'
  }
}
```

### 2. Calcular Desarrollo con Descuento

```typescript
export function calculateDevelopmentWithDiscount(
  desarrollo: number,
  config: ConfigDescuentos | undefined
): number {
  const { valor } = getEffectiveDiscount(config)
  return desarrollo * (1 - valor / 100)
}
```

### 3. Calcular Todos los Costos con Descuentos

```typescript
export function calculateCostsWithDiscounts(snapshot: PackageSnapshot) {
  const desarrolloConDescuento = calculateDevelopmentWithDiscount(
    snapshot.paquete.desarrollo,
    snapshot.paquete.configDescuentos
  )
  
  const totalServicios = calculateServicesWithDiscounts(
    snapshot.serviciosBase,
    snapshot.paquete.configDescuentos
  )
  
  return {
    desarrollo: desarrolloConDescuento,
    servicios: totalServicios,
    total: desarrolloConDescuento + totalServicios
  }
}
```

---

## RESUMEN: POR QUÉ NO ES "BUSCAR Y REEMPLAZAR"

1. ❌ **Cambios de tipo**: `descuento` es `number`, `configDescuentos` es `object`
2. ❌ **Rutas de acceso**: Necesitas `.descuentoGeneral.porcentaje` o `.descuentosGranulares.desarrollo`
3. ❌ **Lógica condicional**: Depende de `tipoDescuento` (ninguno/general/granular)
4. ❌ **Funciones helper**: Necesitas nuevas utilidades para reutilizar
5. ❌ **UI compleja**: Itera sobre objetos, necesita manejo de casos especiales
6. ❌ **PDFs/Emails**: ¿Qué información mostrar de descuentos granulares?

---

## ESFUERZO ESTIMADO

**Si fuera "buscar y reemplazar":** 30 minutos
**En realidad:** 20-24 horas

- 3h: Crear funciones helper de cálculo
- 5h: Refactorizar componentes de input/display
- 4h: Refactorizar cálculos de preview
- 3h: Refactorizar PDFs y exports
- 3h: Testing de todos los escenarios
- 2h: Documentación
- 1h: Buffer/ajustes

---

## ALTERNATIVA FÁCIL

**Si solo necesitas "hacer que funcione":**

1. Crear función helper central:
```typescript
export function getSimpleDiscount(config: ConfigDescuentos | undefined): number {
  if (!config) return 0
  if (config.tipoDescuento === 'general') return config.descuentoGeneral.porcentaje
  if (config.tipoDescuento === 'granular') return config.descuentosGranulares.desarrollo || 0
  return 0
}
```

2. Reemplazar todos los `snapshot.paquete.descuento` con `getSimpleDiscount(snapshot.paquete.configDescuentos)`

3. Reemplazar input de PaqueteSection para que actualice `configDescuentos`

**Esto toma: ~8h en lugar de 24h**

Pero pierde información de descuentos granulares si los usas.
