/**
 * Type definitions for validationStore
 */

export type ValidationType = 'quotation' | 'services' | 'discounts' | 'payment' | 'general'

export interface ValidationError {
  field: string
  message: string
  type: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  timestamp: string
}

export interface QuotationFieldValidationErrors {
  emailProveedor?: string
  whatsappProveedor?: string
  emailCliente?: string
  whatsappCliente?: string
  fechas?: string
  empresa?: string
  profesional?: string
  numero?: string
  version?: string
}

export interface ValidationState {
  tabValidation: Record<string, ValidationResult>
  currentTab?: string
  isValidating: boolean
  errors: Record<string, string>
  quotationFieldErrors: QuotationFieldValidationErrors
}

export interface ValidationStore extends ValidationState {
  validateTab: (tab: string, type: ValidationType) => Promise<void>
  setTabValid: (tab: string, isValid: boolean) => void
  clearTabValidation: (tab: string) => void
  clearAllValidations: () => void
  getTabValidation: (tab: string) => ValidationResult | undefined
  setCurrentTab: (tab: string) => void
  setQuotationFieldErrors: (errors: QuotationFieldValidationErrors) => void
  clearQuotationFieldErrors: () => void
  resetValidation: () => void
}

export const DEFAULT_VALIDATION_STATE: ValidationState = {
  tabValidation: {},
  isValidating: false,
  errors: {},
  quotationFieldErrors: {},
}
