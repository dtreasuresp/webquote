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

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
      include: { account: { select: { legalName: true, commercialName: true } } }
    })

    if (!opportunity) {
      return new NextResponse('Not Found', { status: 404 })
    }

    return NextResponse.json(opportunity)
  } catch (error) {
    console.error('[CRM_OPPORTUNITY_GET]', error)
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
    
    // Convert date if present
    if (body.expectedCloseDate) {
      body.expectedCloseDate = new Date(body.expectedCloseDate)
    }

    const opportunity = await prisma.opportunity.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(opportunity)
  } catch (error) {
    console.error('[CRM_OPPORTUNITY_PATCH]', error)
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

    await prisma.opportunity.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[CRM_OPPORTUNITY_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
