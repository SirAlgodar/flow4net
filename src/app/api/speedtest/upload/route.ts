export async function POST(request: Request) {
    await request.blob();
    return new Response('ok');
}
