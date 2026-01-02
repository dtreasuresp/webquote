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

    const products = await prisma.product.findMany({
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('[CRM_PRODUCTS_GET]', error)
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
    const { name, sku, type, category, description, listPrice, costPrice, available, stock, billingFrequency } = body

    if (!name || !sku || !category || !listPrice) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        type,
        category,
        description,
        listPrice,
        costPrice,
        available,
        stock,
        billingFrequency
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('[CRM_PRODUCTS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
