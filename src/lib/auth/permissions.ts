/**
 * Helper para verificar permisos de usuario
 * 
 * Este módulo proporciona funciones para verificar si un usuario tiene
 * permisos específicos basados en su rol y permisos personalizados.
 */

import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Tipo para los códigos de permisos
export type PermissionCode =
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.reset_password'
  | 'quotations.view'
  | 'quotations.create'
  | 'quotations.edit'
  | 'quotations.delete'
  | 'quotations.assign'
  | 'packages.view'
  | 'packages.edit'
  | 'services.view'
  | 'services.edit'
  | 'config.view'
  | 'config.edit'
  | 'security.roles.view'
  | 'security.roles.manage'
  | 'security.permissions.view'
  | 'security.permissions.manage'
  | 'security.matrix.view'
  | 'security.matrix.manage'
  | 'security.user_permissions.view'
  | 'security.user_permissions.manage'
  | 'security.logs.view'
  | 'security.logs.export'
  | 'backups.view'
  | 'backups.create'
  | 'backups.restore'
  | 'backups.delete'
  | 'backups.manage_all'
  | 'backups.configure';

// Nivel jerárquico de cada rol
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  CLIENT: 1,
};

/**
 * Verifica si un rol puede gestionar a otro rol
 * 
 * @param actorRole - Rol del usuario que realiza la acción
 * @param targetRole - Rol del usuario objetivo
 * @returns true si el actor puede gestionar al objetivo
 */
export function canManageRole(actorRole: UserRole, targetRole: UserRole): boolean {
  // SUPER_ADMIN puede gestionar a todos excepto otros SUPER_ADMIN (para crear sí puede)
  // ADMIN solo puede gestionar CLIENT
  // CLIENT no puede gestionar a nadie
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Verifica si un usuario puede resetear la contraseña de otro
 * 
 * @param actorRole - Rol del usuario que realiza la acción
 * @param targetRole - Rol del usuario objetivo
 * @returns true si el actor puede resetear la contraseña del objetivo
 */
export function canResetPassword(actorRole: UserRole, targetRole: UserRole): boolean {
  // SUPER_ADMIN puede resetear ADMIN y CLIENT
  // ADMIN solo puede resetear CLIENT
  // Nadie puede resetear contraseña de otro SUPER_ADMIN
  if (targetRole === 'SUPER_ADMIN') {
    return false; // Nadie puede resetear contraseña de SUPER_ADMIN
  }
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Verifica si un usuario puede crear usuarios de un rol específico
 * 
 * @param actorRole - Rol del usuario que realiza la acción
 * @param newUserRole - Rol del nuevo usuario a crear
 * @returns true si el actor puede crear un usuario con ese rol
 */
export function canCreateUserWithRole(actorRole: UserRole, newUserRole: UserRole): boolean {
  // SUPER_ADMIN puede crear cualquier tipo de usuario, incluyendo otros SUPER_ADMIN
  if (actorRole === 'SUPER_ADMIN') {
    return true;
  }
  // ADMIN solo puede crear CLIENT
  if (actorRole === 'ADMIN' && newUserRole === 'CLIENT') {
    return true;
  }
  return false;
}

/**
 * Obtiene los permisos de un usuario basado en su rol y permisos personalizados
 * 
 * @param userId - ID del usuario
 * @returns Mapa de permisos con código -> habilitado
 */
export async function getUserPermissions(userId: string): Promise<Map<string, boolean>> {
  // 1. Obtener usuario con su rol
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return new Map();
  }

  // 2. Obtener roleId del usuario
  const userWithRole = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, roleId: true },
  });

  if (!userWithRole) {
    return new Map();
  }

  // 3. Obtener permisos del rol desde tabla NUEVA (RolePermissions)
  let rolePermissions: any[] = [];
  if (userWithRole.roleId) {
    rolePermissions = await prisma.rolePermissions.findMany({
      where: { roleId: userWithRole.roleId },
      include: { permission: true },
    });
  }

  // 4. Obtener permisos personalizados del usuario (override)
  const userPermissions = await prisma.userPermission.findMany({
    where: { userId },
    include: { Permission: true },
  });

  // 5. Construir mapa de permisos
  const permissionMap = new Map<string, boolean>();

  // Agregar permisos del rol (accessLevel: none/read/write/full)
  for (const rp of rolePermissions) {
    // Cualquier accessLevel diferente de 'none' se considera habilitado
    permissionMap.set(rp.permission.code, rp.accessLevel !== 'none');
  }

  // Aplicar overrides del usuario
  for (const up of userPermissions) {
    permissionMap.set(up.Permission.code, up.granted);
  }

  return permissionMap;
}

