'use client';

import { Bell, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
            
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                >
                    <span className="text-sm font-medium text-muted-foreground">Admin</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground hover:bg-accent/80 transition-colors">
                        <User className="h-5 w-5" />
                    </div>
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-popover py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-border">
                        <div className="px-4 py-2 border-b border-border">
                            <p className="text-sm font-medium text-foreground">Administrador</p>
                            <p className="text-xs text-muted-foreground truncate">admin@flow4network.com</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-accent hover:text-red-700 transition-colors"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
}
