# ANÁLISIS COMPARATIVO: `descuento` legacy vs `configDescuentos` nuevo

## PROBLEMA CRÍTICO IDENTIFICADO

El sistema está **PARCIALMENTE implementado**. Hay lugares donde se usa el sistema legacy directamente sin consultar `configDescuentos`.

---

## 1. CÁLCULOS DE DESCUENTOS (🔴 CRÍTICO)

### A. DESCUENTO SIMPLE - `snapshot.paquete.descuento * 0.01`

**Ubicaciones que usan descuento LEGACY directamente:**

1. **performanceOptimizations.ts:84, 108** ❌ PROBLEMA
```typescript
const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
```
- Usa `descuento` directo, IGNORA `configDescuentos`
- El nuevo sistema podría tener descuentos GRANULARES, pero se ignoran
- RIESGO: Si cambias descuentos de SIMPLE a GRANULAR, esto sigue calculando mal

2. **useSnapshotCRUD.ts:60, 71** ❌ PROBLEMA
```typescript
const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
```
- Usado en cálculos de preview
- IGNORA el sistema de descuentos nuevo

3. **SnapshotsTableSection.tsx:107, 118** ❌ PROBLEMA
```typescript
const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
```
- Mostrado en UI de tabla de snapshots
- Podría mostrar precio INCORRECTO si hay descuentos granulares

4. **ServiciosOpcionalesSection.tsx:97, 108** ❌ PROBLEMA
```typescript
const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
```
- Cálculo de preview de servicios opcionales
- IGNORA `configDescuentos`

5. **PackageCostSummary.tsx:81** ❌ PROBLEMA
```typescript
${(snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)).toFixed(0)}
```
- Componente público de resumen de costos
- LOS CLIENTES VEN PRECIOS INCORRECTOS si hay descuentos granulares

6. **PaqueteSection.tsx:87, 132, 137** ❌ PROBLEMA
```typescript
value={paqueteActual.descuento}
// Input field editando descuento directo
// Preview mostrando con descuento
${(paqueteActual.desarrollo * (1 - paqueteActual.descuento / 100)).toFixed(2)}
```
- Se edita el campo `descuento` LEGACY
- NO se actualiza `configDescuentos` automáticamente
- **DESINCRONIZACIÓN CRÍTICA**

7. **pdf-export/generator.ts:68-69, 219-220** ❌ PROBLEMA
```typescript
if (snapshot.paquete.descuento > 0) {
    doc.text(`Descuento: ${snapshot.paquete.descuento}%`, 20, yPosition)
}
```
- PDF exportado muestra descuento LEGACY
- Si hay descuentos granulares, el PDF es INCORRECTO
- **LOS CLIENTES RECIBEN PDFs CON INFO INCORRECTA**

---

### B. SISTEMA NUEVO - `configDescuentos`

**Ubicaciones que SÍ usan `configDescuentos`:**

1. **FinancieroContent.tsx:210-220** ✅ CORRECTO
```typescript
if (configDescuentos.tipoDescuento === 'general' && configDescuentos.descuentoGeneral.aplicarA.serviciosBase) {
    descuentoAplicado = configDescuentos.descuentoGeneral.porcentaje
} else if (configDescuentos.tipoDescuento === 'granular') {
    descuentoAplicado = configDescuentos.descuentosGranulares.serviciosBase[s.id] || 0
}
const conDescuento = original * (1 - descuentoAplicado / 100)
```
- Calcula correctamente con sistema nuevo
- Soporta ambos tipos: general y granular

2. **snapshotApi.ts:150-161** ✅ CORRECTO
```typescript
if (dbSnapshot.configDescuentos) {
    configDescuentos = dbSnapshot.configDescuentos
} else if (dbSnapshot.descuentosGenerales || dbSnapshot.descuentosPorServicio) {
    configDescuentos = migrarConfigDescuentosLegacy(...)
}
```
- Conversión de BD a frontend hace migración

3. **discountCalculator.ts** (función: `migrarConfigDescuentosLegacy`) ✅ PARCIAL
```typescript
// Convierte legacy a nuevo, pero...
// ¿Se llama desde TODOS los cálculos de precios?
```

