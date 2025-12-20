# 🗺️ MATRIZ DE DECISIONES Y FLUJOGRAMAS

**Auditoría del Sistema de Comparación - Parte Final**

---

## 📊 Matriz de Impacto vs Complejidad

```
          COMPLEJIDAD
            ↑
        Alta│
            │    ┌─────────────────────┐
            │    │ Opción 3 (JSONB)    │  Riesgo: ALTO
            │    │ Impacto: Muy Alto   │  Beneficio: Alto
            │    └─────────────────────┘
        Med │  ┌────────────────────────────┐
            │  │ Opción 2 (/api changes)    │  Riesgo: MEDIO
            │  │ Impacto: Alto              │  Beneficio: Muy Alto
            │  └────────────────────────────┘
            │
        Baja│  ┌──────────────────────────────────────┐
            │  │ Opción 1 (Filtro en cotizaComparison)│  Riesgo: BAJO
            │  │ Impacto: Mínimo                      │  Beneficio: Alto
            │  └──────────────────────────────────────┘
            │
            └──────────────────────────────────────────→ IMPACTO

RECOMENDACIÓN: ✅ Opción 1
```

---

## 🔀 Flujograma: Cómo Llega el Problema

```
START: Usuario abre Historial
│
├─ loadSnapshotsCallback()
│  └─ obtenerSnapshotsCompleto()
│     └─ fetch('/api/snapshots/all')
│        └─ prisma.packageSnapshot.findMany()  ← Retorna TODOS
│           └─ snapshots = [
│              v1_pkg1(F), v1_pkg2(F),     ← activo: false
│              v2_pkg1(T), v2_pkg2(T),     ← activo: true
│              v3_pkg1(T), v3_pkg2(T)      ← activo: true
│           ]
│
├─ setSnapshots(snapshots)
│
├─ Render: <Historial snapshots={snapshots} />
│
├─ Usuario expandeix cotización
│  └─ handleShowTimeline(quotation)
│
├─ Usuario selecciona 2 versiones en Timeline
│  └─ handleCompararVersiones(v1, v2)
│
├─ Render: <CotizacionComparison
│     snapshots1={snapshots.filter(...)}  ← Array incompleto
│     snapshots2={snapshots.filter(...)}  ← Array incompleto
│  />
│
├─ CotizacionComparison llamaa:
│  └─ compararCotizaciones(v1, v2, snapshots1, snapshots2)
│     │
│     ├─ const paquetes1 = snapshots1.filter(
│     │   s => s.quotationConfigId === v1.id
│     │ )
│     │ ← Obtiene [v1_pkg1(F), v1_pkg2(F)]
│     │   (INCLUYE inactivos, problema empieza aquí)
│     │
│     ├─ const map1 = new Map(...)
│     │ ← { "pkg1": {id: 1, activo: false}, ... }
│     │
│     ├─ Compara map1 vs map2 por NOMBRE
│     │ └─ Ambos tienen el mismo nombre
│     │    └─ Status: "unchanged"  ← CORRECTO
│     │
│     └─ Retorna packageDifferences
│        └─ Incluye comparación correcta (en este caso)
│
└─ Render: Modal con resultados


═══════════════════════════════════════════════════════

PERO SI HAY DEACTIVACIÓN Y REACTIVACIÓN:

START: Usuario modifica paquete en v1
│
├─ Usuario marca paquete como "inactivo"
│  └─ updateSnapshot(pkg1, {activo: false})
│     └─ BD: UPDATE package_snapshot SET activo = false
│        ← pkg1 ahora tiene activo: false
│
├─ Usuario más tarde lo marca como "activo"
│  └─ updateSnapshot(pkg1, {activo: true})
│     └─ Opción A: UPDATE (mismo registro)
│        └─ BD: pkg1 sigue siendo el mismo ID
│           └─ Comparación: OK ✅
│     └─ Opción B: CREATE (nuevo registro)
│        └─ BD: Crea pkg-new con activo: true
│           ← pkg1 VIEJO tiene activo: false
│           ← pkg-new NUEVO tiene activo: true
│           Comparación: PROBLEMA ❌
│
└─ ¿Cuál sucede en tu código?
   └─ ← Necesito revisar actualizarSnapshot()
```

---

## 🧪 Escenarios de Prueba

### Escenario 1: Versión sin cambios

