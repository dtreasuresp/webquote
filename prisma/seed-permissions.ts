/**
 * Script para inicializar los permisos del sistema
 * Ejecutar con: npx ts-node prisma/seed-permissions.ts
 */

import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Catálogo de permisos del sistema
const PERMISSIONS = [
  // Usuarios
  { code: 'users.view', name: 'Ver usuarios', category: 'Usuarios', description: 'Visualizar lista de usuarios' },
  { code: 'users.create', name: 'Crear usuarios', category: 'Usuarios', description: 'Crear nuevos usuarios' },
  { code: 'users.edit', name: 'Editar usuarios', category: 'Usuarios', description: 'Modificar datos de usuarios' },
  { code: 'users.delete', name: 'Eliminar usuarios', category: 'Usuarios', description: 'Desactivar/eliminar usuarios' },
  { code: 'users.reset_password', name: 'Resetear contraseñas', category: 'Usuarios', description: 'Cambiar contraseña de otros usuarios' },
  
  // Cotizaciones
  { code: 'quotations.view', name: 'Ver cotizaciones', category: 'Cotizaciones', description: 'Visualizar cotizaciones' },
  { code: 'quotations.create', name: 'Crear cotizaciones', category: 'Cotizaciones', description: 'Crear nuevas cotizaciones' },
  { code: 'quotations.edit', name: 'Editar cotizaciones', category: 'Cotizaciones', description: 'Modificar cotizaciones' },
  { code: 'quotations.delete', name: 'Eliminar cotizaciones', category: 'Cotizaciones', description: 'Eliminar cotizaciones' },
  { code: 'quotations.assign', name: 'Asignar cotizaciones', category: 'Cotizaciones', description: 'Asignar cotizaciones a usuarios' },
  
  // Paquetes
  { code: 'packages.view', name: 'Ver paquetes', category: 'Paquetes', description: 'Visualizar paquetes' },
  { code: 'packages.edit', name: 'Editar paquetes', category: 'Paquetes', description: 'Modificar paquetes' },
  
  // Servicios
  { code: 'services.view', name: 'Ver servicios', category: 'Servicios', description: 'Visualizar servicios' },
  { code: 'services.edit', name: 'Editar servicios', category: 'Servicios', description: 'Modificar servicios' },
  
  // Sistema
  { code: 'config.view', name: 'Ver configuración', category: 'Sistema', description: 'Ver configuración del sistema' },
  { code: 'config.edit', name: 'Editar configuración', category: 'Sistema', description: 'Modificar configuración del sistema' },
  
  // Backups
  { code: 'backups.view', name: 'Ver backups', category: 'Backups', description: 'Visualizar lista de backups propios' },
  { code: 'backups.create', name: 'Crear backups', category: 'Backups', description: 'Crear nuevos backups manuales' },
  { code: 'backups.restore', name: 'Restaurar backups', category: 'Backups', description: 'Restaurar datos desde un backup' },
  { code: 'backups.delete', name: 'Eliminar backups', category: 'Backups', description: 'Eliminar backups existentes' },
  { code: 'backups.manage_all', name: 'Gestionar todos los backups', category: 'Backups', description: 'Ver y gestionar backups de todos los usuarios' },
  { code: 'backups.configure', name: 'Configurar backups', category: 'Backups', description: 'Modificar configuración de backups del sistema' },
  
  // Seguridad
  { code: 'security.roles.view', name: 'Ver roles', category: 'Seguridad', description: 'Visualizar roles del sistema' },
  { code: 'security.roles.manage', name: 'Gestionar roles', category: 'Seguridad', description: 'Crear/modificar/eliminar roles' },
  { code: 'security.permissions.view', name: 'Ver permisos', category: 'Seguridad', description: 'Visualizar permisos del sistema' },
  { code: 'security.permissions.manage', name: 'Gestionar permisos', category: 'Seguridad', description: 'Crear/modificar/eliminar permisos' },
  { code: 'security.matrix.view', name: 'Ver matriz de acceso', category: 'Seguridad', description: 'Ver asignación de permisos por rol' },
  { code: 'security.matrix.manage', name: 'Gestionar matriz de acceso', category: 'Seguridad', description: 'Modificar asignación de permisos por rol' },
  { code: 'security.user_permissions.view', name: 'Ver permisos de usuarios', category: 'Seguridad', description: 'Ver permisos individuales de usuarios' },
  { code: 'security.user_permissions.manage', name: 'Gestionar permisos de usuarios', category: 'Seguridad', description: 'Asignar/revocar permisos individuales' },
  { code: 'security.logs.view', name: 'Ver logs de auditoría', category: 'Seguridad', description: 'Visualizar logs de auditoría del sistema' },
  { code: 'security.logs.export', name: 'Exportar logs', category: 'Seguridad', description: 'Exportar logs de auditoría a CSV' },
];

