/**
 * API de reportes de auditoría
 * GET    /api/audit-reports               - Listar reportes del usuario
 * GET    /api/audit-reports/:id          - Obtener reporte específico
 * POST   /api/audit-reports/generate      - Generar reporte manual
 * DELETE /api/audit-reports/:id          - Eliminar reporte
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAndSaveReport } from '@/lib/audit-report-scheduler';

type ReportPeriod = 'daily' | 'weekly' | 'monthly';

// GET /api/audit-reports - Listar reportes del usuario
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period'); // Filtrar por período
    const limit = Number.parseInt(searchParams.get('limit') || '20');
    const skip = Number.parseInt(searchParams.get('skip') || '0');

    // Construir filtro
    const where: any = {
      userId: session.user.id,
    };

    if (period) {
      where.period = period;
    }

    // Obtener total
    const total = await prisma.auditReport.count({ where });

    // Obtener reportes
    const reports = await prisma.auditReport.findMany({
      where,
      select: {
        id: true,
        period: true,
        dateRangeFrom: true,
        dateRangeTo: true,
        generatedAt: true,
        status: true,
        totalLogs: true,
        uniqueUsers: true,
        uniqueActions: true,
        uniqueEntities: true,
      },
      orderBy: {
        generatedAt: 'desc',
      },
      take: limit,
      skip,
    });

    return NextResponse.json(
      {
        success: true,
        data: reports,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error listando reportes:', error);
    return NextResponse.json(
      { error: 'Error obteniendo reportes' },
      { status: 500 }
    );
  }
}

// POST /api/audit-reports/generate - Generar reporte manual
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { period = 'weekly' } = body;

    // Validar período
    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return NextResponse.json(
        { error: 'Período inválido' },
        { status: 400 }
      );
    }

    // Generar reporte
    const report = await generateAndSaveReport(session.user.id, period as ReportPeriod);

    return NextResponse.json(
      {
        success: true,
        data: report,
        message: `Reporte ${period} generado exitosamente`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Error generando reporte:', error);
    return NextResponse.json(
      { error: 'Error generando reporte' },
      { status: 500 }
    );
  }
}
