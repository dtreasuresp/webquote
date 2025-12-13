# RUTA CRÍTICA: De dónde a dónde van los descuentos

## ESCENARIO 1: Editas descuento en Admin Panel

### PASO 1: Editas en PaqueteSection.tsx
```
Usuario edita: "Descuento: 8%"
    ↓
setPaqueteActual({ ...paqueteActual, descuento: 8 })
    ↓
State ahora tiene:
  paqueteActual.descuento = 8
  paqueteActual.configDescuentos = ??? (no se actualiza)
```

### PASO 2: ¿Se refleja en UI?

**Vista Previa - PaqueteSection.tsx:137**
```typescript
${(paqueteActual.desarrollo * (1 - paqueteActual.descuento / 100)).toFixed(2)}
```
✅ SÍ se ve el descuento, porque usa `paqueteActual.descuento` directo

**Pero en FinancieroContent.tsx** ❌ NO se refleja
- Calcula con `configDescuentos`
- Que no fue actualizado
- Usuario ve INCONSISTENCIA entre PaqueteSection y FinancieroContent

### PASO 3: Guardas snapshot

En `administrador/page.tsx:1385`:
```typescript
await crearSnapshot({
  ...paqueteActual,
  descuento: paqueteActual.descuento,  // ← Se guarda 8
  configDescuentos: paqueteActual.configDescuentos,  // ← Se guarda ??? (vacío/default)
})
```

### PASO 4: En BD se guarda

```
descuento: 8
configDescuentos: { tipoDescuento: 'ninguno', ... }
```

### PASO 5: Clientes ven cotización

En `PackageCostSummary.tsx:81`:
```typescript
${(snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)).toFixed(0)}
```
✅ SÍ ve el 8% (porque usa descuento legacy)

En `FinancieroContent.tsx:210`:
```typescript
if (configDescuentos.tipoDescuento === 'general' && ...) {
    // No entra aquí (tipoDescuento es 'ninguno')
}
```
❌ NO aplica descuentos (porque configDescuentos dice 'ninguno')

**RESULTADO**: INCONSISTENCIA CRÍTICA
- Admin cree que descuento es 8%
- Clientes ven diferente dependiendo de DÓNDE se calcula

---

## ESCENARIO 2: Editas Descuentos Granulares en Modal

### PASO 1: Editas en FinancieroContent.tsx

```
Usuario selecciona: "Descuentos granulares"
Usuario establece: Desarrollo 5%, Hosting 3%
    ↓
setConfigDescuentos({
  tipoDescuento: 'granular',
  descuentosGranulares: { desarrollo: 5, serviciosBase: { '1': 3 }, ... }
})
    ↓
State ahora tiene:
  paqueteActual.configDescuentos = { tipoDescuento: 'granular', ... }
  paqueteActual.descuento = ??? (no se actualiza)
```

### PASO 2: ¿Se refleja en UI?

**En FinancieroContent.tsx:210+** ✅ SÍ
- Calcula correctamente con descuentos granulares
- Usuario ve precios correctos

**En PaqueteSection.tsx:137** ❌ NO
- Sigue mostrando: `desarrollo * (1 - paqueteActual.descuento / 100)`
- Pero `descuento` sigue siendo 0 (nunca se actualizó)
- Usuario ve PRECIOS INCORRECTOS

### PASO 3: Guardas snapshot

```typescript
await guardarEdicion({
  ...snapshotEditando,
  paquete: {
    descuento: 0,  // ← Nunca se actualizó
    configDescuentos: { tipoDescuento: 'granular', ... }  // ← Sí se actualiza
  }
})
```

### PASO 4: En BD se guarda

```
descuento: 0 (legacy, vacío)
configDescuentos: { tipoDescuento: 'granular', desarrollo: 5%, ... }
```

### PASO 5: Al leer el snapshot

En `convertDBToSnapshot` (snapshotApi.ts:206):
```typescript
descuento: dbSnapshot.descuento,  // ← Lee 0
configDescuentos: configDescuentos,  // ← Lee el granular correcto
```

¿Cuál se usa en UI?

**En FinancieroContent.tsx** ✅ Usa `configDescuentos` (correcto)
**En PackageCostSummary.tsx** ❌ Usa `descuento` (incorrecto: 0%)
**En PackageHistoryContent.tsx:506** ❌ Usa `paquete.descuento` (incorrecto: 0%)
**En PDF export** ❌ Usa `descuento` (incorrecto: 0%)

**RESULTADO**: DATOS GUARDADOS PERO LECTURA INCONSISTENTE

---

## ESCENARIO 3: Cálculo de Vista Previa

### RUTA 1: En Admin Panel (FinancieroContent.tsx)

