'use client';

import { Award, Briefcase, FileText, Gavel, LayoutDashboard, Receipt, Shield } from 'lucide-react';
import { ContractorGuard } from '@/components/contractor/contractor-guard';
import { AppShell, type NavItem } from '@/components/app-shell';

const items: NavItem[] = [
  { label: 'Dashboard', href: '/contractor/dashboard', icon: LayoutDashboard },
  { label: 'RFQs', href: '/contractor/rfqs', icon: FileText },
  { label: 'Projects', href: '/contractor/projects', icon: Briefcase },
  { label: 'Auctions', href: '/contractor/auctions', icon: Gavel },
  { label: 'Invoices', href: '/contractor/invoices', icon: Receipt },
  { label: 'Compliance', href: '/contractor/compliance', icon: Shield },
  { label: 'Credibility', href: '/contractor/credibility', icon: Award },
];

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContractorGuard>
      <AppShell role="Contractor" base="/contractor" items={items}>
        {children}
      </AppShell>
    </ContractorGuard>
  );
}
