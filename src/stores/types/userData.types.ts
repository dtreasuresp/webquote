/**
 * User Data Types
 * Type definitions for user-related data (quotations, organizations)
 */

export interface QuotationOption {
  id: string
  nombre?: string
  empresa?: string
  numero: string | number
}

export interface Organization {
  id: string
  nombre: string
}

export interface GroupedQuotation {
  baseNumber: string | number
  displayName: string
  versions: QuotationOption[]
  latestVersion: QuotationOption
}