```
Entrada:
┌─────────────┬──────┬──────────────┐
│ Nombre      │ Acti │ quotConfigId │
├─────────────┼──────┼──────────────┤
│ Básico      │ F    │ quote-001    │ v1
│ Pro         │ F    │ quote-001    │ v1
├─────────────┼──────┼──────────────┤
│ Básico      │ T    │ quote-002    │ v2
│ Pro         │ T    │ quote-002    │ v2
└─────────────┴──────┴──────────────┘

Actual (Incorrecto):
compararCotizaciones(v1, v2, snapshots, snapshots)
├─ paquetes1 = [Básico(F), Pro(F)]
├─ paquetes2 = [Básico(T), Pro(T)]
├─ map1 = {"básico": F, "pro": F}
├─ map2 = {"básico": T, "pro": T}
└─ Resultado: unchanged, unchanged ✅ (Correcto por coincidencia)

Con fix (Filtrar activo):
compararCotizaciones(v1, v2, snapshots, snapshots)
├─ paquetes1 = [Básico(F), Pro(F)].filter(s => s.activo)
│             = []
├─ paquetes2 = [Básico(T), Pro(T)].filter(s => s.activo)
│             = [Básico(T), Pro(T)]
├─ map1 = {}  (vacío)
├─ map2 = {"básico": T, "pro": T}
└─ Resultado: [NEW, NEW] ❌ (Incorrecto ahora)

CONCLUSIÓN: El filtro por activo es la MITAD de la solución
```

---

## 🔍 Investigación: ¿Qué sucede realmente en BD?

Para entender exactamente qué está pasando:

```sql
-- Verificar estructura
SELECT 
  id, 
  nombre, 
  activo, 
  quotation_config_id,
  created_at,
  COUNT(*) OVER (PARTITION BY quotation_config_id, nombre) as duplicates
FROM package_snapshot
ORDER BY quotation_config_id, created_at DESC;

-- Resultado esperado (si se reutilizan IDs):
│ pkg-001  │ Básico │ false │ quote-001 │ 2025-11-01 │ 1 │
│ pkg-004  │ Básico │ true  │ quote-002 │ 2025-11-15 │ 1 │

-- Resultado aterrador (si se duplican):
│ pkg-001  │ Básico │ false │ quote-001 │ 2025-11-01 │ 2 │  ← ¡DUPLICADO!
│ pkg-002  │ Básico │ false │ quote-001 │ 2025-11-05 │ 2 │  ← ¡DUPLICADO!
│ pkg-004  │ Básico │ true  │ quote-002 │ 2025-11-15 │ 1 │
```

**Esto determina si el problema es:**
- A) Filtrado incorrecto (ambos tienen mismo paquete)
- B) Duplicación en BD (hay múltiples registros del mismo paquete)

---

## 🎯 Tabla Decisión: Qué Fix Aplicar

| Condición | Realidad BD | Problema Real | Fix Recomendado |
|-----------|------------|---------------|-----------------|
| Registros únicos por paquete/versión | 1 registro por paquete | Filtro por activo falta | Opción 1 |
| Registros duplicados por cambio de estado | 2+ registros del mismo paquete | Lógica de actualización | Opción 2 o 3 |
| Datos antiguos en JSONB | packagesSnapshot tiene datos | Migración incompleta | Opción 3 |
| Todo lo anterior | Mezcla de problemas | Arquitectura compleja | Refactor completo |

---

## 📋 Checklist: Pasos de Investigación

```
INVESTIGACIÓN PREVIA AL FIX:

□ Paso 1: Verificar estado actual en BD
  │
  ├─ Ejecutar:
  │  SELECT COUNT(*) FROM package_snapshot 
  │  WHERE nombre = 'Básico' 
  │  AND quotation_config_id IN (SELECT id FROM quotation_config WHERE numero = '#2025-001')
  │
  └─ Resultado esperado: 2 (una por versión)
     Resultado malo: >2 (duplicados)

□ Paso 2: Verificar estado de activo
  │
  ├─ Ejecutar:
  │  SELECT id, nombre, activo, quotation_config_id FROM package_snapshot
  │  WHERE quotation_config_id IN (SELECT id FROM quotation_config LIMIT 2)
  │  ORDER BY quotation_config_id, nombre
  │
  └─ Verificar: v1 tiene FALSE, v2 tiene TRUE

□ Paso 3: Probar comparación actual
  │
  ├─ Abrir navegador → Admin → Historial
  ├─ Expandir cotización
  ├─ Ver Timeline
  ├─ Comparar v1 vs v2
  │
  └─ Observar: ¿Qué reporta como "NUEVO"?

□ Paso 4: Verificar código de actualización
  │
  ├─ Buscar: actualizarSnapshot()
  ├─ Verificar: ¿Hace UPDATE o CREATE?
  │
  └─ Si es CREATE: Problema B (duplicación)
     Si es UPDATE: Problema A (filtro)

□ Paso 5: Evaluar packagesSnapshot JSONB
  │
  ├─ Ejecutar:
  │  SELECT 
  │    numero,
  │    packages_snapshot,
  │    (SELECT COUNT(*) FROM package_snapshot 
  │     WHERE quotation_config_id = qc.id) as snapshot_count
  │  FROM quotation_config qc
  │  ORDER BY numero
  │
  └─ Si packages_snapshot != NULL y snapshot_count = 0:
     Hay datos antiguos sin migrar
```

