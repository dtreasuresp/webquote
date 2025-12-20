/**
 * Generador de reportes de auditoría reutilizable
 * Puede ser usado tanto por cron jobs como por API endpoints
 */

import { prisma } from '@/lib/prisma';

type ReportPeriod = 'monthly' | 'weekly' | 'daily';

interface ReportOptions {
  period: ReportPeriod;
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

interface DailyActivity {
  date: string;
  count: number;
}

export interface GeneratedAuditReport {
  generatedAt: Date;
  period: ReportPeriod;
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
  dailyActivity: DailyActivity[];
}

/**
 * Calcula el rango de fechas basado en el período
 */
export function calculateDateRange(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, to };
}

/**
 * Convierte período en número de días
 */
export function periodToDays(period: ReportPeriod): number {
  switch (period) {
    case 'daily':
      return 1;
    case 'weekly':
      return 7;
    case 'monthly':
      return 30;
    default:
      return 7;
  }
}

/**
 * Obtiene las acciones principales
 */
export async function getTopActions(
  from: Date,
  to: Date,
  limit: number = 10
): Promise<ActionStats[]> {
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
    take: limit,
  });

  const total = actions.reduce((sum: number, a: typeof actions[0]) => sum + a._count.id, 0);
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

    if (logs.length > 0) {
      actionStats.push({
        action: action.action,
        count: action._count.id,
        percentage: ((action._count.id / total) * 100).toFixed(2) + '%',
        firstOccurrence: logs[0].createdAt,
        lastOccurrence: logs.at(-1)!.createdAt,
      });
    }
  }

  return actionStats;
}

/**
 * Obtiene la distribución por tipo de entidad
 */
export async function getEntityDistribution(
  from: Date,
  to: Date
): Promise<EntityStats[]> {
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

  const total = entities.reduce((sum: number, e: typeof entities[0]) => sum + e._count.id, 0);
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
    actionCounts.forEach((ac: { action: string; _count: { id: number } }) => {
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
export async function getTopUsers(
  from: Date,
  to: Date,
  limit: number = 10
): Promise<UserStats[]> {
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
    const userLogs = await prisma.auditLog.findMany({
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
    userLogs.forEach((log: { action: string; createdAt: Date }) => {
      actions[log.action] = (actions[log.action] || 0) + 1;
    });

    userStats.push({
      userName: user.userName || 'Unknown',
      userId: user.userId || 'unknown',
      count: user._count.id,
      actions,
      firstActivity: userLogs[0]?.createdAt || new Date(),
      lastActivity: userLogs.at(-1)?.createdAt || new Date(),
    });
  }

  return userStats;
}

/**
 * Obtiene la actividad diaria
 */
export async function getDailyActivity(
  from: Date,
  to: Date
): Promise<DailyActivity[]> {
  // Obtener logs agrupados por día
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
    orderBy: {
      createdAt: 'asc',
    },
  });

  const dailyActivity: Map<string, number> = new Map();

  logs.forEach((log: { createdAt: Date }) => {
    const date = log.createdAt.toISOString().split('T')[0];
    dailyActivity.set(date, (dailyActivity.get(date) || 0) + 1);
  });

  // Llenar los días faltantes con 0
  const result: DailyActivity[] = [];
  const current = new Date(from);
  while (current <= to) {
    const dateStr = current.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: dailyActivity.get(dateStr) || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * Genera un reporte completo de auditoría
 */
export async function generateAuditReport(
  period: ReportPeriod = 'weekly',
  days?: number
): Promise<GeneratedAuditReport> {
  const periodDays = days || periodToDays(period);
  const { from, to } = calculateDateRange(periodDays);

  // Obtener resumen básico
  const [totalLogs, uniqueUsersData, uniqueActionsData, uniqueEntitiesData] = await Promise.all([
    prisma.auditLog.count({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    }),
    prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    }),
    prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    }),
    prisma.auditLog.groupBy({
      by: ['entityType'],
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    }),
  ]);

  const [topActions, entityDistribution, topUsers, dailyActivity] = await Promise.all([
    getTopActions(from, to),
    getEntityDistribution(from, to),
    getTopUsers(from, to),
    getDailyActivity(from, to),
  ]);

  return {
    generatedAt: new Date(),
    period,
    dateRange: { from, to },
    summary: {
      totalLogs,
      uniqueUsers: uniqueUsersData.length,
      uniqueActions: uniqueActionsData.length,
      uniqueEntities: uniqueEntitiesData.length,
    },
    topActions,
    entityDistribution,
    topUsers,
    dailyActivity,
  };
}
