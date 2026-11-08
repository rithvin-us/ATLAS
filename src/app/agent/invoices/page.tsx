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
  Clock,
  CheckCircle,
  AlertCircle,
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
      if (!user?.uid) return;
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
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-foreground flex items-center gap-3 mb-2">
              <DollarSign className="h-10 w-10 text-primary" />
              Invoices
            </h1>
            <p className="text-muted-foreground text-lg">Review and manage contractor invoices</p>
          </div>

          {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 hover:border-foreground/25 transition-shadow">
            <CardContent className="p-5">
              <FileText className="h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-medium text-foreground mt-1">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:border-foreground/25 transition-shadow">
            <CardContent className="p-5">
              <FileText className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-3xl font-medium text-foreground mt-1">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:border-foreground/25 transition-shadow">
            <CardContent className="p-5">
              <DollarSign className="h-6 w-6 text-success mb-2" />
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-3xl font-medium text-foreground mt-1">{stats.paid}</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary border-0 hover:border-foreground/25 transition-shadow">
            <CardContent className="p-5">
              <DollarSign className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm text-primary font-medium">Total Amount</p>
              <p className="text-3xl font-medium text-primary mt-1">${(stats.total / 100).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by invoice ID"
              className="pl-10 h-12 rounded-xl border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-12 px-4 rounded-xl border border-border bg-card text-sm font-medium text-foreground cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {error && (
          <Card className="mb-6 bg-destructive/10 border-destructive/30">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">
                {invoices.length === 0 ? 'No invoices yet' : 'No invoices match your filters'}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {invoices.length === 0 ? 'Contractor invoices will appear here' : 'Try adjusting your search or filter'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((invoice) => {
              const getStatusIcon = () => {
                switch (invoice.status) {
                  case 'paid':
                    return <CheckCircle className="h-5 w-5 text-success" />;
                  case 'approved':
                    return <CheckCircle className="h-5 w-5 text-success" />;
                  case 'submitted':
                    return <Clock className="h-5 w-5 text-warning" />;
                  default:
                    return <FileText className="h-5 w-5 text-muted-foreground" />;
                }
              };

              const getStatusBadge = () => {
                const config: any = {
                  draft: { label: "Draft", color: "bg-secondary text-foreground" },
                  submitted: { label: "Submitted", color: "bg-secondary text-primary" },
                  approved: { label: "Approved", color: "bg-success/10 text-success" },
                  paid: { label: "Paid", color: "bg-success/10 text-success" },
                };
                const config_item = config[invoice.status] || config["submitted"];
                return <Badge className={config_item.color}>{config_item.label}</Badge>;
              };

              return (
                <Card key={invoice.id} className="hover:border-foreground/25 transition-shadow border-0">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {getStatusIcon()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground">Invoice #{invoice.id.substring(0, 8)}</h3>
                            {getStatusBadge()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span>Project: {invoice.projectId.substring(0, 8)}</span>
                            <span className="mx-2">•</span>
                            <span>Contractor: {invoice.contractorId.substring(0, 8)}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Created: {new Date(invoice.createdAt).toLocaleDateString()}</span>
                            {invoice.dueDate && (
                              <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-medium text-foreground">${invoice.totalAmount.toLocaleString()}</p>
                        <Link href={`/agent/invoices/${invoice.id}`}>
                          <Button size="sm" className="mt-2">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        </main>
      </div>
    </AgentGuard>
  );
}
