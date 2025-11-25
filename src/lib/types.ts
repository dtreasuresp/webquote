// Tipos compartidos para el administrador y otras páginas

export interface ServicioBase {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

export interface GestionConfig {
  precio: number
  mesesGratis: number
  mesesPago: number
}

export interface OpcionPago {
  nombre: string
  porcentaje: number
  descripcion: string
}

export interface DescuentoServicio {
  servicioId: string
  aplicarDescuento: boolean
  porcentajeDescuento: number
}

export interface DescuentosGenerales {
  aplicarAlDesarrollo?: boolean
  aplicarAServiciosBase?: boolean
  aplicarAOtrosServicios?: boolean
  porcentaje?: number
}

export interface DescuentosPorServicio {
  aplicarAServiciosBase?: boolean
  aplicarAOtrosServicios?: boolean
  serviciosBase?: DescuentoServicio[]
  otrosServicios?: DescuentoServicio[]
}

export interface Package {
  nombre: string
  desarrollo: number
  descuento: number
  activo: boolean
  tipo?: string
  descripcion?: string
  emoji?: string
  tagline?: string
  precioHosting?: number
  precioMailbox?: number
  precioDominio?: number
  tiempoEntrega?: string
  opcionesPago?: OpcionPago[]
  descuentoPagoUnico?: number
  descuentosGenerales?: DescuentosGenerales
  descuentosPorServicio?: DescuentosPorServicio
  gestionMensual?: {
    precio: number
    descripcion: string
  }
}

export interface Servicio {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

export interface OtroServicio {
  id?: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

export type OtroServicioSnapshot = OtroServicio

export interface QuotationConfig {
  id: string
  // Cotización
  numero: string
  versionNumber: number
  fechaEmision: string
  tiempoValidez: number
  fechaVencimiento: string
  presupuesto: string
  moneda: string
  // Cliente
  empresa: string
  sector: string
  ubicacion: string
  emailCliente: string
  whatsappCliente: string
  // Proveedor
  profesional: string
  empresaProveedor: string
  emailProveedor: string
  whatsappProveedor: string
  ubicacionProveedor: string
  // Vigencia del contrato
  tiempoVigenciaValor: number
  tiempoVigenciaUnidad: string  // "días", "meses", "años"
  // Hero (editables por cotización)
  heroTituloMain: string
  heroTituloSub: string
  // Estados de control
  activo: boolean
  isGlobal: boolean
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface PackageSnapshot {
  id: string
  nombre: string
  serviciosBase: ServicioBase[]
  gestion: {
    precio: number
    mesesGratis: number
    mesesPago: number
  }
  paquete: {
    desarrollo: number
    descuento: number
    tipo?: string
    descripcion?: string
    emoji?: string
    tagline?: string
    precioHosting?: number
    precioMailbox?: number
    precioDominio?: number
    tiempoEntrega?: string
    opcionesPago?: OpcionPago[]
    descuentoPagoUnico?: number
    descuentosGenerales?: DescuentosGenerales
    descuentosPorServicio?: DescuentosPorServicio
    gestionMensual?: {
      precio: number
      descripcion: string
    }
  }
  otrosServicios: OtroServicioSnapshot[]
  costos: {
    inicial: number
    año1: number
    año2: number
  }
  contenido?: {
    features: string[]
    beneficios: string[]
    incluidos: string[]
    exclusiones: string[]
    terminosCondiciones: string
    informacionAdicional: string
  }
  activo: boolean
  quotationConfigId?: string
  createdAt: string
}

export interface UserPreferences {
  id: string
  userId: string
  cerrarModalAlGuardar: boolean
  mostrarConfirmacionGuardado: boolean
  validarDatosAntes: boolean
  createdAt: string
  updatedAt: string
}
// ==================== TIPOS PARA SISTEMA GENÉRICO DE DIÁLOGOS ====================
export type DialogType = 'error' | 'advertencia' | 'confirmacion' | 'info' | 'success' | 'activar'

export interface DialogButton {
  label: string
  action: () => void | Promise<void>
  style: 'primary' | 'secondary' | 'danger' | 'success'
}

export interface DialogConfig {
  tipo: DialogType
  titulo: string
  mensaje: string
  subtitulo?: string
  icono?: string // emoji o nombre del icono
  botones: DialogButton[]
  quotation?: QuotationConfig // Solo para tipo 'activar'
  modoAbrir?: 'editar' | 'ver' // Solo para tipo 'activar'
}