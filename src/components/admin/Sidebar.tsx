import Link from 'next/link';
import { LayoutDashboard, FileText, BarChart, Link as LinkIcon, Globe, Settings, Users, Server } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Testes', href: '/admin/tests', icon: FileText },
  { name: 'Relatórios', href: '/admin/reports', icon: BarChart },
  { name: 'Gerar Links', href: '/admin/links/new', icon: LinkIcon },
  { name: 'Links', href: '/admin/links', icon: LinkIcon },
  { name: 'Monitoramento', href: '/admin/monitoring', icon: Globe },
  { name: 'API', href: '/admin/api', icon: Server },
  { name: 'Usuários', href: '/admin/users', icon: Users },
  { name: 'Configurações', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card text-card-foreground">
      <div className="flex h-full flex-col justify-between overflow-y-auto py-4">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.href}
                className="flex items-center rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
