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

    const interactions = await prisma.interaction.findMany({
      include: { 
        account: { select: { legalName: true, commercialName: true } },
        contact: { select: { fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(interactions)
  } catch (error) {
    console.error('[CRM_INTERACTIONS_GET]', error)
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
    const { accountId, contactId, type, subject, description, assignedTo } = body

    if (!accountId || !description) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const interaction = await prisma.interaction.create({
      data: {
        accountId,
        contactId,
        type,
        subject,
        description,
        assignedTo
      }
    })

    return NextResponse.json(interaction)
  } catch (error) {
    console.error('[CRM_INTERACTIONS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
