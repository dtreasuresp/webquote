import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rule = await prisma.automationRule.findUnique({
      where: { id: params.id },
    });
    if (!rule) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    return NextResponse.json(rule);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching rule' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const rule = await prisma.automationRule.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        trigger: body.trigger,
        conditions: body.conditions,
        actions: body.actions,
        active: body.active,
      },
    });
    return NextResponse.json(rule);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating rule' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.automationRule.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting rule' }, { status: 500 });
  }
}
