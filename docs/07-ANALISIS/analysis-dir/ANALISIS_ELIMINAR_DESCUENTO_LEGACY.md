# Análisis: Impacto de Eliminar Campo Legacy `descuento`

## Resumen Ejecutivo

**97 referencias** a `.descuento` en todo el código. Eliminar este campo legacy requeriría refactorizar:
- ✅ 32 archivos fuente
- ✅ 3 scripts de utilidad
- ✅ 2 rutas de API
- ✅ 1 migración de Prisma

---

## 1. BASE DE DATOS & SCHEMA

### Archivos afectados:
- **prisma/schema.prisma**
  - Línea 63: `descuento Int` en PackageSnapshot
  - Línea 117: `descuento Int @default(0)` en FinancialTemplate
  
**Impacto**: Requeriría nueva migración Prisma

---

## 2. API ROUTES (8 referencias)

### `/api/snapshots/route.ts`
```typescript
// Line 32, 84
descuento: data.descuento || 0,  // POST y PUT
```
**Cambio**: Remover este campo en POST/PUT, solo usar `configDescuentos`

### `/api/snapshots/duplicate/route.ts`
```typescript
// Line 99: Copiar descuento al duplicar
descuento: snapshot.descuento,

// Lines 113-114: Copiar descuentos legacy
descuentosGenerales: snapshot.descuentosGenerales,
descuentosPorServicio: snapshot.descuentosPorServicio,
```
**Cambio**: Solo copiar `configDescuentos`

### `/api/quotation-config/[id]/route.ts`
```typescript
// Line 38: Mapear descuento
descuento: p.descuento,
```
**Cambio**: Mapear desde `configDescuentos`

### `/api/quotation-config/restore/route.ts`
```typescript
// Multiple lines (131, 378-388, 439-449)
descuento: p.descuento,
descuentoPagoUnico: paquete.descuentoPagoUnico,
descuentosGenerales: paquete.descuentosGenerales,
descuentosPorServicio: paquete.descuentosPorServicio,
```
**Cambio**: Refactorizar para solo usar `configDescuentos`

### `/api/financial-templates/[id]/route.ts`
```typescript
// Line 50
...(data.descuento !== undefined && { descuento: data.descuento }),
```
**Cambio**: Remover, usar templates con `configDescuentos`

### `/api/financial-templates/route.ts`
```typescript
// Line 39
descuento: data.descuento || 0,
```
**Cambio**: Remover del POST

---

## 3. CONVERSION & UTILITIES (5 archivos)

### `/src/lib/snapshotApi.ts` - CRÍTICO
```typescript
// Line 114 - convertSnapshotToDB()
descuento: snapshot.paquete?.descuento ?? snapshot.descuento ?? 0,

// Line 206 - convertDBToSnapshot()
descuento: dbSnapshot.descuento,
```
**Impacto**: Estas son funciones centrales de conversión BD↔Frontend
**Cambio**: Reemplazar con lógica que extrae descuento de `configDescuentos`

### `/src/lib/snapshotMock.ts`
```typescript
// Line 59
descuento: snapshot.descuento || 0,
```
**Cambio**: Generar descuento desde `configDescuentos`

### `/src/lib/contextHelpers/variableMappers.ts`
```typescript
// Line 50
descuento: snapshot.paquete.descuento,

// Line 89
variables[`${prefix}Descuento`] = normalized.descuento
```
**Cambio**: Extraer descuento efectivo desde `configDescuentos`

### `/src/lib/utils/discountCalculator.ts`
```typescript
// Line 86
descuentoDirecto = snapshot.paquete.descuento || 0
```
**Cambio**: Refactorizar - este es el CORE de cálculos de descuentos

### `/src/features/admin/utils/cotizacionComparison.ts`
```typescript
// Line 91
{ field: 'paquete.descuento', label: 'Descuento', ... }
```
**Cambio**: Reemplazar con campo de `configDescuentos`

---

## 4. PDF EXPORT (2 referencias)

### `/src/features/pdf-export/utils/generator.ts`
```typescript
// Lines 68-69, 219-220
if (snapshot.paquete.descuento > 0) {
    doc.text(`Descuento: ${snapshot.paquete.descuento}%`, ...)
}
```
**Cambio**: Extraer descuento efectivo desde `configDescuentos`

---

## 5. ADMIN COMPONENTS (21 referencias)

### Core Editing:
- **PaqueteSection.tsx** (Lines 87, 132, 137)
  - Input field para editar descuento
  - Display de % y cálculo con descuento
  
- **SnapshotsTableSection.tsx** (Lines 300-301, 531, 549-557)
  - Mostrar descuento en tabla
  - Editar descuento en modal
  - Preview de costo con descuento

- **ServiciosOpcionalesSection.tsx** (Lines 97, 108, 148)
  - Cálculos de desarrollo con descuento

- **OfertaTab.tsx** (Line 298)
  - Pasar `descuentoBase` a componentes child

### Comparisons & History:
- **PaquetesComparison.tsx** (Line 71)
- **PaqueteCompareContent.tsx** (Line 60)
- **PackageHistoryContent.tsx** (Lines 88, 315, 500, 506)
- **PaquetesComparisonContent.tsx** (Line 67)

**Impacto**: Todos estos componentes manejan UI de descuentos
**Cambio**: Migrar UI a usar solo `configDescuentos`

---

## 6. HOOKS (3 referencias)

### `/src/features/admin/hooks/useSnapshotCRUD.ts`
```typescript
// Lines 60, 71 - Cálculos
const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)

// Lines 96, 111, 203 - Mapeos
descuento: props.paqueteActual.descuento,

// Line 125 - Comparación de cambios
datosActuales.descuento === datosSnapshot.descuento
```
**Cambio**: Refactorizar cálculos y comparaciones

