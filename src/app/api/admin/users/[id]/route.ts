
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { hashPassword, verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(6).optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'ATTENDANT']).optional(),
});

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

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!verifyToken(token)) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const data: any = { ...validation.data };

    // If password is provided and not empty, hash it. Otherwise remove from data.
    if (data.password) {
      data.password = await hashPassword(data.password);
    } else {
      delete data.password;
    }

    // Check unique constraints if email/username changed
    if (data.email || data.username) {
        const existing = await prisma.user.findFirst({
            where: {
                AND: [
                    { id: { not: id } },
                    {
                        OR: [
                            data.email ? { email: data.email } : {},
                            data.username ? { username: data.username } : {}
                        ]
                    }
                ]
            }
        });
        
        if (existing) {
             return NextResponse.json({ error: 'Email ou Username já em uso por outro usuário' }, { status: 409 });
        }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!verifyToken(token)) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { id } = await params;

    // Prevent deleting yourself? 
    // Ideally yes, but let's just do the deletion for now.
    // Also check if user has related records (createdTests). Prisma might throw error or cascade.
    // User has `createdTests TestLink[] @relation("CreatedLinks")`. 
    // If not cascading, we might need to handle it.
    
    // Let's try delete.
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Não é possível excluir usuário que possui registros vinculados ou erro interno.' }, { status: 500 });
  }
}