// Permisos por rol (true = habilitado por defecto)
const ROLE_PERMISSIONS: Record<UserRole, Record<string, boolean>> = {
  SUPER_ADMIN: {
    'users.view': true,
    'users.create': true,
    'users.edit': true,
    'users.delete': true,
    'users.reset_password': true,
    'quotations.view': true,
    'quotations.create': true,
    'quotations.edit': true,
    'quotations.delete': true,
    'quotations.assign': true,
    'packages.view': true,
    'packages.edit': true,
    'services.view': true,
    'services.edit': true,
    'config.view': true,
    'config.edit': true,
    'backups.view': true,
    'backups.create': true,
    'backups.restore': true,
    'backups.delete': true,
    'backups.manage_all': true,
    'backups.configure': true,
    'security.roles.view': true,
    'security.roles.manage': true,
    'security.permissions.view': true,
    'security.permissions.manage': true,
    'security.matrix.view': true,
    'security.matrix.manage': true,
    'security.user_permissions.view': true,
    'security.user_permissions.manage': true,
    'security.logs.view': true,
    'security.logs.export': true,
  },
  ADMIN: {
    'users.view': true,      // Solo puede ver CLIENT
    'users.create': true,    // Solo puede crear CLIENT
    'users.edit': true,      // Solo puede editar CLIENT
    'users.delete': true,    // Solo puede eliminar CLIENT
    'users.reset_password': true, // Solo puede resetear CLIENT
    'quotations.view': true,
    'quotations.create': true,
    'quotations.edit': true,
    'quotations.delete': false,
    'quotations.assign': true,
    'packages.view': true,
    'packages.edit': true,
    'services.view': true,
    'services.edit': true,
    'config.view': true,
    'config.edit': false,
    'backups.view': true,
    'backups.create': true,
    'backups.restore': true,
    'backups.delete': false,
    'backups.manage_all': false,
    'backups.configure': false,
    'security.roles.view': true,
    'security.roles.manage': false,
    'security.permissions.view': true,
    'security.permissions.manage': false,
    'security.matrix.view': true,
    'security.matrix.manage': false,
    'security.user_permissions.view': true,
    'security.user_permissions.manage': false,
    'security.logs.view': true,
    'security.logs.export': false,
  },
  CLIENT: {
    'users.view': false,
    'users.create': false,
    'users.edit': false,
    'users.delete': false,
    'users.reset_password': false,
    'quotations.view': true,   // Solo cotizaciones asignadas
    'quotations.create': false,
    'quotations.edit': false,
    'quotations.delete': false,
    'quotations.assign': false,
    'packages.view': true,
    'packages.edit': false,
    'services.view': true,
    'services.edit': false,
    'config.view': false,
    'config.edit': false,
    'backups.view': false,
    'backups.create': false,
    'backups.restore': false,
    'backups.delete': false,
    'backups.manage_all': false,
    'backups.configure': false,
    'security.roles.view': false,
    'security.roles.manage': false,
    'security.permissions.view': false,
    'security.permissions.manage': false,
    'security.matrix.view': false,
    'security.matrix.manage': false,
    'security.user_permissions.view': false,
    'security.user_permissions.manage': false,
    'security.logs.view': false,
    'security.logs.export': false,
  },
};

async function main() {
  console.log('🔐 Iniciando seed de permisos...\n');

  // 1. Crear permisos
  console.log('📋 Creando catálogo de permisos...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        name: perm.name,
        category: perm.category,
        description: perm.description,
      },
      create: perm,
    });
    console.log(`  ✅ ${perm.code}: ${perm.name}`);
  }

  // 2. Obtener todos los roles del sistema
  console.log('\n👥 Obteniendo roles del sistema...');
  const roles = await prisma.role.findMany();
  console.log(`  Encontrados ${roles.length} roles`);

  // Crear mapa de nombre de rol -> ID de rol
  const roleMap = new Map(roles.map(r => [r.name, r.id]));

  // 3. Asignar permisos a roles usando tabla NUEVA (RolePermissions)
  console.log('\n🔐 Asignando permisos a roles...');
  const permissions = await prisma.permission.findMany();
  const permissionMap = new Map(permissions.map(p => [p.code, p.id]));

  for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap.get(roleName);
    if (!roleId) {
      console.log(`  ⚠️ Rol no encontrado: ${roleName}`);
      continue;
    }

    console.log(`\n  Rol: ${roleName} (ID: ${roleId})`);
    for (const [code, enabled] of Object.entries(perms)) {
      const permissionId = permissionMap.get(code);
      if (!permissionId) {
        console.log(`    ⚠️ Permiso no encontrado: ${code}`);
        continue;
      }

      // Usar tabla NUEVA: RolePermissions
      await prisma.rolePermissions.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: { 
          accessLevel: enabled ? 'full' : 'none' 
        },
        create: {
          roleId,
          permissionId,
          accessLevel: enabled ? 'full' : 'none',
        },
      });
      console.log(`    ${enabled ? '✅' : '❌'} ${code}`);
    }
  }

  // 3. Actualizar usuario admin existente a SUPER_ADMIN
  console.log('\n🔄 Actualizando usuario admin a SUPER_ADMIN...');
  const adminUser = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (adminUser) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { role: 'SUPER_ADMIN' },
    });
    console.log('  ✅ Usuario "admin" actualizado a SUPER_ADMIN');
  } else {
    console.log('  ⚠️ Usuario "admin" no encontrado');
  }

  console.log('\n✨ Seed de permisos completado exitosamente!\n');
}

main()
  .catch((e) => {
    console.error('Error en seed de permisos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
