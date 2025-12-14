/**
 * Script de migración: 32 permisos actuales → 88 permisos granulares
 * Basado en PROPUESTA_SISTEMA_PERMISOS_GRANULAR.md
 * Ejecutar con: npx ts-node prisma/migrate-to-88-permissions.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Catálogo completo de 88 permisos granulares
const GRANULAR_PERMISSIONS = [
  // 1. USUARIOS (users.*) - 10 permisos
  { code: 'users.view', name: 'Ver usuarios', category: 'Usuarios', description: 'Listar y ver detalles de usuarios' },
  { code: 'users.create', name: 'Crear usuarios', category: 'Usuarios', description: 'Crear nuevos usuarios' },
  { code: 'users.edit', name: 'Editar usuarios', category: 'Usuarios', description: 'Modificar datos de usuarios' },
  { code: 'users.delete', name: 'Eliminar usuarios', category: 'Usuarios', description: 'Desactivar/eliminar usuarios' },
  { code: 'users.export', name: 'Exportar usuarios', category: 'Usuarios', description: 'Exportar lista a CSV/Excel' },
  { code: 'users.import', name: 'Importar usuarios', category: 'Usuarios', description: 'Importación masiva' },
  { code: 'users.assign_role', name: 'Asignar roles', category: 'Usuarios', description: 'Cambiar rol de usuario' },
  { code: 'users.reset_password', name: 'Resetear contraseñas', category: 'Usuarios', description: 'Forzar cambio de contraseña' },
  { code: 'users.view_all', name: 'Ver todos los usuarios', category: 'Usuarios', description: 'Incluye usuarios de otros admins' },
  { code: 'users.manage', name: 'Gestión completa usuarios', category: 'Usuarios', description: 'Equivale a todos los anteriores' },

  // 2. COTIZACIONES (quotations.*) - 11 permisos
  { code: 'quotations.view', name: 'Ver cotizaciones', category: 'Cotizaciones', description: 'Ver cotizaciones propias/asignadas' },
  { code: 'quotations.view_all', name: 'Ver todas las cotizaciones', category: 'Cotizaciones', description: 'Ver cotizaciones de todos los usuarios' },
  { code: 'quotations.create', name: 'Crear cotizaciones', category: 'Cotizaciones', description: 'Crear nuevas cotizaciones' },
  { code: 'quotations.edit', name: 'Editar cotizaciones', category: 'Cotizaciones', description: 'Modificar cotizaciones' },
  { code: 'quotations.delete', name: 'Eliminar cotizaciones', category: 'Cotizaciones', description: 'Eliminar cotizaciones' },
  { code: 'quotations.export', name: 'Exportar cotizaciones', category: 'Cotizaciones', description: 'Exportar a PDF/Excel' },
  { code: 'quotations.duplicate', name: 'Duplicar cotizaciones', category: 'Cotizaciones', description: 'Crear copia de cotización' },
  { code: 'quotations.assign', name: 'Asignar cotizaciones', category: 'Cotizaciones', description: 'Asignar a usuarios' },
  { code: 'quotations.unassign', name: 'Desasignar cotizaciones', category: 'Cotizaciones', description: 'Quitar asignación' },
  { code: 'quotations.restore', name: 'Restaurar cotizaciones', category: 'Cotizaciones', description: 'Restaurar eliminadas' },
  { code: 'quotations.manage', name: 'Gestión completa cotizaciones', category: 'Cotizaciones', description: 'Equivale a todos los anteriores' },

  // 3. PAQUETES (packages.*) - 9 permisos
  { code: 'packages.view', name: 'Ver paquetes', category: 'Paquetes', description: 'Ver paquetes públicos' },
  { code: 'packages.view_all', name: 'Ver todos los paquetes', category: 'Paquetes', description: 'Incluye paquetes privados' },
  { code: 'packages.create', name: 'Crear paquetes', category: 'Paquetes', description: 'Crear nuevos paquetes' },
  { code: 'packages.edit', name: 'Editar paquetes', category: 'Paquetes', description: 'Modificar paquetes' },
  { code: 'packages.delete', name: 'Eliminar paquetes', category: 'Paquetes', description: 'Eliminar paquetes' },
  { code: 'packages.export', name: 'Exportar paquetes', category: 'Paquetes', description: 'Exportar configuración' },
  { code: 'packages.import', name: 'Importar paquetes', category: 'Paquetes', description: 'Importar configuración' },
  { code: 'packages.restore', name: 'Restaurar paquetes', category: 'Paquetes', description: 'Restaurar eliminados' },
  { code: 'packages.manage', name: 'Gestión completa paquetes', category: 'Paquetes', description: 'Equivale a todos los anteriores' },

  // 4. SERVICIOS (services.*) - 9 permisos
  { code: 'services.view', name: 'Ver servicios', category: 'Servicios', description: 'Ver servicios base y opcionales' },
  { code: 'services.view_all', name: 'Ver todos los servicios', category: 'Servicios', description: 'Incluye servicios desactivados' },
  { code: 'services.create', name: 'Crear servicios', category: 'Servicios', description: 'Crear nuevos servicios' },
  { code: 'services.edit', name: 'Editar servicios', category: 'Servicios', description: 'Modificar servicios' },
  { code: 'services.delete', name: 'Eliminar servicios', category: 'Servicios', description: 'Eliminar servicios' },
  { code: 'services.export', name: 'Exportar servicios', category: 'Servicios', description: 'Exportar configuración' },
  { code: 'services.import', name: 'Importar servicios', category: 'Servicios', description: 'Importar configuración' },
  { code: 'services.restore', name: 'Restaurar servicios', category: 'Servicios', description: 'Restaurar eliminados' },
  { code: 'services.manage', name: 'Gestión completa servicios', category: 'Servicios', description: 'Equivale a todos los anteriores' },

  // 5. CONFIGURACIÓN (config.*) - 10 permisos
  { code: 'config.view', name: 'Ver configuración', category: 'Configuración', description: 'Acceder a PreferenciasTab' },
  { code: 'config.edit_general', name: 'Editar configuración general', category: 'Configuración', description: 'Modificar configuración básica' },
  { code: 'config.edit_branding', name: 'Editar branding', category: 'Configuración', description: 'Logo, colores, empresa' },
  { code: 'config.edit_integrations', name: 'Editar integraciones', category: 'Configuración', description: 'APIs, webhooks' },
  { code: 'config.edit_notifications', name: 'Editar notificaciones', category: 'Configuración', description: 'Configurar emails, alertas' },
  { code: 'config.export', name: 'Exportar configuración', category: 'Configuración', description: 'Exportar settings completos' },
  { code: 'config.import', name: 'Importar configuración', category: 'Configuración', description: 'Importar settings' },
  { code: 'config.reset', name: 'Resetear configuración', category: 'Configuración', description: 'Restaurar valores por defecto' },
  { code: 'config.view_sensitive', name: 'Ver datos sensibles', category: 'Configuración', description: 'API keys, contraseñas' },
  { code: 'config.manage', name: 'Gestión completa config', category: 'Configuración', description: 'Equivale a todos los anteriores' },

  // 6. SEGURIDAD (security.*) - 16 permisos
  { code: 'security.roles.view', name: 'Ver roles', category: 'Seguridad', description: 'Listar roles del sistema' },
  { code: 'security.roles.create', name: 'Crear roles', category: 'Seguridad', description: 'Crear roles personalizados' },
  { code: 'security.roles.edit', name: 'Editar roles', category: 'Seguridad', description: 'Modificar roles (no sistema)' },
  { code: 'security.roles.delete', name: 'Eliminar roles', category: 'Seguridad', description: 'Eliminar roles personalizados' },
  { code: 'security.roles.manage', name: 'Gestión completa roles', category: 'Seguridad', description: 'Equivale a create+edit+delete' },
  { code: 'security.permissions.view', name: 'Ver permisos', category: 'Seguridad', description: 'Listar permisos disponibles' },
  { code: 'security.permissions.create', name: 'Crear permisos', category: 'Seguridad', description: 'Crear permisos custom' },
  { code: 'security.permissions.edit', name: 'Editar permisos', category: 'Seguridad', description: 'Modificar permisos custom' },
  { code: 'security.permissions.delete', name: 'Eliminar permisos', category: 'Seguridad', description: 'Eliminar permisos custom' },
  { code: 'security.permissions.manage', name: 'Gestión completa permisos', category: 'Seguridad', description: 'Equivale a create+edit+delete' },
  { code: 'security.matrix.view', name: 'Ver matriz de acceso', category: 'Seguridad', description: 'Ver asignación rol-permiso' },
  { code: 'security.matrix.edit', name: 'Editar matriz', category: 'Seguridad', description: 'Modificar permisos de roles' },
  { code: 'security.user_permissions.view', name: 'Ver permisos usuarios', category: 'Seguridad', description: 'Ver permisos individuales' },
  { code: 'security.user_permissions.assign', name: 'Asignar permisos', category: 'Seguridad', description: 'Conceder permisos a usuarios' },
  { code: 'security.user_permissions.revoke', name: 'Revocar permisos', category: 'Seguridad', description: 'Denegar permisos a usuarios' },
  { code: 'security.user_permissions.manage', name: 'Gestión completa permisos usuarios', category: 'Seguridad', description: 'Equivale a assign+revoke' },

  // 7. LOGS DE AUDITORÍA (logs.*) - 6 permisos
  { code: 'logs.view', name: 'Ver logs', category: 'Logs', description: 'Ver logs de auditoría' },
  { code: 'logs.view_all', name: 'Ver todos los logs', category: 'Logs', description: 'Incluye logs de otros usuarios' },
  { code: 'logs.export', name: 'Exportar logs', category: 'Logs', description: 'Exportar a CSV/Excel' },
  { code: 'logs.delete', name: 'Eliminar logs', category: 'Logs', description: 'Eliminar registros antiguos' },
  { code: 'logs.view_sensitive', name: 'Ver acciones sensibles', category: 'Logs', description: 'Ver cambios de seguridad' },
  { code: 'logs.manage', name: 'Gestión completa logs', category: 'Logs', description: 'Equivale a todos los anteriores' },

  // 8. BACKUPS (backups.*) - 10 permisos
  { code: 'backups.view', name: 'Ver backups', category: 'Backups', description: 'Ver backups propios' },
  { code: 'backups.view_all', name: 'Ver todos los backups', category: 'Backups', description: 'Ver backups de todos' },
  { code: 'backups.create', name: 'Crear backups', category: 'Backups', description: 'Crear backup manual' },
  { code: 'backups.restore', name: 'Restaurar backups', category: 'Backups', description: 'Restaurar desde backup' },
  { code: 'backups.delete', name: 'Eliminar backups', category: 'Backups', description: 'Eliminar backups' },
  { code: 'backups.export', name: 'Exportar backups', category: 'Backups', description: 'Descargar archivo backup' },
  { code: 'backups.import', name: 'Importar backups', category: 'Backups', description: 'Subir archivo backup' },
  { code: 'backups.schedule', name: 'Programar backups', category: 'Backups', description: 'Configurar automáticos' },
  { code: 'backups.configure', name: 'Configurar sistema', category: 'Backups', description: 'Modificar configuración' },
  { code: 'backups.manage', name: 'Gestión completa backups', category: 'Backups', description: 'Equivale a todos los anteriores' },

  // 9. HISTORIAL (history.*) - 7 permisos
  { code: 'history.view', name: 'Ver historial', category: 'Historial', description: 'Ver historial de cotizaciones' },
  { code: 'history.view_all', name: 'Ver todo el historial', category: 'Historial', description: 'Incluye de todos los usuarios' },
  { code: 'history.export', name: 'Exportar historial', category: 'Historial', description: 'Exportar a CSV/Excel' },
  { code: 'history.filter', name: 'Filtrar historial', category: 'Historial', description: 'Usar filtros avanzados' },
  { code: 'history.delete', name: 'Eliminar entradas', category: 'Historial', description: 'Eliminar del historial' },
  { code: 'history.restore', name: 'Restaurar entradas', category: 'Historial', description: 'Recuperar eliminadas' },
  { code: 'history.manage', name: 'Gestión completa historial', category: 'Historial', description: 'Equivale a todos los anteriores' },
];

async function main() {
  console.log('🚀 Iniciando migración: 32 → 88 permisos granulares\n');

  // 1. Marcar todos los permisos actuales como isSystem=true (conservarlos)
  console.log('1️⃣ Marcando permisos actuales como del sistema...');
  const currentPermissions = await prisma.permission.findMany();
  console.log(`   Encontrados: ${currentPermissions.length} permisos existentes`);

  for (const perm of currentPermissions) {
    await prisma.permission.update({
      where: { id: perm.id },
      data: { isSystem: true },
    });
  }
  console.log('   ✅ Permisos existentes marcados como del sistema\n');

  // 2. Crear los 88 permisos granulares (insertando solo los nuevos)
  console.log('2️⃣ Creando 88 permisos granulares...');
  let created = 0;
  let skipped = 0;

  for (const permission of GRANULAR_PERMISSIONS) {
    const existing = await prisma.permission.findUnique({
      where: { code: permission.code },
    });

    if (existing) {
      skipped++;
      console.log(`   ⏭️  Saltando ${permission.code} (ya existe)`);
    } else {
      await prisma.permission.create({
        data: {
          ...permission,
          isSystem: true,
          isActive: true,
        },
      });
      created++;
      console.log(`   ✅ Creado: ${permission.code}`);
    }
  }

  console.log(`\n   📊 Resumen:`);
  console.log(`      - Creados: ${created} nuevos permisos`);
  console.log(`      - Saltados: ${skipped} (ya existían)`);
  console.log(`      - Total: ${GRANULAR_PERMISSIONS.length} permisos granulares\n`);

  // 3. Verificar total de permisos
  const totalPermissions = await prisma.permission.count();
  console.log(`3️⃣ Verificando estado final...`);
  console.log(`   📊 Total de permisos en BD: ${totalPermissions}`);

  if (totalPermissions >= 88) {
    console.log(`   ✅ Migración completada exitosamente!\n`);
  } else {
    console.log(`   ⚠️  Advertencia: Se esperaban 88+ permisos, pero hay ${totalPermissions}\n`);
  }

  // 4. Mostrar resumen por categoría
  console.log('4️⃣ Resumen por categoría:');
  const categories = await prisma.permission.groupBy({
    by: ['category'],
    _count: true,
  });

  for (const cat of categories) {
    console.log(`   - ${cat.category}: ${cat._count} permisos`);
  }

  console.log('\n✨ Migración completada!');
  console.log('\n📋 Próximos pasos:');
  console.log('   1. Ejecutar: npm run seed-roles (actualizar matriz de roles)');
  console.log('   2. Implementar 5 capas de protección');
  console.log('   3. Actualizar helpers hasPermission() y usePermission()');
  console.log('   4. Proteger APIs con nuevos permisos');
  console.log('   5. Actualizar componentes UI');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
