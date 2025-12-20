/**
 * API de reportes de auditoría - Detalle
 * GET    /api/audit-reports/[id]        - Obtener reporte específico
 * DELETE /api/audit-reports/[id]        - Eliminar reporte
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/audit-reports/[id] - Obtener reporte específico
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;

    // Obtener reporte
    const report = await prisma.auditReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el reporte pertenece al usuario
    if (report.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para acceder a este reporte' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: report,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error obteniendo reporte:', error);
    return NextResponse.json(
      { error: 'Error obteniendo reporte' },
      { status: 500 }
    );
  }
}

// DELETE /api/audit-reports/[id] - Eliminar reporte
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;

    // Obtener reporte
    const report = await prisma.auditReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el reporte pertenece al usuario
    if (report.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar este reporte' },
        { status: 403 }
      );
    }

    // Eliminar reporte
    await prisma.auditReport.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Reporte eliminado exitosamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error eliminando reporte:', error);
    return NextResponse.json(
      { error: 'Error eliminando reporte' },
      { status: 500 }
    );
  }
}
