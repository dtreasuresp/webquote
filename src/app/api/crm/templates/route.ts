import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const templates = await prisma.documentTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching templates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const template = await prisma.documentTemplate.create({
      data: {
        name: body.name,
        type: body.type,
        content: body.content,
        active: body.active ?? true,
      },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating template' }, { status: 500 });
  }
}
