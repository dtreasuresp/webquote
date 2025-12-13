# 🔬 ANÁLISIS DETALLADO: El Problema de "Paquetes Nuevos"

**Documento de referencia técnica**  
**Para entender exactamente qué sucede en cada paso**

---

## 📍 El Problema en una Imagen

```
COMPARACIÓN: Versión 1 → Versión 2

Base de Datos (REAL):
┌────────────────┬────────────┬────────┬──────────────┐
│ id             │ nombre     │ activo │ quotConfigId │
├────────────────┼────────────┼────────┼──────────────┤
│ pkg-001        │ Básico     │ false  │ quote-001    │ ← V1
│ pkg-002        │ Pro        │ false  │ quote-001    │ ← V1
│ pkg-003        │ Premium    │ false  │ quote-001    │ ← V1
│ pkg-004        │ Básico     │ true   │ quote-002    │ ← V2
│ pkg-005        │ Pro        │ true   │ quote-002    │ ← V2
│ pkg-006        │ Elite      │ true   │ quote-002    │ ← V2 (nuevo)
└────────────────┴────────────┴────────┴──────────────┘

Array recibido por la función:
snapshots1 = todos de BD
snapshots2 = todos de BD

Filtrado en compararCotizaciones():
paquetes1 = snapshots1.filter(s => s.quotationConfigId === 'quote-001')
          = [pkg-001, pkg-002, pkg-003]  ✅ CORRECTO

Pero espera... ¿cómo sabes cuál mostrar?

Lógica actual (INCORRECTA):
  Si paquete.activo === true → mostrar
  Si paquete.activo === false → ignorar

Resultado:
paquetes1_mostrados = [pkg-001, pkg-002, pkg-003].filter(p => p.activo)
                    = []  ← ❌ VACÍO

Comparación:
map1 = {}
map2 = { "básico": pkg-004, "pro": pkg-005, "elite": pkg-006 }

Paquetes de v2 que NO están en v1:
- "básico" → No en map1 → reportado como "NUEVO" ❌
- "pro" → No en map1 → reportado como "NUEVO" ❌
- "elite" → No en map1 → reportado como "NUEVO" ✅ (correcto por coincidencia)

RESULTADO FINAL INCORRECTO:
✗ Básico: NUEVO (debería ser SIN CAMBIOS)
✗ Pro: NUEVO (debería ser SIN CAMBIOS)
✓ Elite: NUEVO (correcto)
```

---

## 🔍 Análisis paso a paso: ¿Dónde se pierde el estado "activo"?

### Paso 1: Carga de snapshots

**Archivo: `administrador/page.tsx` línea 175**
```typescript
const loadSnapshotsCallback = async () => {
  const snapshotsDelServidor = await obtenerSnapshotsCompleto()
  setSnapshots(snapshotsDelServidor)
}
```

**Estado actual de `snapshots`:**
```
[
  { id: 'pkg-001', nombre: 'Básico', activo: false, quotationConfigId: 'quote-001' },
  { id: 'pkg-002', nombre: 'Pro', activo: false, quotationConfigId: 'quote-001' },
  { id: 'pkg-003', nombre: 'Premium', activo: false, quotationConfigId: 'quote-001' },
  { id: 'pkg-004', nombre: 'Básico', activo: true, quotationConfigId: 'quote-002' },
  { id: 'pkg-005', nombre: 'Pro', activo: true, quotationConfigId: 'quote-002' },
  { id: 'pkg-006', nombre: 'Elite', activo: true, quotationConfigId: 'quote-002' },
]
```

✅ **ESTADO:** Datos correctos en memoria

---

### Paso 2: Abrir Historial

**Archivo: `administrador/page.tsx` línea 3476**
```tsx
<Historial 
  quotations={quotations} 
  snapshots={snapshots}  ← Pasa el array completo
/>
```

**Estado en Historial:**
```typescript
interface HistorialProps {
  snapshots: PackageSnapshot[]  // TODOS los snapshots, sin filtrar
  quotations: QuotationConfig[]
}
```

⚠️ **ESTADO:** Array completo sin filtro, pero correcto

---

### Paso 3: Seleccionar cotización y ver Timeline

**Archivo: `Historial.tsx` línea 150**
```typescript
const handleShowTimeline = useCallback((quotation: QuotationConfig) => {
  setSelectedQuotation(quotation)
  setShowTimeline(true)
}, [])
```

