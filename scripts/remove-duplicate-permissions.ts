/**
 * Script para eliminar permisos duplicados (roles.manage y permissions.manage)
 * y mantener solo los permisos security.*
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Eliminando permisos duplicados...\n');

  // Permisos antiguos a eliminar
  const oldPermissions = ['roles.manage', 'permissions.manage'];

  for (const code of oldPermissions) {
    const permission = await prisma.permission.findUnique({
      where: { code },
      include: {
        _count: {
          select: {
            RolePermissions: true,
            UserPermission: true,
          },
        },
      },
    });

    if (!permission) {
      console.log(`  ⚠️  Permiso "${code}" no encontrado`);
      continue;
    }

    console.log(`\n📋 Procesando permiso: ${code}`);
    console.log(`   - RolePermissions: ${permission._count.RolePermissions}`);
    console.log(`   - UserPermissions: ${permission._count.UserPermission}`);

    // 1. Eliminar asignaciones de permisos por rol
    if (permission._count.RolePermissions > 0) {
      const deleted = await prisma.rolePermissions.deleteMany({
        where: { permissionId: permission.id },
      });
      console.log(`   ✅ Eliminadas ${deleted.count} asignaciones de rol`);
    }

    // 2. Eliminar permisos directos de usuario
    if (permission._count.UserPermission > 0) {
      const deleted = await prisma.userPermission.deleteMany({
        where: { permissionId: permission.id },
      });
      console.log(`   ✅ Eliminadas ${deleted.count} asignaciones de usuario`);
    }

    // 3. Eliminar el permiso
    await prisma.permission.delete({
      where: { id: permission.id },
    });
    console.log(`   ✅ Permiso "${code}" eliminado`);
  }

  console.log('\n✨ Limpieza de permisos duplicados completada!\n');
  console.log('💡 Ahora ejecuta: npx ts-node prisma/seed-permissions.ts');
  console.log('   Para crear los nuevos permisos security.* actualizados\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