---

## 2. EDICIÓN EN ADMIN PANEL

### A. INPUT DE DESCUENTO SIMPLE

**PaqueteSection.tsx:87** ❌ PROBLEMA
```typescript
<input
    value={paqueteActual.descuento}
    onChange={(e) =>
        setPaqueteActual({
            ...paqueteActual,
            descuento: Number.parseFloat(e.target.value) || 0,
        })
    }
/>
```

**PROBLEMA CRÍTICO:**
- Editas `paqueteActual.descuento` (campo legacy)
- ✅ Se actualiza en state
- ❌ NO se sincronizan cambios automáticos a `paqueteActual.configDescuentos`
- ❌ Cuando guardas snapshot, ¿cuál descuento se guarda?

**Flujo de guardado:**

En `administrador/page.tsx:1385`:
```typescript
descuento: paqueteActual.descuento,  // ← Se guarda EL LEGACY
```

Pero en `snapshotApi.ts:114`:
```typescript
descuento: snapshot.paquete?.descuento ?? snapshot.descuento ?? 0,
```

**PROBLEMA**: El campo `descuento` simple se guarda, pero `configDescuentos` TAMBIÉN se guarda. ¿Cuál tiene prioridad al leer?

---

### B. NUEVOS DESCUENTOS EN MODAL

**administrador/page.tsx:5183+** ✅ PARCIALMENTE OK
```typescript
// Edita descuentos generales
checked={snapshotEditando.paquete.configDescuentos?.descuentoGeneral?.aplicarA?.[key]}

// Edita descuentos granulares
value={snapshotEditando.paquete.configDescuentos?.descuentosGranulares?.otrosServicios?.[servicioKey] || 0}
```

✅ Estos SÍ actualizan `configDescuentos`

**PERO**: ¿Qué pasa con el campo `descuento` legacy cuando cambias estos?
- Se queda desincronizado
- Cuando lees el snapshot después, ¿lees descuento o configDescuentos?

---

## 3. VALIDACIONES Y COMPARACIONES

### A. Detectar Cambios (useSnapshotCRUD.ts:125)

```typescript
datosActuales.descuento === datosSnapshot.descuento &&
```

❌ PROBLEMA: Compara el campo LEGACY
- Si cambias `configDescuentos` pero no `descuento`, no detecta cambios
- Si cambias ambos, compara mal

### B. Comparación de Snapshots (snapshotComparison.ts:57)

```typescript
'paquete.descuento',
```

❌ PROBLEMA: Compara solo el campo legacy
- No compara `configDescuentos`
- Dos snapshots con DIFERENTES descuentos granulares pero mismo `descuento` legacy = SIN DIFERENCIAS

---

## 4. MIGRACIÓN DE DATOS

### A. Función de Migración: `migrarConfigDescuentosLegacy`

```typescript
// Convierte:
// descuentosGenerales (legacy) → configDescuentos.descuentoGeneral (nuevo)
// descuentosPorServicio (legacy) → configDescuentos.descuentosGranulares (nuevo)
```

**PROBLEMA**: ¿Se llama desde todos lados?

**Dónde se llama:**
1. ✅ snapshotApi.ts:156 (convertDBToSnapshot)
2. ✅ discountCalculator.ts (exportada)
3. ❓ ¿Dónde más?

**BUSCAR**: ¿Se llama en cálculos de precios PÚBLICOS (no admin)?

---

## 5. COMPONENTES PÚBLICOS (Cliente viendo cotización)

### A. PaymentOptions.tsx:28

```typescript
const descuentoPagoUnico = snapshot.paquete.configDescuentos?.descuentoPagoUnico 
                         || snapshot.paquete.descuentoPagoUnico || 0
```

✅ BIEN: Tiene fallback del nuevo al legacy

### B. PackageCostSummary.tsx:81

```typescript
${(snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)).toFixed(0)}
```

❌ MAL: Usa descuento legacy
- Cliente ve precio INCORRECTO si hay descuentos granulares
- CRÍTICO: Esto es PÚBLICO, clientes lo ven

### C. variableMappers.ts:50, 89

