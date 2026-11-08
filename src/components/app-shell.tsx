'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, Settings, User, X, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface AppShellProps {
  role: 'Agent' | 'Contractor';
  base: string;
  items: NavItem[];
  children: React.ReactNode;
}

const ICON = 'h-4 w-4 shrink-0';
const ROW =
  'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors';

export function AppShell({ role, base, items, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === `${base}/dashboard`
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.push('/');
    } else {
      toast({ title: 'Could not log out', description: 'Try again', variant: 'destructive' });
    }
  };

  const link = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setOpen(false)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          ROW,
          active
            ? 'bg-card text-foreground shadow-[inset_0_0_0_1px_hsl(var(--border))]'
            : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
        )}
      >
        <Icon className={ICON} strokeWidth={1.5} />
        {item.label}
      </Link>
    );
  };

  const secondary = [
    { label: 'Profile', href: `${base}/profile`, icon: User },
    { label: 'Settings', href: `${base}/settings`, icon: Settings },
  ];

  const sidebar = (
    <div className="flex h-full flex-col px-3 py-4">
      <Link href={`${base}/dashboard`} className="flex items-baseline gap-2 px-2.5 pb-6 pt-1">
        <span className="text-base font-medium tracking-tight">ATLAS</span>
        <span className="font-mono text-xs text-muted-foreground">{role.toLowerCase()}</span>
      </Link>

      <nav className="flex flex-col gap-0.5" aria-label="Main">
        {items.map(link)}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 border-t pt-3">
        {secondary.map(link)}
        <button
          onClick={handleLogout}
          className={cn(ROW, 'text-muted-foreground hover:bg-card/60 hover:text-foreground')}
        >
          <LogOut className={ICON} strokeWidth={1.5} />
          Log out
        </button>
        {user?.email && (
          <p className="truncate px-2.5 pt-3 text-xs text-muted-foreground" title={user.email}>
            {user.email}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r bg-[hsl(var(--sidebar-background))] lg:block">
        {sidebar}
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
        <Link href={`${base}/dashboard`} className="text-base font-medium tracking-tight">
          ATLAS
        </Link>
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-20 bg-[hsl(var(--sidebar-background))] lg:hidden">
          {sidebar}
        </div>
      )}

      <main className="lg:pl-60">{children}</main>
    </div>
  );
}
