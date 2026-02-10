
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type && type !== 'ALL') where.type = type;
    if (status) {
        if (status === 'ACTIVE') where.isActive = true;
        if (status === 'INACTIVE') where.isActive = false;
    }

    // Determine total count for pagination
    const total = await prisma.testLink.count({ where });

    const tests = await prisma.testLink.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { name: true, email: true } },
        results: {
            select: { id: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1
        },
        _count: { select: { results: true } }
      }
    });

    const formattedTests = tests.map(test => ({
        id: test.id,
        code: test.code,
        type: test.type,
        creator: test.creator?.name || 'Sistema',
        createdAt: test.createdAt,
        expiresAt: test.expiresAt,
        isActive: test.isActive,
        resultsCount: test._count.results,
        lastResultAt: test.results[0]?.createdAt || null
    }));

    return NextResponse.json({
        data: formattedTests,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });

  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Action to Pause/Resume/Delete
export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id, action } = body;

        if (!id || !action) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        if (action === 'TOGGLE_STATUS') {
            const link = await prisma.testLink.findUnique({ where: { id } });
            if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            
            await prisma.testLink.update({
                where: { id },
                data: { isActive: !link.isActive }
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