```typescript
descuento: snapshot.paquete.descuento,
variables[`${prefix}Descuento`] = normalized.descuento
```

❌ MAL: Mapea variable de descuento desde campo legacy
- Usado en templates (email, PDF)
- Clientes ven descuento INCORRECTO

---

## MATRIZ DE DECISIÓN

| Componente | Usa Legacy | Usa Nuevo | ESTADO | IMPACTO |
|-----------|-----------|----------|--------|---------|
| PaqueteSection | ✅ | ❌ | ❌ ROTO | Admin edita mal |
| FinancieroContent | ❌ | ✅ | ✅ OK | Admin calcula bien |
| PackageCostSummary | ✅ | ❌ | ❌ ROTO | Cliente ve malo |
| PaymentOptions | ❌ | ✅ | ✅ OK | Cliente ve bien |
| PDF Generator | ✅ | ❌ | ❌ ROTO | PDF cliente malo |
| performanceOpts | ✅ | ❌ | ❌ ROTO | Preview malo |
| useSnapshotCRUD | ✅ | ❌ | ❌ ROTO | Preview malo |
| snapshotApi | ✅ | ✅ | ⚠️ AMBOS | Confusión |
| Comparación | ✅ | ❌ | ❌ ROTO | No detecta cambios |
| variableMappers | ✅ | ❌ | ❌ ROTO | Email/PDF malo |

---

## CONCLUSIONES CRÍTICAS

### 🔴 PROBLEMAS ENCONTRADOS

1. **DESINCRONIZACIÓN**: Dos campos de descuento que pueden tener valores diferentes
   - `snapshot.paquete.descuento` (legacy)
   - `snapshot.paquete.configDescuentos` (nuevo)
   - Sistema NO garantiza que estén sincronizados

2. **CÁLCULOS INCORRECTOS**: 7 lugares calculan con descuento legacy, IGNORAN `configDescuentos`
   - Si tienes descuentos granulares → precios EQUIVOCADOS
   - En admin panel (FinancieroContent) funciona bien
   - En otros lados (públicos) funciona MAL

3. **CLIENTES VEN PRECIOS MALOS**: 
   - PackageCostSummary ❌
   - PDF export ❌
   - Email templates ❌

4. **EDICIÓN DESINCRONIZADA**:
   - Editas descuento simple → NO se actualiza `configDescuentos`
   - Editas `configDescuentos` → descuento simple queda desactualizado

5. **COMPARACIONES ROTAS**:
   - useSnapshotCRUD solo compara descuento legacy
   - snapshotComparison solo compara descuento legacy
   - Cambios en `configDescuentos` NO se detectan

---

## SOLUCIONES NECESARIAS

### Opción A: COMPLETAR la implementación del nuevo sistema (RECOMENDADO)
- Reemplazar TODOS los `descuento` legacy con cálculos desde `configDescuentos`
- Tiempo: ~20h
- Riesgo: Medio (testing exhaustivo)
- Ganancia: Sistema único, consistente

### Opción B: Sincronizar automáticamente ambos campos
- Cuando editas uno, actualiza el otro automáticamente
- Mantener ambos pero garantizar consistencia
- Tiempo: ~8h
- Riesgo: Bajo (cambios puntuales)
- Ganancia: Parcial (aún hay deuda técnica)

### Opción C: Revertir a sistema legacy (NO RECOMENDADO)
- Eliminar `configDescuentos`
- Tiempo: ~6h
- Riesgo: Alto (perder features nuevas)
- Ganancia: Ninguna (atrás en desarrollo)

---

## RECOMENDACIÓN FINAL

**El nuevo sistema está implementado en 40% del código.**

**Opciones viables:**
1. ✅ **OPCIÓN A + RESETEO** = Completar nuevo sistema + resetear esos 3 snapshots a 0%
2. ⚠️ OPCIÓN B = Sincronizar, pero es parche temporal

**MI RECOMENDACIÓN**: Opción A
- Terminar implementación del nuevo sistema
- Luego resetear esos 3 snapshots
- Base de datos queda limpia y consistente
- Código queda limpio y eficiente
