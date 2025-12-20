import { NextRequest, NextResponse } from 'next/server'
import { runBackupScheduler } from '@/lib/backup/backupScheduler'
import { requireReadPermission } from '@/lib/apiProtection'

/**
 * GET /api/backups/scheduler/run
 * Ejecuta el scheduler de backups manualmente (para testing/admin)
 * Requiere: backups.manage (SUPER_ADMIN only)
 */
export async function GET(request: NextRequest) {
  // Solo SUPER_ADMIN
  const { session, error } = await requireReadPermission('backups.manage')
  if (error) return error

  if (session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Solo SUPER_ADMIN puede ejecutar el scheduler' },
      { status: 403 }
    )
  }

  try {
    console.log('[API /backups/scheduler/run] Ejecutando scheduler manualmente...')
    const result = await runBackupScheduler()

    return NextResponse.json({
      success: result.success,
      data: result,
      message: `${result.backupsCreated} backups creados, ${result.backupsDeleted} eliminados`
    })
  } catch (error) {
    console.error('[API /backups/scheduler/run] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error ejecutando scheduler' },
      { status: 500 }
    )
  }
}
