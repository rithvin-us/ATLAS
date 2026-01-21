'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  FileText,
  DollarSign,
  Calendar,
  Loader2,
  AlertCircle,
  Plus,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { fetchContractorInvoices } from '@/lib/contractor-api';
import { Invoice } from '@/lib/types';

function formatMoney(value?: number) {
  if (value == null) return '—';
  return `$${(value / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function InvoicesContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [paymentNote, setPaymentNote] = useState('');

  useEffect(() => {
    async function loadInvoices() {
      if (!user) return;

      try {
        setLoading(true);
        const data = await fetchContractorInvoices(user.uid);
        setInvoices(data);
        setSelectedInvoice((prev) => prev || data[0] || null);
      } catch (err) {
        console.error('Failed to load invoices:', err);
        setError('Failed to load invoices. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, [user]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        invoice.id.toLowerCase().includes(q) ||
        invoice.projectId.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  useEffect(() => {
    if (selectedInvoice && !filteredInvoices.find((i) => i.id === selectedInvoice.id)) {
      setSelectedInvoice(filteredInvoices[0] || null);
    }
  }, [filteredInvoices, selectedInvoice]);

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    submitted: invoices.filter((i) => i.status === 'submitted').length,
    approved: invoices.filter((i) => i.status === 'approved').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
  };

  const statusTone = (status: Invoice['status']) => {
    if (status === 'paid') return 'bg-green-100 text-green-800';
    if (status === 'approved') return 'bg-blue-100 text-blue-800';
    if (status === 'submitted') return 'bg-amber-100 text-amber-800';
    if (status === 'disputed') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleUpload = () => {
    setUploadMessage('Documents uploaded (mock). Ensure invoices include PO and GRN.');
  };

  const handleSaveNote = () => {
    if (!selectedInvoice) return;
    setUploadMessage('Payment note saved.');
    setPaymentNote('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 flex gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Unable to load invoices</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-2">Create, track, and manage invoices for awarded projects.</p>
          </div>
          <Button className="gap-2" asChild>
            <Link href="/contractor/invoices/new">
              <Plus className="h-4 w-4" /> Create invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {uploadMessage && (
          <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {uploadMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatMoney(stats.total)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.submitted}</div>
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
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paid}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by invoice or project ID"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <FileText className="h-14 w-14 text-gray-300 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">No invoices found</h3>
              <p className="text-sm text-gray-600">{searchQuery || statusFilter !== 'all' ? 'No invoices match your filters.' : 'Create your first invoice to track payments.'}</p>
              <Button asChild>
                <Link href="/contractor/invoices/new">Create invoice</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Invoice ID</TableHead>
                      <TableHead className="font-semibold">Project</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Due date</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => {
                      const isSelected = selectedInvoice?.id === invoice.id;
                      return (
                        <TableRow
                          key={invoice.id}
                          className={`cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          <TableCell className="font-mono text-sm text-blue-700">{invoice.id.slice(0, 8)}</TableCell>
                          <TableCell className="text-sm text-gray-800">{invoice.projectId.slice(0, 10)}</TableCell>
                          <TableCell className="text-sm text-gray-900">{formatMoney(invoice.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge className={statusTone(invoice.status)}>{invoice.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-800">{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="gap-1" asChild>
                              <Link href={`/contractor/invoices/${invoice.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Detail panel */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedInvoice ? (
                  <p className="text-sm text-gray-600">Select an invoice to view payment status.</p>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs text-gray-500">Invoice</div>
                        <div className="font-mono text-sm text-blue-700">{selectedInvoice.id}</div>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1">Project {selectedInvoice.projectId}</h3>
                        <p className="text-sm text-gray-700 mt-1">Amount: {formatMoney(selectedInvoice.totalAmount)}</p>
                      </div>
                      <Badge className={statusTone(selectedInvoice.status)}>{selectedInvoice.status}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                      <div>
                        <div className="text-gray-500">Created</div>
                        <div className="font-medium text-gray-900">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Due date</div>
                        <div className="font-medium text-gray-900">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Base amount</div>
                        <div className="font-medium text-gray-900">{formatMoney(selectedInvoice.amount)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Tax</div>
                        <div className="font-medium text-gray-900">{formatMoney(selectedInvoice.taxAmount)}</div>
                      </div>
                    </div>

                    {selectedInvoice.paidAt && (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-900">
                        Paid on {new Date(selectedInvoice.paidAt).toLocaleDateString()}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <Upload className="h-4 w-4 text-gray-500" /> Upload documents
                      </div>
                      <p className="text-xs text-gray-600">Attach PO, GRN, and supporting docs to speed approvals.</p>
                      <Button variant="outline" size="sm" className="gap-2" onClick={handleUpload}>
                        <Upload className="h-4 w-4" /> Upload (mock)
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-800">Agent remarks / rejection reasons</div>
                      <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
                        {(selectedInvoice as any).remarks || 'No remarks from agent yet.'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-800">Payment status note</div>
                      <Textarea
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        placeholder="Add follow-up notes or bank reference numbers."
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button size="sm" className="gap-2" onClick={handleSaveNote} disabled={!paymentNote.trim()}>
                          Save note
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContractorInvoicesPage() {
  return <InvoicesContent />;
}
