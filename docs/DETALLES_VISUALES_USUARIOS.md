# 👥 INTEGRACIÓN CON MODAL "NUEVO/EDITAR USUARIO"

## 📋 CONTEXTO ACTUAL

En el modal de **Nuevo Usuario / Editar Usuario** (en Gestión de Usuarios), existe un dropdown llamado **"Cotización Asignada"** que permite seleccionar una cotización para asignar a un usuario.

### ANTES (Comportamiento Actual):

```
┌───────────────────────────────────────────────────┐
│ NUEVO USUARIO                                     │
├───────────────────────────────────────────────────┤
│                                                    │
│ Nombre *                                          │
│ [                                               ] │
│                                                    │
│ Email *                                           │
│ [                                               ] │
│                                                    │
│ Cotización Asignada                               │
│ ┌─────────────────────────────────────────────┐  │
│ │ ▼ Seleccionar cotización                    │  │
│ ├─────────────────────────────────────────────┤  │
│ │ • Mercado Mi Casita - CZ0001.251628V5      │  │
│ │ • Mercado Mi Casita - CZ0001.251628V6      │  │ ← ❌ Muestra TODAS
│ │ • Urbanísima Constructora - CZ0002.252153V4│  │    las versiones
│ │ • Urbanísima Constructora - CZ0002.252153V5│  │    (no agrupadas)
│ │ • Mercado Mi Casita - CZ0001.251628V4      │  │
│ │ • Mercado Mi Casita - CZ0001.251628V7      │  │
│ │ • Urbanísima Constructora - CZ0002.252153V3│  │
│ │ Sin Cotización                               │  │
│ └─────────────────────────────────────────────┘  │
│                                                    │
│ [Cancelar]                         [Guardar]     │
│                                                    │
└───────────────────────────────────────────────────┘
```

**Problemas Identificados:**
1. Muestra TODAS las versiones como opciones separadas
2. No está agrupado por cotización base
3. Incluye versiones que están en "CARGADA" (en edición)
4. No es claro cuál es la "última" versión

---

## ✅ DESPUÉS: CON TRIESTADO

### A. FILTRO POR ESTADO

Solo mostrar cotizaciones con estado **ACTIVA**.

```typescript
// En userDataStore.ts:
filteredQuotations = quotations.filter(q => q.estado === 'ACTIVA')
```

### B. AGRUPAMIENTO POR VERSIÓN (YA EXISTE)

El código actual en `userDataStore.ts` ya agrupa por número base y muestra la **última versión**:

```typescript
// Mostrar solo la última versión de cada grupo
const displayLabel = `${q.empresa} - ${group.numeroBase} (${versionesCount} versiones - v${latestVersion})`
```

### C. VISUAL DEL DROPDOWN FILTRADO

```
┌───────────────────────────────────────────────────────────────────┐
│ NUEVO USUARIO                                                      │
├───────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Nombre *                                                           │
│ [                                                                 ]│
│                                                                     │
│ Email *                                                            │
│ [                                                                 ]│
│                                                                     │
│ Cotización Asignada                                                │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ ▼ Seleccionar cotización                                     │  │
│ ├──────────────────────────────────────────────────────────────┤  │
│ │ • ✅ Mercado Mi Casita - CZ0001.251628 (5 v. - v6)          │  │ ← AGRUPADO
│ │ • ✅ Urbanísima Constructora - CZ0002.252153 (2 v. - v5)    │  │ ← Solo ACTIVAS
│ │ • ✅ Otro Cliente - CZ0003.254789 (1 v. - v1)              │  │
│ │                                                              │  │
│ │ ℹ️ Las cotizaciones en edición (CARGADA) no se muestran     │  │ ← Info text
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ [Cancelar]                                      [Guardar]        │
│                                                                     │
└───────────────────────────────────────────────────────────────────┘
```

