import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const FALLBACK_NEWSLETTERS = [
  {
    id: 1,
    date: "29/12/2025 – 2/1/2026",
    url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/december-2025/31/Newsletter+Dec+31.pdf",
    active: true,
    createdAt: new Date("2025-12-31").toISOString(),
    updatedAt: new Date("2025-12-31").toISOString(),
  },
  {
    id: 2,
    date: "22/12/2025 – 26/12/2025",
    url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/december-2025/24/Newsletter+Dec+24.pdf",
    active: true,
    createdAt: new Date("2025-12-24").toISOString(),
    updatedAt: new Date("2025-12-24").toISOString(),
  },
  {
    id: 3,
    date: "15/12/2025 – 19/12/2025",
    url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/december-2025/16/Newsletter+Dec+16.pdf",
    active: true,
    createdAt: new Date("2025-12-16").toISOString(),
    updatedAt: new Date("2025-12-16").toISOString(),
  },
  {
    id: 4,
    date: "8/12/2025 – 12/12/2025",
    url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/december-2025/10/Newsletter+Dec+10.pdf",
    active: true,
    createdAt: new Date("2025-12-10").toISOString(),
    updatedAt: new Date("2025-12-10").toISOString(),
  },
  {
    id: 5,
    date: "1/12/2025 – 7/12/2025",
    url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/december-2025/3/Newsletter+Dec+3.pdf",
    active: true,
    createdAt: new Date("2025-12-03").toISOString(),
    updatedAt: new Date("2025-12-03").toISOString(),
  },
  {
    id: 6,
    date: "24/11/2025 – 28/11/2025",
    url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/november-2025/26/Newsletter+Nov+26.pdf",
    active: true,
    createdAt: new Date("2025-11-26").toISOString(),
    updatedAt: new Date("2025-11-26").toISOString(),
  },
  {
    id: 7,
    date: "17/11/2025 – 21/11/2025",
    url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/november-2025/24/Updated+Newsletter+Nov+24.pdf",
    active: true,
    createdAt: new Date("2025-11-24").toISOString(),
    updatedAt: new Date("2025-11-24").toISOString(),
  },
];

function getEndDateTimestamp(newsletter: { date: string; createdAt?: Date | string }) {
  try {
    if (newsletter.date) {
      // Expect format like "29/12/2025 – 2/1/2026"
      const match = newsletter.date.match(/–\s*(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        return new Date(year, month - 1, day).getTime();
      }
    }
  } catch (_) {
    // ignore and fall back to createdAt
  }

  if (newsletter.createdAt) {
    const d = new Date(newsletter.createdAt);
    if (!Number.isNaN(d.getTime())) return d.getTime();
  }

  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    try {
      const allNewsletters = await prisma.newsletter.findMany();
      const total = allNewsletters.length;

      if (total > 0) {
        const sorted = allNewsletters.sort(
          (a, b) => getEndDateTimestamp(b) - getEndDateTimestamp(a)
        );
        const paginatedNewsletters = sorted.slice(skip, skip + limit);

        return NextResponse.json({
          newsletters: paginatedNewsletters,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        });
      }
    } catch (dbError) {
      console.error('Database error, using fallback data:', dbError);
    }

    // Fallback to mock data if database is empty or has errors
    const total = FALLBACK_NEWSLETTERS.length;
    const sortedFallback = [...FALLBACK_NEWSLETTERS].sort(
      (a, b) => getEndDateTimestamp(b) - getEndDateTimestamp(a)
    );
    const paginatedNewsletters = sortedFallback.slice(skip, skip + limit);

    return NextResponse.json({
      newsletters: paginatedNewsletters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      fallback: true,
    });
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    
    // Return fallback data even on error
    const total = FALLBACK_NEWSLETTERS.length;
    const page = parseInt(new URL(request.url).searchParams.get('page') || '1');
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const paginatedNewsletters = FALLBACK_NEWSLETTERS.slice(skip, skip + limit);

    return NextResponse.json({
      newsletters: paginatedNewsletters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      fallback: true,
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.date || !body.url) {
      return NextResponse.json(
        { error: 'Date and URL are required' },
        { status: 400 }
      );
    }
    
    const newsletter = await prisma.newsletter.create({
      data: {
        date: body.date,
        url: body.url,
        active: body.active ?? true,
      },
    });

    return NextResponse.json(newsletter, { status: 201 });
  } catch (error: any) {
    console.error('Error creating newsletter:', error);
    
    // Provide more detailed error message
    let errorMessage = 'Failed to create newsletter';
    if (error?.code === 'P2002') {
      errorMessage = 'A newsletter with this information already exists';
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error?.code || error?.meta || null },
      { status: 500 }
    );
  }
}
