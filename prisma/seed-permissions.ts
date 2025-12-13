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
  { code: 'permissions.manage', name: 'Gestionar permisos', category: 'Sistema', description: 'Configurar permisos por rol' },
  { code: 'roles.manage', name: 'Gestionar roles', category: 'Sistema', description: 'Crear/modificar roles de usuario' },
  
  // Backups
  { code: 'backups.view', name: 'Ver backups', category: 'Backups', description: 'Visualizar lista de backups propios' },
  { code: 'backups.create', name: 'Crear backups', category: 'Backups', description: 'Crear nuevos backups manuales' },
  { code: 'backups.restore', name: 'Restaurar backups', category: 'Backups', description: 'Restaurar datos desde un backup' },
  { code: 'backups.delete', name: 'Eliminar backups', category: 'Backups', description: 'Eliminar backups existentes' },
  { code: 'backups.manage_all', name: 'Gestionar todos los backups', category: 'Backups', description: 'Ver y gestionar backups de todos los usuarios' },
  { code: 'backups.configure', name: 'Configurar backups', category: 'Backups', description: 'Modificar configuración de backups del sistema' },
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
    'permissions.manage': true,
    'roles.manage': true,
    'backups.view': true,
    'backups.create': true,
    'backups.restore': true,
    'backups.delete': true,
    'backups.manage_all': true,
    'backups.configure': true,
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
    'permissions.manage': false,
    'roles.manage': false,
    'backups.view': true,
    'backups.create': true,
    'backups.restore': true,
    'backups.delete': false,
    'backups.manage_all': false,
    'backups.configure': false,
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
    'permissions.manage': false,
    'roles.manage': false,
    'backups.view': false,
    'backups.create': false,
    'backups.restore': false,
    'backups.delete': false,
    'backups.manage_all': false,
    'backups.configure': false,
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

  // 2. Asignar permisos a roles
  console.log('\n👥 Asignando permisos a roles...');
  const permissions = await prisma.permission.findMany();
  const permissionMap = new Map(permissions.map(p => [p.code, p.id]));

  for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
    console.log(`\n  Rol: ${role}`);
    for (const [code, enabled] of Object.entries(perms)) {
      const permissionId = permissionMap.get(code);
      if (!permissionId) {
        console.log(`    ⚠️ Permiso no encontrado: ${code}`);
        continue;
      }

      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: {
            role: role as UserRole,
            permissionId,
          },
        },
        update: { enabled },
        create: {
          role: role as UserRole,
          permissionId,
          enabled,
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
