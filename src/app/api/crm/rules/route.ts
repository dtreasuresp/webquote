import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rules = await prisma.automationRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(rules);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching rules' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rule = await prisma.automationRule.create({
      data: {
        name: body.name,
        description: body.description,
        trigger: body.trigger,
        conditions: body.conditions,
        actions: body.actions,
        active: body.active ?? true,
      },
    });
    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating rule' }, { status: 500 });
  }
}
