/**
 * User Modal Types
 * Type definitions for user modal state management
 */

export type ModalMode = 'create' | 'edit' | 'delete' | 'resetPassword' | null

export interface User {
  id: string
  username: string
  nombre: string
  email: string | null
  telefono: string | null
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT'
  organizationId: string | null
  quotationAssignedId: string | null
  quotationAssigned?: {
    id: string
    empresa: string
    numero: string
  } | null
  activo: boolean
  createdAt?: string
  updatedAt?: string
}
