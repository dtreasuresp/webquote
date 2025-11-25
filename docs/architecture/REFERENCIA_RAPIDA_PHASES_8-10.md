# 🔍 REFERENCIA RÁPIDA - PHASES 8-10

## ⚡ Imports Esenciales

### Componentes
```tsx
import { AdminHeader, DialogoGenerico, Button, Badge, IconButton } 
  from '@/features/admin/components'
```

### Utilities
```tsx
// Validators
import { validarEmail, validarWhatsApp, validarFechas } 
  from '@/features/admin/utils'

// Formatters
import { formatearFechaLarga, formatearMonedaUSD, truncar } 
  from '@/features/admin/utils'

// Calculations
import { calcularFechaVencimiento, calcularPrecioAnual } 
  from '@/features/admin/utils'

// Generators
import { generarUUID, generarNumeroSecuencial } 
  from '@/features/admin/utils'
```

### Hooks
```tsx
import { useAdminState } from '@/features/admin/hooks'
```

---

## 🛠️ Snippets Comunes

### AdminHeader Básico
```tsx
<AdminHeader
  onSave={handleSave}
  onPdfExport={handlePdfExport}
  onNewQuote={handleNewQuote}
  onSettings={handleSettings}
  isSaving={isSaving}
  isPdfGenerating={isPdfGenerating}
  hasChanges={hasChanges}
  quoteName="CZ-2025-001"
/>
```

### DialogoGenerico
```tsx
const [showDialog, setShowDialog] = useState(false)
const [dialogConfig, setDialogConfig] = useState({ tipo: 'info' })

<DialogoGenerico
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  title="Título"
  description="Descripción"
  type={dialogConfig.tipo}
  size="md"
/>
```

### Button Variantes
```tsx
<Button variant="primary">Guardar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="danger">Eliminar</Button>
<Button variant="ghost" size="sm">Link</Button>
```

### Validación Email
```tsx
const isValid = validarEmail('user@example.com')
if (!isValid) {
  setDialogConfig({ tipo: 'error', titulo: 'Email inválido' })
}
```

### Formateo Moneda
```tsx
const formatted = formatearMonedaUSD(1500)
console.log(formatted) // "$1,500.00"
```

### Cálculo Vencimiento
```tsx
const fechaVencimiento = calcularFechaVencimiento(new Date(), 30)
console.log(fechaVencimiento) // Date 30 días adelante
```

### Generación UUID
```tsx
const id = generarUUID()
const shortId = generarIDCorto()
const sequential = generarNumeroSecuencial() // "CZ-2025-001"
```

---

## 📊 Componentes por Caso de Uso

### Necesito un botón...
```tsx
// Primario (azul, llamado a acción)
<Button variant="primary">Guardar</Button>

// Secundario (gris, acción normal)
<Button variant="secondary">Cancelar</Button>

// Peligro (rojo, acción destructiva)
<Button variant="danger">Eliminar</Button>

// Ghost (transparente, links)
<Button variant="ghost">Más info</Button>

// Pequeño botón con ícono
<IconButton variant="primary" size="sm" icon={<FaSave />} />
```

### Necesito una etiqueta...
```tsx
// Status
<Badge variant="success">Activo</Badge>
<Badge variant="error">Inactivo</Badge>
<Badge variant="warning">Pendiente</Badge>

// Info
<Badge variant="info">Nuevo</Badge>
<Badge variant="primary">Featured</Badge>
```

### Necesito un modal...
```tsx
// Confirmación
<DialogoGenerico
  type="warning"
  title="¿Está seguro?"
  description="Esta acción no se puede deshacer"
/>

// Error
<DialogoGenerico
  type="error"
  title="Error"
  description="Ocurrió un error al guardar"
/>

// Éxito
<DialogoGenerico
  type="success"
  title="¡Éxito!"
  description="Datos guardados correctamente"
/>
```

---

## 🔗 Validators por Tipo

### Email
```tsx
validarEmail('user@example.com') → true
validarEmail('invalid.email') → false
```

### WhatsApp
```tsx
validarWhatsApp('+573001234567') → true
validarWhatsApp('3001234567') → true
```

### Fechas
```tsx
validarFechas('2025-01-01', '2025-12-31') → true
validarFechas('2025-12-31', '2025-01-01') → false // vencimiento antes de emisión
```

### Tabs
```tsx
validarTabCotizacion(config) → { valido: true, errores: [] }
validarTabOferta(config) → { valido: false, errores: ['Campo X requerido'] }
```

---

## 📐 Formatters por Tipo

### Fechas
```tsx
formatearFechaLarga(new Date()) // "20 de noviembre de 2025"
formatearFechaCorta(new Date()) // "20/11/2025"
formatearFechaISO(new Date()) // "2025-11-20"
```

### Moneda
```tsx
formatearMonedaUSD(1500) // "$1,500.00"
formatearMonedaCOP(1500) // "$1.500"
```

### Números
```tsx
redondear(1.2345, 2) // 1.23
formatearNumero(1500) // "1,500"
formatearPorcentaje(0.1234) // "12.34%"
```

### Strings
```tsx
capitalize('hola mundo') // "Hola mundo"
slugify('Hola Mundo') // "hola-mundo"
truncar('texto muy largo', 10) // "texto mé..."
```

### Arrays
```tsx
deduplicar([1,2,2,3]) // [1,2,3]
ordenarPor(array, 'fecha', true) // Descendente
groupBy(array, 'tipo') // Agrupado por propiedad
```

---

## 🧮 Calculations Comunes

### Fechas
```tsx
calcularFechaVencimiento(new Date(), 30) // 30 días adelante
calcularDiasRestantes(fechaVencimiento) // Número de días
calcularFechaFutura(new Date(), 6, 'months') // 6 meses adelante
```

