/**
 * Discounts Store Types
 * Gestiona configuración de descuentos
 */

export type TipoDescuento = 'ninguno' | 'granular' | 'general'

export interface DescuentoGeneral {
  aplicarAlDesarrollo: boolean
  aplicarAServiciosBase: boolean
  aplicarAOtrosServicios: boolean
  porcentaje: number
}

export interface DescuentoServicio {
  id: string
  nombre: string
  porcentaje: number
}

export interface DescuentosGranulares {
  aplicarAServiciosBase: boolean
  aplicarAOtrosServicios: boolean
  serviciosBase: DescuentoServicio[]
  otrosServicios: DescuentoServicio[]
}

export interface ConfigDescuentos {
  tipoDescuento?: TipoDescuento
  descuentoGeneral?: DescuentoGeneral
  descuentosGranulares?: DescuentosGranulares
  descuentoPagoUnico?: number
  descuentoDirecto?: number
  descuentoEspecial?: {
    habilitado: boolean
    porcentaje: number
    motivo?: string
  }
  // Legacy properties
  id?: string
  porcentajeDescuento?: number
  montoDescuento?: number
  condiciones?: string
  activo?: boolean
  [key: string]: any
}

export interface DiscountsState {
  config: ConfigDescuentos | null
  expandedGroups: { [key: string]: boolean }
  isLoading: boolean
  errors: Record<string, string>
}

export interface DiscountsStore extends DiscountsState {
  // Actions
  loadConfig: () => Promise<void>
  updateConfig: (partial: Partial<ConfigDescuentos>) => Promise<void>
  saveConfig: () => Promise<void>
  setConfig: (config: ConfigDescuentos | null) => void
  toggleExpanded: (groupId: string) => void
  clearErrors: () => void
  resetDiscounts: () => void
}

export const DEFAULT_DISCOUNTS_STATE: DiscountsState = {
  config: null,
  expandedGroups: {},
  isLoading: false,
  errors: {},
}
