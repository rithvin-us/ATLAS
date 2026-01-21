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
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <DollarSign className="h-10 w-10 text-blue-600" />
              Invoices
            </h1>
            <p className="text-gray-600 text-lg">Review and manage contractor invoices</p>
          </div>

          {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <FileText className="h-6 w-6 text-gray-600 mb-2" />
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <FileText className="h-6 w-6 text-purple-600 mb-2" />
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <DollarSign className="h-6 w-6 text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.paid}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <DollarSign className="h-6 w-6 text-blue-600 mb-2" />
              <p className="text-sm text-blue-700 font-medium">Total Amount</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">${(stats.total / 100).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by invoice ID..."
              className="pl-10 h-12 rounded-xl border-gray-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 cursor-pointer"
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
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">
                {invoices.length === 0 ? 'No invoices yet' : 'No invoices match your filters'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
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
                    return <CheckCircle className="h-5 w-5 text-emerald-600" />;
                  case 'approved':
                    return <CheckCircle className="h-5 w-5 text-green-600" />;
                  case 'submitted':
                    return <Clock className="h-5 w-5 text-yellow-600" />;
                  default:
                    return <FileText className="h-5 w-5 text-gray-600" />;
                }
              };

              const getStatusBadge = () => {
                const config: any = {
                  draft: { label: "Draft", color: "bg-gray-100 text-gray-800" },
                  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800" },
                  approved: { label: "Approved", color: "bg-green-100 text-green-800" },
                  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-800" },
                };
                const config_item = config[invoice.status] || config["submitted"];
                return <Badge className={config_item.color}>{config_item.label}</Badge>;
              };

              return (
                <Card key={invoice.id} className="hover:shadow-lg transition-shadow border-0">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {getStatusIcon()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">Invoice #{invoice.id.substring(0, 8)}</h3>
                            {getStatusBadge()}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span>Project: {invoice.projectId.substring(0, 8)}</span>
                            <span className="mx-2">•</span>
                            <span>Contractor: {invoice.contractorId.substring(0, 8)}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Created: {new Date(invoice.createdAt).toLocaleDateString()}</span>
                            {invoice.dueDate && (
                              <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-gray-900">${invoice.totalAmount.toLocaleString()}</p>
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
