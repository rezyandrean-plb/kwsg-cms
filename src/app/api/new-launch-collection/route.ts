import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const FALLBACK_LAUNCHES = [
  {
    id: 1,
    title: "Springleaf Residence",
    summary: "The North's First Nature-Integrated, and Well-connected High-Rise",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/springleaf-collection.webp",
    location: "Upper Thomson",
    district: "District 26",
    status: "Registration Open",
    visibility: "Show",
    type: "Condo",
    bedrooms: "3-5",
    price: "2,300,000",
    url: "/springleaf-residence",
    launchDate: "April 2024",
    developer: "Springleaf Development",
    units: 300,
    views: 1200,
  },
  {
    id: 2,
    title: "Penrith",
    summary: "The Margaret Drive Address That Brings You Closer to Everything",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/penrith-collection.webp",
    location: "Queenstown",
    district: "District 3",
    status: "Preview Available",
    visibility: "Show",
    type: "Condo",
    bedrooms: "2-5",
    price: "1,495,000",
    url: "/penrith",
    launchDate: "April 2024",
    developer: "Penrith Holdings",
    units: 220,
    views: 980,
  },
  {
    id: 3,
    title: "Aurea",
    summary: "The Golden Mile's Premier Residential Development",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/hero-aurea.webp",
    location: "Beach Road",
    district: "District 7",
    status: "Coming Soon",
    visibility: "Show",
    type: "Condo",
    bedrooms: "2-5",
    price: "1,765,000",
    url: "/aurea",
    launchDate: "May 2024",
    developer: "Aurea Group",
    units: 180,
    views: 850,
  },
  {
    id: 4,
    title: "W Residences Marina View",
    summary: "Embrace liberated luxury with sleek, chic apartments that offer exclusive 5-star W facilities and services.",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/w-residences-collection.webp",
    location: "Marina View",
    district: "District 1",
    status: "Coming Soon",
    visibility: "Show",
    type: "Condo",
    bedrooms: "1-5 BR",
    price: "1,848,000",
    url: "/w-residences-marina-view",
    launchDate: "June 2024",
    developer: "Marina Development",
    units: 250,
    views: 720,
  },
  {
    id: 5,
    title: "Arina East Residences",
    summary: "The East Coast's First Nature-Integrated, and Well-connected High-Rise",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/arina-east-collection.webp",
    location: "East Coast",
    district: "District 15",
    status: "Coming Soon",
    visibility: "Show",
    type: "Condo",
    bedrooms: "1-4",
    price: "1,298,000",
    url: "/arina-east",
    launchDate: "June 2024",
    developer: "Arina Developments",
    units: 190,
    views: 650,
  },
  {
    id: 6,
    title: "Artisan 8",
    summary: "Crafted for those who appreciate curated living.",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/coming-soon.webp",
    location: "Sin Ming Road",
    district: "District 20",
    status: "Coming Soon",
    visibility: "Show",
    type: "Condo",
    bedrooms: "TBC",
    price: "TBC",
    url: "/artisan-8",
    launchDate: "June 2024",
    developer: "Artisan Homes",
    units: 140,
    views: 540,
  },
];

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
    
    // Fallback to static data to keep the dashboard functional
    const total = FALLBACK_LAUNCHES.length;
    const fallbackPage = 1;
    const fallbackLimit = total;

    return NextResponse.json({
      launches: FALLBACK_LAUNCHES,
      pagination: {
        page: fallbackPage,
        limit: fallbackLimit,
        total,
        pages: 1,
      },
      fallback: true,
    }, { status: 200 });
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
