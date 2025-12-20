/**
 * Servicio de scheduler para ejecutar backups automáticos
 * Se ejecuta en intervalos configurados según preferencias del usuario
 */

import { prisma } from '@/lib/prisma';

type BackupPeriod = 'daily' | 'weekly' | 'monthly';

/**
 * Valida si la hora actual coincide con la hora programada (± 5 minutos de ventana)
 */
export function shouldExecuteNow(scheduledHour: number, scheduledMinute: number): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Ventana de ejecución: ±5 minutos
  const EXECUTION_WINDOW = 5;

  if (currentHour !== scheduledHour) {
    return false;
  }

  // Mismo hora, verificar minutos con ventana
  return Math.abs(currentMinute - scheduledMinute) <= EXECUTION_WINDOW;
}

/**
 * Obtiene los usuarios con backups automáticos habilitados
 */
async function getUsersWithAutoBackupEnabled() {
  const preferences = await prisma.userPreferences.findMany({
    where: {
      autoBackupEnabled: true,
    },
    select: {
      userId: true,
      autoBackupPeriod: true,
      autoBackupHour: true,
      autoBackupMinute: true,
      autoBackupRetentionDays: true,
    },
  });

  return preferences;
}

/**
 * Ejecuta un backup para un usuario específico
 */
export async function executeBackupForUser(
  userId: string,
  period: BackupPeriod = 'weekly'
) {
  try {
    console.log(`[AUTO BACKUP] Ejecutando backup ${period} para usuario ${userId}`);

    // Llamar al endpoint de backups
    const response = await fetch('/api/backups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        type: 'auto',
        period,
        description: `Automatic ${period} backup`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backup API returned status ${response.status}`);
    }

    const result = await response.json();
    console.log(`[AUTO BACKUP] ✅ Backup completado para ${userId}: ${result.id}`);
    return result;
  } catch (error) {
    console.error(`[AUTO BACKUP] ❌ Error ejecutando backup para ${userId}:`, error);
    throw error;
  }
}

/**
 * Limpia backups antiguos según la política de retención
 */
export async function cleanOldBackups(userId: string, retentionDays: number) {
  try {
    console.log(`[AUTO BACKUP] Limpiando backups antiguos para ${userId} (retención: ${retentionDays} días)`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Eliminar backups más antiguos que la fecha límite
    const deleted = await prisma.userBackup.deleteMany({
      where: {
        userId,
        createdAt: {
          lt: cutoffDate,
        },
        tipo: 'auto', // Solo eliminar backups automáticos
      },
    });

    if (deleted.count > 0) {
      console.log(`[AUTO BACKUP] ✅ Eliminados ${deleted.count} backups antiguos para ${userId}`);
    } else {
      console.log(`[AUTO BACKUP] No hay backups antiguos para eliminar para ${userId}`);
    }

    return deleted.count;
  } catch (error) {
    console.error(`[AUTO BACKUP] ❌ Error limpiando backups antiguos para ${userId}:`, error);
    throw error;
  }
}

/**
 * Ejecuta el scheduler para generar backups automáticos
 * Debe ser llamado periódicamente (ej: cada hora vía cron)
 */
export async function runAutoBackupScheduler() {
  console.log('[AUTO BACKUP] Iniciando scheduler de backups automáticos...');

  try {
    const usersWithAutoBackup = await getUsersWithAutoBackupEnabled();

    if (usersWithAutoBackup.length === 0) {
      console.log('[AUTO BACKUP] No hay usuarios con backups automáticos habilitados');
      return;
    }

    console.log(`[AUTO BACKUP] Encontrados ${usersWithAutoBackup.length} usuarios con backups automáticos`);

    // Procesar cada usuario que tenga la hora correcta
    const usersToProcess = usersWithAutoBackup.filter((pref: any) => 
      shouldExecuteNow(pref.autoBackupHour, pref.autoBackupMinute)
    );

    if (usersToProcess.length === 0) {
      console.log('[AUTO BACKUP] No hay usuarios con hora de ejecución correcta en este momento');
      return;
    }

    console.log(`[AUTO BACKUP] Procesando ${usersToProcess.length} usuarios con hora coincidente`);

    // Procesar cada usuario
    const results = await Promise.allSettled(
      usersToProcess.map(async (pref: any) => {
        // Ejecutar backup
        const backup = await executeBackupForUser(
          pref.userId,
          pref.autoBackupPeriod as BackupPeriod
        );

        // Limpiar backups antiguos
        await cleanOldBackups(pref.userId, pref.autoBackupRetentionDays);

        return backup;
      })
    );

    // Contar resultados
    const successful = results.filter((r: PromiseSettledResult<any>) => r.status === 'fulfilled').length;
    const failed = results.filter((r: PromiseSettledResult<any>) => r.status === 'rejected').length;

    console.log(
      `[AUTO BACKUP] ✅ Completado: ${successful} exitosos, ${failed} fallidos`
    );
  } catch (error) {
    console.error('[AUTO BACKUP] Error en scheduler:', error);
  }
}

/**
 * Prueba la ejecución de backup para un usuario específico
 */
export async function testExecuteBackup(userId: string, period: BackupPeriod = 'weekly') {
  console.log(`[TEST] Ejecutando backup de prueba para ${userId}`);
  const backup = await executeBackupForUser(userId, period);
  console.log('[TEST] Backup ejecutado:', backup.id);
  return backup;
}

// Re-exportar para uso en cron jobs o API
export { prisma } from '@/lib/prisma';
