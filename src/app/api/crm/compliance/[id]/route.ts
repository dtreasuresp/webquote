import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const complianceRecord = await prisma.complianceRecord.findUnique({
      where: { id: params.id },
      include: { account: { select: { legalName: true, commercialName: true } } }
    })

    if (!complianceRecord) {
      return new NextResponse('Not Found', { status: 404 })
    }

    return NextResponse.json(complianceRecord)
  } catch (error) {
    console.error('[CRM_COMPLIANCE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    
    // Convert dates if present
    if (body.validUntil) body.validUntil = new Date(body.validUntil)
    if (body.verifiedAt) body.verifiedAt = new Date(body.verifiedAt)

    const complianceRecord = await prisma.complianceRecord.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(complianceRecord)
  } catch (error) {
    console.error('[CRM_COMPLIANCE_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await prisma.complianceRecord.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[CRM_COMPLIANCE_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