**Pasa a CotizacionTimeline:**
```tsx
<CotizacionTimeline
  cotizacionActual={selectedQuotation}
  versiones={versionesSeleccionadas}  ← Todas las versiones del mismo número
  onComparar={handleCompararVersiones}
/>
```

✅ **ESTADO:** Timeline recibe cotizaciones correctas

---

### Paso 4: Seleccionar 2 versiones en Timeline

**Archivo: `CotizacionTimeline.tsx` línea 98-100**
```typescript
const ejecutarComparacion = useCallback(() => {
  if (versionesSeleccionadas.length === 2 && onComparar) {
    onComparar(versionesSeleccionadas[0], versionesSeleccionadas[1])
  }
}, [versionesSeleccionadas, onComparar])
```

**Disparador: `handleCompararVersiones` en Historial.tsx línea 165**
```typescript
const handleCompararVersiones = useCallback((v1: QuotationConfig, v2: QuotationConfig) => {
  const [older, newer] = v1.versionNumber < v2.versionNumber 
    ? [v1, v2] 
    : [v2, v1]
  
  setVersionesParaComparar([older, newer])
  setShowComparacion(true)
  handleCloseTimeline()
}, [handleCloseTimeline])
```

✅ **ESTADO:** Ordena correctamente v1 (antigua) y v2 (nueva)

---

### Paso 5: Pasar arrays a CotizacionComparison

**Archivo: `Historial.tsx` línea 616-622**
```tsx
<CotizacionComparison
  cotizacion1={versionesParaComparar[0]}    // Version antigua
  cotizacion2={versionesParaComparar[1]}    // Version nueva
  snapshots1={snapshots.filter(s => 
    s.quotationConfigId === versionesParaComparar[0].id
  )}  // Array de paquetes para v1
  snapshots2={snapshots.filter(s => 
    s.quotationConfigId === versionesParaComparar[1].id
  )}  // Array de paquetes para v2
  onClose={handleCloseComparacion}
/>
```

**AQUÍ OCURRE LA MAGIA (MALA):**

```typescript
// snapshots1 contiene:
snapshots1 = [
  { id: 'pkg-001', nombre: 'Básico', activo: false, quotationConfigId: 'quote-001' },
  { id: 'pkg-002', nombre: 'Pro', activo: false, quotationConfigId: 'quote-001' },
  { id: 'pkg-003', nombre: 'Premium', activo: false, quotationConfigId: 'quote-001' },
]

// snapshots2 contiene:
snapshots2 = [
  { id: 'pkg-004', nombre: 'Básico', activo: true, quotationConfigId: 'quote-002' },
  { id: 'pkg-005', nombre: 'Pro', activo: true, quotationConfigId: 'quote-002' },
  { id: 'pkg-006', nombre: 'Elite', activo: true, quotationConfigId: 'quote-002' },
]
```

✅ **ESTADO:** Arrays son correctos en contenido

⚠️ **PERO ESPERA:** Los paquetes de v1 tienen `activo: false`

---

### Paso 6: La comparación misma

**Archivo: `cotizacionComparison.ts` línea 203-234**

