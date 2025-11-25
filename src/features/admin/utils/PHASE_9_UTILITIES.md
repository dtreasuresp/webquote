# Phase 9 - Utilities Extraction

Extracción de funciones de utilidad reutilizables del admin panel a un directorio centralizado.

## Ubicación

```
src/features/admin/utils/
├── validators.ts      (340+ líneas)
├── formatters.ts      (360+ líneas)
├── calculations.ts    (380+ líneas)
├── generators.ts      (380+ líneas)
└── index.ts           (barrel export)
```

**Total: ~1,460 líneas de utilidades**

---

## 1. **validators.ts** (340+ líneas)

Funciones de validación para datos de cotizaciones.

### Email & Teléfono
- ✅ `validarEmail(email: string)` - Validación básica de email
- ✅ `validarWhatsApp(whatsapp: string)` - Validación WhatsApp (+XXX XXXXXXXXX)
- ✅ `validarTelefono(telefono: string)` - Teléfono genérico

### Fechas
- ✅ `validarFechas(emisión, vencimiento)` - Compara fechas
- ✅ `validarFechaISO(isoString)` - Validación formato ISO

### Configuración de Cotización
- ✅ `validarTabCotizacion(config)` - Valida campos empresa, profesional, sector, ubicación
- ✅ `validarTabOferta(serviciosBase, paquete)` - Validación de servicios
- ✅ `validarTabCliente(config)` - Email y contacto cliente
- ✅ `validarTabPresentacion(config)` - Configuración visual
- ✅ `validarTabServicios(servicios)` - Validación de servicios

### Validadores Genéricos
- ✅ `validarStringRequerido(valor, nombreCampo)` - String no vacío
- ✅ `validarNumeroPositivo(valor, nombreCampo)` - Número > 0
- ✅ `validarArrayNoVacio(array, nombreCampo)` - Array con elementos

### Respuesta Estándar
```typescript
interface ValidationResult {
  valido: boolean
  errores: string[]
}
```

**Ejemplo:**
```tsx
const resultado = validarTabCotizacion(config)
if (!resultado.valido) {
  resultado.errores.forEach(error => showToast(error, 'error'))
}
```

---

## 2. **formatters.ts** (360+ líneas)

Funciones de formateo para presentación de datos.

### Fechas
- ✅ `formatearFechaLarga(isoString)` → "20 de noviembre de 2025"
- ✅ `formatearFechaCorta(isoString)` → "20/11/2025"
- ✅ `formatearFechaISO(date)` → "2025-11-20"
- ✅ `obtenerDiasEntre(fecha1, fecha2)` → número de días

### Moneda
- ✅ `formatearMonedaUSD(monto)` → "$1,234.56"
- ✅ `formatearMonedaCOP(monto)` → "$1.234.567"
- ✅ `extraerNumeroDeMoneda(monedaFormateada)` → 1234.56
- ✅ `formatearRangoPrecios(min, max)` → "$100 - $500"

### Números
- ✅ `formatearNumero(valor, decimales)` - Con separadores
- ✅ `redondear(valor, decimales)` - Redondeo preciso
- ✅ `formatearPorcentaje(valor)` → "25.50%"

### Strings
- ✅ `capitalizarPrimera(texto)` → "Hola"
- ✅ `mayuscula(texto)` → "HOLA"
- ✅ `minuscula(texto)` → "hola"
- ✅ `truncar(texto, longitud)` - Corta y añade "..."
- ✅ `slugify(texto)` → "mi-texto-aqui"
- ✅ `formatearNombreServicio(nombre)` → "Servicio Base"
- ✅ `limpiarEspeciales(texto)` - Elimina caracteres especiales
- ✅ `validarLongitud(texto, min, max)` - Rango de caracteres

### Arrays
- ✅ `agruparPor(array, propiedad)` - Agrupa por propiedad
- ✅ `ordenarPor(array, propiedad, ascendente)` - Ordena array
- ✅ `eliminarDuplicados(array, propiedad)` - Sin repetidos

**Ejemplo:**
```tsx
const fechaFormateada = formatearFechaLarga(config.fechaEmision)
// "20 de noviembre de 2025"

const monedaFormateada = formatearMonedaUSD(1500)
// "$1,500.00"

const servicios = ordenarPor(servicios, 'nombre', true)
// [Dominio, Hosting, Mailbox]
```

