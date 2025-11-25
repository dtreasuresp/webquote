# 🎯 PHASE 11: VALIDACIÓN AVANZADA DE TABs

**Fecha**: 24 de noviembre de 2025  
**Status**: ✅ COMPLETADA  
**Objetivo**: Implementar sistema de validación avanzada con multi-field validation, cross-tab dependencies y validación condicional

---

## 📋 RESUMEN EJECUTIVO

**Phase 11** proporciona un **sistema integral de validación** para el admin panel con:

- ✅ Validadores avanzados multi-field
- ✅ Dependencias entre TABs
- ✅ Validación condicional
- ✅ Componentes de feedback visual
- ✅ Validación en tiempo real
- ✅ Hooks reutilizables

**Líneas de código**: 2,050 líneas  
**Archivos creados**: 4 archivos principales + actualizaciones

---

## 🏗️ ARQUITECTURA

### Estructura de Archivos

```
src/features/admin/
├── utils/
│   ├── advancedValidators.ts          [570 líneas] Validadores complejos
│   ├── validationRules.ts             [300 líneas] Reglas configurables
│   └── index.ts                       [Actualizado] Exports
│
├── components/
│   ├── ValidationFeedback.tsx         [400 líneas] Componentes feedback
│   ├── TabValidator.tsx               [450 líneas] Validator wrapper + hooks
│   └── index.ts                       [Actualizado] Exports
```

### Capas de Validación

```
┌─────────────────────────────────┐
│   AdminPage (Integración)       │
├─────────────────────────────────┤
│   ValidationFeedback            │  ← Mostrar errores
│   ValidationStatusBar           │  ← Estado general
├─────────────────────────────────┤
│   TabValidator                  │  ← Por TAB
│   ValidatedInput                │  ← Por campo
├─────────────────────────────────┤
│   advancedValidators.ts         │  ← Lógica compleja
│   validationRules.ts            │  ← Reglas configurables
└─────────────────────────────────┘
```

---

## 🎯 VALIDADORES AVANZADOS

### `advancedValidators.ts` - Tipos y Funciones

#### Tipos Principales

```typescript
interface AdvancedValidationResult {
  valido: boolean
  errores: string[]
  advertencias: string[]
  erroresPorTab: Record<string, string[]>
  erroresPorCampo: Record<string, string[]>
  dependenciasRotas: string[]
}

interface ValidationContext {
  config: QuotationConfig
  packages?: Package[]
  servicios?: Servicio[]
  otrosServicios?: OtroServicio[]
  forceStrict?: boolean
}
```

#### Validadores Multi-Field

| Función | Propósito | TAB |
|---------|----------|-----|
| `validarConsistenciaPrecios()` | Valida coherencia de precios y descuentos | Presupuesto |
| `validarConsistenciaFechas()` | Valida fechas, vencimiento, vigencia | Cotización |
| `validarConsistenciaCliente()` | Valida datos cliente completos | Cliente |
| `validarConsistenciaProveedor()` | Valida datos proveedor completos | Proveedor |
| `validarConsistenciaHero()` | Valida títulos y subtítulos | Cotización |

#### Validadores de Dependencias

```typescript
validarDependenciasTab(context)
// Si presupuesto > 0 → debe haber paquete
// Si cliente → debe haber contacto
// Si proveedor → debe haber contacto
```

#### Validadores Condicionales

```typescript
validarReglasCondicionales(context)
// Si isGlobal → datos obligatorios
// Si activo → presupuesto > 0
```

#### Validación Integral

```typescript
// Valida TODA la configuración
validarConfiguracionCompleta(context)
  → AdvancedValidationResult

// Más permisivo (para borrador)
validarGuardable(context)
  → AdvancedValidationResult

// Más estricto (para publicación)
validarPublicable(context)
  → AdvancedValidationResult
```

#### Utilidades

```typescript
obtenerResumenErrores(result)        // "3 TABs con errores"
obtenerTabsConErrores(result)        // ['cliente', 'proveedor']
tieneErroresPorTab(result, 'tab')    // boolean
obtenerErroresPorTab(result, 'tab')  // string[]
```

---

## 📋 REGLAS DE VALIDACIÓN

### `validationRules.ts`

Define reglas configurables y extensibles:

```typescript
interface ValidationRule {
  id: string                    // 'cot-numero'
  nombre: string               // 'Número de Cotización'
  descripcion: string          // 'Número único y válido'
  tab: string                  // 'cotizacion'
  tipo: 'requerido'|'formato'|'rango'|'condicional'|'cross-tab'
  campo?: string               // 'numero'
  validar: (valor, contexto) => boolean
  mensaje: string              // Error message
  severidad: 'error'|'advertencia'|'info'
}
```

### Reglas por TAB

#### COTIZACIÓN (5 reglas)

```typescript
'cot-numero'           → Número requerido
'cot-fechas'           → Emisión ≤ Vencimiento
'cot-vigencia'         → Vigencia > 0
'cot-hero-main'        → Título >= 5 chars
'cot-hero-sub'         → Subtítulo >= 5 chars
```

#### CLIENTE (6 reglas)

```typescript
'cli-empresa'          → Empresa requerida
'cli-sector'           → Sector requerido
'cli-ubicacion'        → Ubicación requerida
'cli-contacto'         → Email o WhatsApp
'cli-email-formato'    → Formato email válido
'cli-whatsapp-formato' → Formato WhatsApp válido
```

#### PROVEEDOR (6 reglas)

```typescript
'prov-profesional'     → Profesional requerido
'prov-empresa'         → Empresa requerida
'prov-ubicacion'       → Ubicación requerida
'prov-contacto'        → Email o WhatsApp
'prov-email-formato'   → Formato email válido
'prov-whatsapp-formato'→ Formato WhatsApp válido
```

#### PRESUPUESTO (2 reglas)

```typescript
'pres-valor'           → Presupuesto > 0
'pres-moneda'          → Moneda si presupuesto
```

#### GLOBALES (2 reglas)

```typescript
'global-version'       → Versión >= 1
'global-activo'        → Si activo → presupuesto > 0
```

### Funciones de Reglas

```typescript
obtenerReglasPorTab(tab)           // Todas las reglas de un TAB
obtenerReglasPorSeveridad(sev)     // Por error/advertencia/info
obtenerReglasError()               // Todas las críticas
obtenerReglasAdvertencia()         // Todas las advertencias
```

---

## 🎨 COMPONENTES DE VALIDACIÓN

### `ValidationFeedback.tsx`

Componentes para mostrar errores en UI.

#### `<ValidationFeedback />`

```typescript
<ValidationFeedback
  result={validationResult}
  mostrarAdvertencias={true}
  mostrarInfo={false}
  posicion="top"
  expandible={true}
  compacto={false}
  onDismiss={() => {}}
/>
```

**Features**:
- ✓ Errores críticos destacados
- ✓ Advertencias colapsables
- ✓ Dependencias rotas resaltadas
- ✓ Animación Framer Motion
- ✓ Máx 5 errores visibles + contador

#### `<TabValidationBadge />`

```typescript
<TabValidationBadge
  tabName="cliente"
  errores={['Email inválido', 'Empresa requerida']}
  tipoTab="cliente"
/>
```

**Muestra**:
- ✓ Badge verde si OK
- ✓ Badge roja si errores con contador

#### `<ValidationCard />`

```typescript
<ValidationCard
  result={validationResult}
  titulo="Validación"
  mostrarDetalles={true}
/>
```

**Features**:
- ✓ Resumen de validación
- ✓ Errores por TAB
- ✓ Toggle "Ver todos"
- ✓ Íconos de estado

#### `<ValidationIndicator />`

```typescript
<ValidationIndicator
  result={validationResult}
  tamaño="medio"
/>
```

**Muestra**: Indicador simple de estado (✓ o ✗)

---

### `TabValidator.tsx`

Componentes y hooks para validación por TAB.

#### Hook: `useTabValidation()`

```typescript
const { resultado, loading, validar, valido, errores } = useTabValidation(
  'cliente',
  context
)

// Métodos
validar()  // Ejecutar validación
```

#### `<TabValidator />`

```typescript
<TabValidator
  tab="cliente"
  context={validationContext}
  onValidationChange={(result) => {}}
  validarAlMontarse={true}
>
  {({ valido, errores }) => (
    <div>
      {/* Contenido del TAB */}
    </div>
  )}
</TabValidator>
```