```typescript
export function compararCotizaciones(
  cotizacion1: QuotationConfig,
  cotizacion2: QuotationConfig,
  snapshots1: PackageSnapshot[],
  snapshots2: PackageSnapshot[]
): CotizacionComparisonResult {

  // ... código de metadata ...

  // ==================== COMPARAR PAQUETES ====================
  
  // Línea 203-204: Filtrado INCORRECTO
  const paquetes1 = snapshots1.filter(s => s.quotationConfigId === cotizacion1.id)
  const paquetes2 = snapshots2.filter(s => s.quotationConfigId === cotizacion2.id)
  
  // En este punto:
  // paquetes1 = [pkg-001, pkg-002, pkg-003]  ✅
  // paquetes2 = [pkg-004, pkg-005, pkg-006]  ✅
  
  // ✅ Filtrado correcto por quotationConfigId
  // ❌ PERO NO FILTRA POR activo
  
  // Crear mapas por nombre para facilitar comparación
  const map1 = new Map(paquetes1.map(p => [p.nombre.toLowerCase(), p]))
  const map2 = new Map(paquetes2.map(p => [p.nombre.toLowerCase(), p]))
  
  // En este punto:
  // map1 = {
  //   "básico": pkg-001 (activo: false)
  //   "pro": pkg-002 (activo: false)
  //   "premium": pkg-003 (activo: false)
  // }
  // map2 = {
  //   "básico": pkg-004 (activo: true)
  //   "pro": pkg-005 (activo: true)
  //   "elite": pkg-006 (activo: true)
  // }
  
  // ✅ ESTO ES CORRECTO
  
  // Buscar paquetes modificados o eliminados
  for (const [nombreKey, snapshot1] of map1) {
    const snapshot2 = map2.get(nombreKey)
    
    if (!snapshot2) {
      // Paquete eliminado
      packageDifferences.push({
        packageId: snapshot1.id,
        packageName: snapshot1.nombre,
        status: 'removed',  // ← Premium está aquí
        differences: [],
        oldSnapshot: snapshot1,
        newSnapshot: undefined,
      })
    } else {
      // Paquete existe en ambos - comparar campos
      const diffs = compararPaquetes(snapshot1, snapshot2)
      
      packageDifferences.push({
        packageId: snapshot1.id,
        packageName: snapshot1.nombre,
        status: diffs.length > 0 ? 'modified' : 'unchanged',
        differences: diffs,
        oldSnapshot: snapshot1,
        newSnapshot: snapshot2,
      })
    }
  }
  // En este punto, packageDifferences = [
  //   { packageName: 'Básico', status: 'unchanged', ... }
  //   { packageName: 'Pro', status: 'unchanged', ... }
  //   { packageName: 'Premium', status: 'removed', ... }
  // ]
  // ✅ ESTO ES CORRECTO
  
  // Buscar paquetes agregados
  for (const [nombreKey, snapshot2] of map2) {
    if (!map1.has(nombreKey)) {
      packageDifferences.push({
        packageId: snapshot2.id,
        packageName: snapshot2.nombre,
        status: 'added',
        differences: [],
        oldSnapshot: undefined,
        newSnapshot: snapshot2,
      })
    }
  }
  // En este punto, busca paquetes en map2 que NO están en map1:
  // - "básico": SÍ en map1 → no entra
  // - "pro": SÍ en map1 → no entra
  // - "elite": NO en map1 → ENTRA
  
  // ✅ ESTO ES CORRECTO
  
  // packageDifferences final = [
  //   { packageName: 'Básico', status: 'unchanged', ... }
  //   { packageName: 'Pro', status: 'unchanged', ... }
  //   { packageName: 'Premium', status: 'removed', ... }
  //   { packageName: 'Elite', status: 'added', ... }
  // ]
  
  // ✅ ESTO DEBERÍA SER CORRECTO
}
```

---

## 🤔 ¿ESPERA? ¿ESTÁ FUNCIONANDO CORRECTAMENTE?

**NO, tiene un error conceptual que se manifiesta en cierto contexto.**

### Cuándo funciona correctamente (caso 1):

```
Versión 1:
- Básico (activo: true cuando se crea)
- Pro (activo: true cuando se crea)
- Premium (activo: true cuando se crea)

Versión 2:
- Básico (activo: true)
- Pro (activo: true)
- Elite (activo: true)

En BD después:
V1: Básico (false), Pro (false), Premium (false)
V2: Básico (true), Pro (true), Elite (true)

Comparación recibe TODOS = [v1_básico(F), v1_pro(F), v1_premium(F), v2_básico(T), v2_pro(T), v2_elite(T)]

Filtrado:
snapshots1 (quotConfigId=v1) = [v1_básico(F), v1_pro(F), v1_premium(F)]
snapshots2 (quotConfigId=v2) = [v2_básico(T), v2_pro(T), v2_elite(T)]

map1 = {"básico": v1_básico, "pro": v1_pro, "premium": v1_premium}
map2 = {"básico": v2_básico, "pro": v2_pro, "elite": v2_elite}

Comparación:
Loop v1:
- "básico" → en map2 → comparar campos → SIN CAMBIOS ✅
- "pro" → en map2 → comparar campos → SIN CAMBIOS ✅
- "premium" → NO en map2 → ELIMINADO ✅

Loop v2:
- "básico" → en map1 → ya procesado
- "pro" → en map1 → ya procesado
- "elite" → NO en map1 → NUEVO ✅

RESULTADO: CORRECTO ✅
```

