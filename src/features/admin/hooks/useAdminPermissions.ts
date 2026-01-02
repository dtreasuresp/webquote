import { useCallback } from 'react'
import { useSession } from 'next-auth/react'

export type PermissionAction = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'EXPORT'
export type AdminModule = 
  | 'CLIENTS' | 'CONTACTS' | 'PRODUCTS' | 'OPPORTUNITIES' | 'INTERACTIONS' | 'SUBSCRIPTIONS' | 'COMPLIANCE' | 'PRICING' | 'SETTINGS'
  | 'QUOTATIONS' | 'OFFERS' | 'CONTENT' | 'PREFERENCES' | 'USERS' | 'ROLES' | 'PERMISSIONS' | 'BACKUPS'
  | 'INVOICES' | 'REPORTS' | 'DASHBOARD' | 'QUOTES' | 'AUDIT'

/**
 * Hook para verificar permisos en el Panel Administrativo
 * Valida el rol y permisos del usuario antes de permitir acciones
 */
export const useAdminPermissions = () => {
  const { data: session } = useSession()

  const hasPermission = useCallback(
    (module: AdminModule, action: PermissionAction): boolean => {
      if (!session?.user) return false

      // Administradores tienen todos los permisos
      if (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN') {
        return true
      }

      // Mapeo de permisos por rol
      const rolePermissions: Record<string, Partial<Record<AdminModule, PermissionAction[]>>> = {
        USER: {
          CLIENTS: ['VIEW'],
          CONTACTS: ['VIEW'],
          PRODUCTS: ['VIEW'],
          OPPORTUNITIES: ['VIEW'],
          INTERACTIONS: ['VIEW', 'CREATE'],
          SUBSCRIPTIONS: ['VIEW'],
          QUOTATIONS: ['VIEW'],
          OFFERS: ['VIEW'],
          CONTENT: ['VIEW'],
        },
      }

      const userRole = (session.user.role as string).toUpperCase()
      const permissions = rolePermissions[userRole]?.[module] || []

      return permissions.includes(action)
    },
    [session]
  )

  const canView = useCallback((module: AdminModule) => hasPermission(module, 'VIEW'), [hasPermission])
  const canCreate = useCallback((module: AdminModule) => hasPermission(module, 'CREATE'), [hasPermission])
  const canEdit = useCallback((module: AdminModule) => hasPermission(module, 'EDIT'), [hasPermission])
  const canDelete = useCallback((module: AdminModule) => hasPermission(module, 'DELETE'), [hasPermission])
  const canExport = useCallback((module: AdminModule) => hasPermission(module, 'EXPORT'), [hasPermission])

  return {
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
  }
}