### `/src/features/admin/hooks/useModalEdition.ts`
```typescript
// Lines 146, 152
descuentosGenerales: firstSnapshot.paquete.descuentosGenerales || {...}
descuentosPorServicio: firstSnapshot.paquete.descuentosPorServicio || {...}
```
**Cambio**: Inicializar desde `configDescuentos` en lugar de legacy

---

## 7. PERFORMANCE OPTIMIZATIONS (6 referencias)

### `/src/features/admin/utils/performanceOptimizations.ts`
```typescript
// Lines 84, 97, 108, 120
const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
descuento: snapshot.paquete.descuento,
```
**Cambio**: Refactorizar función de cálculo

### `/src/features/admin/components/SnapshotsTableSection.tsx`
```typescript
// Lines 107, 118
const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
```

### `/src/features/admin/components/ServiciosOpcionalesSection.tsx`
```typescript
// Lines 97, 108
const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
```

**Patrón**: Todas hacen: `desarrollo * (1 - descuento / 100)`
**Cambio Necesario**: Crear función reutilizable que extraiga descuento efectivo de `configDescuentos`

---

## 8. PAGE COMPONENTS (4 referencias)

### `/src/app/administrador/page.tsx`
```typescript
// Line 1385
descuento: paqueteActual.descuento,

// Line 1847
snapshotEditando.paquete.descuento !== original.paquete.descuento
```
**Cambio**: Usar `configDescuentos` en comparaciones

### `/src/components/sections/PaymentOptions.tsx`
```typescript
// Line 28 - Fallback logic
const descuentoPagoUnico = snapshot.paquete.configDescuentos?.descuentoPagoUnico 
                         || snapshot.paquete.descuentoPagoUnico || 0
```
**Cambio**: Ya hay fallback - remover el legacy

### `/src/components/sections/PackageCostSummary.tsx`
```typescript
// Line 81
${(snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)).toFixed(0)}
```
**Cambio**: Reemplazar con función de cálculo nuevo

---

## 9. SCRIPTS DE UTILIDAD (3 referencias)

### `/scripts/restore-data.ts`, `/scripts/backup-sql.js`, `/scripts/backup-and-migrate.ts`
```typescript
// Líneas varias
descuento: snapshot.descuento,
```
**Cambio**: Actualizar backups para solo guardar `configDescuentos`

---

## 10. MOCK DATA

### `/src/lib/snapshotMock.ts`
```typescript
// Line 59
descuento: snapshot.descuento || 0,
```
**Cambio**: Generar mock completo con `configDescuentos`

---

## CATEGORÍA: CÁLCULOS CRÍTICOS

Los siguientes archivos hacen cálculos de "desarrollo con descuento" que aparecen en MÚLTIPLES lugares:

```
desarrollo * (1 - descuento / 100)
```

**Arquivos**:
1. performanceOptimizations.ts (2 veces)
2. useSnapshotCRUD.ts (2 veces)
3. SnapshotsTableSection.tsx (2 veces)
4. ServiciosOpcionalesSection.tsx (2 veces)
5. PackageCostSummary.tsx (1 vez)
6. PaqueteSection.tsx (1 vez)

**Refactor Necesario**: 
- Crear función: `function getEffectiveDiscount(configDescuentos): number`
- Crear función: `function calculateDevelopmentWithDiscount(desarrollo, configDescuentos): number`
- Reemplazar todas las instancias

---

## RESUMEN DE TRABAJO REQUERIDO

| Categoría | Archivos | Complejidad | Esfuerzo |
|-----------|----------|-------------|----------|
| Schema + Migración | 1 | Alta | 2h |
| API Routes | 5 | Media | 3h |
| Conversiones Core | 3 | Alta | 4h |
| Cálculos | 8 | Media | 3h |
| Componentes Admin | 12 | Media | 5h |
| Hooks | 3 | Media | 2h |
| Utilities | 4 | Baja | 1h |
| Scripts | 3 | Baja | 1h |
| Testing | - | Alta | 3h |
| **TOTAL** | **32** | **Media** | **~24h** |

---

## RIESGOS

1. **CRÍTICO**: Perder descuentos en datos históricos si no se migran bien
2. **CRÍTICO**: Cálculos incorrectos en PDF exports durante transición
3. **ALTO**: Inconsistencia en comparaciones de snapshots antiguos vs nuevos
4. **MEDIO**: Errores en cálculos de precios durante edición

---

## ALTERNATIVAS

### Opción A: Eliminar Legacy (Lo que se propone)
- ✅ Código más limpio
- ✅ Una sola fuente de verdad (`configDescuentos`)
- ✅ Elimina confusión
- ❌ 24h de trabajo
- ❌ Alto riesgo de regresiones

### Opción B: Mantener Ambos (Actual)
- ✅ Sin cambios inmediatos
- ✅ Backward compatible
- ❌ Confusión continua
- ❌ Deuda técnica
- ❌ Bug potencial: desincronización entre campos

### Opción C: RECOMENDADO - Deprecar Gradualmente
- Mantener `descuento` en BD pero marcarlo como @deprecated en Prisma
- Refactorizar nuevos snapshots para SOLO usar `configDescuentos`
- Migrar datos históricos en background
- Tiempo de transición: 2-3 semanas
- Riesgo: Bajo

---

## CONCLUSIÓN

**Eliminar totalmente el legacy requiere refactorizar 32 archivos con riesgo medio-alto.**

Las opciones son:
1. **Hacer limpieza completa ahora** (24h, riesgo alto)
2. **Mantener como está** (deuda técnica, confusión continua)
3. **Deprecar gradualmente** (mejor balance)

¿Qué dirección prefieres tomar?
