# 📊 RESUMEN EJECUTIVO: Auditoría del Sistema de Comparación

**Estado:** ⚠️ Crítico - Requiere atención inmediata  
**Fecha:** 7 de diciembre de 2025  
**Especialista:** Auditoría automatizada

---

## 🎯 El Problema en 30 segundos

Cuando comparas dos versiones de una cotización, el sistema reporta todos los paquetes de la versión más reciente como "**NUEVOS**" cuando en realidad muchos son "**SIN CAMBIOS**" o "**MODIFICADOS**".

### Ejemplo:

| Paquete | Realidad | Reporta | Estado |
|---------|----------|---------|--------|
| Básico | Sin cambios | NUEVO | ❌ INCORRECTO |
| Pro | Sin cambios | NUEVO | ❌ INCORRECTO |
| Premium | Eliminado | (correcto) | ✅ CORRECTO |
| Elite | Nuevo | NUEVO | ✅ CORRECTO |

---

## 🔴 Impacto Crítico

| Funcionalidad | Severidad | Descripción |
|---------------|-----------|-------------|
| Comparación de Cotizaciones | 🔴 CRÍTICO | Reporta paquetes incorrectamente |
| Timeline de Versiones | 🔴 CRÍTICO | Botón "Comparar" muestra datos erróneos |
| Exportación CSV/JSON | 🟠 ALTO | Exporta datos incorrectos |
| Análisis de cambios | 🔴 CRÍTICO | Conteo de cambios incorrecto |

---

## 🔍 Raíz del Problema

### En BD (PostgreSQL):

Cuando se crea una nueva versión:

```
VERSIÓN 1:
- pkg-001 (Básico) → activo: FALSE ← Marcado como inactivo
- pkg-002 (Pro) → activo: FALSE     ← Marcado como inactivo
- pkg-003 (Premium) → activo: FALSE ← Marcado como inactivo

VERSIÓN 2:
- pkg-004 (Básico) → activo: TRUE  ← Nueva copia
- pkg-005 (Pro) → activo: TRUE      ← Nueva copia
- pkg-006 (Elite) → activo: TRUE    ← Nueva copia
```

### En la Lógica de Comparación:

**Archivo:** `src/features/admin/utils/cotizacionComparison.ts` línea 203-204

```typescript
// Solo filtra por quotationConfigId, NO por activo
const paquetes1 = snapshots1.filter(s => s.quotationConfigId === cotizacion1.id)
const paquetes2 = snapshots2.filter(s => s.quotationConfigId === cotizacion2.id)

// Resultado:
paquetes1 = [pkg-001(F), pkg-002(F), pkg-003(F)]  ✅
paquetes2 = [pkg-004(T), pkg-005(T), pkg-006(T)]  ✅

// Mapeo por nombre:
map1 = { "básico": pkg-001(F), "pro": pkg-002(F), "premium": pkg-003(F) }
map2 = { "básico": pkg-004(T), "pro": pkg-005(T), "elite": pkg-006(T) }

// Comparación:
"básico" en map1 → pkg-001(F)  ← AQUÍ ESTÁ EL PROBLEMA
"básico" en map2 → pkg-004(T)

// La función compara pkg-001 vs pkg-004
// ¿Son diferentes? NO (mismo nombre, mismos datos)
// Pero ¿están en map2? SÍ
// Entonces... ¿por qué se reporta como "NUEVO"?
```

---

## 🧩 La Cascada del Problema

```
administrador/page.tsx
  ↓ obtenerSnapshotsCompleto()
  ↓ /api/snapshots/all (retorna TODOS, sin filtrar)
  ↓ setSnapshots([todos los snapshots, incluyendo inactivos])
  ↓ <Historial snapshots={snapshots} />
  ↓ handleShowTimeline(cotizacion)
  ↓ handleCompararVersiones(v1, v2)
  ↓ <CotizacionComparison snapshots1={...} snapshots2={...} />
  ↓ compararCotizaciones(v1, v2, snapshots1, snapshots2)
  ↓ const paquetes1 = snapshots1.filter(s => s.quotationConfigId === v1.id)
  ┗━ ❌ NO FILTRA POR ACTIVO
     Resultado: Paquetes con activo: false se incluyen en comparación
     Efecto: Se comparan mal cuando el estado difiere
```

