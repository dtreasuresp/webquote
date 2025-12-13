/**
 * Script de Migración: UserRole enum → Role model dinámico
 * 
 * Este script:
 * 1. Crea los roles del sistema (SUPER_ADMIN, ADMIN, CLIENT)
 * 2. Migra los permisos de RolePermission (legacy) a RolePermissions (nuevo)
 * 3. Asigna roleId a todos los usuarios existentes basándose en su enum role
 * 
 * Ejecutar con: npx ts-node prisma/migrate-roles.ts
 */

import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Definición de roles del sistema
const SYSTEM_ROLES = [
  {
    name: 'SUPER_ADMIN',
    displayName: 'Super Administrador',
    description: 'Control total del sistema, gestión de roles y permisos, creación de otros Super Admin',
    hierarchy: 100,
    color: '#DC2626', // red-600
    isSystem: true,
  },
  {
    name: 'ADMIN',
    displayName: 'Administrador',
    description: 'Gestión de clientes, cotizaciones y configuraciones del sistema',
    hierarchy: 50,
    color: '#2563EB', // blue-600
    isSystem: true,
  },
  {
    name: 'CLIENT',
    displayName: 'Cliente',
    description: 'Acceso solo a cotizaciones asignadas',
    hierarchy: 10,
    color: '#16A34A', // green-600
    isSystem: true,
  },
];

async function migrateRoles() {
  console.log('🚀 Iniciando migración de roles...\n');

  // 1. Crear roles del sistema
  console.log('📦 Creando roles del sistema...');
  const createdRoles: Record<string, string> = {};

  for (const roleData of SYSTEM_ROLES) {
    const existingRole = await prisma.role.findUnique({
      where: { name: roleData.name },
    });

    if (existingRole) {
      console.log(`  ⏭️  Rol ${roleData.name} ya existe (id: ${existingRole.id})`);
      createdRoles[roleData.name] = existingRole.id;
    } else {
      const role = await prisma.role.create({
        data: roleData,
      });
      console.log(`  ✅ Creado rol ${role.name} (id: ${role.id})`);
      createdRoles[roleData.name] = role.id;
    }
  }

  // 2. Migrar permisos de RolePermission (legacy) a RolePermissions (nuevo)
  console.log('\n🔑 Migrando permisos de roles...');
  
  const legacyPermissions = await prisma.rolePermission.findMany({
    include: { Permission: true },
  });

  console.log(`  📊 Encontrados ${legacyPermissions.length} permisos legacy`);

  for (const legacyPerm of legacyPermissions) {
    const roleId = createdRoles[legacyPerm.role];
    if (!roleId) {
      console.log(`  ⚠️  No se encontró rol para ${legacyPerm.role}, saltando...`);
      continue;
    }

    // Verificar si ya existe
    const existing = await prisma.rolePermissions.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId: legacyPerm.permissionId,
        },
      },
    });

    if (existing) {
      console.log(`  ⏭️  Permiso ${legacyPerm.Permission.code} ya existe para rol`);
      continue;
    }

    // Convertir enabled a accessLevel
    const accessLevel = legacyPerm.enabled ? 'full' : 'none';

    await prisma.rolePermissions.create({
      data: {
        roleId,
        permissionId: legacyPerm.permissionId,
        accessLevel,
      },
    });
    console.log(`  ✅ Migrado permiso ${legacyPerm.Permission.code} → ${legacyPerm.role}`);
  }

  // 3. Asignar roleId a usuarios existentes
  console.log('\n👥 Migrando usuarios a roles dinámicos...');
  
  const users = await prisma.user.findMany({
    where: { roleId: null },
  });

  console.log(`  📊 Encontrados ${users.length} usuarios sin roleId`);

  for (const user of users) {
    const roleId = createdRoles[user.role];
    if (!roleId) {
      console.log(`  ⚠️  No se encontró rol para ${user.role}, usuario ${user.username}`);
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { roleId },
    });
    console.log(`  ✅ Usuario ${user.username} → roleId ${roleId}`);
  }

  // 4. Marcar permisos existentes como isSystem
  console.log('\n🔒 Marcando permisos del sistema...');
  
  const permissionsToMark = await prisma.permission.findMany({
    where: { isSystem: false },
  });

  if (permissionsToMark.length > 0) {
    await prisma.permission.updateMany({
      where: {
        id: { in: permissionsToMark.map(p => p.id) },
      },
      data: { isSystem: true },
    });
    console.log(`  ✅ Marcados ${permissionsToMark.length} permisos como sistema`);
  }

  // 5. Registrar en AuditLog
  console.log('\n📝 Registrando en log de auditoría...');
  
  await prisma.auditLog.create({
    data: {
      action: 'system.migration.roles',
      entityType: 'Role',
      entityId: null,
      userId: null,
      userName: 'SYSTEM',
      details: {
        rolesCreated: Object.keys(createdRoles).length,
        permissionsMigrated: legacyPermissions.length,
        usersMigrated: users.length,
        timestamp: new Date().toISOString(),
      },
    },
  });

  console.log('\n✨ Migración completada exitosamente!\n');
  
  // Resumen final
  console.log('📋 Resumen:');
  console.log(`  • Roles creados: ${Object.keys(createdRoles).length}`);
  console.log(`  • Permisos migrados: ${legacyPermissions.length}`);
  console.log(`  • Usuarios actualizados: ${users.length}`);
  console.log('\n💡 Nota: El enum UserRole y RolePermission se mantienen para compatibilidad.');
  console.log('   Pueden eliminarse en una migración futura después de verificar que todo funciona.\n');
}

async function main() {
  try {
    await migrateRoles();
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
