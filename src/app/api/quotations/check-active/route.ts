import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/quotations/check-active?email=xxx@xxx.com&excludeId=abc123
 * Verifica si un cliente tiene una cotización ACTIVA
 * excludeId: ID de cotización a ignorar en la búsqueda (para no contar la actual)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const excludeId = searchParams.get('excludeId')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Buscar cotización ACTIVA para este cliente, excluyendo la actual
    const activeQuotation = await prisma.quotationConfig.findFirst({
      where: {
        emailCliente: email,
        estado: 'ACTIVA',
        id: excludeId ? { not: excludeId } : undefined,
      },
      select: {
        id: true,
        numero: true,
        emailCliente: true,
        estado: true,
        User: {
          select: {
            nombre: true,
            username: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      exists: !!activeQuotation,
      quotation: activeQuotation || null,
    })
  } catch (error) {
    console.error('Error checking active quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
