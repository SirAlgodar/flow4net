
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { startOfMonth, subMonths, endOfMonth, format } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!verifyToken(token)) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30days';

    // Summary Stats
    const totalTests = await prisma.testLink.count();
    const totalResults = await prisma.testResult.count();
    const activeTests = await prisma.testLink.count({ where: { isActive: true } });
    
    // Recent activity (last 30 days)
    const thirtyDaysAgo = subMonths(new Date(), 1);
    
    const testsByDay = await prisma.testResult.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: 'asc' }
    });

    // Format for chart (group by day)
    const chartDataMap = new Map();
    testsByDay.forEach(item => {
        const day = format(item.createdAt, 'yyyy-MM-dd');
        chartDataMap.set(day, (chartDataMap.get(day) || 0) + item._count.id);
    });

    const chartData = Array.from(chartDataMap.entries()).map(([date, count]) => ({
        date,
        count
    }));

    // Distribution by Type
    const byType = await prisma.testLink.groupBy({
        by: ['type'],
        _count: { id: true }
    });

    return NextResponse.json({
        summary: {
            totalTests,
            totalResults,
            activeTests,
            completionRate: totalTests > 0 ? Math.round((totalResults / totalTests) * 100) : 0
        },
        chartData,
        byType: byType.map(t => ({ name: t.type, value: t._count.id }))
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
