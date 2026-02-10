(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__1e0a9c6e._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/Documents/trae_projects/flow4network/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/node_modules/jose/dist/webapi/jwt/verify.js [middleware-edge] (ecmascript)");
;
;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';
async function middleware(request) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;
    // 1. If trying to access login page
    if (pathname === '/login') {
        if (token) {
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jwtVerify"])(token, new TextEncoder().encode(JWT_SECRET));
                // Token is valid, redirect to dashboard
                return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/admin', request.url));
            } catch (e) {
                // Token invalid, let them login
                return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // 2. If trying to access protected routes (e.g. /admin)
    if (pathname.startsWith('/admin')) {
        if (!token) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', request.url));
        }
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jwtVerify"])(token, new TextEncoder().encode(JWT_SECRET));
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
        } catch (e) {
            // Token invalid
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', request.url));
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        '/login',
        '/admin/:path*'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__1e0a9c6e._.js.map