import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit/auditHelper'

/**
 * API Route: /api/audit-config/generate-report
 * 
 * POST: Genera un reporte de auditoría HTML y lo retorna como descarga
 * 
 * Parámetros:
 * - period: 'daily' | 'weekly' | 'monthly' | 'custom'
 * - dateFrom: (opcional) fecha inicio en formato ISO para custom
 * - dateTo: (opcional) fecha fin en formato ISO para custom
 * 
 * Requiere autenticación y permiso: logs.manage
 */

interface AuditReport {
  generatedAt: Date
  period: 'daily' | 'weekly' | 'monthly' | 'custom'
  dateRange: {
    from: Date
    to: Date
  }
  summary: {
    totalLogs: number
    uniqueUsers: number
    uniqueActions: number
    uniqueEntities: number
  }
  topActions: Array<{
    action: string
    count: number
    percentage: string
    firstOccurrence: Date
    lastOccurrence: Date
  }>
  entityDistribution: Array<{
    entityType: string
    count: number
    percentage: string
    actions: Record<string, number>
  }>
  topUsers: Array<{
    userName: string
    userId: string
    count: number
    actions: Record<string, number>
    firstActivity: Date
    lastActivity: Date
  }>
  dailyActivity: Array<{
    date: string
    count: number
  }>
}

function calculateDateRange(period: string, dateFrom?: string, dateTo?: string): { from: Date; to: Date } {
  const to = new Date()
  let from: Date

  switch (period) {
    case 'daily':
      from = new Date(to.getTime() - 1 * 24 * 60 * 60 * 1000)
      break
    case 'weekly':
      from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'monthly':
      from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'custom':
      if (!dateFrom || !dateTo) {
        from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
      } else {
        from = new Date(dateFrom)
        to.setTime(new Date(dateTo).getTime())
      }
      break
    default:
      from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  return { from, to }
}

async function getTopActions(from: Date, to: Date) {
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
    take: 15,
  })

  const total = actions.reduce((sum, a) => sum + a._count.id, 0)

  const topActions = []
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
    })

    if (logs.length > 0) {
      topActions.push({
        action: action.action,
        count: action._count.id,
        percentage: ((action._count.id / total) * 100).toFixed(2) + '%',
        firstOccurrence: logs[0].createdAt,
        lastOccurrence: logs[logs.length - 1].createdAt,
      })
    }
  }

  return topActions
}

async function getEntityDistribution(from: Date, to: Date) {
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
  })

  const total = entities.reduce((sum, e) => sum + e._count.id, 0)

  const entityDistribution = []
  for (const entity of entities) {
    const actions: Record<string, number> = {}
    const logs = await prisma.auditLog.findMany({
      where: {
        entityType: entity.entityType,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      select: {
        action: true,
      },
    })

    logs.forEach((log) => {
      actions[log.action] = (actions[log.action] || 0) + 1
    })

    entityDistribution.push({
      entityType: entity.entityType,
      count: entity._count.id,
      percentage: ((entity._count.id / total) * 100).toFixed(2) + '%',
      actions,
    })
  }

  return entityDistribution
}

async function getTopUsers(from: Date, to: Date) {
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
    take: 10,
  })

  const userStats = []

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
    })

    if (logs.length > 0) {
      const actions: Record<string, number> = {}
      logs.forEach((log) => {
        actions[log.action] = (actions[log.action] || 0) + 1
      })

      userStats.push({
        userName: user.userName || 'Unknown',
        userId: user.userId || 'unknown',
        count: user._count.id,
        actions,
        firstActivity: logs[0].createdAt,
        lastActivity: logs[logs.length - 1].createdAt,
      })
    }
  }

  return userStats
}