**Features**:
- ✓ Validación al montar
- ✓ Encabezado con icono de estado
- ✓ Lista de errores automática
- ✓ Estilos condicionales

#### `<ValidatedInput />`

```typescript
<ValidatedInput
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  advertencia={emailWarning}
  requerido={true}
  placeholder="ejemplo@correo.com"
  regla={emailRule}
/>
```

**Features**:
- ✓ Bordes de color según estado
- ✓ Iconos de error/advertencia
- ✓ Descripción de regla
- ✓ aria-invalid para accesibilidad

#### `<FieldValidationFeedback />`

```typescript
<FieldValidationFeedback
  campo="emailCliente"
  errores={['Formato inválido']}
  advertencias={['Email no verificado']}
/>
```

#### `<ValidationStatusBar />`

```typescript
<ValidationStatusBar
  contexto={context}
  mostrarTabs={['cotizacion', 'cliente', 'proveedor']}
/>
```

**Features**:
- ✓ Estado de todos los TABs
- ✓ Chips con contadores
- ✓ Actualización en tiempo real

---

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Validación Completa

```typescript
import {
  validarConfiguracionCompleta,
  type ValidationContext,
  type AdvancedValidationResult,
} from '@/features/admin/utils'

const context: ValidationContext = {
  config: {
    empresa: 'Acme Corp',
    sector: 'Tecnología',
    // ... resto de config
  },
  packages: packages,
  forceStrict: false,
}

const resultado = validarConfiguracionCompleta(context)

if (resultado.valido) {
  console.log('✓ Configuración válida')
} else {
  console.log('✗ Errores:', resultado.errores)
  console.log('Por TAB:', resultado.erroresPorTab)
}
```

### Ejemplo 2: Validación en TAB

```typescript
import { TabValidator } from '@/features/admin/components'

<TabValidator
  tab="cliente"
  context={context}
  onValidationChange={(result) => {
    if (!result.valido) {
      console.log('Errores en cliente:', result.erroresPorTab['cliente'])
    }
  }}
>
  {({ valido, errores }) => (
    <div>
      <input value={empresa} onChange={handleChange} />
      {!valido && <p>Hay errores en este TAB</p>}
    </div>
  )}
</TabValidator>
```

### Ejemplo 3: Hook personalizado

```typescript
const { resultado, validar, valido } = useTabValidation('proveedor', context)

useEffect(() => {
  validar()
}, [context])

if (!valido) {
  return <ValidationCard result={resultado} />
}
```

### Ejemplo 4: Input validado

```typescript
<ValidatedInput
  label="Teléfono WhatsApp"
  value={whatsapp}
  onChange={(e) => setWhatsapp(e.target.value)}
  error={
    validarWhatsApp(whatsapp)
      ? undefined
      : 'Formato inválido: +XXX XXXXXXXXX'
  }
  placeholder="+34 612345678"
  requerido={true}
/>
```

---

## 🔗 INTEGRACIÓN CON AdminPage.tsx

### Paso 1: Importar componentes

```typescript
import {
  ValidationFeedback,
  ValidationStatusBar,
  TabValidator,
  ValidatedInput,
} from '@/features/admin/components'
import {
  validarConfiguracionCompleta,
  type AdvancedValidationResult,
} from '@/features/admin/utils'
```

### Paso 2: Agregar estado

```typescript
const [validationResult, setValidationResult] = useState<
  AdvancedValidationResult | null
>(null)

const validarTodo = () => {
  const result = validarConfiguracionCompleta({
    config: adminState.config,
    packages: adminState.packages,
    forceStrict: false,
  })
  setValidationResult(result)
}
```

### Paso 3: Usar en UI

```typescript
return (
  <div>
    {/* Status bar en top */}
    <ValidationStatusBar contexto={context} />

    {/* Feedback de errores */}
    <ValidationFeedback
      result={validationResult}
      onDismiss={() => setValidationResult(null)}
    />

    {/* TABs con validación */}
    <Tabs>
      <Tab label="Cliente">
        <TabValidator tab="cliente" context={context}>
          {({ valido, errores }) => (
            <>
              <input value={empresa} />
              {/* ... */}
            </>
          )}
        </TabValidator>
      </Tab>
    </Tabs>

    {/* Botones con validación */}
    <Button
      onClick={() => {
        validarTodo()
        if (validationResult?.valido) {
          guardar()
        }
      }}
    >
      Guardar
    </Button>
  </div>
)
```

