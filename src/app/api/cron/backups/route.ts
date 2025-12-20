import { NextRequest, NextResponse } from 'next/server'
import { runBackupScheduler } from '@/lib/backup/backupScheduler'

// GET /api/cron/backups
// Endpoint para ejecutar el scheduler de backups automáticamente.
// Protegido automáticamente por Vercel Crons (usa Bearer token).
// 
// Configuración en vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/backups",
//     "schedule": "*/5 * * * *"
//   }]
// }
// Se ejecutará cada 5 minutos automáticamente.

export async function GET(request: NextRequest) {
  try {
    // En Vercel Crons, el token viene automáticamente en header
    // Para otros servicios, agregar validación personalizada aquí
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[CRON] Ejecutando scheduler de backups...')
    
    const result = await runBackupScheduler()

    console.log('[CRON] ✅ Scheduler completado:', {
      backupsCreated: result.backupsCreated,
      backupsDeleted: result.backupsDeleted,
      errors: result.errors.length
    })

    return NextResponse.json({
      success: result.success,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[CRON] Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
