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

    const opportunities = await prisma.opportunity.findMany({
      include: { account: { select: { legalName: true, commercialName: true } } },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    console.error('[CRM_OPPORTUNITIES_GET]', error)
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
    const { accountId, name, stage, probability, estimatedValue, expectedCloseDate } = body

    if (!accountId || !name) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        accountId,
        name,
        stage,
        probability,
        estimatedValue,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null
      }
    })

    return NextResponse.json(opportunity)
  } catch (error) {
    console.error('[CRM_OPPORTUNITIES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
