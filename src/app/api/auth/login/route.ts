import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { signToken, comparePassword } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const prisma = new PrismaClient();

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { username, password, remember } = validation.data;

    const user = await prisma.user.findFirst({
      where: { 
        OR: [
            { username },
            { email: username }
        ]
      },
    });

    if (!user) {
      // Fake delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500));
      await logAudit(null, 'LOGIN', 'FAILURE', request, { username, reason: 'User not found' });
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Check Lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
        await logAudit(user.id, 'LOGIN', 'FAILURE', request, { reason: 'Account locked' });
        const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
        return NextResponse.json({ error: `Conta bloqueada. Tente novamente em ${minutesLeft} minutos.` }, { status: 429 });
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
        const failedAttempts = user.failedLoginAttempts + 1;
        let lockoutUntil = user.lockoutUntil;

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: failedAttempts, lockoutUntil }
        });

        await logAudit(user.id, 'LOGIN', 'FAILURE', request, { reason: 'Invalid password', attempt: failedAttempts });
        return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Login Success
    await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockoutUntil: null }
    });

    // Token Expiration
    const expiresIn = remember ? '30d' : '8h';
    const token = signToken({
        userId: user.id,
        role: user.role,
        username: user.username || user.email
    }, expiresIn);

    await logAudit(user.id, 'LOGIN', 'SUCCESS', request);

    const response = NextResponse.json({ 
        success: true, 
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            mustChangePassword: user.mustChangePassword
        }
    });

    // Set Cookie
    const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8; // 30 days or 8 hours
    
    const useSecure = process.env.NODE_ENV === 'production' && process.env.USE_HTTPS === 'true';
    console.log(`[Login] Setting cookie. Secure: ${useSecure}, Env: ${process.env.NODE_ENV}, UseHTTPS: ${process.env.USE_HTTPS}`);

    response.cookies.set('token', token, {
        httpOnly: true,
        secure: useSecure, 
        sameSite: 'lax',
        maxAge: maxAge, 
        path: '/'
    });

    // Debug cookie (visible to JS)
    response.cookies.set('login_debug', 'success', {
        httpOnly: false,
        secure: useSecure,
        sameSite: 'lax',
        maxAge: 60, // 1 minute
        path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
