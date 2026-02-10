
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!verifyToken(token)) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { id } = await params;

    const test = await prisma.testLink.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true, email: true } },
        results: {
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50 results for performance
        },
        _count: { select: { results: true } }
      }
    });

    if (!test) {
        return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json(test);

  } catch (error) {
    console.error('Error fetching test details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