**Cambios:**
- ✅ Badge "ACTIVA" en cada opción
- ✅ Agrupadas por número base
- ✅ Muestra solo última versión (v6, v5, v1)
- ✅ Muestra cantidad de versiones entre paréntesis
- ✅ Texto informativo: "Las cotizaciones en edición (CARGADA) no se muestran"
- ✅ NO aparecen cotizaciones INACTIVAS

---

## 🎯 CASOS DE USO

### Caso 1: Usuario intenta asignar una cotización CARGADA

**Escenario:** El usuario trata de seleccionar una cotización que está en estado CARGADA

```
1. El usuario abre "Nuevo Usuario"
2. Hace clic en dropdown "Cotización Asignada"
3. Ve solo 2 cotizaciones (las ACTIVAS)
4. NO ve la que estaba CARGADA
5. Si intenta cargar desde DevTools:
   → Toast ERROR: "No puedes asignar una cotización en edición"
   → Auditoría registra: "Intento de asignar CARGADA (rechazado)"
```

### Caso 2: Publicar una cotización y que aparezca en el dropdown

**Escenario:** El admin está editando una cotización, la publica y vuelve al usuario

```
1. Admin edita cotización → Estado CARGADA
2. Admin hace clic [PUBLICAR]
3. Estado cambia a ACTIVA
4. Toast: "Cotización publicada - Ya disponible para asignar"
5. Si el admin abre dropdown de usuario → Aparece la nueva cotización
6. Auditoría registra: QUOTATION_STATE_CHANGED (CARGADA → ACTIVA)
```

### Caso 3: Archivar una cotización que ya está asignada

**Escenario:** El admin archiva una cotización que un usuario tiene asignada

```
1. Usuario A tiene asignada: "Mercado Mi Casita - v6"
2. Admin archiva esa cotización → Estado INACTIVA
3. Toast: "Cotización archivada - Ya no será visible para nuevas asignaciones"
4. Usuario A SIGUE teniendo la cotización asignada (legacy data)
5. Pero si admin edita ese usuario, el dropdown NO la muestra
6. Admin puede cambiarla manualmente a otra
7. Auditoría registra: QUOTATION_STATE_CHANGED (ACTIVA → INACTIVA)
```

---

## 📊 ESTRUCTURA DEL DROPDOWN CON TRIESTADO

### Layout HTML/Tailwind del Dropdown:

```tsx
// En UserModalGlobal.tsx donde se renderiza el dropdown:

<DropdownSelect
  id="cotizacionAsignada"
  value={selectedCotization}
  onChange={(val) => setSelectedCotization(val)}
  options={[
    { value: '', label: 'Sin Cotización' },
    ...groupedQuotations
      .filter(group => group.latestVersion.estado === 'ACTIVA')  // ← FILTRO
      .map(group => ({
        value: group.latestVersion.id,
        label: `✅ ${group.empresaNombre} - ${group.numeroBase} (${group.versions.length} v. - v${latestVersion.versionNumber})`,
        // Si queremos, podríamos agregar más info:
        description: `Última actualización: ${new Date(group.latestVersion.updatedAt).toLocaleDateString()}`
      }))
  ]}
  placeholder="Seleccionar cotización activa..."
/>

{/* Mensaje informativo bajo el dropdown */}
<p className="text-xs text-gh-text-muted mt-2">
  💡 Solo se muestran cotizaciones ACTIVAS. 
  <br />
  Las cotizaciones en edición (CARGADA) o archivadas (INACTIVA) no aparecen aquí.
</p>
```

---

## 🔒 PROTECCIÓN EN BACKEND

### API `/api/users` (POST / PUT) - Validación de Cotización

