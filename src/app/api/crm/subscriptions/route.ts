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

    const subscriptions = await prisma.subscription.findMany({
      include: { account: { select: { legalName: true, commercialName: true } } },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('[CRM_SUBSCRIPTIONS_GET]', error)
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
    const { accountId, productId, name, status, billingFrequency, amount, startDate, endDate, nextBillingDate } = body

    if (!accountId || !name || !amount) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const subscription = await prisma.subscription.create({
      data: {
        accountId,
        productId,
        name,
        status,
        billingFrequency,
        amount,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : null
      }
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('[CRM_SUBSCRIPTIONS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
