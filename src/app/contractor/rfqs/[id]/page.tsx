'use client';

import { useState, useEffect, useMemo, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  AlertCircle,
  Users,
  ShieldCheck,
  FileDown,
  Paperclip,
  Save,
  Send,
  Building2,
} from 'lucide-react';
import { ContractorGuard } from '@/components/contractor/contractor-guard';
import { useAuth } from '@/lib/auth-context';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase-client';
import { RFQ } from '@/lib/types';

function RFQDetailContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rfq, setRFQ] = useState<RFQ | null>(null);
  const [materialsCost, setMaterialsCost] = useState('');
  const [servicesCost, setServicesCost] = useState('');
  const [timeline, setTimeline] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('30% advance, 70% on delivery');
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    async function loadRFQ() {
      if (!user) return;

      const db = getFirebaseDb();
      if (!db) return;

      try {
        setLoading(true);
        const rfqRef = doc(db, 'rfqs', rfqId);
        const rfqDoc = await getDoc(rfqRef);

        if (!rfqDoc.exists()) {
          setError('RFQ not found');
          return;
        }

        const data = rfqDoc.data();
        const rfq: RFQ = {
          id: rfqDoc.id,
          projectId: data.projectId || 'project',
          agentId: data.agentId,
          title: data.title,
          description: data.description || '',
          scopeOfWork: data.scopeOfWork || data.scope || '',
          scope: data.scope || data.scopeOfWork,
          location: data.location,
          budget: data.budget,
          eligibilityCriteria: data.eligibilityCriteria || [],
          documents: data.documents || [],
          status: data.status || 'draft',
          deadline: data.deadline?.toDate?.() || new Date(data.deadline),
          responses: data.responses || [],
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        };

        setRFQ(rfq);
      } catch (err) {
        console.error('Failed to load RFQ:', err);
        setError('Failed to load RFQ. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadRFQ();
  }, [user, rfqId]);

  const totalCost = useMemo(() => {
    const materials = parseFloat(materialsCost) || 0;
    const services = parseFloat(servicesCost) || 0;
    return (materials + services).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [materialsCost, servicesCost]);

  const handleAttachmentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setAttachments(files);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatusMessage('Quotation submitted successfully.');
  };

  const handleSaveDraft = () => {
    setStatusMessage('Draft saved. You can return to edit before submitting.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">{error || 'RFQ not found'}</p>
          <Button className="mt-4" onClick={() => router.push('/contractor/rfqs')}>
            Back to RFQs
          </Button>
        </div>
      </div>
    );
  }

  const hasResponded = rfq.responses?.some(r => r.contractorId === user?.uid);
  const daysUntilDeadline = Math.ceil((new Date(rfq.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysUntilDeadline < 0;
  const isOpen = rfq.status === 'published';
  const statusLabel = isOpen ? 'Open' : isExpired ? 'Expired' : rfq.status === 'draft' ? 'Draft' : 'Closed';
  const statusTone = isOpen
    ? 'bg-success/10 text-success'
    : isExpired
      ? 'bg-destructive/10 text-destructive'
      : rfq.status === 'draft'
        ? 'bg-warning/10 text-warning'
        : 'bg-secondary text-foreground';

  const downloadableDocs = [
    { name: 'Scope_of_Work.pdf', size: '1.2 MB' },
    { name: 'Plant_Drawings.zip', size: '8.4 MB' },
    { name: 'Safety_Compliance_Checklist.docx', size: '420 KB' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8 gap-4">
          <Link href="/contractor/rfqs" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline text-sm font-medium">Back to RFQs</span>
          </Link>
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-medium text-foreground">{rfq.title}</h1>
              <p className="text-sm text-muted-foreground">RFQ ID: {rfq.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusTone}>{statusLabel}</Badge>
              <Badge variant="outline" className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4" />
                {new Date(rfq.deadline).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Status Message */}
        {statusMessage && (
          <div className="rounded-md border border-border bg-secondary px-4 py-3 text-sm text-primary">
            {statusMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* RFQ Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>RFQ Overview</CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {rfq.responses?.length || 0} responses
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Project Summary</h3>
                  <p className="text-foreground mt-2 whitespace-pre-wrap leading-relaxed">
                    {rfq.description || 'No description provided.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border bg-secondary p-4">
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="flex items-center gap-2 mt-1 text-foreground font-medium">
                      <MapPin className="h-4 w-4" /> {rfq.location ?? 'Not specified'}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-secondary p-4">
                    <div className="text-xs text-muted-foreground">Budget Range</div>
                    <div className="flex items-center gap-2 mt-1 text-foreground font-medium">
                      <DollarSign className="h-4 w-4" /> {rfq.budget != null ? `$${rfq.budget.toLocaleString()}` : 'Budget not shared'}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-secondary p-4">
                    <div className="text-xs text-muted-foreground">Closing Date</div>
                    <div className="flex items-center gap-2 mt-1 text-foreground font-medium">
                      <Calendar className="h-4 w-4" /> {new Date(rfq.deadline).toLocaleDateString()}
                    </div>
                    {isExpired && <p className="text-xs text-destructive mt-1">This RFQ is past its closing date.</p>}
                  </div>
                  <div className="rounded-lg border bg-secondary p-4">
                    <div className="text-xs text-muted-foreground">Buyer Organization</div>
                    <div className="flex items-center gap-2 mt-1 text-foreground font-medium">
                      <Building2 className="h-4 w-4" /> Agent Company
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scope, Site, Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Scope of Work & Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Scope of Work</h3>
                  <p className="mt-2 text-foreground whitespace-pre-wrap">
                    {rfq.scopeOfWork || rfq.scope || 'Scope details will be provided by the agent.'}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-secondary">
                    <h4 className="text-sm font-medium text-foreground">Site / Plant Details</h4>
                    <p className="text-sm text-foreground mt-2">
                      Work will be executed at {rfq.location ?? 'the specified site'}. Contractors must coordinate access, follow safety inductions, and adhere to plant operating hours.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 bg-secondary">
                    <h4 className="text-sm font-medium text-foreground">Agent Policies & Code of Conduct</h4>
                    <ul className="mt-2 space-y-1 text-sm text-foreground">
                      <li className="flex gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Zero-tolerance on safety non-compliance.</li>
                      <li className="flex gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Follow vendor ethics and anti-bribery policy.</li>
                      <li className="flex gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Submit only verified data and certifications.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-foreground">Eligibility Criteria</h3>
                  <div className="mt-2 space-y-2">
                    {rfq.eligibilityCriteria && rfq.eligibilityCriteria.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-foreground">
                        {rfq.eligibilityCriteria.map((criterion, index) => (
                          <li key={index}>{criterion}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-foreground">No specific eligibility criteria specified.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Downloadable Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {downloadableDocs.map((docItem) => (
                  <div key={docItem.name} className="flex items-center justify-between rounded-lg border p-3 bg-secondary">
                    <div className="flex items-center gap-3">
                      <FileDown className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{docItem.name}</p>
                        <p className="text-xs text-muted-foreground">{docItem.size}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileDown className="h-4 w-4" /> Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deadline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-medium text-foreground">
                  {isExpired ? 'Expired' : `${Math.max(daysUntilDeadline, 0)} days`}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isExpired ? 'This RFQ is past the deadline.' : 'Time remaining to submit your quotation.'}
                </p>
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">Due Date</div>
                  <div className="font-medium text-foreground">{new Date(rfq.deadline).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submission Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hasResponded ? (
                  <>
                    <Badge className="bg-success/10 text-success px-3 py-1">Response Submitted</Badge>
                    <p className="text-sm text-foreground">You have already submitted a quotation.</p>
                  </>
                ) : isOpen && !isExpired ? (
                  <>
                    <Badge className="bg-secondary text-primary px-3 py-1">Open for submission</Badge>
                    <p className="text-sm text-foreground">Complete the structured form to submit an accurate, compliant bid.</p>
                  </>
                ) : (
                  <>
                    <Badge className="bg-secondary text-foreground px-3 py-1">Closed</Badge>
                    <p className="text-sm text-foreground">This RFQ is not accepting new bids.</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>RFQ Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-foreground">
                  <span>Total Responses</span>
                  <span className="font-medium text-foreground">{rfq.responses?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-foreground">
                  <span>Budget</span>
                  <span className="font-medium text-foreground">{rfq.budget != null ? `$${rfq.budget.toLocaleString()}` : 'Not shared'}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-foreground">
                  <span>Created</span>
                  <span className="font-medium text-foreground">{new Date(rfq.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quotation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Structured Quotation</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Materials Cost</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter materials cost"
                    value={materialsCost}
                    onChange={(e) => setMaterialsCost(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Services / Labor Cost</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter services cost"
                    value={servicesCost}
                    onChange={(e) => setServicesCost(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Total (Auto)</label>
                  <div className="text-xl font-medium text-foreground">${totalCost}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Timeline & Milestones</label>
                <Textarea
                  placeholder="Outline milestones with dates (e.g., Mobilization, Material delivery, Commissioning)"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Payment Terms</label>
                <Input
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g., 30% advance, 50% on delivery, 20% post-commissioning"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Additional Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Clarifications, exclusions, warranty, compliance notes"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Attach Annexures</label>
                <Input type="file" multiple onChange={handleAttachmentChange} className="cursor-pointer" />
                {attachments.length > 0 && (
                  <ul className="text-sm text-foreground space-y-1">
                    {attachments.map((file) => (
                      <li key={file.name} className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" /> {file.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" className="gap-2" disabled={!isOpen || isExpired}>
                  <Send className="h-4 w-4" />
                  Submit Quotation
                </Button>
                <Button type="button" variant="outline" className="gap-2" onClick={handleSaveDraft}>
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                {!isOpen && (
                  <span className="text-sm text-destructive">Submissions are closed for this RFQ.</span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ContractorRFQDetailPage() {
  return (
    <ContractorGuard>
      <RFQDetailContent />
    </ContractorGuard>
  );
}
