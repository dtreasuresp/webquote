import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireWritePermission } from '@/lib/apiProtection'

/**
 * DELETE /api/backups/[id]
 * Elimina un backup
 * Requiere: backups.delete
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireWritePermission('backups.delete')
  if (error) return error

  try {
    const { id } = await context.params

    const backup = await prisma.userBackup.findUnique({
      where: { id },
    })

    if (!backup) {
      return NextResponse.json(
        { success: false, error: 'Backup no encontrado' },
        { status: 404 }
      )
    }

    const isSuperAdmin = session.user.role === 'SUPER_ADMIN'
    if (backup.userId !== session.user.id && !isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para eliminar este backup' },
        { status: 403 }
      )
    }

    await prisma.userBackup.delete({
      where: { id },
    })

    await prisma.auditLog.create({
      data: {
        action: 'backup.deleted',
        entityType: 'UserBackup',
        entityId: id,
        userId: session.user.id,
        userName: session.user.nombre || session.user.username || 'Usuario',
        details: {
          backupId: id,
          nombre: backup.nombre,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Backup eliminado exitosamente',
    })
  } catch (error) {
    console.error('[API Backups DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar backup' },
      { status: 500 }
    )
  }
}
