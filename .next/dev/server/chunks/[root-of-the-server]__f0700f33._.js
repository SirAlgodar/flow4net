module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/Documents/trae_projects/flow4network/src/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "comparePassword",
    ()=>comparePassword,
    "hashPassword",
    ()=>hashPassword,
    "signToken",
    ()=>signToken,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';
function signToken(payload, expiresIn = '8h') {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, JWT_SECRET, {
        expiresIn: expiresIn
    });
}
function verifyToken(token) {
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}
async function hashPassword(password) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(password, 10);
}
async function comparePassword(password, hash) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, hash);
}
}),
"[project]/Documents/trae_projects/flow4network/src/lib/audit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "logAudit",
    ()=>logAudit
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/Documents/trae_projects/flow4network/node_modules/@prisma/client)");
;
const prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
async function logAudit(userId, action, status, req, details) {
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
                details: details ? JSON.stringify(details) : undefined
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
}
}),
"[project]/Documents/trae_projects/flow4network/src/app/api/auth/login/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/Documents/trae_projects/flow4network/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$src$2f$lib$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/src/lib/audit.ts [app-route] (ecmascript)");
;
;
;
;
;
const prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
const loginSchema = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    username: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Username is required'),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Password is required'),
    remember: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
});
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
async function POST(request) {
    try {
        const body = await request.json();
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: validation.error.issues[0].message
            }, {
                status: 400
            });
        }
        const { username, password, remember } = validation.data;
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        username
                    },
                    {
                        email: username
                    }
                ]
            }
        });
        if (!user) {
            // Fake delay to prevent timing attacks
            await new Promise((resolve)=>setTimeout(resolve, 500));
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$src$2f$lib$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAudit"])(null, 'LOGIN', 'FAILURE', request, {
                username,
                reason: 'User not found'
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Credenciais inválidas'
            }, {
                status: 401
            });
        }
        // Check Lockout
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$src$2f$lib$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAudit"])(user.id, 'LOGIN', 'FAILURE', request, {
                reason: 'Account locked'
            });
            const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Conta bloqueada. Tente novamente em ${minutesLeft} minutos.`
            }, {
                status: 429
            });
        }
        const isValid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["comparePassword"])(password, user.password);
        if (!isValid) {
            const failedAttempts = user.failedLoginAttempts + 1;
            let lockoutUntil = user.lockoutUntil;
            if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
                lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
            }
            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    failedLoginAttempts: failedAttempts,
                    lockoutUntil
                }
            });
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$src$2f$lib$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAudit"])(user.id, 'LOGIN', 'FAILURE', request, {
                reason: 'Invalid password',
                attempt: failedAttempts
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Credenciais inválidas'
            }, {
                status: 401
            });
        }
        // Login Success
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                failedLoginAttempts: 0,
                lockoutUntil: null
            }
        });
        // Token Expiration
        const expiresIn = remember ? '30d' : '8h';
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signToken"])({
            userId: user.id,
            role: user.role,
            username: user.username || user.email
        }, expiresIn);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$src$2f$lib$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAudit"])(user.id, 'LOGIN', 'SUCCESS', request);
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
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
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === 'production',
            sameSite: 'strict',
            maxAge: maxAge,
            path: '/'
        });
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Erro interno no servidor'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f0700f33._.js.map