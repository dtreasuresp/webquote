/**
 * Script para generar reportes de auditoría
 * Uso: npx ts-node scripts/generate-audit-report.ts [--period=monthly|weekly|daily] [--days=30]
 * 
 * Ejemplo:
 * npx ts-node scripts/generate-audit-report.ts                   # Reporte mensual
 * npx ts-node scripts/generate-audit-report.ts --period=weekly   # Reporte semanal
 * npx ts-node scripts/generate-audit-report.ts --period=daily    # Reporte diario
 * npx ts-node scripts/generate-audit-report.ts --days=90         # Reporte de últimos 90 días
 */

import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const prisma = new PrismaClient();

interface ReportOptions {
  period: 'monthly' | 'weekly' | 'daily';
  days: number;
}

interface ActionStats {
  action: string;
  count: number;
  percentage: string;
  firstOccurrence: Date;
  lastOccurrence: Date;
}

interface EntityStats {
  entityType: string;
  count: number;
  percentage: string;
  actions: Record<string, number>;
}

interface UserStats {
  userName: string;
  userId: string;
  count: number;
  actions: Record<string, number>;
  firstActivity: Date;
  lastActivity: Date;
}

interface AuditReport {
  generatedAt: Date;
  period: ReportOptions['period'];
  dateRange: {
    from: Date;
    to: Date;
  };
  summary: {
    totalLogs: number;
    uniqueUsers: number;
    uniqueActions: number;
    uniqueEntities: number;
  };
  topActions: ActionStats[];
  entityDistribution: EntityStats[];
  topUsers: UserStats[];
  dailyActivity: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * Calcula el rango de fechas basado en el período
 */
function calculateDateRange(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, to };
}

/**
 * Obtiene las acciones principales
 */
