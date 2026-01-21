'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AgentGuard } from '@/components/agent/agent-guard';
import { fetchInvoice, updateInvoiceStatus } from '@/lib/agent-api';
import { Invoice } from '@/lib/types';
import { Loader2, ArrowLeft, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchInvoice(invoiceId);
        if (!data) {
          setError('Invoice not found');
          setInvoice(null);
        } else {
          setInvoice(data);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [invoiceId]);

  const handleStatusChange = async (newStatus: Invoice['status']) => {
    if (!invoice) return;
    
    setUpdating(true);
    try {
      await updateInvoiceStatus(invoiceId, newStatus);
      setInvoice({ ...invoice, status: newStatus });
      toast({
        title: 'Success',
        description: 'Invoice status updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AgentGuard>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Back Navigation */}
          <Link href="/agent/invoices" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Invoice Details</h1>
            <p className="text-gray-600 text-lg">Review and manage invoice status</p>
          </div>
          {error && !loading && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading invoice...</span>
            </div>
          ) : invoice ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl flex items-center gap-2">
                        <FileText className="h-8 w-8" />
                        Invoice {invoiceId.substring(0, 8)}
                      </CardTitle>
                    </div>
                    <Badge variant={
                      invoice.status === 'paid' ? 'default' :
                      invoice.status === 'approved' ? 'secondary' :
                      'outline'
                    }>
                      {invoice.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Project ID</p>
                      <p className="font-medium">{invoice.projectId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contractor</p>
                      <p className="font-medium">{invoice.contractorId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Milestone</p>
                      <p className="font-medium">{invoice.milestoneId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${invoice.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">${invoice.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total</span>
                      <span>${invoice.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {invoice.paidAt && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-900">Paid on {new Date(invoice.paidAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invoice Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Update Status</label>
                    <div className="flex gap-2">
                      <Select 
                        value={invoice.status} 
                        onValueChange={(value) => handleStatusChange(value as Invoice['status'])}
                        disabled={updating}
                      >
                        <SelectTrigger className="w-full max-w-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="disputed">Disputed</SelectItem>
                        </SelectContent>
                      </Select>
                      {updating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href={`/agent/projects/${invoice.projectId}`}>View Project</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </main>
      </div>
    </AgentGuard>
  );
}
