/**
 * API Cron Job para ejecutar scheduler de reportes automáticos
 * Puede ser llamado por:
 * - Vercel Cron Functions (si está deployado en Vercel)
 * - External cron service (ej: cron-job.org)
 * - Sistema interno
 * 
 * Endpoint: POST /api/cron/audit-reports
 * Headers requeridos: 'x-cron-secret' (si está configurado)
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAutoReportScheduler } from '@/lib/audit-report-scheduler';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Validar token secreto si está configurado
    if (CRON_SECRET) {
      const authHeader = req.headers.get('authorization');
      const secret = authHeader?.replace('Bearer ', '');

      if (secret !== CRON_SECRET) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }
    }

    console.log('[CRON] Iniciando generación de reportes automáticos...');

    // Ejecutar scheduler
    await runAutoReportScheduler();

    return NextResponse.json(
      {
        success: true,
        message: 'Scheduler de reportes ejecutado exitosamente',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CRON] Error ejecutando scheduler:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error ejecutando scheduler',
      },
      { status: 500 }
    );
  }
}

// Para Vercel Cron Functions
export const runtime = 'nodejs';