async function getTopActions(from: Date, to: Date): Promise<ActionStats[]> {
  const actions = await prisma.auditLog.groupBy({
    by: ['action'],
    where: {
      createdAt: {
        gte: from,
        lte: to,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });

  const total = actions.reduce((sum, a) => sum + a._count.id, 0);

  const actionStats: ActionStats[] = [];

  for (const action of actions) {
    const logs = await prisma.auditLog.findMany({
      where: {
        action: action.action,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    actionStats.push({
      action: action.action,
      count: action._count.id,
      percentage: ((action._count.id / total) * 100).toFixed(2) + '%',
      firstOccurrence: logs[0].createdAt,
      lastOccurrence: logs[logs.length - 1].createdAt,
    });
  }

  return actionStats;
}

/**
 * Obtiene la distribución por tipo de entidad
 */
async function getEntityDistribution(from: Date, to: Date): Promise<EntityStats[]> {
  const entities = await prisma.auditLog.groupBy({
    by: ['entityType'],
    where: {
      createdAt: {
        gte: from,
        lte: to,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });

  const total = entities.reduce((sum, e) => sum + e._count.id, 0);

  const entityStats: EntityStats[] = [];

  for (const entity of entities) {
    const actionCounts = await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        entityType: entity.entityType,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      _count: {
        id: true,
      },
    });

    const actions: Record<string, number> = {};
    actionCounts.forEach((ac) => {
      actions[ac.action] = ac._count.id;
    });

    entityStats.push({
      entityType: entity.entityType,
      count: entity._count.id,
      percentage: ((entity._count.id / total) * 100).toFixed(2) + '%',
      actions,
    });
  }

  return entityStats;
}

/**
 * Obtiene los usuarios más activos
 */
async function getTopUsers(from: Date, to: Date, limit: number = 10): Promise<UserStats[]> {
  const users = await prisma.auditLog.groupBy({
    by: ['userId', 'userName'],
    where: {
      createdAt: {
        gte: from,
        lte: to,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: limit,
  });

  const userStats: UserStats[] = [];

  for (const user of users) {
    const logs = await prisma.auditLog.findMany({
      where: {
        userId: user.userId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      select: {
        action: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const actions: Record<string, number> = {};
    logs.forEach((log) => {
      actions[log.action] = (actions[log.action] || 0) + 1;
    });

    userStats.push({
      userName: user.userName || 'Unknown',
      userId: user.userId || 'unknown',
      count: user._count.id,
      actions,
      firstActivity: logs[0].createdAt,
      lastActivity: logs[logs.length - 1].createdAt,
    });
  }

  return userStats;
}

/**
 * Obtiene la actividad diaria
 */
async function getDailyActivity(from: Date, to: Date): Promise<Array<{ date: string; count: number }>> {
  const logs = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: from,
        lte: to,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const dailyMap: Record<string, number> = {};

  logs.forEach((log) => {
    const dateStr = log.createdAt.toISOString().split('T')[0];
    dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;
  });

  return Object.entries(dailyMap)
    .sort()
    .map(([date, count]) => ({
      date,
      count,
    }));
}

/**
 * Genera el reporte completo de auditoría
 */
async function generateAuditReport(options: ReportOptions): Promise<AuditReport> {
  const dateRange = calculateDateRange(options.days);

  console.log(`📊 Generando reporte ${options.period}...`);
  console.log(`📅 Período: ${dateRange.from.toISOString()} a ${dateRange.to.toISOString()}`);

  try {
    // Obtener resumen general
    const totalLogs = await prisma.auditLog.count({
      where: {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
    });

    const uniqueUsers = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
      distinct: ['userId'],
      select: {
        userId: true,
      },
    });

    const uniqueActions = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
      distinct: ['action'],
      select: {
        action: true,
      },
    });

    const uniqueEntities = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
      distinct: ['entityType'],
      select: {
        entityType: true,
      },
    });

    console.log('  ✅ Resumen obtenido');

    // Obtener datos analíticos
    console.log('  ⏳ Procesando acciones principales...');
    const topActions = await getTopActions(dateRange.from, dateRange.to);

    console.log('  ⏳ Procesando distribución de entidades...');
    const entityDistribution = await getEntityDistribution(dateRange.from, dateRange.to);

    console.log('  ⏳ Procesando usuarios principales...');
    const topUsers = await getTopUsers(dateRange.from, dateRange.to);

    console.log('  ⏳ Procesando actividad diaria...');
    const dailyActivity = await getDailyActivity(dateRange.from, dateRange.to);

    console.log('  ✅ Datos procesados');

    return {
      generatedAt: new Date(),
      period: options.period,
      dateRange,
      summary: {
        totalLogs,
        uniqueUsers: uniqueUsers.length,
        uniqueActions: uniqueActions.length,
        uniqueEntities: uniqueEntities.length,
      },
      topActions,
      entityDistribution,
      topUsers,
      dailyActivity,
    };
  } catch (error) {
    console.error('❌ Error generando reporte:', error);
    throw error;
  }
}

/**
 * Formatea el reporte en HTML
 */
function formatReportAsHTML(report: AuditReport): string {
  const cssStyles = `
    <style>
      * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      body { background: #0d1117; color: #c9d1d9; padding: 20px; margin: 0; }
      .container { max-width: 1200px; margin: 0 auto; }
      h1 { color: #58a6ff; border-bottom: 2px solid #30363d; padding-bottom: 10px; }
      h2 { color: #79c0ff; margin-top: 30px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; background: #161b22; }
      th { background: #0d1117; color: #58a6ff; padding: 12px; text-align: left; border-bottom: 2px solid #30363d; }
      td { padding: 12px; border-bottom: 1px solid #30363d; }
      tr:hover { background: #1c2128; }
      .stat { display: inline-block; background: #161b22; padding: 15px 20px; margin: 10px 10px 10px 0; border-radius: 6px; border-left: 4px solid #58a6ff; }
      .stat strong { color: #58a6ff; }
      .percentage { color: #79c0ff; }
      .badge { display: inline-block; background: #238636; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin: 2px; }
      .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #30363d; color: #8b949e; font-size: 12px; }
    </style>
  `;

  let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Auditoría - ${report.period}</title>
  ${cssStyles}
</head>
<body>
  <div class="container">
    <h1>📊 Reporte de Auditoría (${report.period.charAt(0).toUpperCase() + report.period.slice(1)})</h1>
    <p>Generado: ${report.generatedAt.toLocaleString('es-ES')}</p>
    <p>Período: ${report.dateRange.from.toLocaleDateString('es-ES')} - ${report.dateRange.to.toLocaleDateString('es-ES')}</p>

    <h2>📈 Resumen General</h2>
    <div>
      <div class="stat"><strong>Total Logs:</strong> ${report.summary.totalLogs.toLocaleString('es-ES')}</div>
      <div class="stat"><strong>Usuarios Únicos:</strong> ${report.summary.uniqueUsers}</div>
      <div class="stat"><strong>Acciones Únicas:</strong> ${report.summary.uniqueActions}</div>
      <div class="stat"><strong>Entidades Únicas:</strong> ${report.summary.uniqueEntities}</div>
    </div>

    <h2>🏆 Acciones Principales</h2>
    <table>
      <tr>
        <th>Acción</th>
        <th>Cantidad</th>
        <th>Porcentaje</th>
        <th>Primera Ocurrencia</th>
        <th>Última Ocurrencia</th>
      </tr>
  `;

  report.topActions.slice(0, 15).forEach((action) => {
    html += `
      <tr>
        <td><span class="badge">${action.action}</span></td>
        <td>${action.count.toLocaleString('es-ES')}</td>
        <td><span class="percentage">${action.percentage}</span></td>
        <td>${action.firstOccurrence.toLocaleString('es-ES')}</td>
        <td>${action.lastOccurrence.toLocaleString('es-ES')}</td>
      </tr>
    `;
  });

  html += `
    </table>

    <h2>📦 Distribución por Entidad</h2>
    <table>
      <tr>
        <th>Tipo de Entidad</th>
        <th>Cantidad</th>
        <th>Porcentaje</th>
        <th>Acciones</th>
      </tr>
  `;

  report.entityDistribution.forEach((entity) => {
    const actions = Object.entries(entity.actions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([action, count]) => `${action}(${count})`)
      .join(', ');

    html += `
      <tr>
        <td><span class="badge">${entity.entityType}</span></td>
        <td>${entity.count.toLocaleString('es-ES')}</td>
        <td><span class="percentage">${entity.percentage}</span></td>
        <td>${actions}</td>
      </tr>
    `;
  });

  html += `
    </table>

    <h2>👥 Usuarios Principales</h2>
    <table>
      <tr>
        <th>Usuario</th>
        <th>Actividades</th>
        <th>Primera Actividad</th>
        <th>Última Actividad</th>
        <th>Acciones Principales</th>
      </tr>
  `;

  report.topUsers.forEach((user) => {
    const topActions = Object.entries(user.actions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([action, count]) => `${action}(${count})`)
      .join(', ');

    html += `
      <tr>
        <td><strong>${user.userName}</strong></td>
        <td>${user.count.toLocaleString('es-ES')}</td>
        <td>${user.firstActivity.toLocaleString('es-ES')}</td>
        <td>${user.lastActivity.toLocaleString('es-ES')}</td>
        <td>${topActions}</td>
      </tr>
    `;
  });

  html += `
    </table>

    <div class="footer">
      <p>Este reporte fue generado automáticamente. Los datos mostrados reflejan la auditoría del sistema.</p>
    </div>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Parsea argumentos de línea de comandos
 */
function parseArgs(): ReportOptions {
  const periodArg = process.argv.find((arg) => arg.startsWith('--period='));
  const daysArg = process.argv.find((arg) => arg.startsWith('--days='));

  const period = (
    periodArg?.split('=')[1] || process.env.AUDIT_REPORT_PERIOD || 'monthly'
  ) as 'monthly' | 'weekly' | 'daily';

  const daysMap: Record<string, number> = {
    daily: 1,
    weekly: 7,
    monthly: 30,
  };

  let days = daysMap[period];

  if (daysArg) {
    days = Number.parseInt(daysArg.split('=')[1], 10);
  }

  if (Number.isNaN(days) || days < 1) {
    throw new Error('Días debe ser un número válido mayor a 0');
  }

  return { period, days };
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const options = parseArgs();

  async function main() {
    const report = await generateAuditReport(options);
    const html = formatReportAsHTML(report);

    // Generar nombre de archivo
    const timestamp = report.generatedAt.toISOString().split('T')[0];
    const filename = `audit-report-${options.period}-${timestamp}.html`;
    const filepath = join(process.cwd(), 'docs', 'reports', filename);

    writeFileSync(filepath, html);

    console.log(`\n✅ Reporte generado exitosamente`);
    console.log(`📁 Ubicación: ${filepath}`);
    console.log(`📊 Total logs: ${report.summary.totalLogs}`);
    console.log(`👥 Usuarios únicos: ${report.summary.uniqueUsers}`);
    console.log(`🏷️  Acciones únicas: ${report.summary.uniqueActions}`);
  }

  main()
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { generateAuditReport, AuditReport, ReportOptions };