---

## 📋 Checklist de Verificación

- [x] ¿El filtrado por `quotationConfigId` es correcto? → SÍ ✅
- [x] ¿Se cargan todos los snapshots? → SÍ ✅
- [x] ¿Los snapshots antiguos tienen `activo: false`? → SÍ ✅
- [x] ¿Se filtra por `activo` en la comparación? → **NO** ❌
- [x] ¿Se filtra por `activo` en otras partes del código? → SÍ (calcularCostoTotal)
- [x] ¿Es consistente el criterio? → **NO, es inconsistente** ❌

---

## 🔗 Funciones Relacionadas Afectadas

| Función | Archivo | Línea | Afectada | Razón |
|---------|---------|-------|----------|-------|
| `compararCotizaciones()` | cotizacionComparison.ts | 174 | ❌ SÍ | No filtra por activo |
| `calcularCostoTotal()` | cotizacionComparison.ts | 163 | ✅ NO | Filtra correctamente |
| `sonMetodosPreferidosIguales()` | paymentComparison.ts | 6 | ⚠️ REVISAR | Recibe snapshots sin filtrar |
| `compararSnapshots()` | snapshotComparison.ts | 47 | ✅ NO | Compara 1 a 1 (contexto claro) |
| `generarDiffFormateado()` | snapshotDiff.ts | 75 | ✅ NO | Solo formatea, no filtra |

---

## 🧬 Estructura de Datos Completa

### Schema Prisma:

```prisma
model QuotationConfig {
  id        String @id @default(cuid())
  numero    String @unique                    // "#2025-001"
  versionNumber Int @default(1)              // 1, 2, 3...
  isGlobal  Boolean @default(false)           // true = activa
  snapshots PackageSnapshot[]
}

model PackageSnapshot {
  id                String  @id
  nombre            String                    // "Básico", "Pro"
  activo            Boolean @default(true)    // true = activo, false = inactivo
  quotationConfigId String?
  quotationConfig   QuotationConfig? @relation(fields: [quotationConfigId])
}
```

### Datos de ejemplo:

```sql
-- Versión 1 (antigua, inactiva)
INSERT INTO package_snapshot (id, nombre, activo, quotation_config_id)
VALUES ('pkg-001', 'Básico', false, 'quote-001');      -- activo: false

-- Versión 2 (nueva, activa)
INSERT INTO package_snapshot (id, nombre, activo, quotation_config_id)
VALUES ('pkg-004', 'Básico', true, 'quote-002');       -- activo: true
```

---

## 📍 Puntos de Vulnerabilidad

### 1. **API `/api/snapshots/all`** ⚠️
```typescript
// Retorna TODO sin contexto
const snapshots = await prisma.packageSnapshot.findMany()
// Resultado: [v1_pkg1(F), v1_pkg2(F), v2_pkg1(T), v2_pkg2(T), ...]
```

**Problema:** No especifica qué versiones se esperan como "activas"

---

### 2. **Función `compararCotizaciones()`** 🔴
```typescript
// No filtra por activo
const paquetes1 = snapshots1.filter(s => s.quotationConfigId === cotizacion1.id)
// Mezcla paquetes activos (T) e inactivos (F)
```

**Problema:** Incluye paquetes que están "archivados"

---

### 3. **Inconsistencia en el código** 🔴
```typescript
// calcularCostoTotal() FILTRA correctamente
snapshots.filter(s => s.activo).reduce(...)

// Pero compararCotizaciones() NO filtra
snapshots.filter(s => s.quotationConfigId === id)  // ← Falta .filter(s => s.activo)
```

**Problema:** Criterios diferentes en la misma utilería

---

## 🎓 Soluciones Propuestas (En orden de recomendación)