---

## 3. **calculations.ts** (380+ líneas)

Funciones de cálculo para cotizaciones y precios.

### Fechas
- ✅ `calcularFechaVencimiento(fechaEmision, dias)` - Fecha futura
- ✅ `calcularDias(fecha1, fecha2)` - Diferencia en días
- ✅ `calcularFechaFutura(dias)` - Desde hoy
- ✅ `calcularMesesDesde(fecha)` - Meses transcurridos

### Precios
- ✅ `calcularPrecioAnual(precioMensual, mesesGratis, mesesPago)` - Total anual
- ✅ `calcularConDescuento(precio, porcentaje)` - Aplica descuento
- ✅ `calcularPorcentajeDescuento(original, conDescuento)` - % aplicado
- ✅ `sumarPrecios(precios)` - Suma múltiples precios
- ✅ `promedioPrecios(precios)` - Promedio
- ✅ `calcularRangoPrecios(precios)` → {minimo, maximo}
- ✅ `calcularPrecioTotal(items)` - Total de items con cantidad
- ✅ `calcularIVA(precio, porcentaje)` - IVA 19% (default)
- ✅ `calcularPrecioConIVA(precio)` - Precio + IVA
- ✅ `calcularIncrementoAnual(year1, year2)` - % incremento

### Servicios
- ✅ `calcularInversionTotal(desarrollo, hosting, dominio, descuento)`
- ✅ `calcularPagoInicial(desarrollo)` - Pago único
- ✅ `calcularInversionAnual(hosting, dominio, descuento)`
- ✅ `calcularMesesServicio(mesesGratis, mesesPago)`
- ✅ `calcularROI(ganancia, inversion)` - Retorno de Inversión
- ✅ `calcularAmortizacion(inversionTotal, meses)` - Por mes

### Snapshots
- ✅ `obtenerSnapshotsActivos(snapshots)` - Filtra eliminados
- ✅ `calcularRangoSnapshots(snapshots, campo)` - Min/Max
- ✅ `agruparSnapshotsPorTipo(snapshots)` - Por tipo paquete
- ✅ `obtenerEstadisticasSnapshots(snapshots)` → {total, activos, etc}

### Paquetes
- ✅ `calcularVigenciaPaquete(fechaCreacion, diasValidez)` → {vigente, diasRestantes}
- ✅ `obtenerEstadoValidez(diasRestantes)` → 'vigente' | 'proxima_vencer' | 'vencida'
- ✅ `calcularDescuentoPorVolumen(cantidad, precioUnitario)` - Descuento progresivo

**Ejemplo:**
```tsx
const pagoInicial = calcularPagoInicial(1500) // $1,500

const anual = calcularInversionAnual(
  28 * 9, // hosting
  18 * 9, // dominio
  10 // descuento 10%
) // ~$404.40

const vigencia = calcularVigenciaPaquete(
  new Date(),
  30 // 30 días
)
// { vigente: true, diasRestantes: 30, fechaVencimiento: ... }
```

---

## 4. **generators.ts** (380+ líneas)

Generadores de datos para cotizaciones y testing.

### IDs y UUIDs
- ✅ `generarUUID()` - UUID v4 único
- ✅ `generarIDCorto()` - ID 8 caracteres
- ✅ `generarIDNumerico()` - Basado en timestamp

### Números
- ✅ `generarNumeroAleatorio(min, max)` - Entero
- ✅ `generarNumeroDecimal(min, max, decimales)` - Con decimales

### Configuración Inicial
- ✅ `generarConfiguracionCotizacionInicial()` - Config vacía
- ✅ `generarConfiguracionPaqueteInicial()` - Paquete vacío
- ✅ `generarServicioBaseInicial()` - Servicio base vacío
- ✅ `generarServicioOpcionalInicial()` - Servicio opcional vacío

### Números Secuenciales
- ✅ `generarNumeroSecuencial(prefijo, secuencia)` → "CZ-2025-001"
- ✅ `generarVersionCotizacion(versionAnterior)` → "v1.1"

### Testing
- ✅ `generarCotizacionEjemplo()` - Cotización completa
- ✅ `generarCotizacionesEjemplo(cantidad)` - Múltiples
- ✅ `generarSnapshotInicial(paqueteId)` - Snapshot base
- ✅ `generarSnapshotsEjemplo(cantidad)` - Múltiples snapshots

