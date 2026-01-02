import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.documentTemplate.findUnique({
      where: { id: params.id },
    });
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching template' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const template = await prisma.documentTemplate.update({
      where: { id: params.id },
      data: {
        name: body.name,
        type: body.type,
        content: body.content,
        active: body.active,
      },
    });
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating template' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.documentTemplate.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting template' }, { status: 500 });
  }
}
