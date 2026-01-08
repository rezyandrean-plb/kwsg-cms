import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '8');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const subCategory = searchParams.get('subCategory') || '';

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { subCategory: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (category && category !== 'All') {
      where.category = category;
    }
    
    if (subCategory && subCategory !== 'All') {
      where.subCategory = subCategory;
    }

    const [toolResources, total] = await Promise.all([
      prisma.toolResource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.toolResource.count({ where }),
    ]);

    // Get all unique categories for the filter dropdown
    const allCategories = await prisma.toolResource.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    // Get sub-categories based on selected category (or all if no category selected)
    let subCategories: string[] = [];
    if (category && category !== 'All') {
      const subCategoryData = await prisma.toolResource.findMany({
        where: { category },
        select: { subCategory: true },
        distinct: ['subCategory'],
      });
      subCategories = subCategoryData.map(sc => sc.subCategory).filter(Boolean) as string[];
    } else {
      // If no category selected, get all unique sub-categories
      const subCategoryData = await prisma.toolResource.findMany({
        select: { subCategory: true },
        distinct: ['subCategory'],
      });
      subCategories = subCategoryData.map(sc => sc.subCategory).filter(Boolean) as string[];
    }

    return NextResponse.json({
      toolResources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      categories: allCategories.map(c => c.category).filter(Boolean),
      subCategories,
    });
  } catch (error) {
    console.error('Error fetching tool resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool resources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const toolResource = await prisma.toolResource.create({
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon,
        category: body.category,
        url: body.url,
        active: body.active ?? true,
      },
    });

    return NextResponse.json(toolResource, { status: 201 });
  } catch (error) {
    console.error('Error creating tool resource:', error);
    return NextResponse.json(
      { error: 'Failed to create tool resource' },
      { status: 500 }
    );
  }
}