---

## 🧪 PATRONES DE TESTING

### Test unitario de validador

```typescript
import { validarConsistenciaCliente } from '@/features/admin/utils'

describe('validarConsistenciaCliente', () => {
  it('debe fallar si empresa vacía', () => {
    const errores = validarConsistenciaCliente({
      config: { empresa: '', ...otros },
    })
    expect(errores).toContain('Nombre de empresa cliente requerido')
  })

  it('debe fallar si sin contacto', () => {
    const errores = validarConsistenciaCliente({
      config: {
        empresa: 'Acme',
        emailCliente: '',
        whatsappCliente: '',
        ...otros
      },
    })
    expect(errores).toContain('Cliente debe tener al menos email o WhatsApp')
  })

  it('debe pasar si datos válidos', () => {
    const errores = validarConsistenciaCliente({
      config: {
        empresa: 'Acme',
        sector: 'Tech',
        ubicacion: 'Madrid',
        emailCliente: 'contact@acme.com',
        ...otros
      },
    })
    expect(errores).toHaveLength(0)
  })
})
```

### Test de componente

```typescript
import { render, screen } from '@testing-library/react'
import { ValidationFeedback } from '@/features/admin/components'

describe('<ValidationFeedback />', () => {
  it('debe mostrar errores', () => {
    const result = {
      valido: false,
      errores: ['Error 1', 'Error 2'],
      advertencias: [],
      erroresPorTab: {},
      erroresPorCampo: {},
      dependenciasRotas: [],
    }

    render(<ValidationFeedback result={result} />)
    expect(screen.getByText('Errores encontrados')).toBeInTheDocument()
    expect(screen.getByText('Error 1')).toBeInTheDocument()
  })

  it('no debe mostrar si válido', () => {
    const result = {
      valido: true,
      errores: [],
      advertencias: [],
      erroresPorTab: {},
      erroresPorCampo: {},
      dependenciasRotas: [],
    }

    const { container } = render(<ValidationFeedback result={result} />)
    expect(container.firstChild).toBeNull()
  })
})
```

---

## 🐛 TROUBLESHOOTING

### Problema: Validación no se ejecuta

**Solución**: Verificar que `validarAlMontarse={true}` en `<TabValidator />`

```typescript
<TabValidator
  validarAlMontarse={true}  // ← Verificar esto
  context={context}
>
  ...
</TabValidator>
```

### Problema: Errores duplicados

**Solución**: No llamar múltiples veces `validar()`

```typescript
const { validar } = useTabValidation('cliente', context)

useEffect(() => {
  validar() // Una sola vez
}, [])
```

### Problema: Componentes no se actualizan

**Solución**: Asegurar que context cambia correctamente

```typescript
const context = {
  config: adminState.config,  // ← Debe cambiar
  packages: adminState.packages,
}
```

---

## 📚 REFERENCIAS

### Archivos creados
- ✅ `advancedValidators.ts` - 570 líneas
- ✅ `validationRules.ts` - 300 líneas
- ✅ `ValidationFeedback.tsx` - 400 líneas
- ✅ `TabValidator.tsx` - 450 líneas

### Archivos actualizados
- ✅ `utils/index.ts` - Exports
- ✅ `components/index.ts` - Exports

### Total Phase 11
- **Líneas de código**: 2,050+
- **Componentes**: 7
- **Hooks**: 1
- **Tipos**: 15+
- **Funciones**: 40+

---

## ✅ CHECKLIST DE COMPLETITUD

- [x] Validadores avanzados implementados
- [x] Reglas configurables creadas
- [x] Componentes de feedback creados
- [x] Hooks reutilizables
- [x] Exports en index.ts
- [x] Documentación completa
- [x] Ejemplos de uso
- [x] Patrones de testing

---

## 🚀 PRÓXIMOS PASOS

**Phase 12**: Integración de Snapshots Mejorada
- Timeline visual de snapshots
- Comparación entre versiones
- Rollback functionality
- Snapshot diff viewer

---

*Phase 11 completada exitosamente*  
*24 de noviembre de 2025*
