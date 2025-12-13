import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/audit-logs
 * Lista logs de auditoría con paginación y filtros
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de paginación
    const page = Number.parseInt(searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    // Filtros
    const action = searchParams.get('action')
    const entityType = searchParams.get('entityType')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') // 'csv' para exportar

    // Construir where
    const where: Record<string, unknown> = {}

    if (action) {
      where.action = { contains: action }
    }

    if (entityType) {
      where.entityType = entityType
    }

    if (userId) {
      where.userId = userId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate)
      }
    }

    // Si es exportación CSV
    if (format === 'csv') {
      const allLogs = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10000, // Límite de exportación
      })

      const csvHeader = 'ID,Fecha,Acción,Entidad,ID Entidad,Usuario,IP,Detalles\n'
      const csvRows = allLogs.map((log) => {
        const date = log.createdAt.toISOString()
        const details = log.details ? JSON.stringify(log.details).replaceAll('"', '""') : ''
        return `"${log.id}","${date}","${log.action}","${log.entityType}","${log.entityId || ''}","${log.userName}","${log.ipAddress || ''}","${details}"`
      }).join('\n')

      return new NextResponse(csvHeader + csvRows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Consulta normal con paginación
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[API AuditLogs] Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Error al obtener logs de auditoría' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/audit-logs
 * Crea un nuevo log de auditoría (uso interno)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, entityType, entityId, userId, userName, details, ipAddress } = body

    if (!action || !entityType || !entityId) {
      return NextResponse.json(
        { error: 'action, entityType y entityId son obligatorios' },
        { status: 400 }
      )
    }

    const log = await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId: userId || null,
        userName: userName || 'SYSTEM',
        details: details || null,
        ipAddress: ipAddress || null,
      },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('[API AuditLogs] Error creating log:', error)
    return NextResponse.json(
      { error: 'Error al crear log de auditoría' },
      { status: 500 }
    )
  }
}
