import { Bell, User } from 'lucide-react';

export function Topbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-card text-card-foreground">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold">
                F4
            </div>
            <span className="text-lg font-semibold tracking-tight">Flow4Network</span>
        </div>
        
        <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Admin</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <User className="h-5 w-5" />
                </div>
            </div>
        </div>
      </div>
    </header>
  );
}
