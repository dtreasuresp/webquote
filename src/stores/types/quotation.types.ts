/**
 * Quotation Store Types
 * Gestiona el estado de la cotización activa y su metadata
 */

import { ServicioBase, Servicio } from './services.types'

export interface ServicioBaseTemplate {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
  frecuenciaPago?: 'mensual' | 'anual'
  descripcion?: string
  activo?: boolean
}

export interface CostoDesglose {
  subtotal: number
  descuentoVenta?: number
  descuentoPromocion?: number
  descuentoTemporada?: number
  total: number
  margenEmpresa?: number
  margenComercial?: number
  impuestos?: number
  precioFinal?: number
}
  
export interface QuotationConfig {
  // ID y metadata
  id: string
  numero: string
  versionNumber?: number
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  
  // Validez
  tiempoValidez?: number
  fechaEmision?: string
  fechaVencimiento?: string
  
  // Presupuesto y moneda
  presupuesto?: string
  moneda?: string
  
  // Cliente
  clientId?: string
  clientName?: string
  empresa?: string
  sector?: string
  ubicacion?: string
  emailCliente?: string
  whatsappCliente?: string
  
  // Proveedor
  profesional?: string
  empresaProveedor?: string
  emailProveedor?: string
  whatsappProveedor?: string
  ubicacionProveedor?: string
  
  // Vigencia del contrato
  tiempoVigenciaValor?: number
  tiempoVigenciaUnidad?: string
  
  // Hero (editables por cotización)
  heroTituloMain?: string
  heroTituloSub?: string
  
  // Estados de control
  activo?: boolean
  isGlobal?: boolean
  
  // Templates reutilizables
  serviciosBaseTemplate?: ServicioBaseTemplate[]
  serviciosOpcionalesTemplate?: Servicio[]
  opcionesPagoTemplate?: any[]
  configDescuentosTemplate?: any
  metodoPagoPreferido?: string
  notasPago?: string
  metodosPreferidos?: any[]
  estilosConfig?: Record<string, unknown>
  contenidoGeneral?: any
  descripcionesPaqueteTemplates?: any[]
  
  // Legacy
  paqueteTemplate?: any
  description?: string
  notas?: string
  condicionesComerciales?: string
  contactoCliente?: {
    email?: string
    telefono?: string
    [key: string]: any
  }
  
  // Metadata
  createdAt?: string | Date
  updatedAt?: string | Date
  
  // Flexible any for extensibility
  [key: string]: any
}

export interface QuotationValidationErrors {
  [key: string]: string | string[]
}

export interface QuotationState {
  // Data
  quotationId: string | null
  config: QuotationConfig | null
  current: Partial<QuotationConfig>
  
  // UI State
  isLoading: boolean
  isDirty: boolean
  readOnly: boolean
  hasShownAlert: boolean
  
  // Error Handling
  errors: QuotationValidationErrors
}

export interface QuotationStore extends QuotationState {
  // Actions
  loadQuotation: (id: string) => Promise<void>
  updateQuotation: (partial: any) => Promise<void>
  saveQuotation: () => Promise<void>
  setConfig: (config: QuotationConfig | null) => void
  setReadOnly: (value: boolean) => void
  setHasShownAlert: (value: boolean) => void
  setValidationErrors: (errors: QuotationValidationErrors) => void
  clearErrors: () => void
  resetQuotation: () => void
}

export const DEFAULT_QUOTATION_STATE: QuotationState = {
  quotationId: null,
  config: null,
  current: {},
  isLoading: false,
  isDirty: false,
  readOnly: false,
  hasShownAlert: false,
  errors: {},
}
