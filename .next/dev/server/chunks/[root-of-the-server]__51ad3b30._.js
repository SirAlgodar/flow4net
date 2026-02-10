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
"[project]/Documents/trae_projects/flow4network/src/app/api/admin/reports/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/Documents/trae_projects/flow4network/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$date$2d$fns$2f$subMonths$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/node_modules/date-fns/subMonths.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/trae_projects/flow4network/node_modules/date-fns/format.js [app-route] (ecmascript) <locals>");
;
;
;
;
;
const prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
async function GET(request) {
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const token = cookieStore.get('token')?.value;
        if (!token) return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Unauthorized'
        }, {
            status: 401
        });
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token)) return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Invalid token'
        }, {
            status: 401
        });
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30days';
        // Summary Stats
        const totalTests = await prisma.testLink.count();
        const totalResults = await prisma.testResult.count();
        const activeTests = await prisma.testLink.count({
            where: {
                isActive: true
            }
        });
        // Recent activity (last 30 days)
        const thirtyDaysAgo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$date$2d$fns$2f$subMonths$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["subMonths"])(new Date(), 1);
        const testsByDay = await prisma.testResult.groupBy({
            by: [
                'createdAt'
            ],
            _count: {
                id: true
            },
            where: {
                createdAt: {
                    gte: thirtyDaysAgo
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        // Format for chart (group by day)
        const chartDataMap = new Map();
        testsByDay.forEach((item)=>{
            const day = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(item.createdAt, 'yyyy-MM-dd');
            chartDataMap.set(day, (chartDataMap.get(day) || 0) + item._count.id);
        });
        const chartData = Array.from(chartDataMap.entries()).map(([date, count])=>({
                date,
                count
            }));
        // Distribution by Type
        const byType = await prisma.testLink.groupBy({
            by: [
                'type'
            ],
            _count: {
                id: true
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            summary: {
                totalTests,
                totalResults,
                activeTests,
                completionRate: totalTests > 0 ? Math.round(totalResults / totalTests * 100) : 0
            },
            chartData,
            byType: byType.map((t)=>({
                    name: t.type,
                    value: t._count.id
                }))
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$trae_projects$2f$flow4network$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal Server Error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__51ad3b30._.js.map