### Colores y Estilos
- ✅ `generarColorAleatorio()` → "#A1B2C3"
- ✅ `generarColorPorEstado(estado)` - Color por estado
- ✅ `generarClasePorEstado(estado)` - Clase CSS

### Opciones (Select)
- ✅ `generarOpcionesSector()` - 7 sectores
- ✅ `generarOpcionesTipoPaquete()` - 6 tipos
- ✅ `generarOpcionesNivelProfesional()` - 4 niveles
- ✅ `generarOpcionesDuracionValidez()` - 7 duraciones

**Ejemplo:**
```tsx
const cotizacion = generarCotizacionEjemplo()
// Cotización completa lista para testing

const numero = generarNumeroSecuencial() // "CZ-2025-045"

const version = generarVersionCotizacion('v1.0') // "v1.1"

const opciones = generarOpcionesSector()
// [{label: 'Construcción', value: 'construccion'}, ...]
```

---

## Imports Recomendados

**Importar todos (barrel export):**
```tsx
import {
  validarEmail,
  formatearMonedaUSD,
  calcularInversionTotal,
  generarUUID,
} from '@/features/admin/utils'
```

**Importar específicos:**
```tsx
import {
  validarTabCotizacion,
  ValidarEmail,
  ValidationResult,
} from '@/features/admin/utils/validators'

import {
  formatearFechaLarga,
  formatearRangoPrecios,
} from '@/features/admin/utils/formatters'

import {
  calcularPrecioAnual,
  calcularIVA,
} from '@/features/admin/utils/calculations'

import {
  generarUUID,
  generarNumeroSecuencial,
} from '@/features/admin/utils/generators'
```

---

## System de Colores de Estados

```
Vigente:        Verde   (gh-accent-green)
Próxima vencer: Naranja (gh-accent-orange)
Vencida:        Rojo    (gh-accent-red)
```

---

## Casos de Uso

### 1. Validar Cotización Completa
```tsx
const { cotizacionConfig, serviciosBase, paqueteActual } = admin

const resultado = validarTabCotizacion(cotizacionConfig)
if (!resultado.valido) {
  resultado.errores.forEach(e => showError(e))
  return
}
```

### 2. Calcular Precios
```tsx
const pagoInicial = calcularPagoInicial(paquete.desarrollo)
const anual = calcularInversionAnual(hosting, dominio, descuento)
const total = pagoInicial + anual

const moneda = formatearMonedaUSD(total) // "$2,904.40"
```

### 3. Validar y Mostrar Vigencia
```tsx
const vigencia = calcularVigenciaPaquete(cotizacion.fechaEmision, 30)
const estado = obtenerEstadoValidez(vigencia.diasRestantes)
const color = generarColorPorEstado(estado)
const clase = generarClasePorEstado(estado)

// <span className={clase}>Vigente (20 días)</span>
```

### 4. Generar Datos para Testing
```tsx
const cotizaciones = generarCotizacionesEjemplo(10)
cotizaciones.forEach(cot => {
  console.log(`${cot.numero}: ${cot.empresa}`)
})
```

---

## Ventajas

✅ **DRY** - Código reutilizable centralizado
✅ **Testeable** - Funciones puras, fáciles de mockear
✅ **Consistencia** - Mismo formateo/cálculo en toda app
✅ **Mantenimiento** - Un solo lugar para actualizar lógica
✅ **Documentación** - JSDoc en cada función
✅ **Type-safe** - Interfaces exportadas para TypeScript

---

## Status

✅ **PHASE 9 - 100% COMPLETADO**
- ✅ validators.ts creado (340+ líneas)
- ✅ formatters.ts creado (360+ líneas)
- ✅ calculations.ts creado (380+ líneas)
- ✅ generators.ts creado (380+ líneas)
- ✅ index.ts con barrel exports

**Total de utilidades: ~1,460 líneas**

---

## Próximos Pasos

**Phase 10 - AdminPage Integration (CRÍTICA)**
- Actualizar AdminPage.tsx
- Reemplazar imports con utils
- Integrar componentes (AdminHeader, DialogoGenerico)
- Integrar hooks
- Reducir de 3,865 a ~2,000 líneas
- Testing completo

**Tiempo estimado**: 3-4 horas
