import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const contacts = await prisma.contact.findMany({
      include: {
        account: {
          select: {
            legalName: true,
            commercialName: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('[CRM_CONTACTS_GET]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { accountId, fullName, title, role, email, phone, mobile, preferredContact, language } = body

    if (!accountId || !fullName) {
      return NextResponse.json({ error: 'Cuenta y nombre completo son obligatorios' }, { status: 400 })
    }

    const contact = await prisma.contact.create({
      data: {
        accountId,
        fullName,
        title,
        role,
        email,
        phone,
        mobile,
        preferredContact,
        language: language || 'es'
      }
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error('[CRM_CONTACTS_POST]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
