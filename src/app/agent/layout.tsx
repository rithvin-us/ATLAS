'use client';

import { Briefcase, FileText, Gavel, LayoutDashboard, Receipt, Users } from 'lucide-react';
import { AgentGuard } from '@/components/agent/agent-guard';
import { AppShell, type NavItem } from '@/components/app-shell';

const items: NavItem[] = [
  { label: 'Dashboard', href: '/agent/dashboard', icon: LayoutDashboard },
  { label: 'RFQs', href: '/agent/rfq', icon: FileText },
  { label: 'Projects', href: '/agent/projects', icon: Briefcase },
  { label: 'Auctions', href: '/agent/auctions', icon: Gavel },
  { label: 'Vendors', href: '/agent/vendors', icon: Users },
  { label: 'Invoices', href: '/agent/invoices', icon: Receipt },
];

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgentGuard>
      <AppShell role="Agent" base="/agent" items={items}>
        {children}
      </AppShell>
    </AgentGuard>
  );
}
