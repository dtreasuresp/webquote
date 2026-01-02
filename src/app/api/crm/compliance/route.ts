import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const complianceRecords = await prisma.complianceRecord.findMany({
      include: { account: { select: { legalName: true, commercialName: true } } },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(complianceRecords)
  } catch (error) {
    console.error('[CRM_COMPLIANCE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { accountId, type, status, documentUrl, notes, validUntil } = body

    if (!accountId || !type) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const complianceRecord = await prisma.complianceRecord.create({
      data: {
        accountId,
        type,
        status,
        documentUrl,
        notes,
        validUntil: validUntil ? new Date(validUntil) : null
      }
    })

    return NextResponse.json(complianceRecord)
  } catch (error) {
    console.error('[CRM_COMPLIANCE_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
