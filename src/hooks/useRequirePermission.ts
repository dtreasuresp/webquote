/**
 * Hook para verificar permisos de usuario en componentes React
 * 
 * Este hook permite renderizado condicional basado en los permisos
 * del usuario autenticado. Útil para mostrar/ocultar elementos de UI
 * según los permisos disponibles.
 * 
 * @example
 * ```tsx
 * const canManageRoles = useRequirePermission('security.roles.manage');
 * 
 * return (
 *   <div>
 *     {canManageRoles && (
 *       <Button onClick={handleEdit}>Editar Rol</Button>
 *     )}
 *   </div>
 * );
 * ```
 */

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

/**
 * Verifica si el usuario tiene un permiso específico
 * 
 * @param permissionCode - Código del permiso a verificar (ej: 'security.roles.manage')
 * @returns true si el usuario tiene el permiso, false en caso contrario
 */
export function useRequirePermission(permissionCode: string): boolean {
  const { data: session, status } = useSession();

  return useMemo(() => {
    // Si no hay sesión o está cargando, no tiene permiso
    if (status === 'loading' || status === 'unauthenticated' || !session?.user) {
      return false;
    }

    // SUPER_ADMIN tiene todos los permisos
    if (session.user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Verificar si el usuario tiene el permiso en su lista
    const userPermissions = session.user.permissions || [];
    
    // Buscar el permiso exacto o uno que coincida con el patrón
    const hasPermission = userPermissions.some(permission => {
      if (typeof permission === 'string') {
        return permission === permissionCode;
      }
      // Si es un objeto con estructura { code: string, granted: boolean }
      if (permission && typeof permission === 'object' && 'code' in permission) {
        return permission.code === permissionCode && permission.granted !== false;
      }
      return false;
    });

    return hasPermission;
  }, [session, status, permissionCode]);
}

/**
 * Verifica si el usuario tiene AL MENOS UNO de los permisos especificados
 * 
 * @param permissionCodes - Array de códigos de permisos a verificar
 * @returns true si el usuario tiene al menos uno de los permisos
 * 
 * @example
 * ```tsx
 * const canViewSecurity = useRequireAnyPermission([
 *   'security.roles.view',
 *   'security.permissions.view'
 * ]);
 * ```
 */
export function useRequireAnyPermission(permissionCodes: string[]): boolean {
  const { data: session, status } = useSession();

  return useMemo(() => {
    if (status === 'loading' || status === 'unauthenticated' || !session?.user) {
      return false;
    }

    // SUPER_ADMIN tiene todos los permisos
    if (session.user.role === 'SUPER_ADMIN') {
      return true;
    }

    const userPermissions = session.user.permissions || [];
    
    return permissionCodes.some(permCode => 
      userPermissions.some(permission => {
        if (typeof permission === 'string') {
          return permission === permCode;
        }
        if (permission && typeof permission === 'object' && 'code' in permission) {
          return permission.code === permCode && permission.granted !== false;
        }
        return false;
      })
    );
  }, [session, status, permissionCodes]);
}

/**
 * Verifica si el usuario tiene TODOS los permisos especificados
 * 
 * @param permissionCodes - Array de códigos de permisos a verificar
 * @returns true si el usuario tiene todos los permisos
 * 
 * @example
 * ```tsx
 * const canManageEverything = useRequireAllPermissions([
 *   'security.roles.manage',
 *   'security.permissions.manage'
 * ]);
 * ```
 */
export function useRequireAllPermissions(permissionCodes: string[]): boolean {
  const { data: session, status } = useSession();

  return useMemo(() => {
    if (status === 'loading' || status === 'unauthenticated' || !session?.user) {
      return false;
    }

    // SUPER_ADMIN tiene todos los permisos
    if (session.user.role === 'SUPER_ADMIN') {
      return true;
    }

    const userPermissions = session.user.permissions || [];
    
    return permissionCodes.every(permCode => 
      userPermissions.some(permission => {
        if (typeof permission === 'string') {
          return permission === permCode;
        }
        if (permission && typeof permission === 'object' && 'code' in permission) {
          return permission.code === permCode && permission.granted !== false;
        }
        return false;
      })
    );
  }, [session, status, permissionCodes]);
}

/**
 * Hook que retorna información completa sobre el estado de permisos del usuario
 * 
 * @returns Objeto con información de permisos y estado de sesión
 * 
 * @example
 * ```tsx
 * const { hasPermission, isLoading, isSuperAdmin } = usePermissionCheck();
 * 
 * if (isLoading) return <Spinner />;
 * if (isSuperAdmin) return <AdminPanel />;
 * if (hasPermission('users.view')) return <UsersList />;
 * ```
 */
export function usePermissionCheck() {
  const { data: session, status } = useSession();

  return useMemo(() => {
    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated' && !!session?.user;
    const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
    const userRole = session?.user?.role;
    const userPermissions = session?.user?.permissions || [];

    /**
     * Función helper para verificar un permiso específico
     */
    const hasPermission = (permissionCode: string): boolean => {
      if (!isAuthenticated) return false;
      if (isSuperAdmin) return true;

      return userPermissions.some(permission => {
        if (typeof permission === 'string') {
          return permission === permissionCode;
        }
        if (permission && typeof permission === 'object' && 'code' in permission) {
          return permission.code === permissionCode && permission.granted !== false;
        }
        return false;
      });
    };

    return {
      isLoading,
      isAuthenticated,
      isSuperAdmin,
      userRole,
      permissions: userPermissions,
      hasPermission,
    };
  }, [session, status]);
}

// Export por defecto del hook principal
export default useRequirePermission;