```typescript
// En el endpoint de crear/actualizar usuario:

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { cotizacionAsignadaId } = body
  
  // Si se intenta asignar una cotización, validar que sea ACTIVA
  if (cotizacionAsignadaId) {
    const quotation = await prisma.quotationConfig.findUnique({
      where: { id: cotizacionAsignadaId },
      select: { estado: true, numero: true, empresa: true }
    })
    
    if (!quotation) {
      return NextResponse.json(
        { error: 'Cotización no encontrada' },
        { status: 404 }
      )
    }
    
    // ⚠️ VALIDACIÓN: Solo ACTIVA
    if (quotation.estado !== 'ACTIVA') {
      // Registrar intento en auditoría
      await createAuditLog({
        action: 'QUOTATION_ASSIGNMENT_BLOCKED',
        entityType: 'USER',
        entityId: userId,
        details: {
          quotationId: cotizacionAsignadaId,
          quotationState: quotation.estado,
          reason: `Intento de asignar cotización ${quotation.estado}`
        }
      })
      
      return NextResponse.json(
        { 
          error: `No puedes asignar una cotización ${quotation.estado}. Solo se pueden asignar cotizaciones ACTIVAS.`
        },
        { status: 400 }
      )
    }
  }
  
  // Resto de la lógica...
}
```

---

## 🎨 VISUAL COMPLETO: Modal antes y después

### ANTES:
```
┌─────────────────────────────────────────────────┐
│ EDITAR USUARIO                                  │
├─────────────────────────────────────────────────┤
│ Nombre: Juan Pérez                              │
│ Email: juan@example.com                         │
│                                                  │
│ Cotización Asignada:                            │
│ [▼ Mercado - CZ0001.251628V5           ]        │ ← Muestra versiones
│                                                  │   como textos
│ [Cancelar]                   [Guardar]         │
└─────────────────────────────────────────────────┘
```

### DESPUÉS:
```
┌──────────────────────────────────────────────────────┐
│ EDITAR USUARIO                                       │
├──────────────────────────────────────────────────────┤
│ Nombre: Juan Pérez                                   │
│ Email: juan@example.com                              │
│                                                       │
│ Cotización Asignada:                                 │
│ [▼ ✅ Mercado - CZ0001.251628 (5 v. - v6) ]         │ ← Agrupado
│                                                       │   Solo ACTIVA
│ 💡 Solo se muestran cotizaciones ACTIVAS             │
│                                                       │
│ [Cancelar]                       [Guardar]          │
└──────────────────────────────────────────────────────┘
```

---

## 📱 TABLA COMPARATIVA: ESTADOS PERMITIDOS EN DROPDOWN

| Estado | ¿Mostrar en Dropdown? | Razón |
|--------|----------------------|-------|
| **CARGADA** | ❌ NO | Está en edición, no debería asignarse aún |
| **ACTIVA** | ✅ SÍ | Está publicada y lista para usar |
| **INACTIVA** | ❌ NO | Está archivada, no es válida |

---

## 🔄 FLUJO DE CAMBIO DE ESTADO - IMPACTO EN USUARIO

```
Scenario: Admin edita cotización V5 → V6 (Estado: CARGADA)
          Usuario tiene asignada V5 (ACTIVA)

┌─────────────────────────────────────────────────────────┐
│ 1. Estado inicial:                                       │
│    Usuario: Juan → Asignada: CZ0001.251628V5 (ACTIVA)   │
│                                                          │
│ 2. Admin crea V6:                                        │
│    V6 creada con estado: CARGADA                        │
│    Juan sigue con V5 (no se toca)                       │
│                                                          │
│ 3. Admin publica V6:                                     │
│    V6 cambia a: ACTIVA                                  │
│    Toast: "Cotización publicada"                        │
│    Auditoría: QUOTATION_STATE_CHANGED (CARGADA→ACTIVA)  │
│                                                          │
│ 4. Juan sigue con V5:                                    │
│    No se cambió automáticamente                         │
│    Admin puede actualizar si quiere                     │
│                                                          │
│ 5. Si admin abre Gestión Usuarios:                       │
│    Dropdown muestra: V5 (ACTIVA) ✅ y V6 (ACTIVA) ✅   │
│    Puede elegir cambiar a V6 si quiere                 │
└─────────────────────────────────────────────────────────┘
```

---

Ahora tienes la visión **completa** de cómo se vería todo integrado. ¿Preguntas adicionales antes de empezar la implementación?
