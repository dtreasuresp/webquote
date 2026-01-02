import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
      include: {
        account: true,
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        quotations: true
      }
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error('[CRM_CONTACT_GET]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error('[CRM_CONTACT_PUT]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await prisma.contact.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[CRM_CONTACT_DELETE]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