### Cuándo funciona INCORRECTAMENTE (caso 2):

```
Este es el problema que reportas:
"Versión anterior no tiene paquetes activos porque fueron migrados"

Supongamos: Sólo consultamos v2, pero el array global tiene:
snapshots = [v1_básico(F), v1_pro(F), v1_premium(F), v2_básico(T), v2_pro(T), v2_elite(T)]

PERO en la UI, cuando mostramos "paquetes configurados" de v1:
Historial.tsx línea 391:
const paquetesConfigurados = quotationSnapshots.filter(s => s.activo)
                            = []  ← VACÍO

Esto causa la ILUSIÓN de que v1 no tiene paquetes.

Pero la comparación DEBERÍA SEGUIR FUNCIONANDO porque recibe el array completo.

EXCEPT: Si alguien hace esto...
```

---

## 🚨 EL VERDADERO PROBLEMA

El verdadero problema ocurre cuando:

### Escenario problemático real:

```
Usuario en Historial ve:

Cotización #2025-001
├─ v.1 (Inactiva)
│  └─ PAQUETES CONFIGURADOS: (vacío) ← porque todos tienen activo: false
├─ v.2 (Activa)
│  └─ PAQUETES CONFIGURADOS: 3 paquetes ← porque tienen activo: true

Usuario piensa: "v.1 no tiene paquetes"
```

**Pero cuando compara v.1 → v.2:**

El array global `snapshots` TIENE los paquetes de v.1 con `activo: false`.

Entonces debería comparar correctamente...

**PERO ESPERA:**

```typescript
// En administrador/page.tsx, ¿cómo se cargan los snapshots?

const snapshots = await obtenerSnapshotsCompleto()

// ¿Y si luego se MODIFICA un snapshot de v1?

await actualizarSnapshot(pkg-001, { activo: true })
// Ahora pkg-001.activo = true
```

**Escenario terrible:**

```
1. Usuario ve v.1 con paquetes (porque los marcó como activo en algún punto)
2. Usuario luego edita v.1 y guardó cambios
3. Versión 2 se creó como copia
4. Usuario vuelve a editar v.1 y DESACTIVÓ paquetes manuallmente
5. Ahora v.1 tiene paquetes con activo: false
6. Pero v.2 se creó del estado anterior cuando eran activo: true

La comparación compara:
- v.1 paquetes: [..., activo: false]
- v.2 paquetes: [..., activo: true]

¿Qué pasa cuando se comparan?

Si en algún punto un paquete fue desactivado Y reactivado:
Los IDs son diferentes (pkg-001 vs pkg-004)

Entonces son "nuevos" aunque sean el mismo paquete
```

---

## 💡 CONCLUSIÓN REAL

**El problema NO es del filtrado por `quotationConfigId`.**

**El problema es:**

1. **Cambio de estado `activo` sin recarga:** Si un paquete cambia `activo` de true → false → true, crea nuevos registros en BD
2. **Comparación por nombre:** La función compara por `nombre` (string), no por ID
3. **Desincronización de estado:** La UI muestra "paquetes configurados" (filtrados) pero la comparación usa los registros crudos

**Esto es más profundo:**

```
El verdadero problema es:
- Cuando se marca un paquete como activo: false
- Luego se marca como activo: true
- Se crea un NUEVO registro en la BD (porque updateSnapshot lo hace así)
- Ahora hay 2 registros del "mismo" paquete
- La comparación ve 2 paquetes con igual nombre pero diferente ID
- Decide que uno es "nuevo"
```

---

## 🎯 SIGUIENTE PASO

Necesito verificar:

1. **¿Cómo actualiza `actualizarSnapshot` el campo `activo`?**
   - ¿Lo actualiza IN-PLACE?
   - ¿O crea un nuevo registro?

2. **¿Hay duplicación de registros en BD?**
   - `SELECT COUNT(*) FROM PackageSnapshot WHERE nombre = 'Básico' AND quotationConfigId = 'quote-001'`

3. **¿El cambio de `activo` dispara migración/duplicación?**

Esto aclarará si el problema es:
- A) Filtrado incorrecto por `activo` (false positivos)
- B) Duplicación de paquetes en BD (false positives por ID diferente)
- C) Ambos

