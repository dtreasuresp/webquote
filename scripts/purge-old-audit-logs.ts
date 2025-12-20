/**
 * Script para purgar logs de auditoría antiguos
 * Uso: npx ts-node scripts/purge-old-audit-logs.ts [--days=180] [--dryRun]
 * 
 * Ejemplo:
 * npx ts-node scripts/purge-old-audit-logs.ts                    # Purga logs con más de 180 días
 * npx ts-node scripts/purge-old-audit-logs.ts --days=90          # Purga logs con más de 90 días
 * npx ts-node scripts/purge-old-audit-logs.ts --dryRun           # Simula purga sin eliminar
 * npx ts-node scripts/purge-old-audit-logs.ts --days=180 --dryRun # Simula purga de 180 días
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PurgeOptions {
  retentionDays: number;
  dryRun: boolean;
}

/**
 * Calcula la fecha límite para purga basada en días de retención
 */
function calculateCutoffDate(retentionDays: number): Date {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);
  return cutoffDate;
}

/**
 * Purga logs de auditoría antiguos
 */
async function purgeOldAuditLogs(options: PurgeOptions): Promise<void> {
  const cutoffDate = calculateCutoffDate(options.retentionDays);

  console.log('🗑️  Iniciando purga de logs de auditoría...');
  console.log(`📅 Fecha límite: ${cutoffDate.toISOString()}`);
  console.log(`📊 Retención: ${options.retentionDays} días`);

  if (options.dryRun) {
    console.log('⚠️  Modo SIMULACIÓN: No se eliminarán datos reales\n');
  }

  try {
    // Contar logs que serán eliminados
    const logsToDelete = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
        action: true,
        createdAt: true,
      },
    });

    console.log(`\n📋 Logs encontrados para eliminar: ${logsToDelete.length}`);

    if (logsToDelete.length === 0) {
      console.log('✅ No hay logs que eliminar. Retención en orden.');
      return;
    }

    // Agrupar por acción para estadísticas
    const actionStats: Record<string, number> = {};
    logsToDelete.forEach((log) => {
      actionStats[log.action] = (actionStats[log.action] || 0) + 1;
    });

    console.log('\n📊 Desglose por acción:');
    Object.entries(actionStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([action, count]) => {
        console.log(`   ${action}: ${count} registro(s)`);
      });

    // Agrupar por rango de fechas para visualización
    const dateRanges: Record<string, number> = {};
    logsToDelete.forEach((log) => {
      const month = log.createdAt.toISOString().substring(0, 7); // YYYY-MM
      dateRanges[month] = (dateRanges[month] || 0) + 1;
    });

    console.log('\n📅 Desglose por mes:');
    Object.entries(dateRanges)
      .sort()
      .forEach(([month, count]) => {
        console.log(`   ${month}: ${count} registro(s)`);
      });

    if (options.dryRun) {
      console.log(`\n✅ Simulación completada. Se eliminarían ${logsToDelete.length} logs.`);
    } else {
      // Ejecutar eliminación en lotes para evitar bloqueos
      const BATCH_SIZE = 1000;
      let deleted = 0;

      console.log(`\n🚀 Eliminando logs en lotes de ${BATCH_SIZE}...`);

      for (let i = 0; i < logsToDelete.length; i += BATCH_SIZE) {
        const batch = logsToDelete.slice(i, i + BATCH_SIZE).map((log) => log.id);

        const result = await prisma.auditLog.deleteMany({
          where: {
            id: {
              in: batch,
            },
          },
        });

        deleted += result.count;
        const progress = ((i + batch.length) / logsToDelete.length * 100).toFixed(1);
        console.log(`   Progreso: ${progress}% (${deleted}/${logsToDelete.length})`);
      }

      console.log(
        `\n✅ Purga completada exitosamente. ${deleted} logs eliminados.`
      );

      // Estadísticas post-purga
      const remaining = await prisma.auditLog.count();
      console.log(`📊 Logs restantes en base de datos: ${remaining}`);
    }
  } catch (error) {
    console.error('\n❌ Error durante la purga:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Parsea argumentos de línea de comandos
 */
function parseArgs(): PurgeOptions {
  const retentionDaysArg = process.argv.find((arg) => arg.startsWith('--days='));
  const dryRunArg = process.argv.includes('--dryRun');

  const retentionDays = retentionDaysArg
    ? Number.parseInt(retentionDaysArg.split('=')[1], 10)
    : Number.parseInt(process.env.AUDIT_RETENTION_DAYS || '180', 10);

  if (Number.isNaN(retentionDays) || retentionDays < 1) {
    throw new Error('AUDIT_RETENTION_DAYS debe ser un número válido mayor a 0');
  }

  return {
    retentionDays,
    dryRun: dryRunArg,
  };
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const options = parseArgs();
  
  async function main() {
    try {
      await purgeOldAuditLogs(options);
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  }
  
  void main();
}

export { purgeOldAuditLogs, PurgeOptions };
