/**
 * Reglas de Validación Configurables
 * Define reglas de validación complejas por TAB y globales
 * 
 * @phase Phase 11 - Validación Avanzada de TABs
 * @date 2025-11-24
 */

export interface ValidationRule {
  id: string
  nombre: string
  descripcion: string
  tab: string
  tipo: 'requerido' | 'formato' | 'rango' | 'condicional' | 'cross-tab'
  campo?: string
  validar: (valor: any, contexto?: any) => boolean
  mensaje: string
  severidad: 'error' | 'advertencia' | 'info'
}

// ==================== REGLAS POR TAB ====================

export const REGLAS_COTIZACION: ValidationRule[] = [
  {
    id: 'cot-numero',
    nombre: 'Número de Cotización',
    descripcion: 'Número único y válido',
    tab: 'cotizacion',
    tipo: 'requerido',
    campo: 'numero',
    validar: (valor) => !!valor?.trim(),
    mensaje: 'Número de cotización requerido',
    severidad: 'error',
  },
  {
    id: 'cot-fechas',
    nombre: 'Fechas Válidas',
    descripcion: 'Emisión ≤ Vencimiento',
    tab: 'cotizacion',
    tipo: 'condicional',
    validar: (valor, contexto) => {
      if (!contexto?.fechaEmision || !contexto?.fechaVencimiento) return true
      return new Date(contexto.fechaEmision) <= new Date(contexto.fechaVencimiento)
    },
    mensaje: 'Fecha de emisión debe ser anterior a vencimiento',
    severidad: 'error',
  },
  {
    id: 'cot-vigencia',
    nombre: 'Vigencia Válida',
    descripcion: 'Vigencia > 0 y unidad válida',
    tab: 'cotizacion',
    tipo: 'rango',
    validar: (valor, contexto) => {
      if (!valor || valor <= 0) return false
      const unidades = ['días', 'meses', 'años']
      return unidades.includes(contexto?.tiempoVigenciaUnidad)
    },
    mensaje: 'Vigencia debe ser > 0 con unidad válida',
    severidad: 'error',
  },
  {
    id: 'cot-hero-main',
    nombre: 'Título Principal',
    descripcion: 'Título principal con longitud mínima',
    tab: 'cotizacion',
    tipo: 'requerido',
    campo: 'heroTituloMain',
    validar: (valor) => !!valor?.trim() && valor.trim().length >= 5,
    mensaje: 'Título principal requerido (mín. 5 caracteres)',
    severidad: 'error',
  },
  {
    id: 'cot-hero-sub',
    nombre: 'Subtítulo',
    descripcion: 'Subtítulo con longitud mínima',
    tab: 'cotizacion',
    tipo: 'requerido',
    campo: 'heroTituloSub',
    validar: (valor) => !!valor?.trim() && valor.trim().length >= 5,
    mensaje: 'Subtítulo requerido (mín. 5 caracteres)',
    severidad: 'error',
  },
]

export const REGLAS_CLIENTE: ValidationRule[] = [
  {
    id: 'cli-empresa',
    nombre: 'Nombre Empresa',
    descripcion: 'Nombre de empresa requerido',
    tab: 'cliente',
    tipo: 'requerido',
    campo: 'empresa',
    validar: (valor) => !!valor?.trim(),
    mensaje: 'Nombre de empresa cliente requerido',
    severidad: 'error',
  },
  {
    id: 'cli-sector',
    nombre: 'Sector',
    descripcion: 'Sector de la empresa',
    tab: 'cliente',
    tipo: 'requerido',
    campo: 'sector',
    validar: (valor) => !!valor?.trim(),
    mensaje: 'Sector del cliente requerido',
    severidad: 'error',
  },
  {
    id: 'cli-ubicacion',
    nombre: 'Ubicación',
    descripcion: 'Ubicación de la empresa',
    tab: 'cliente',
    tipo: 'requerido',
    campo: 'ubicacion',
    validar: (valor) => !!valor?.trim(),
    mensaje: 'Ubicación del cliente requerida',
    severidad: 'error',
  },
  {
    id: 'cli-contacto',
    nombre: 'Medio de Contacto',
    descripcion: 'Email o WhatsApp requerido',
    tab: 'cliente',
    tipo: 'condicional',
    validar: (valor, contexto) => {
      const email = contexto?.emailCliente?.trim()
      const whatsapp = contexto?.whatsappCliente?.trim()
      return !!email || !!whatsapp
    },
    mensaje: 'Cliente debe tener al menos email o WhatsApp',
    severidad: 'error',
  },
  {
    id: 'cli-email-formato',
    nombre: 'Formato Email',
    descripcion: 'Email con formato válido',
    tab: 'cliente',
    tipo: 'formato',
    campo: 'emailCliente',
    validar: (valor) => {
      if (!valor?.trim()) return true // Opcional
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
    },
    mensaje: 'Email del cliente formato inválido',
    severidad: 'error',
  },
  {
    id: 'cli-whatsapp-formato',
    nombre: 'Formato WhatsApp',
    descripcion: 'WhatsApp con formato válido',
    tab: 'cliente',
    tipo: 'formato',
    campo: 'whatsappCliente',
    validar: (valor) => {
      if (!valor?.trim()) return true // Opcional
      return /^\+\d{1,3}\s?\d{6,14}$/.test(valor.replace(/\s/g, ''))
    },
    mensaje: 'WhatsApp del cliente formato inválido',
    severidad: 'error',
  },
]

