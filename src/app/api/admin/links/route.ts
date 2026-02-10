
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

const createLinkSchema = z.object({
  type: z.enum(['QUICK', 'IDENTIFIED', 'UNIDENTIFIED']),
  code: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  cpfCnpj: z.string().optional().nullable(),
  config: z.object({
    allowSpeedTest: z.boolean().default(true),
    allowPing: z.boolean().default(true),
    allowTraceroute: z.boolean().default(true),
    allowVideo: z.boolean().default(true),
    allowVoip: z.boolean().default(true),
    allowWeb: z.boolean().default(true),
  }).optional(),
});

function generateCode(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verify if user exists (handles stale tokens after DB reset)
    const user = await prisma.user.findUnique({
        where: { id: payload.userId }
    });

    if (!user) {
        return NextResponse.json({ error: 'Usuário não encontrado. Por favor, faça login novamente.' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createLinkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { type, code, expiresAt, cpfCnpj, config } = validation.data;

    // Validate CPF/CNPJ if type is IDENTIFIED
    if (type === 'IDENTIFIED' && !cpfCnpj) {
        return NextResponse.json({ error: 'CPF/CNPJ é obrigatório para links identificados' }, { status: 400 });
    }

    // Generate code if not provided
    let finalCode = code;
    if (!finalCode) {
        let isUnique = false;
        while (!isUnique) {
            finalCode = generateCode();
            const existing = await prisma.testLink.findUnique({ where: { code: finalCode } });
            if (!existing) isUnique = true;
        }
    } else {
        // Check if provided code exists
        const existing = await prisma.testLink.findUnique({ where: { code: finalCode } });
        if (existing) {
            return NextResponse.json({ error: 'Código já existe' }, { status: 400 });
        }
    }

    const newLink = await prisma.testLink.create({
        data: {
            code: finalCode!,
            type,
            creatorId: payload.userId,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            cpfCnpj,
            config: config || {},
        }
    });

    return NextResponse.json({ success: true, link: newLink });

  } catch (error: any) {
    console.error('Error creating link:', error);
    return NextResponse.json({ error: 'Erro interno ao criar link' }, { status: 500 });
  }
}
