import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logAudit(
  userId: string | null,
  action: string,
  status: 'SUCCESS' | 'FAILURE',
  req: Request,
  details?: any
) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        status,
        ip,
        userAgent,
        details: details ? JSON.stringify(details) : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
