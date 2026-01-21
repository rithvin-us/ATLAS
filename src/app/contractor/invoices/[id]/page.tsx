'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { ContractorGuard } from '@/components/contractor/contractor-guard';
import { useAuth } from '@/lib/auth-context';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Invoice } from '@/lib/types';

function InvoiceDetailContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      if (!user) return;

      try {
        setLoading(true);
        const invoiceRef = doc(db, 'invoices', invoiceId);
        const invoiceDoc = await getDoc(invoiceRef);

        if (!invoiceDoc.exists()) {
          setError('Invoice not found');
          return;
        }

        const data = invoiceDoc.data();
        const invoice: Invoice = {
          id: invoiceDoc.id,
          contractorId: data.contractorId,
          agentId: data.agentId,
          projectId: data.projectId,
          milestoneId: data.milestoneId,
          amount: data.amount,
          taxAmount: data.taxAmount,
          totalAmount: data.totalAmount,
          description: data.description,
          status: data.status,
          documents: data.documents || [],
          dueDate: data.dueDate?.toDate?.() || new Date(data.dueDate),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          paidAt: data.paidAt?.toDate?.() || data.paidAt ? new Date(data.paidAt) : undefined,
        };

        // Verify this invoice belongs to the contractor
        if (invoice.contractorId !== user.uid) {
          setError('You do not have access to this invoice');
          return;
        }

        setInvoice(invoice);
      } catch (err) {
        console.error('Failed to load invoice:', err);
        setError('Failed to load invoice. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [user, invoiceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">{error || 'Invoice not found'}</p>
          <Button className="mt-4" onClick={() => router.push('/contractor/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/contractor/invoices" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold font-headline ml-4">Invoice {invoice.id.slice(0, 8)}</h1>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Banner */}
          {invoice.paidAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900">Payment Received</div>
                  <div className="text-sm text-green-700">
                    Paid on {new Date(invoice.paidAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoice Details</CardTitle>
                <Badge variant={
                  invoice.status === 'paid' ? 'default' :
                  invoice.status === 'approved' ? 'default' :
                  invoice.status === 'submitted' ? 'secondary' :
                  'outline'
                }>
                  {invoice.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Invoice ID</div>
                    <div className="font-mono">{invoice.id}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Project ID</div>
                    <Link 
                      href={`/contractor/projects/${invoice.projectId}`}
                      className="font-mono text-primary hover:underline"
                    >
                      {invoice.projectId.slice(0, 16)}...
                    </Link>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Issue Date</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Due Date</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amount Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Amount Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{invoice.description}</p>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-lg font-semibold">
                      ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-lg font-semibold">
                      ${invoice.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${invoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Invoice Created</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(invoice.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {invoice.status !== 'draft' && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Invoice Submitted</div>
                      <div className="text-sm text-muted-foreground">
                        Awaiting approval from agent
                      </div>
                    </div>
                  </div>
                )}

                {(invoice.status === 'approved' || invoice.status === 'paid') && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Invoice Approved</div>
                      <div className="text-sm text-muted-foreground">
                        Approved for payment
                      </div>
                    </div>
                  </div>
                )}

                {invoice.paidAt && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Payment Received</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(invoice.paidAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" asChild className="flex-1">
              <Link href={`/contractor/projects/${invoice.projectId}`}>
                <FileText className="h-4 w-4 mr-2" />
                View Project
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/contractor/invoices">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ContractorInvoiceDetailPage() {
  return (
    <ContractorGuard>
      <InvoiceDetailContent />
    </ContractorGuard>
  );
}