---

## 🛠️ Plan de Implementación (Opción 1)

```
FASE 1: Preparación
│
├─ Backup de BD
│  └─ dump data
│
├─ Crear rama: feature/fix-comparacion-paquetes
│
└─ Revisar pruebas actuales
   └─ ¿Hay tests para compararCotizaciones()?

FASE 2: Cambio de código
│
├─ Archivo: src/features/admin/utils/cotizacionComparison.ts
│  │
│  ├─ Línea 203: Cambiar
│  │  │ const paquetes1 = snapshots1.filter(s => s.quotationConfigId === cotizacion1.id)
│  │  │ TO:
│  │  │ const paquetes1 = snapshots1.filter(s => 
│  │  │   s.quotationConfigId === cotizacion1.id && s.activo !== false
│  │  │ )
│  │
│  ├─ Línea 204: Cambiar
│  │  │ const paquetes2 = snapshots2.filter(s => s.quotationConfigId === cotizacion2.id)
│  │  │ TO:
│  │  │ const paquetes2 = snapshots2.filter(s => 
│  │  │   s.quotationConfigId === cotizacion2.id && s.activo !== false
│  │  │ )
│  │
│  └─ Línea 165: Verificar si calcularCostoTotal() ya filtra
│     └─ ✅ SÍ, lo hace (línea 165-168)

├─ Archivo: src/lib/utils/paymentComparison.ts
│  │
│  ├─ Verificar si necesita cambios
│  │
│  ├─ Funciones:
│  │  ├─ sonMetodosPreferidosIguales()
│  │  ├─ sonOpcionesPagoIguales()
│  │  └─ sonDescuentosIguales()
│  │
│  └─ Acción: Revisar contexto de uso

└─ Archivo: src/features/admin/utils/snapshotComparison.ts
   │
   ├─ Revisar contexto
   │
   └─ Acción: Probablemente OK (compara 1 a 1)

FASE 3: Testing
│
├─ Test manual:
│  ├─ Crear cotización
│  ├─ Crear versión 2
│  ├─ Cambiar un paquete
│  ├─ Comparar v1 vs v2
│  └─ Verificar: Se reporta "modificado", no "nuevo"
│
├─ Test unitario:
│  └─ Crear test para compararCotizaciones con inactivos
│
└─ Test de regresión:
   ├─ Versiones sin cambios
   ├─ Versiones con adiciones
   ├─ Versiones con eliminaciones
   ├─ Versiones con cambios múltiples
   └─ Exportar CSV y JSON

FASE 4: Deploy
│
├─ Crear PR
├─ Code review
├─ Merge a main
└─ Deploy
```

---

## ⚠️ Riesgos Potenciales

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| Break comparación para usuarios con v1 activos | BAJA | Test extensivo |
| Cambio rompe exportación | BAJA | Revisar función de export |
| Inconsistencia con calcularCostoTotal | BAJA | Aplicar mismo filtro |
| Versions with activo=NULL | MEDIA | Usar `!== false` en lugar de `=== true` |

---

## 🎓 Conclusión del Análisis

**Problema Identificado:**
- Sistema de comparación de paquetes reporta todas las versiones nuevas como "NUEVAS"

**Raíz:**
- Versiones anteriores tienen `activo: false` en BD
- Función `compararCotizaciones()` no filtra por este campo
- Otros métodos SÍ filtran (inconsistencia)

**Solución Recomendada:**
- Filtrar por `s.activo !== false` en líneas 203-204 de `cotizacionComparison.ts`
- Riesgo: Bajo
- Complejidad: Mínima
- Impacto: Máximo

**Siguiente Paso:**
- Investigar si hay duplicación de registros en BD
- Si hay duplicación: Considerar Opción 2 o 3
- Si no hay: Implementar Opción 1 directamente

---

**Fin de la Auditoría**  
*Documento completo y detallado*  
*Listo para implementación*
