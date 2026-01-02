import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateQuoteHtml } from '@/features/admin/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const quotation = await prisma.quotationConfig.findUnique({
      where: { id },
      include: {
        User: true
      }
    })

    if (!quotation) {
      return new NextResponse('Cotización no encontrada', { status: 404 })
    }

    // Generar el HTML profesional
    const html = generateQuoteHtml(quotation)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating PDF HTML:', error)
    return new NextResponse('Error al generar el documento', { status: 500 })
  }
}