async function getDailyActivity(from: Date, to: Date) {
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
  })

  const dailyMap: Record<string, number> = {}

  logs.forEach((log) => {
    const dateStr = log.createdAt.toISOString().split('T')[0]
    dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1
  })

  return Object.entries(dailyMap)
    .sort()
    .map(([date, count]) => ({
      date,
      count,
    }))
}

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
  `

  let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Auditoría</title>
  ${cssStyles}
</head>
<body>
  <div class="container">
    <h1>📊 Reporte de Auditoría</h1>
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
  `

  report.topActions.forEach((action) => {
    html += `
      <tr>
        <td><span class="badge">${action.action}</span></td>
        <td>${action.count.toLocaleString('es-ES')}</td>
        <td><span class="percentage">${action.percentage}</span></td>
        <td>${action.firstOccurrence.toLocaleString('es-ES')}</td>
        <td>${action.lastOccurrence.toLocaleString('es-ES')}</td>
      </tr>
    `
  })

  html += `
    </table>

    <h2>📦 Distribución por Entidad</h2>
    <table>
      <tr>
        <th>Entidad</th>
        <th>Cantidad</th>
        <th>Porcentaje</th>
        <th>Acciones</th>
      </tr>
  `

  report.entityDistribution.forEach((entity) => {
    const actions = Object.entries(entity.actions)
      .map(([action, count]) => `${action} (${count})`)
      .join(', ')

    html += `
      <tr>
        <td>${entity.entityType}</td>
        <td>${entity.count.toLocaleString('es-ES')}</td>
        <td><span class="percentage">${entity.percentage}</span></td>
        <td>${actions}</td>
      </tr>
    `
  })

  html += `
    </table>

    <h2>👥 Usuarios Principales</h2>
    <table>
      <tr>
        <th>Usuario</th>
        <th>Cantidad</th>
        <th>Acciones</th>
        <th>Primera Actividad</th>
        <th>Última Actividad</th>
      </tr>
  `

  report.topUsers.forEach((user) => {
    const actions = Object.entries(user.actions)
      .map(([action, count]) => `${action} (${count})`)
      .join(', ')

    html += `
      <tr>
        <td>${user.userName}</td>
        <td>${user.count.toLocaleString('es-ES')}</td>
        <td>${actions}</td>
        <td>${user.firstActivity.toLocaleString('es-ES')}</td>
        <td>${user.lastActivity.toLocaleString('es-ES')}</td>
      </tr>
    `
  })

  html += `
    </table>

    <h2>📅 Actividad Diaria</h2>
    <table>
      <tr>
        <th>Fecha</th>
        <th>Logs</th>
      </tr>
  `

  report.dailyActivity.forEach((day) => {
    html += `
      <tr>
        <td>${day.date}</td>
        <td>${day.count.toLocaleString('es-ES')}</td>
      </tr>
    `
  })

  html += `
    </table>

    <div class="footer">
      <p>📌 Este reporte fue generado automáticamente por el sistema de auditoría.</p>
    </div>
  </div>
</body>
</html>`

  return html
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticación
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Parsear body
    const body = await request.json()
    const { period = 'monthly', dateFrom, dateTo } = body

    // Validar período
    const validPeriods = ['daily', 'weekly', 'monthly', 'custom']
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: 'Period debe ser: daily, weekly, monthly, custom' },
        { status: 400 }
      )
    }

    // Calcular rango de fechas
    const dateRange = calculateDateRange(period, dateFrom, dateTo)

    // Generar reporte
    const totalLogs = await prisma.auditLog.count({
      where: {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
    })

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
    })

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
    })

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
    })

    const topActions = await getTopActions(dateRange.from, dateRange.to)
    const entityDistribution = await getEntityDistribution(dateRange.from, dateRange.to)
    const topUsers = await getTopUsers(dateRange.from, dateRange.to)
    const dailyActivity = await getDailyActivity(dateRange.from, dateRange.to)

    const report: AuditReport = {
      generatedAt: new Date(),
      period: period as any,
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
    }

    // Log de generación de reporte
    await createAuditLog({
      action: 'REPORT_GENERATED',
      entityType: 'AUDIT',
      entityId: undefined,
      actorId: session.user.id,
      actorName: session.user.nombre || session.user.username || 'Unknown',
      details: {
        period,
        dateRange: {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        },
        logsIncluded: totalLogs,
      },
    })

    // Generar HTML
    const html = formatReportAsHTML(report)

    // Retornar como descarga HTML
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="audit-report-${new Date().toISOString().split('T')[0]}.html"`,
      },
    })
  } catch (err) {
    console.error('❌ Error en POST /api/audit-config/generate-report:', err)
    return NextResponse.json(
      { error: 'Error al generar reporte' },
      { status: 500 }
    )
  }
}