```
desarrolloOriginal = 5000

if (configDescuentos.tipoDescuento === 'general') {
    desarrolloConDescuento = 5000 * (1 - descuentoGeneral / 100)
} else if (configDescuentos.tipoDescuento === 'granular') {
    desarrolloConDescuento = 5000 * (1 - descuentoGranular / 100)
}
```

✅ CORRECTO: Lee desde `configDescuentos`

### RUTA 2: En performanceOptimizations.ts

```typescript
const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
```

❌ INCORRECTO: Lee desde `descuento` legacy
- Si hay descuentos granulares, este cálculo es MALO
- Se usa en comparaciones de snapshots

### RUTA 3: En useSnapshotCRUD.ts

```typescript
const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
```

❌ INCORRECTO: Lee desde `descuento` legacy
- Se usa para preview de snapshot
- Usuario ve PRECIO EQUIVOCADO

**RESULTADO**: Diferentes cálculos dan diferentes resultados

---

## ESCENARIO 4: Comparación de Cambios

### En useSnapshotCRUD.ts:125

```typescript
const tieneCambios = JSON.stringify(datosActuales) !== JSON.stringify(datosSnapshot)
```

¿Qué se compara?
```typescript
datosActuales = {
  descuento: snapshotEditando.paquete.descuento,  // ← campo legacy
  // NO incluye configDescuentos
}
```

Si:
- ✅ Cambias `descuento` de 0 a 8 → SE DETECTA
- ❌ Cambias `configDescuentos` pero `descuento` sigue igual → NO SE DETECTA

**RESULTADO**: El usuario edita descuentos granulares y luego cierra sin guardar
- Sistema dice "Sin cambios"
- Pero los descuentos granulares SÍ cambiaron

---

## ESCENARIO 5: Cálculos de Costo Anual/Inicial

En `useSnapshotCRUD.ts:60`:
```typescript
const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
const costoInicial = desarrolloConDescuento * 0.3
const costoAño1 = desarrolloConDescuento + totalServicios
```

Luego se guarda:
```typescript
actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
```

🔴 PROBLEMA CRÍTICO:
- Si tienes descuentos granulares (5% desarrollo + 3% hosting)
- Pero el campo `descuento` legacy = 0
- Este cálculo daría: `5000 * (1 - 0/100)` = 5000 (SIN descuento)
- Pero FinancieroContent calculó con descuentos
- LOS COSTOS GUARDADOS EN BD ESTÁN INCORRECTOS

**RESULTADO**: Datos en BD inconsistentes

---

## CADENA DE CONSECUENCIAS

```
                    ┌─ ADMIN EDITA DESCUENTOS ─────┐
                    │                                │
            Legacy `descuento`     Nuevo `configDescuentos`
                    │                                │
                    ↓                                ↓
            NO actualiza                  NO actualiza
            configDescuentos               descuento
                    │                                │
                    └────────────┬────────────────────┘
                                  │
                          Se guardan AMBOS
                                  │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ↓                  ↓                  ↓
        FinancieroContent    PackageCostSummary    PDFExport
        (admin ve bien)      (cliente ve mal)     (cliente recibe mal)
                │                  │                  │
                └──────────────────┼──────────────────┘
                                  │
                    Datos en BD inconsistentes
                    Precios incorrectos
                    Clientes confundidos
```

---

## CONCLUSIÓN

**EL SISTEMA NO ESTÁ COMPLETO.**

- ✅ Backend (BD/API) guarda ambos campos
- ⚠️ Admin Panel usa AMBOS sistemas (confusión)
- ❌ Componentes públicos usan SOLO legacy
- ❌ Cálculos de costos usan SOLO legacy
- ❌ PDFs usan SOLO legacy
- ❌ Sin sincronización automática

**CONSECUENCIA OBSERVABLE:**

Tu caso: `descuento: 8%` en BD, pero UI del admin NO lo muestra
- ✅ Está en BD correctamente
- ❌ UI no lo muestra porque:
  - PaqueteSection Lee descuento legacy = no ve cambios
  - Pero FinancieroContent lee configDescuentos = ve 'ninguno'
  - Estado desincronizado

---

## ACCIONES REQUERIDAS

### CORTO PLAZO (Fix Inmediato)
1. Resetear esos 3 snapshots a 0%
2. Garantizar que `descuento` y `configDescuentos` estén sincronizados

### MEDIANO PLAZO (Completar Implementación - CRÍTICO)
1. Reemplazar ALL cálculos con NUEVA lógica de `configDescuentos`
2. Remover dependencia de campo `descuento` legacy
3. Actualizar UI pública (PackageCostSummary, PDF, Email)
4. Tests exhaustivos de todos los casos

### LARGO PLAZO (Limpieza)
1. Eliminar campo `descuento` legacy del schema
2. Nueva migración Prisma
3. Actualizar scripts de backup
