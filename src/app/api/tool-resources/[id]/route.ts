import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resourceId = Number.parseInt(id, 10);
    if (Number.isNaN(resourceId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const toolResource = await prisma.toolResource.findUnique({
      where: { id: resourceId },
    });

    if (!toolResource) {
      return NextResponse.json(
        { error: 'Tool resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(toolResource);
  } catch (error) {
    console.error('Error fetching tool resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool resource' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const resourceId = Number.parseInt(id, 10);
    if (Number.isNaN(resourceId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    
    const toolResource = await prisma.toolResource.update({
      where: { id: resourceId },
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon,
        category: body.category,
        url: body.url,
        active: body.active,
      },
    });

    return NextResponse.json(toolResource);
  } catch (error) {
    console.error('Error updating tool resource:', error);
    return NextResponse.json(
      { error: 'Failed to update tool resource' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resourceId = Number.parseInt(id, 10);
    if (Number.isNaN(resourceId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    await prisma.toolResource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({ message: 'Tool resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting tool resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete tool resource' },
      { status: 500 }
    );
  }
}


