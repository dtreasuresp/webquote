/**
 * Payment Store Types
 * Gestiona métodos de pago y opciones
 */

export interface OpcionPago {
  nombre: string
  porcentaje: number
  descripcion: string
  id?: string
  activo?: boolean
  [key: string]: any
}

export interface MetodoPreferido {
  id: string
  metodo: string
  nota: string
  [key: string]: any
}

export interface PaymentState {
  currentPackage: Record<string, any> | null
  paymentOptions: OpcionPago[]
  preferredMethod: string | null
  notes: string
  preferredMethods: MetodoPreferido[]
  isLoading: boolean
  errors: Record<string, string>
}

export interface PaymentStore extends PaymentState {
  // Actions
  setCurrentPackage: (pkg: any) => void
  setPaymentOptions: (options: OpcionPago[]) => void
  setPreferredMethod: (method: string) => void
  setPreferredMethods: (methods: MetodoPreferido[]) => void
  updateNotes: (notes: string) => void
  loadPaymentMethods: () => Promise<void>
  savePaymentPreferences: () => Promise<void>
  clearErrors: () => void
  resetPayment: () => void
}

export const DEFAULT_PAYMENT_STATE: PaymentState = {
  currentPackage: null,
  paymentOptions: [],
  preferredMethod: null,
  notes: '',
  preferredMethods: [],
  isLoading: false,
  errors: {},
}
