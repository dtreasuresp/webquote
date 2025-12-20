import { NextRequest, NextResponse } from 'next/server'
import { requireReadPermission } from '@/lib/apiProtection'
import { validarQuotation } from '@/lib/utils/validation'

// Forzar que esta ruta sea dinámica (no cacheada)
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/quotations/validate
 * Valida una cotización sin guardar
 * Usada por quotationStore para validar antes de guardar
 */
export async function POST(request: NextRequest) {
  const { session, error } = await requireReadPermission('quotations.view')
  if (error) return error

  try {
    const quotation = await request.json()

    // Validar usando la función de validación existente
    const { valido, errores } = validarQuotation(quotation)

    return NextResponse.json({
      valid: valido,
      errors: errores.length > 0 ? { _validation: errores.join(', ') } : undefined,
    })
  } catch (error) {
    console.error('[POST /api/quotations/validate]', error)

    return NextResponse.json(
      {
        valid: false,
        errors: {
          _global: error instanceof Error ? error.message : 'Error validating quotation',
        },
      },
      { status: 400 }
    )
  }
}
