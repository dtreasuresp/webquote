/**
 * Servicio de scheduler para ejecutar reportes automáticos de auditoría
 * Se ejecuta en intervalos configurados según preferencias del usuario
 */

import { prisma } from '@/lib/prisma';
import { generateAuditReport, periodToDays } from '@/lib/audit-report-generator';

type ReportPeriod = 'daily' | 'weekly' | 'monthly';

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
 * Obtiene los usuarios con reportes automáticos habilitados
 */
async function getUsersWithAutoReportEnabled() {
  const preferences = await prisma.userPreferences.findMany({
    where: {
      auditAutoReportEnabled: true,
    },
    select: {
      userId: true,
      auditAutoReportPeriod: true,
      auditAutoReportHour: true,
      auditAutoReportMinute: true,
    },
  });

  return preferences;
}

/**
 * Calcula cuándo debería generarse el próximo reporte
 */
function calculateNextReportTime(period: ReportPeriod): Date {
  const now = new Date();

  switch (period) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Genera y guarda un reporte para un usuario específico
 */
export async function generateAndSaveReport(
  userId: string,
  period: ReportPeriod = 'weekly'
) {
  try {
    console.log(`[AUDIT REPORT] Generando reporte ${period} para usuario ${userId}`);

    // Generar reporte
    const report = await generateAuditReport(period);

    // Guardar en BD
    const savedReport = await prisma.auditReport.create({
      data: {
        userId,
        period,
        dateRangeFrom: report.dateRange.from,
        dateRangeTo: report.dateRange.to,
        totalLogs: report.summary.totalLogs,
        uniqueUsers: report.summary.uniqueUsers,
        uniqueActions: report.summary.uniqueActions,
        uniqueEntities: report.summary.uniqueEntities,
        reportData: report as any,
        status: 'completed',
        generatedBy: 'system',
      },
    });

    console.log(`[AUDIT REPORT] ✅ Reporte guardado: ${savedReport.id}`);
    return savedReport;
  } catch (error) {
    console.error(`[AUDIT REPORT] ❌ Error generando reporte para ${userId}:`, error);

    // Guardar error en BD
    try {
      await prisma.auditReport.create({
        data: {
          userId,
          period,
          dateRangeFrom: new Date(Date.now() - periodToDays(period) * 24 * 60 * 60 * 1000),
          dateRangeTo: new Date(),
          totalLogs: 0,
          uniqueUsers: 0,
          uniqueActions: 0,
          uniqueEntities: 0,
          reportData: {},
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error),
          generatedBy: 'system',
        },
      });
    } catch (saveError) {
      console.error('[AUDIT REPORT] Error guardando reporte fallido:', saveError);
    }

    throw error;
  }
}

/**
 * Ejecuta el scheduler para generar reportes automáticos
 * Debe ser llamado periódicamente (ej: cada hora vía cron)
 */
export async function runAutoReportScheduler() {
  console.log('[AUDIT REPORT] Iniciando scheduler de reportes automáticos...');

  try {
    const usersWithAutoReport = await getUsersWithAutoReportEnabled();

    if (usersWithAutoReport.length === 0) {
      console.log('[AUDIT REPORT] No hay usuarios con reportes automáticos habilitados');
      return;
    }

    console.log(`[AUDIT REPORT] Procesando ${usersWithAutoReport.length} usuarios`);

    // Procesar cada usuario que tenga la hora correcta
    const usersToProcess = usersWithAutoReport.filter((pref: any) => 
      shouldExecuteNow(pref.auditAutoReportHour, pref.auditAutoReportMinute)
    );

    if (usersToProcess.length === 0) {
      console.log('[AUDIT REPORT] No hay usuarios con hora de ejecución correcta en este momento');
      return;
    }

    console.log(`[AUDIT REPORT] Procesando ${usersToProcess.length} usuarios con hora coincidente`);

    // Procesar cada usuario
    const results = await Promise.allSettled(
      usersToProcess.map((pref: any) =>
        generateAndSaveReport(
          pref.userId,
          pref.auditAutoReportPeriod as ReportPeriod
        )
      )
    );

    // Contar resultados
    const successful = results.filter((r: PromiseSettledResult<any>) => r.status === 'fulfilled').length;
    const failed = results.filter((r: PromiseSettledResult<any>) => r.status === 'rejected').length;

    console.log(
      `[AUDIT REPORT] ✅ Completado: ${successful} exitosos, ${failed} fallidos`
    );
  } catch (error) {
    console.error('[AUDIT REPORT] Error en scheduler:', error);
  }
}

/**
 * Prueba la generación de reportes para un usuario específico
 */
export async function testGenerateReport(userId: string, period: ReportPeriod = 'weekly') {
  console.log(`[TEST] Generando reporte de prueba para ${userId}`);
  const report = await generateAndSaveReport(userId, period);
  console.log('[TEST] Reporte generado:', report.id);
  return report;
}

// Re-exportar para uso en cron jobs o API
export { prisma } from '@/lib/prisma';
