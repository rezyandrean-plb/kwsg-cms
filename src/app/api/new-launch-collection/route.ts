import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '8');
    const skip = (page - 1) * limit;

    const [launches, total] = await Promise.all([
      prisma.newLaunch.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.newLaunch.count(),
    ]);

    return NextResponse.json({
      launches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching new launches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch new launches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const launch = await prisma.newLaunch.create({
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
        active: body.active ?? true,
      },
    });

    return NextResponse.json(launch, { status: 201 });
  } catch (error) {
    console.error('Error creating new launch:', error);
    return NextResponse.json(
      { error: 'Failed to create new launch' },
      { status: 500 }
    );
  }
}
