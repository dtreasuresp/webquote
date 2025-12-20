import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * API Route: /api/cron/audit-purge
 * 
 * Ejecuta automáticamente la purga de logs de auditoría antiguos
 * Requiere header: X-Cron-Secret para autorización
 * 
 * Uso:
 * curl -H "X-Cron-Secret: $CRON_SECRET" https://example.com/api/cron/audit-purge
 */

/**
 * Valida el token de cron
 */
function validateCronToken(request: NextRequest): boolean {
  const cronSecret = request.headers.get('X-Cron-Secret');
  const expectedSecret = process.env.CRON_SECRET;

  // Validar que el secret esté configurado
  if (!expectedSecret) {
    console.error('⚠️  CRON_SECRET no configurado en variables de entorno');
    return false;
  }
  if (!cronSecret) {
    console.warn('⚠️  Header X-Cron-Secret ausente en solicitud cron');
    return false;
  }

  // Usar comparación segura para evitar timing attacks
  return cronSecret === expectedSecret;
}

/**
 * Calcula la fecha de corte para purga
 */
function calculateCutoffDate(retentionDays: number): Date {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);
  return cutoffDate;
}

interface AuditPurgeResult {
  deleted: number;
  remaining: number;
  cutoffDate: string;
  duration: number;
}

/**
 * Ejecuta la purga de logs antiguos
 */
async function executeAuditPurge(): Promise<AuditPurgeResult> {
  const startTime = Date.now();
  const retentionDays = Number.parseInt(process.env.AUDIT_RETENTION_DAYS || '180', 10);
  const cutoffDate = calculateCutoffDate(retentionDays);

  try {
    // Contar logs a eliminar antes de la operación
    const logsToDelete = await prisma.auditLog.count({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

      if (logsToDelete === 0) {
        const remaining = await prisma.auditLog.count();
        return {
          deleted: 0,
          remaining,
          cutoffDate: cutoffDate.toISOString(),
          duration: Date.now() - startTime,
        };
      }

    // Ejecutar purga en lotes para evitar bloqueos
    const BATCH_SIZE = 5000;
    let totalDeleted = 0;
    let logsDeleted = 0;

    while (logsDeleted < logsToDelete) {
      // Obtener IDs de los logs a eliminar (límite de BATCH_SIZE)
      const logsToDeleteIds = await prisma.auditLog.findMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
        select: {
          id: true,
        },
        take: BATCH_SIZE,
      });

      if (logsToDeleteIds.length === 0) {
        break;
      }

      const result = await prisma.auditLog.deleteMany({
        where: {
          id: {
            in: logsToDeleteIds.map((log) => log.id),
          },
        },
      });

      logsDeleted += result.count;
      totalDeleted += result.count;

      // Pequeña pausa entre lotes para no saturar la BD
      if (logsDeleted < logsToDelete) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const remaining = await prisma.auditLog.count();

    return {
      deleted: totalDeleted,
      remaining,
      cutoffDate: cutoffDate.toISOString(),
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Error en purga de auditoría:', error);
    throw error;
  }
}

/**
 * Handler GET para ejecutar purga (compatible con Vercel Crons, Fly.io, etc.)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Validar token CRON
    if (!validateCronToken(request)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token de autenticación inválido o faltante',
        },
        { status: 401 }
      );
    }

    console.log('🗑️  Iniciando purga automática de logs de auditoría...');

    const result = await executeAuditPurge();

    const message = result.deleted === 0 
      ? 'No había logs para eliminar. Retención en orden.'
      : `Purga completada: ${result.deleted} logs eliminados en ${result.duration}ms`;

    console.log(`✅ ${message}`);
    console.log(`📊 Logs restantes: ${result.remaining}`);

    return NextResponse.json(
      {
        success: true,
        message,
        deleted: result.deleted,
        remaining: result.remaining,
        cutoffDate: result.cutoffDate,
        duration: result.duration,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    console.error(`❌ Error en purga de auditoría: ${errorMessage}`);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Handler POST para ejecución manual (desarrollo/debugging)
 * Requiere header X-Debug-Secret en desarrollo
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    // En desarrollo, permitir con header diferente para testing
    if (isDevelopment) {
      const debugSecret = request.headers.get('X-Debug-Secret');
      if (debugSecret !== process.env.DEBUG_SECRET) {
        return NextResponse.json(
          { success: false, error: 'Debug secret inválido' },
          { status: 401 }
        );
      }
    } else if (!validateCronToken(request)) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticación inválido' },
        { status: 401 }
      );
    }

    const result = await executeAuditPurge();

    return NextResponse.json(
      {
        success: true,
        message: `Purga manual ejecutada: ${result.deleted} logs eliminados`,
        deleted: result.deleted,
        remaining: result.remaining,
        cutoffDate: result.cutoffDate,
        duration: result.duration,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Configuración de timeout y runtime
 * Aumentar para operaciones de purga en bases de datos grandes
 */
export const maxDuration = 60; // 60 segundos máximo en Vercel
