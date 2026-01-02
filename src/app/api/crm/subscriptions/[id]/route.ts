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

    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
      include: { account: { select: { legalName: true, commercialName: true } } }
    })

    if (!subscription) {
      return new NextResponse('Not Found', { status: 404 })
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('[CRM_SUBSCRIPTION_GET]', error)
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
    if (body.startDate) body.startDate = new Date(body.startDate)
    if (body.endDate) body.endDate = new Date(body.endDate)
    if (body.nextBillingDate) body.nextBillingDate = new Date(body.nextBillingDate)

    const subscription = await prisma.subscription.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('[CRM_SUBSCRIPTION_PATCH]', error)
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

    await prisma.subscription.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[CRM_SUBSCRIPTION_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
