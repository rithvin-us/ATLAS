'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AgentGuard } from '@/components/agent/agent-guard';
import { useAuth } from '@/lib/auth-context';
import { fetchInvoices } from '@/lib/agent-api';
import { Invoice } from '@/lib/types';
import {
  Search,
  DollarSign,
  Loader2,
  FileText,
} from 'lucide-react';

export default function AgentInvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchInvoices(user.uid);
        setInvoices(data);
      } catch (err: any) {
        setError(err?.message || 'Unable to load invoices');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const filtered = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch = invoice.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      pending: invoices.filter((inv) => inv.status === 'submitted' || inv.status === 'draft').length,
      approved: invoices.filter((inv) => inv.status === 'approved').length,
      paid: invoices.filter((inv) => inv.status === 'paid').length,
    };
  }, [invoices]);

  return (
    <AgentGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4">
            <Link href="/agent/dashboard" className="text-muted-foreground hover:text-foreground">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold font-headline ml-4">Invoices</h1>
          </div>
        </header>

        <main className="flex-1 container py-6 px-4">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(stats.total / 100).toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.paid}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant={statusFilter === 'all' ? 'outline' : 'default'}
              onClick={() => setStatusFilter((prev) => (prev === 'all' ? 'submitted' : 'all'))}
            >
              {statusFilter === 'all' ? 'Show Pending' : 'Show All'}
            </Button>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading invoices...</span>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    {invoices.length === 0 ? 'No invoices yet.' : 'No invoices match your filters.'}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {filtered.map((invoice) => (
                    <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="font-medium">Invoice {invoice.id.substring(0, 8)}</div>
                            <div className="text-sm text-muted-foreground">
                              Project: {invoice.projectId} • Contractor: {invoice.contractorId}
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="font-bold text-lg">${(invoice.totalAmount / 100).toFixed(2)}</div>
                            <Badge variant={
                              invoice.status === 'paid' ? 'default' :
                              invoice.status === 'approved' ? 'secondary' :
                              'outline'
                            }>
                              {invoice.status}
                            </Badge>
                          </div>
                          <div className="ml-4">
                            <Button asChild size="sm">
                              <Link href={`/agent/invoices/${invoice.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </AgentGuard>
  );
}
