/**
 * Services Store Types
 * Gestiona servicios base y opcionales (CRUD)
 */

export interface ServicioBase {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
  frecuenciaPago?: 'mensual' | 'anual'
  descripcion?: string
  activo?: boolean
}

export interface Servicio {
  id?: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
  frecuenciaPago?: 'mensual' | 'anual'
  descripcion?: string
  optional?: boolean
  activo?: boolean
}

export interface ServicesState {
  // Base Services
  baseServices: ServicioBase[]
  editingBaseId: string | null
  editingBase: ServicioBase | null
  newBaseService: Partial<ServicioBase>

  // Optional Services
  optionalServices: Servicio[]
  editingId: string | null
  editing: Servicio | null
  newService: Partial<Servicio>

  // UI State
  isLoading: boolean
  errors: Record<string, string>
}

export interface ServicesStore extends ServicesState {
  // Base Services Actions
  loadBaseServices: () => Promise<void>
  addBaseService: (data: Partial<ServicioBase>) => Promise<void>
  updateBaseService: (id: string, data: Partial<ServicioBase>) => Promise<void>
  deleteBaseService: (id: string) => Promise<void>
  startEditingBase: (service: ServicioBase) => void
  cancelEditingBase: () => void
  setNewBaseService: (data: Partial<ServicioBase>) => void

  // Optional Services Actions
  loadOptionalServices: () => Promise<void>
  addOptionalService: (data: Partial<Servicio>) => Promise<void>
  updateOptionalService: (id: string, data: Partial<Servicio>) => Promise<void>
  deleteOptionalService: (id: string) => Promise<void>
  startEditing: (service: Servicio) => void
  cancelEditing: () => void
  setNewService: (data: Partial<Servicio>) => void
  setBaseServices: (services: ServicioBase[]) => void
  setOptionalServices: (services: Servicio[]) => void

  // General Actions
  clearErrors: () => void
  resetServices: () => void
}

export const DEFAULT_SERVICES_STATE: ServicesState = {
  baseServices: [],
  editingBaseId: null,
  editingBase: null,
  newBaseService: {},
  optionalServices: [],
  editingId: null,
  editing: null,
  newService: {},
  isLoading: false,
  errors: {},
}
