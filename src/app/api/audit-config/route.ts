import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * API Route: /api/audit-config
 * 
 * GET: Obtener configuración de auditoría del usuario actual
 * POST: Guardar configuración de auditoría del usuario actual
 * 
 * Requiere autenticación y permiso: logs.manage
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticación
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener preferencias del usuario
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
      select: {
        auditRetentionDays: true,
        auditAutoPurgeEnabled: true,
        auditAutoPurgeFrequency: true,
        auditAutoReportEnabled: true,
        auditAutoReportPeriod: true,
      },
    })

    return NextResponse.json({
      success: true,
      config: {
        auditRetentionDays: userPreferences?.auditRetentionDays || 90,
        auditAutoPurgeEnabled: userPreferences?.auditAutoPurgeEnabled || false,
        auditAutoPurgeFrequency: userPreferences?.auditAutoPurgeFrequency || 'weekly',
        auditAutoReportEnabled: userPreferences?.auditAutoReportEnabled || false,
        auditAutoReportPeriod: userPreferences?.auditAutoReportPeriod || 'weekly',
      },
    })
  } catch (err) {
    console.error('❌ Error en GET /api/audit-config:', err)
    return NextResponse.json(
      { error: 'Error al obtener configuración de auditoría' },
      { status: 500 }
    )
  }
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
    const {
      auditRetentionDays,
      auditAutoPurgeEnabled,
      auditAutoPurgeFrequency,
      auditAutoReportEnabled,
      auditAutoReportPeriod,
    } = body

    // Validar datos
    if (auditRetentionDays !== undefined) {
      const retentionDays = Number.parseInt(String(auditRetentionDays))
      if (Number.isNaN(retentionDays) || retentionDays < 30 || retentionDays > 730) {
        return NextResponse.json(
          { error: 'auditRetentionDays debe estar entre 30 y 730' },
          { status: 400 }
        )
      }
    }

    if (auditAutoPurgeFrequency !== undefined) {
      const validFrequencies = ['daily', 'weekly', 'monthly']
      if (!validFrequencies.includes(auditAutoPurgeFrequency)) {
        return NextResponse.json(
          { error: 'auditAutoPurgeFrequency debe ser: daily, weekly, monthly' },
          { status: 400 }
        )
      }
    }

    if (auditAutoReportPeriod !== undefined) {
      const validPeriods = ['daily', 'weekly', 'monthly']
      if (!validPeriods.includes(auditAutoReportPeriod)) {
        return NextResponse.json(
          { error: 'auditAutoReportPeriod debe ser: daily, weekly, monthly' },
          { status: 400 }
        )
      }
    }

    // Guardar preferencias
    const updatedPreferences = await prisma.userPreferences.update({
      where: { userId: session.user.id },
      data: {
        ...(auditRetentionDays !== undefined && { auditRetentionDays: Number.parseInt(String(auditRetentionDays)) }),
        ...(auditAutoPurgeEnabled !== undefined && { auditAutoPurgeEnabled }),
        ...(auditAutoPurgeFrequency !== undefined && { auditAutoPurgeFrequency }),
        ...(auditAutoReportEnabled !== undefined && { auditAutoReportEnabled }),
        ...(auditAutoReportPeriod !== undefined && { auditAutoReportPeriod }),
      },
      select: {
        auditRetentionDays: true,
        auditAutoPurgeEnabled: true,
        auditAutoPurgeFrequency: true,
        auditAutoReportEnabled: true,
        auditAutoReportPeriod: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Configuración de auditoría actualizada',
      config: updatedPreferences,
    })
  } catch (err) {
    console.error('❌ Error en POST /api/audit-config:', err)
    return NextResponse.json(
      { error: 'Error al guardar configuración de auditoría' },
      { status: 500 }
    )
  }
}