### Precios
```tsx
calcularPrecioAnual(desarrollo, hosting, dominio)
calcularConDescuento(precio, descuentoPorcentaje)
calcularConIVA(precio, porcentajeIVA)
calcularROI(inversion, ganancia)
```

### Servicios
```tsx
calcularInversionTotal(servicios, descuento)
calcularMensualidad(anual)
calcularAnualidad(mensual)
```

### Snapshots
```tsx
obtenerSnapshotsActivos(array) // Filtrados por fecha
calcularRangoSnapshots(array, 'precio') // Min/Max
estadisticasSnapshots(array) // {total, promedio, mediana}
```

---

## 🎲 Generators Comunes

### IDs
```tsx
generarUUID() // "550e8400-e29b-41d4-a716-446655440000"
generarIDCorto() // "abc123xyz"
generarIDNumerico() // "12345678"
```

### Números
```tsx
generarNumeroAleatorio(1, 100) // Entre 1-100
generarNumeroDecimal(1, 100, 2) // 2 decimales
generarNumeroSecuencial() // "CZ-2025-001"
```

### Configuraciones
```tsx
generarConfiguracionCotizacionInicial() // Config template
generarServicioBaseInicial() // Servicio template
```

### Datos de Prueba
```tsx
generarCotizacionEjemplo() // Una cotización
generarCotizacionesEjemplo(10) // 10 cotizaciones
```

### Opciones
```tsx
generarOpcionesSector() // Array de sectores
generarOpcionesTipoPaquete() // Array de tipos
generarOpcionesNivelProfesional() // Array de niveles
generarOpcionesDuracion() // Array de duraciones
```

### Colores y Estilos
```tsx
generarColorAleatorio() // "#FF5733"
generarColorPorEstado('activo') // Verde
generarClasePorEstado('error') // Clase error
```

---

## 🎨 Tailwind Classes Personalizadas

```tsx
// Colores corporativos
className="text-gh-accent-blue"    // Azul principal
className="bg-gh-accent-green"     // Verde secundario
className="border-gh-danger"       // Rojo peligro
className="bg-gh-bg-overlay"       // Overlay gris

// Componentes comunes
className="sticky top-0 z-40"      // Header sticky
className="flex gap-4 items-center" // Layout flex
className="rounded-lg shadow-md"    // Estilos
className="px-6 py-3"              // Padding
className="hover:scale-105"        // Animación
```

---

## 🔄 Flujo AdminPage

```
AdminPage Renders
  ├─ AdminHeader (sticky top)
  │   └─ Botones: Save, PDF, New, Settings
  ├─ Main Content
  │   ├─ ServiciosBaseSection
  │   ├─ PaqueteSection
  │   ├─ ServiciosOpcionalesSection
  │   ├─ DescuentosSection
  │   └─ SnapshotsTableSection
  └─ DialogoGenerico Modal

Usuario interactúa
  ├─ Hace cambios → hasChanges = true
  ├─ Clica Save → handleSave
  │   └─ isSaving = true
  │   └─ localStorage.setItem
  │   └─ refreshSnapshots()
  │   └─ Muestra DialogoGenerico éxito
  │   └─ isSaving = false
  ├─ Clica PDF → handlePdfExport
  │   └─ isPdfGenerating = true
  │   └─ generatePDF()
  │   └─ isPdfGenerating = false
  └─ Clica New → handleNewQuote
      └─ Limpia estado
      └─ Reset form
```

---

## 📋 Checklist Integración Rápida

- [ ] Importar AdminHeader
- [ ] Importar DialogoGenerico
- [ ] Importar useAdminState
- [ ] Configurar estados (isSaving, isPdfGenerating, hasChanges)
- [ ] Implementar handleSave
- [ ] Implementar handlePdfExport
- [ ] Implementar handleNewQuote
- [ ] Implementar handleSettings
- [ ] Agregar DialogoGenerico modal
- [ ] Vincular AdminHeader handlers
- [ ] Testing en browser
- [ ] Commit cambios

---

## 🐛 Debug Common Issues

### "No se importa módulo"
```
✓ Asegurar ruta correcta: @/features/admin/components
✓ Verificar barrel export en index.ts
✓ Restart TypeScript server
```

### "AdminHeader no se ve"
```
✓ Asegurar posición sticky
✓ Verificar z-index (z-40)
✓ Verificar className en padre
```

### "DialogoGenerico no cierra"
```
✓ Verificar onClose handler
✓ Verificar showDialog state
✓ Probar con Escape key
✓ Probar con backdrop click
```

### "Validación no funciona"
```
✓ Verificar formato email/whatsapp
✓ Verificar fechas en ISO format
✓ Revisar ValidationResult {valido, errores}
```

---

## 📞 Recursos

- **Documentación Completa**: `INDICE_DOCUMENTACION_PHASES_8-10.md`
- **Componentes Detallados**: `PHASE_8_COMPONENTS.md`
- **Utilities Detallados**: `PHASE_9_UTILITIES.md`
- **Integración**: `PHASE_10_INTEGRATION.md`
- **Checklist**: `CHECKLIST_PHASE_10_COMPLETITUD.md`
- **Ejecutivo**: `RESUMEN_EJECUTIVO_PHASES_8-10.md`

---

## 🚀 Próximos Pasos

1. Ejecutar AdminPage en el navegador
2. Testing de componentes
3. Testing de utilities
4. Testing end-to-end
5. Code review
6. Deployment

---

*Referencia Rápida - Phases 8-10*
*Actualizado: Noviembre 2024*
*Versión: 1.0*
