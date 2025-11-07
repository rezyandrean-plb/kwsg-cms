import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const launchId = Number.parseInt(id, 10);
    if (Number.isNaN(launchId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const launch = await prisma.newLaunch.findUnique({
      where: { id: launchId },
    });

    if (!launch) {
      return NextResponse.json(
        { error: 'New launch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(launch);
  } catch (error) {
    console.error('Error fetching new launch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch new launch' },
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
    const launchId = Number.parseInt(id, 10);
    if (Number.isNaN(launchId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    
    const launch = await prisma.newLaunch.update({
      where: { id: launchId },
      data: {
        title: body.title,
        summary: body.summary,
        image: body.image,
        location: body.location,
        district: body.district,
        status: body.status,
        visibility: body.visibility ?? 'Show',
        type: body.type,
        bedrooms: body.bedrooms,
        price: body.price,
        url: body.url,
        launchDate: body.launchDate,
        developer: body.developer,
        units: typeof body.units === 'number' ? body.units : null,
        active: body.active,
      },
    });

    return NextResponse.json(launch);
  } catch (error) {
    console.error('Error updating new launch:', error);
    return NextResponse.json(
      { error: 'Failed to update new launch' },
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
    const launchId = Number.parseInt(id, 10);
    if (Number.isNaN(launchId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    await prisma.newLaunch.delete({
      where: { id: launchId },
    });

    return NextResponse.json({ message: 'New launch deleted successfully' });
  } catch (error) {
    console.error('Error deleting new launch:', error);
    return NextResponse.json(
      { error: 'Failed to delete new launch' },
      { status: 500 }
    );
  }
}