export const REGLAS_PROVEEDOR: ValidationRule[] = [
  {
    id: 'prov-profesional',
    nombre: 'Profesional',
    descripcion: 'Nombre del profesional',
    tab: 'proveedor',
    tipo: 'requerido',
    campo: 'profesional',
    validar: (valor) => !!valor?.trim(),
    mensaje: 'Nombre del profesional requerido',
    severidad: 'error',
  },
  {
    id: 'prov-empresa',
    nombre: 'Empresa Proveedor',
    descripcion: 'Nombre de empresa proveedor',
    tab: 'proveedor',
    tipo: 'requerido',
    campo: 'empresaProveedor',
    validar: (valor) => !!valor?.trim(),
    mensaje: 'Nombre de empresa proveedor requerido',
    severidad: 'error',
  },
  {
    id: 'prov-ubicacion',
    nombre: 'Ubicación',
    descripcion: 'Ubicación del proveedor',
    tab: 'proveedor',
    tipo: 'requerido',
    campo: 'ubicacionProveedor',
    validar: (valor) => !!valor?.trim(),
    mensaje: 'Ubicación del proveedor requerida',
    severidad: 'error',
  },
  {
    id: 'prov-contacto',
    nombre: 'Medio de Contacto',
    descripcion: 'Email o WhatsApp requerido',
    tab: 'proveedor',
    tipo: 'condicional',
    validar: (valor, contexto) => {
      const email = contexto?.emailProveedor?.trim()
      const whatsapp = contexto?.whatsappProveedor?.trim()
      return !!email || !!whatsapp
    },
    mensaje: 'Proveedor debe tener al menos email o WhatsApp',
    severidad: 'error',
  },
  {
    id: 'prov-email-formato',
    nombre: 'Formato Email',
    descripcion: 'Email con formato válido',
    tab: 'proveedor',
    tipo: 'formato',
    campo: 'emailProveedor',
    validar: (valor) => {
      if (!valor?.trim()) return true // Opcional
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
    },
    mensaje: 'Email del proveedor formato inválido',
    severidad: 'error',
  },
  {
    id: 'prov-whatsapp-formato',
    nombre: 'Formato WhatsApp',
    descripcion: 'WhatsApp con formato válido',
    tab: 'proveedor',
    tipo: 'formato',
    campo: 'whatsappProveedor',
    validar: (valor) => {
      if (!valor?.trim()) return true // Opcional
      return /^\+\d{1,3}\s?\d{6,14}$/.test(valor.replace(/\s/g, ''))
    },
    mensaje: 'WhatsApp del proveedor formato inválido',
    severidad: 'error',
  },
]

export const REGLAS_PRESUPUESTO: ValidationRule[] = [
  {
    id: 'pres-valor',
    nombre: 'Valor Presupuesto',
    descripcion: 'Presupuesto número válido > 0',
    tab: 'presupuesto',
    tipo: 'rango',
    campo: 'presupuesto',
    validar: (valor) => !isNaN(Number(valor)) && Number(valor) > 0,
    mensaje: 'Presupuesto debe ser número > 0',
    severidad: 'error',
  },
  {
    id: 'pres-moneda',
    nombre: 'Moneda',
    descripcion: 'Moneda definida',
    tab: 'presupuesto',
    tipo: 'condicional',
    validar: (valor, contexto) => {
      // Si hay presupuesto, debe haber moneda
      if (contexto?.presupuesto && Number(contexto.presupuesto) > 0) {
        return !!contexto?.moneda?.trim()
      }
      return true
    },
    mensaje: 'Moneda requerida cuando hay presupuesto',
    severidad: 'error',
  },
]

export const REGLAS_GLOBALES: ValidationRule[] = [
  {
    id: 'global-version',
    nombre: 'Versión',
    descripcion: 'Número de versión >= 1',
    tab: 'cotizacion',
    tipo: 'rango',
    campo: 'versionNumber',
    validar: (valor) => valor >= 1,
    mensaje: 'Versión debe ser >= 1',
    severidad: 'error',
  },
  {
    id: 'global-activo',
    nombre: 'Estado Activo',
    descripcion: 'Si está activo, debe tener datos válidos',
    tab: 'cotizacion',
    tipo: 'condicional',
    validar: (valor, contexto) => {
      if (contexto?.activo) {
        return (
          !!contexto?.empresa &&
          !!contexto?.profesional &&
          !!contexto?.presupuesto &&
          Number(contexto?.presupuesto) > 0
        )
      }
      return true
    },
    mensaje: 'Config activa debe tener empresa, profesional y presupuesto > 0',
    severidad: 'error',
  },
]

// ==================== COLECCIONES ====================

/**
 * Todas las reglas de validación
 */
export const TODAS_LAS_REGLAS: ValidationRule[] = [
  ...REGLAS_COTIZACION,
  ...REGLAS_CLIENTE,
  ...REGLAS_PROVEEDOR,
  ...REGLAS_PRESUPUESTO,
  ...REGLAS_GLOBALES,
]

/**
 * Obtener reglas por TAB
 */
export function obtenerReglasPorTab(tab: string): ValidationRule[] {
  return TODAS_LAS_REGLAS.filter((r) => r.tab === tab)
}

/**
 * Obtener reglas por severidad
 */
export function obtenerReglasPorSeveridad(severidad: 'error' | 'advertencia' | 'info'): ValidationRule[] {
  return TODAS_LAS_REGLAS.filter((r) => r.severidad === severidad)
}

/**
 * Obtener todas las reglas de error (críticas)
 */
export function obtenerReglasError(): ValidationRule[] {
  return obtenerReglasPorSeveridad('error')
}

/**
 * Obtener todas las reglas de advertencia
 */
export function obtenerReglasAdvertencia(): ValidationRule[] {
  return obtenerReglasPorSeveridad('advertencia')
}
