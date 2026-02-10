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
"[project]/Documents/trae_projects/flow4network/src/app/api/speedtest/download/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
async function GET() {
    // 10MB total size
    const totalSize = 10 * 1024 * 1024;
    const bufferSize = 64 * 1024; // 64KB chunks
    // Create a reusable noise buffer to save CPU during the stream loop
    const noiseBuffer = new Uint8Array(bufferSize);
    for(let i = 0; i < bufferSize; i++)noiseBuffer[i] = Math.floor(Math.random() * 256);
    const stream = new ReadableStream({
        start (controller) {
            let sent = 0;
            try {
                while(sent < totalSize){
                    // Enqueue the reused buffer. 
                    // Note: In some environments, enqueued chunks should be copied if modified later, 
                    // but here we don't modify it.
                    controller.enqueue(noiseBuffer);
                    sent += bufferSize;
                }
                controller.close();
            } catch (err) {
                // If the stream is cancelled by the client, this might throw
                // We can just ignore it or log it
                try {
                    controller.close();
                } catch (e) {}
            }
        }
    });
    return new Response(stream, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Cache-Control': 'no-store, no-transform'
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3fca63ff._.js.map