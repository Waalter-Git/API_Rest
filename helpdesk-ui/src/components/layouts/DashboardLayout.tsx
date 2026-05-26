'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, ClipboardList, HardDrive, LogOut, Shield, UserCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type DashboardLayoutProps = {
  children: ReactNode;
};

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/dashboard/assets', label: 'Assets', icon: HardDrive },
  { href: '/dashboard/tickets', label: 'Tickets', icon: ClipboardList },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, isAuthenticated, isReady, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isReady, router]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-zinc-300 shadow-2xl backdrop-blur">
          Carregando area protegida...
        </div>
      </div>
    );
  }

  const handleLogout = (): void => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(23,23,23,0.95),_rgba(9,9,11,1)_58%)] text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-white/5 px-6 py-8 backdrop-blur xl:flex xl:flex-col">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-300/20">
              <Shield className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/60">Helpdesk</p>
              <h1 className="text-lg font-semibold text-zinc-50">Operations Console</h1>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/20'
                      : 'text-zinc-300 hover:bg-white/5 hover:text-zinc-50'
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Signed in as</p>
            <div className="mt-3 flex items-center gap-3">
              <UserCircle2 className="size-10 text-cyan-300" />
              <div>
                <p className="text-sm font-semibold text-zinc-50">{user?.id ?? 'Authenticated user'}</p>
                <p className="text-xs text-zinc-400">Role: {user?.role ?? 'EMPLOYEE'}</p>
              </div>
            </div>
          </div>

          <Button className="mt-6 justify-start gap-2 rounded-2xl bg-white/10 text-zinc-50 hover:bg-white/15" onClick={handleLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-white/10 bg-black/10 px-6 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/60">Secure Dashboard</p>
                <h2 className="mt-1 text-2xl font-semibold text-zinc-50">Corporate Control Panel</h2>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200">
                <Shield className="size-4 text-cyan-300" />
                Session protected
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>

      <Toaster richColors position="top-right" closeButton />
    </div>
  );
};

export { DashboardLayout };