/**
 * Verifica si un usuario tiene un permiso específico
 * 
 * @param userId - ID del usuario
 * @param permissionCode - Código del permiso a verificar
 * @returns true si el usuario tiene el permiso
 */
export async function hasPermission(userId: string, permissionCode: PermissionCode): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.get(permissionCode) ?? false;
}

/**
 * Verifica si un usuario tiene todos los permisos especificados
 * 
 * @param userId - ID del usuario
 * @param permissionCodes - Códigos de permisos a verificar
 * @returns true si el usuario tiene todos los permisos
 */
export async function hasAllPermissions(userId: string, permissionCodes: PermissionCode[]): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissionCodes.every(code => permissions.get(code) === true);
}

/**
 * Verifica si un usuario tiene alguno de los permisos especificados
 * 
 * @param userId - ID del usuario
 * @param permissionCodes - Códigos de permisos a verificar
 * @returns true si el usuario tiene al menos uno de los permisos
 */
export async function hasAnyPermission(userId: string, permissionCodes: PermissionCode[]): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissionCodes.some(code => permissions.get(code) === true);
}

/**
 * Obtiene todos los permisos agrupados por categoría
 * 
 * @returns Permisos agrupados por categoría
 */
export async function getPermissionsByCategory(): Promise<Record<string, Array<{
  id: string;
  code: string;
  name: string;
  description: string | null;
}>>> {
  const permissions = await prisma.permission.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  const grouped: Record<string, typeof permissions> = {};
  for (const perm of permissions) {
    if (!grouped[perm.category]) {
      grouped[perm.category] = [];
    }
    grouped[perm.category].push(perm);
  }

  return grouped;
}

/**
 * Obtiene la configuración de permisos de un rol
 * 
 * @param roleId - ID del rol a consultar
 * @returns Mapa de permisos con código -> habilitado
 */
export async function getRolePermissions(roleId: string): Promise<Map<string, boolean>> {
  const rolePermissions = await prisma.rolePermissions.findMany({
    where: { roleId },
    include: { permission: true },
  });

  const permissionMap = new Map<string, boolean>();
  for (const rp of rolePermissions) {
    permissionMap.set(rp.permission.code, rp.accessLevel !== 'none');
  }

  return permissionMap;
}

/**
 * Actualiza un permiso de rol
 * 
 * @param roleId - ID del rol a actualizar
 * @param permissionCode - Código del permiso
 * @param accessLevel - Nivel de acceso: none, read, write, full
 */
export async function updateRolePermission(
  roleId: string,
  permissionCode: string,
  accessLevel: string
): Promise<void> {
  const permission = await prisma.permission.findUnique({
    where: { code: permissionCode },
  });

  if (!permission) {
    throw new Error(`Permiso no encontrado: ${permissionCode}`);
  }

  await prisma.rolePermissions.upsert({
    where: {
      roleId_permissionId: {
        roleId,
        permissionId: permission.id,
      },
    },
    update: { accessLevel },
    create: {
      roleId,
      permissionId: permission.id,
      accessLevel,
    },
  });
}

/**
 * Obtiene los roles que un usuario puede ver/gestionar
 * 
 * @param actorRole - Rol del usuario actual
 * @returns Array de roles que puede gestionar
 */
export function getManageableRoles(actorRole: UserRole): UserRole[] {
  switch (actorRole) {
    case 'SUPER_ADMIN':
      return ['SUPER_ADMIN', 'ADMIN', 'CLIENT'];
    case 'ADMIN':
      return ['CLIENT'];
    case 'CLIENT':
    default:
      return [];
  }
}

/**
 * Obtiene los roles que un usuario puede crear
 * 
 * @param actorRole - Rol del usuario actual
 * @returns Array de roles que puede crear
 */
export function getCreatableRoles(actorRole: UserRole): UserRole[] {
  switch (actorRole) {
    case 'SUPER_ADMIN':
      return ['SUPER_ADMIN', 'ADMIN', 'CLIENT'];
    case 'ADMIN':
      return ['CLIENT'];
    case 'CLIENT':
    default:
      return [];
  }
}
