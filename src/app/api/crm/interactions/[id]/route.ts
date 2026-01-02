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

    const interaction = await prisma.interaction.findUnique({
      where: { id: params.id },
      include: { 
        account: { select: { legalName: true, commercialName: true } },
        contact: { select: { fullName: true } }
      }
    })

    if (!interaction) {
      return new NextResponse('Not Found', { status: 404 })
    }

    return NextResponse.json(interaction)
  } catch (error) {
    console.error('[CRM_INTERACTION_GET]', error)
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
    const interaction = await prisma.interaction.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(interaction)
  } catch (error) {
    console.error('[CRM_INTERACTION_PATCH]', error)
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

    await prisma.interaction.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[CRM_INTERACTION_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
