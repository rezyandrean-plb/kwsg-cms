import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid newsletter ID' },
        { status: 400 }
      );
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(newsletter);
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid newsletter ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const newsletter = await prisma.newsletter.update({
      where: { id },
      data: {
        date: body.date,
        url: body.url,
        active: body.active,
      },
    });

    return NextResponse.json(newsletter);
  } catch (error) {
    console.error('Error updating newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to update newsletter' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid newsletter ID' },
        { status: 400 }
      );
    }

    await prisma.newsletter.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Newsletter deleted successfully' });
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to delete newsletter' },
      { status: 500 }
    );
  }
}
