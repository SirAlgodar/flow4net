import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const link = await prisma.testLink.findUnique({
    where: { code },
  });
  
  if (!link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }
  
  if (link.expiresAt && new Date() > link.expiresAt) {
    return NextResponse.json({ error: 'Link expired' }, { status: 410 });
  }

  return NextResponse.json(link);
}
