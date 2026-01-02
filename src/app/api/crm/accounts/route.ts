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

    const accounts = await prisma.account.findMany({
      include: {
        contacts: true,
        _count: {
          select: {
            quotations: true,
            opportunities: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('[CRM_ACCOUNTS_GET]', error)
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
    const { legalName, commercialName, taxId, type, status, email, phone, website, address, city, state, zipCode, country, sector, size } = body

    if (!legalName) {
      return NextResponse.json({ error: 'El nombre legal es obligatorio' }, { status: 400 })
    }

    const account = await prisma.account.create({
      data: {
        legalName,
        commercialName,
        taxId,
        type,
        status,
        email,
        phone,
        website,
        address,
        city,
        state,
        zipCode,
        country,
        sector,
        size,
        createdBy: session.user.id
      }
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('[CRM_ACCOUNTS_POST]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
