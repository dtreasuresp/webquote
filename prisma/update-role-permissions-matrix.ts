/**
 * Script de migración: Actualizar matriz de roles con Access Levels granulares
 * Basado en PROPUESTA_SISTEMA_PERMISOS_GRANULAR.md - Sección "Catálogo de Permisos"
 * Ejecutar con: npx ts-node prisma/update-role-permissions-matrix.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//type AccessLevel = 'full' | 'write' | 'read' | 'none';

// Matriz de permisos: ROLE → PERMISSION_CODE → ACCESS_LEVEL
const ROLE_PERMISSIONS_MATRIX: Record<string, Record<string, string>> = {
  'SUPER_ADMIN': {
    // Usuarios - FULL en todos
    'users.view': 'full',
    'users.create': 'full',
    'users.edit': 'full',
    'users.delete': 'full',
    'users.export': 'full',
    'users.import': 'full',
    'users.assign_role': 'full',
    'users.reset_password': 'full',
    'users.view_all': 'full',
    'users.manage': 'full',

    // Cotizaciones - FULL en todos
    'quotations.view': 'full',
    'quotations.view_all': 'full',
    'quotations.create': 'full',
    'quotations.edit': 'full',
    'quotations.delete': 'full',
    'quotations.export': 'full',
    'quotations.duplicate': 'full',
    'quotations.assign': 'full',
    'quotations.unassign': 'full',
    'quotations.restore': 'full',
    'quotations.manage': 'full',

    // Paquetes - FULL en todos
    'packages.view': 'full',
    'packages.view_all': 'full',
    'packages.create': 'full',
    'packages.edit': 'full',
    'packages.delete': 'full',
    'packages.export': 'full',
    'packages.import': 'full',
    'packages.restore': 'full',
    'packages.manage': 'full',

    // Servicios - FULL en todos
    'services.view': 'full',
    'services.view_all': 'full',
    'services.create': 'full',
    'services.edit': 'full',
    'services.delete': 'full',
    'services.export': 'full',
    'services.import': 'full',
    'services.restore': 'full',
    'services.manage': 'full',

    // Configuración - FULL en todos
    'config.view': 'full',
    'config.edit_general': 'full',
    'config.edit_branding': 'full',
    'config.edit_integrations': 'full',
    'config.edit_notifications': 'full',
    'config.export': 'full',
    'config.import': 'full',
    'config.reset': 'full',
    'config.view_sensitive': 'full',
    'config.manage': 'full',

    // Seguridad - FULL en todos
    'security.roles.view': 'full',
    'security.roles.create': 'full',
    'security.roles.edit': 'full',
    'security.roles.delete': 'full',
    'security.roles.manage': 'full',
    'security.permissions.view': 'full',
    'security.permissions.create': 'full',
    'security.permissions.edit': 'full',
    'security.permissions.delete': 'full',
    'security.permissions.manage': 'full',
    'security.matrix.view': 'full',
    'security.matrix.edit': 'full',
    'security.user_permissions.view': 'full',
    'security.user_permissions.assign': 'full',
    'security.user_permissions.revoke': 'full',
    'security.user_permissions.manage': 'full',

    // Logs - FULL en todos
    'logs.view': 'full',
    'logs.view_all': 'full',
    'logs.export': 'full',
    'logs.delete': 'full',
    'logs.view_sensitive': 'full',
    'logs.manage': 'full',

    // Backups - FULL en todos
    'backups.view': 'full',
    'backups.view_all': 'full',
    'backups.create': 'full',
    'backups.restore': 'full',
    'backups.delete': 'full',
    'backups.export': 'full',
    'backups.import': 'full',
    'backups.schedule': 'full',
    'backups.configure': 'full',
    'backups.manage': 'full',

    // Historial - FULL en todos
    'history.view': 'full',
    'history.view_all': 'full',
    'history.export': 'full',
    'history.filter': 'full',
    'history.delete': 'full',
    'history.restore': 'full',
    'history.manage': 'full',
  },

  'ADMIN': {
    // Usuarios - READ (solo puede ver CLIENT, no puede crear/edit/delete)
    'users.view': 'read',
    'users.create': 'write',  // Solo usuarios CLIENT
    'users.edit': 'write',    // Solo usuarios CLIENT
    'users.delete': 'write',  // Solo usuarios CLIENT
    'users.export': 'read',
    'users.import': 'none',
    'users.assign_role': 'none',
    'users.reset_password': 'write',  // Solo usuarios CLIENT
    'users.view_all': 'none',
    'users.manage': 'none',

    // Cotizaciones - FULL en mayoría
    'quotations.view': 'full',
    'quotations.view_all': 'full',
    'quotations.create': 'full',
    'quotations.edit': 'full',
    'quotations.delete': 'none',
    'quotations.export': 'full',
    'quotations.duplicate': 'full',
    'quotations.assign': 'full',
    'quotations.unassign': 'full',
    'quotations.restore': 'none',
    'quotations.manage': 'none',

    // Paquetes - FULL en mayoría
    'packages.view': 'full',
    'packages.view_all': 'full',
    'packages.create': 'full',
    'packages.edit': 'full',
    'packages.delete': 'none',
    'packages.export': 'full',
    'packages.import': 'full',
    'packages.restore': 'none',
    'packages.manage': 'none',

    // Servicios - FULL en mayoría
    'services.view': 'full',
    'services.view_all': 'full',
    'services.create': 'full',
    'services.edit': 'full',
    'services.delete': 'none',
    'services.export': 'full',
    'services.import': 'full',
    'services.restore': 'none',
    'services.manage': 'none',

    // Configuración - READ + algunos WRITE
    'config.view': 'read',
    'config.edit_general': 'none',
    'config.edit_branding': 'write',
    'config.edit_integrations': 'none',
    'config.edit_notifications': 'write',
    'config.export': 'none',
    'config.import': 'none',
    'config.reset': 'none',
    'config.view_sensitive': 'none',
    'config.manage': 'none',

    // Seguridad - READ solamente
    'security.roles.view': 'read',
    'security.roles.create': 'none',
    'security.roles.edit': 'none',
    'security.roles.delete': 'none',
    'security.roles.manage': 'none',
    'security.permissions.view': 'read',
    'security.permissions.create': 'none',
    'security.permissions.edit': 'none',
    'security.permissions.delete': 'none',
    'security.permissions.manage': 'none',
    'security.matrix.view': 'read',
    'security.matrix.edit': 'none',
    'security.user_permissions.view': 'read',
    'security.user_permissions.assign': 'none',
    'security.user_permissions.revoke': 'none',
    'security.user_permissions.manage': 'none',

    // Logs - READ solamente
    'logs.view': 'read',
    'logs.view_all': 'none',
    'logs.export': 'none',
    'logs.delete': 'none',
    'logs.view_sensitive': 'none',
    'logs.manage': 'none',

    // Backups - READ + WRITE en algunos
    'backups.view': 'read',
    'backups.view_all': 'none',
    'backups.create': 'write',
    'backups.restore': 'write',  // Solo sus propios backups
    'backups.delete': 'none',
    'backups.export': 'read',
    'backups.import': 'none',
    'backups.schedule': 'none',
    'backups.configure': 'none',
    'backups.manage': 'none',

    // Historial - FULL en mayoría
    'history.view': 'full',
    'history.view_all': 'full',
    'history.export': 'full',
    'history.filter': 'full',
    'history.delete': 'none',
    'history.restore': 'none',
    'history.manage': 'none',
  },

  'CLIENT': {
    // Usuarios - NONE en todos
    'users.view': 'none',
    'users.create': 'none',
    'users.edit': 'none',
    'users.delete': 'none',
    'users.export': 'none',
    'users.import': 'none',
    'users.assign_role': 'none',
    'users.reset_password': 'none',
    'users.view_all': 'none',
    'users.manage': 'none',

    // Cotizaciones - READ solamente (solo asignadas)
    'quotations.view': 'read',
    'quotations.view_all': 'none',
    'quotations.create': 'none',
    'quotations.edit': 'none',
    'quotations.delete': 'none',
    'quotations.export': 'read',
    'quotations.duplicate': 'none',
    'quotations.assign': 'none',
    'quotations.unassign': 'none',
    'quotations.restore': 'none',
    'quotations.manage': 'none',

    // Paquetes - READ solamente
    'packages.view': 'read',
    'packages.view_all': 'none',
    'packages.create': 'none',
    'packages.edit': 'none',
    'packages.delete': 'none',
    'packages.export': 'none',
    'packages.import': 'none',
    'packages.restore': 'none',
    'packages.manage': 'none',

    // Servicios - READ solamente
    'services.view': 'read',
    'services.view_all': 'none',
    'services.create': 'none',
    'services.edit': 'none',
    'services.delete': 'none',
    'services.export': 'none',
    'services.import': 'none',
    'services.restore': 'none',
    'services.manage': 'none',

    // Configuración - NONE en todos
    'config.view': 'none',
    'config.edit_general': 'none',
    'config.edit_branding': 'none',
    'config.edit_integrations': 'none',
    'config.edit_notifications': 'none',
    'config.export': 'none',
    'config.import': 'none',
    'config.reset': 'none',
    'config.view_sensitive': 'none',
    'config.manage': 'none',

    // Seguridad - NONE en todos
    'security.roles.view': 'none',
    'security.roles.create': 'none',
    'security.roles.edit': 'none',
    'security.roles.delete': 'none',
    'security.roles.manage': 'none',
    'security.permissions.view': 'none',
    'security.permissions.create': 'none',
    'security.permissions.edit': 'none',
    'security.permissions.delete': 'none',
    'security.permissions.manage': 'none',
    'security.matrix.view': 'none',
    'security.matrix.edit': 'none',
    'security.user_permissions.view': 'none',
    'security.user_permissions.assign': 'none',
    'security.user_permissions.revoke': 'none',
    'security.user_permissions.manage': 'none',

    // Logs - NONE en todos
    'logs.view': 'none',
    'logs.view_all': 'none',
    'logs.export': 'none',
    'logs.delete': 'none',
    'logs.view_sensitive': 'none',
    'logs.manage': 'none',

    // Backups - NONE en todos
    'backups.view': 'none',
    'backups.view_all': 'none',
    'backups.create': 'none',
    'backups.restore': 'none',
    'backups.delete': 'none',
    'backups.export': 'none',
    'backups.import': 'none',
    'backups.schedule': 'none',
    'backups.configure': 'none',
    'backups.manage': 'none',

    // Historial - READ (solo cotizaciones asignadas)
    'history.view': 'read',
    'history.view_all': 'none',
    'history.export': 'none',
    'history.filter': 'read',
    'history.delete': 'none',
    'history.restore': 'none',
    'history.manage': 'none',
  },
};

async function main() {
  console.log('🚀 Iniciando actualización de matriz de roles\n');

  // 1. Obtener todos los roles del sistema
  const roles = await prisma.role.findMany({
    where: {
      name: {
        in: ['SUPER_ADMIN', 'ADMIN', 'CLIENT'],
      },
    },
  });

  console.log(`1️⃣ Roles encontrados: ${roles.length}`);
  for (const role of roles) {
    console.log(`   - ${role.name} (${role.displayName}) - hierarchy: ${role.hierarchy}`);
  }
  console.log('');

  // 2. Obtener todos los permisos
  const permissions = await prisma.permission.findMany();
  console.log(`2️⃣ Permisos disponibles: ${permissions.length}\n`);

  // 3. Actualizar matriz para cada rol
  for (const role of roles) {
    const rolePermissions = ROLE_PERMISSIONS_MATRIX[role.name];
    if (!rolePermissions) {
      console.log(`   ⏭️  Saltando rol ${role.name} (sin configuración en matriz)\n`);
      continue;
    }

    console.log(`3️⃣ Actualizando matriz para rol: ${role.displayName}`);
    let updated = 0;
    let created = 0;
    let skipped = 0;

    for (const permission of permissions) {
      const accessLevel = rolePermissions[permission.code];
      if (!accessLevel) {
        skipped++;
        continue;
      }

      // Buscar si ya existe la relación
      const existing = await prisma.rolePermissions.findUnique({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
      });

      if (existing) {
        // Actualizar si cambió el accessLevel
        if (existing.accessLevel !== accessLevel) {
          await prisma.rolePermissions.update({
            where: { id: existing.id },
            data: { accessLevel },
          });
          updated++;
          console.log(`   ✅ Actualizado: ${permission.code} → ${accessLevel}`);
        } else {
          skipped++;
        }
      } else {
        // Crear nueva relación
        await prisma.rolePermissions.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
            accessLevel,
          },
        });
        created++;
        console.log(`   🆕 Creado: ${permission.code} → ${accessLevel}`);
      }
    }

    console.log(`\n   📊 Resumen para ${role.displayName}:`);
    console.log(`      - Creados: ${created}`);
    console.log(`      - Actualizados: ${updated}`);
    console.log(`      - Saltados: ${skipped}\n`);
  }

  // 4. Verificación final
  console.log('4️⃣ Verificación final...');
  for (const role of roles) {
    const count = await prisma.rolePermissions.count({
      where: { roleId: role.id },
    });
    console.log(`   - ${role.displayName}: ${count} permisos asignados`);
  }

  console.log('\n✨ Actualización de matriz completada!');
  console.log('\n📋 Próximos pasos:');
  console.log('   1. Implementar 5 capas de protección');
  console.log('   2. Actualizar helpers hasPermission() y usePermission()');
  console.log('   3. Proteger APIs con nuevos permisos');
  console.log('   4. Actualizar componentes UI con validaciones');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la actualización:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
