import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireReadPermission, requireWritePermission } from '@/lib/apiProtection'
import { createAuditLog } from '@/lib/audit/auditHelper'

/**
 * GET /api/backups
 * Obtiene lista de backups del usuario actual
 * Requiere: backups.view
 */
export async function GET(request: NextRequest) {
  const { session, error } = await requireReadPermission('backups.view')
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const limit = Number.parseInt(searchParams.get('limit') || '50')
    
    // Solo SUPER_ADMIN puede ver todos los backups
    const isSuperAdmin = session.user.role === 'SUPER_ADMIN'
    
    const backups = await prisma.userBackup.findMany({
      where: {
        ...(isSuperAdmin ? {} : { userId: session.user.id }),
        ...(tipo ? { tipo } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        nombre: true,
        descripcion: true,
        tipo: true,
        version: true,
        size: true,
        estado: true,
        errorMessage: true,
        createdAt: true,
        expiresAt: true,
        User: {
          select: {
            username: true,
            nombre: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: backups,
      total: backups.length
    })
  } catch (error) {
    console.error('[API Backups GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener backups' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/backups
 * Crea un nuevo backup manual
 * Requiere: backups.create
 */
export async function POST(request: NextRequest) {
  const { session, error } = await requireWritePermission('backups.create')
  if (error) return error

  try {
    const body = await request.json()
    const { nombre, descripcion, tipo = 'manual' } = body

    if (!nombre) {
      return NextResponse.json(
        { success: false, error: 'El nombre del backup es requerido' },
        { status: 400 }
      )
    }

    // Obtener datos del usuario para backup
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        UserPermission: {
          include: {
            Permission: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener TODOS los datos asociados al usuario
    const [quotations, snapshots, preferences, permissions, financialTemplates] = await Promise.all([
      // Obtener la cotización asignada al usuario (si existe)
      user.quotationAssignedId 
        ? prisma.quotationConfig.findMany({
            where: { id: user.quotationAssignedId },
            include: { snapshots: true }
          })
        : Promise.resolve([]),
      // Obtener snapshots asociados a la cotización del usuario
      user.quotationAssignedId
        ? prisma.packageSnapshot.findMany({
            where: { quotationConfigId: user.quotationAssignedId }
          })
        : Promise.resolve([]),
      prisma.userPreferences.findUnique({
        where: { userId: session.user.id }
      }),
      prisma.userPermission.findMany({
        where: { userId: session.user.id },
        include: { Permission: true }
      }),
      prisma.financialTemplate.findMany({
        where: { userId: session.user.id }
      })
    ])

    // Preparar datos COMPLETOS para backup (excluir password)
    const { passwordHash, ...userData } = user
    const backupData = {
      user: userData,
      quotations,
      snapshots,
      preferences,
      permissions: permissions.map(p => ({
        permissionCode: p.Permission.code,
        granted: p.granted
      })),
      financialTemplates,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      dataTypes: {
        user: true,
        quotations: quotations.length > 0,
        snapshots: snapshots.length > 0,
        preferences: !!preferences,
        permissions: permissions.length > 0,
        financialTemplates: financialTemplates.length > 0
      }
    }

    // Calcular tamaño exacto
    const dataString = JSON.stringify(backupData)
    const size = Buffer.byteLength(dataString, 'utf8')

    // Crear backup
    const backup = await prisma.userBackup.create({
      data: {
        userId: session.user.id,
        nombre,
        descripcion,
        tipo,
        version: backupData.version,
        data: backupData as any,
        size,
        estado: 'completado'
      }
    })

    // Auditar creación de backup usando helper centralizado
    await createAuditLog({
      action: 'BACKUP_CREATED',
      entityType: 'BACKUP',
      entityId: backup.id,
      actorId: session.user.id,
      actorName: session.user.nombre || session.user.username || 'Usuario',
      details: {
        backupId: backup.id,
        nombre,
        tipo,
        size,
      },
    })

    return NextResponse.json({
      success: true,
      data: backup,
      message: 'Backup creado exitosamente'
    })
  } catch (error) {
    console.error('[API Backups POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear backup' },
      { status: 500 }
    )
  }
}
