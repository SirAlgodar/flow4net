import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function AdminPage() {
  const results = await prisma.testResult.findMany({
    orderBy: { createdAt: 'desc' },
    include: { testLink: true },
    take: 50
  });

  const links = await prisma.testLink.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Painel Administrativo</h1>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section>
            <h2 className="mb-4 text-xl font-semibold">Links de Teste</h2>
            <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
                <Link href="/admin/links/new" className="mb-4 inline-block rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-blue-600">
                    Criar Novo Link
                </Link>
                <div className="space-y-2">
                    {links.map(link => (
                        <div key={link.id} className="flex justify-between border-b border-border py-2 last:border-0">
                            <div>
                                <div className="font-bold">{link.code}</div>
                                <div className="text-sm text-muted-foreground">{link.type}</div>
                            </div>
                            <a href={`/t/${link.code}`} target="_blank" className="text-primary hover:underline">
                                Abrir Teste
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section>
            <h2 className="mb-4 text-xl font-semibold">Últimos Resultados</h2>
            <div className="h-96 overflow-y-auto rounded-lg border border-border bg-card p-4 text-card-foreground">
                {results.map(res => (
                    <div key={res.id} className="mb-4 border-b border-border pb-4 last:border-0">
                        <div className="flex justify-between">
                            <span className="font-bold">{res.cpfCnpj || 'Anônimo'}</span>
                            <span className="text-sm text-muted-foreground">{res.createdAt.toLocaleString()}</span>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                            <div>Download: {res.downloadSpeed?.toFixed(2)} Mbps</div>
                            <div>Upload: {res.uploadSpeed?.toFixed(2)} Mbps</div>
                            <div>Ping: {res.ping?.toFixed(0)} ms</div>
                            <div>IP: {res.publicIp}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
}