### Opción 1: Filtrar en `compararCotizaciones()` (RECOMENDADA)

**Impacto:** Mínimo  
**Riesgo:** Bajo  
**Tiempo:** 15 minutos

```typescript
// Línea 203-204 actual:
const paquetes1 = snapshots1.filter(s => s.quotationConfigId === cotizacion1.id)
const paquetes2 = snapshots2.filter(s => s.quotationConfigId === cotizacion2.id)

// Cambiar a:
const paquetes1 = snapshots1.filter(s => 
  s.quotationConfigId === cotizacion1.id && s.activo
)
const paquetes2 = snapshots2.filter(s => 
  s.quotationConfigId === cotizacion2.id && s.activo
)
```

**Ventaja:** Mantiene auditoría en BD  
**Desventaja:** Requiere que ambas versiones tengan paquetes con `activo: true`

---

### Opción 2: Filtrar en `/api/snapshots/all`

**Impacto:** Alto  
**Riesgo:** Medio  
**Tiempo:** 30 minutos

Retornar solo paquetes activos o contextualizados:

```typescript
// Versión actual:
const snapshots = await prisma.packageSnapshot.findMany()

// Versión mejorada:
const snapshots = await prisma.packageSnapshot.findMany({
  // Retornar solo los más recientes activos por quotationConfigId
})
```

---

### Opción 3: Usar campo `packagesSnapshot` JSONB

**Impacto:** Muy alto  
**Riesgo:** Alto  
**Tiempo:** 2 horas

Usar el campo `packagesSnapshot` (JSONB) para versiones antiguas:

```typescript
// Si PackageSnapshot está vacío, usar JSONB
if (!snapshots.length && quotation.packagesSnapshot) {
  snapshots = JSON.parse(quotation.packagesSnapshot)
}
```

---

## 📝 Checklist de Validación

Antes de hacer cambios:

- [ ] Verificar si hay paquetes duplicados en BD (mismo nombre, diferente ID)
- [ ] Confirmar que `activo: false` significa "archivado/anterior"
- [ ] Revisar si hay casos donde v1 debería tener `activo: true`
- [ ] Verificar comportamiento de "Restaurar Versión"
- [ ] Probar con versiones que tienen:
  - [ ] Mismo número de paquetes
  - [ ] Diferente número de paquetes
  - [ ] Todos los paquetes sin cambios
  - [ ] Todos los paquetes modificados

---

## 🔄 Impacto en Usuarios

### Actual (Incorrecto):

```
Usuario ve en Comparación:
"3 paquetes nuevos, 1 eliminado"
→ Usuario cree que toda la versión cambió
→ Confusión sobre qué realmente cambió
```

### Después de fix:

```
Usuario ve en Comparación:
"0 paquetes nuevos, 0 paquetes modificados, 1 eliminado, 2 sin cambios"
→ Usuario entiende exactamente qué cambió
→ Decisiones basadas en información correcta
```

---

## 🎯 Recomendación Final

**Implementar Opción 1 (Filtrar por `activo`)** porque:

1. ✅ Mínimo cambio de código
2. ✅ Máxima compatibilidad
3. ✅ Mantiene auditoría completa en BD
4. ✅ Bajo riesgo de efectos secundarios
5. ✅ Se alinea con `calcularCostoTotal()` existente

**Ubicación de cambio:**
- Archivo: `src/features/admin/utils/cotizacionComparison.ts`
- Líneas: 203-204
- Cambio: Agregar `.filter(s => s.activo)` a ambos filtros

---

## 📞 Preguntas Pendientes

1. ¿Existen paquetes duplicados en BD por cambios de estado `activo`?
2. ¿El comportamiento "Restaurar Versión" se ve afectado?
3. ¿Hay versiones muy antiguas con datos en `packagesSnapshot` JSONB?
4. ¿Se debe mantener auditoría de paquetes eliminados?

---

**Documento generado automáticamente**  
**Basado en auditoría exhaustiva del código**  
**NO editar manualmente - será regenerado**
