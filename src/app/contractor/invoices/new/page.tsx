'use client';

import { useState, useEffect, useMemo, type FormEvent, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, DollarSign, Loader2, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import { ContractorGuard } from '@/components/contractor/contractor-guard';
import { useAuth } from '@/lib/auth-context';
import { fetchContractorProjects, createInvoice } from '@/lib/contractor-api';
import { Project, Milestone, Document } from '@/lib/types';

function CreateInvoiceContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [supportingDocs, setSupportingDocs] = useState<Document[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      if (!user) return;

      try {
        setLoading(true);
        const data = await fetchContractorProjects(user.uid);
        // Only show projects that are active or in-progress
        const activeProjects = data.filter(p => p.status === 'active' || p.status === 'in-progress');
        setProjects(activeProjects);

        // Pre-select project and milestone from URL params
        const projectIdParam = searchParams.get('projectId');
        const milestoneIdParam = searchParams.get('milestoneId');
        
        if (projectIdParam) {
          setSelectedProjectId(projectIdParam);
        }
        if (milestoneIdParam) {
          setSelectedMilestoneId(milestoneIdParam);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [user, searchParams]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Only show approved milestones that don't already have an invoice
  const availableMilestones = selectedProject?.milestones?.filter(
    m => m.status === 'approved'
  ) || [];

  const selectedMilestone = availableMilestones.find(m => m.id === selectedMilestoneId);

  // Auto-fill amount when milestone is selected
  useEffect(() => {
    if (selectedMilestone) {
      setAmount(selectedMilestone.payment.toString());
      setTaxAmount((selectedMilestone.payment * 0.1).toFixed(2));
      setDescription(`Payment for milestone: ${selectedMilestone.title || selectedMilestone.name}`);
    }
  }, [selectedMilestone]);

  useEffect(() => {
    const next30 = new Date();
    next30.setDate(next30.getDate() + 30);
    setDueDate(next30.toISOString().split('T')[0]);
  }, []);

  const totalAmount = useMemo(() => {
    const base = parseFloat(amount) || 0;
    const tax = parseFloat(taxAmount) || 0;
    return base + tax;
  }, [amount, taxAmount]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploaded: Document[] = Array.from(files).map((file) => ({
      id: `temp_${file.name}_${Date.now()}`,
      name: file.name,
      type: file.type || 'supporting-doc',
      // Placeholder URL; integrate storage upload when backend is ready
      url: 'pending-upload',
      uploadedBy: user.uid,
      uploadedAt: new Date(),
    }));

    setSupportingDocs((prev) => [...prev, ...uploaded]);
    event.target.value = '';
  };

  const handleRemoveDoc = (id: string) => {
    setSupportingDocs((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleSubmit = async (e: FormEvent, status: 'submitted' | 'draft' = 'submitted') => {
    e.preventDefault();
    
    if (!user || !selectedProjectId || !selectedMilestoneId) {
      alert('Please select both a project and milestone');
      return;
    }

    if (!selectedProject?.agentId) {
      alert('Project is missing agent information. Please contact support.');
      return;
    }

    if (!dueDate) {
      alert('Please provide a due date');
      return;
    }

    if (!acknowledged && status === 'submitted') {
      alert('Please confirm the declaration before submitting.');
      return;
    }

    const amountValue = parseFloat(amount);
    const taxValue = parseFloat(taxAmount);

    if (isNaN(amountValue) || amountValue <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (isNaN(taxValue) || taxValue < 0) {
      alert('Please enter a valid tax amount');
      return;
    }

    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }

    try {
      setSubmitting(true);
      const invoiceId = await createInvoice({
        projectId: selectedProjectId,
        milestoneId: selectedMilestoneId,
        contractorId: user.uid,
        agentId: selectedProject.agentId,
        amount: amountValue,
        taxAmount: taxValue,
        totalAmount,
        status,
        documents: supportingDocs,
        dueDate: new Date(dueDate),
      });
      alert(status === 'draft' ? 'Draft saved successfully.' : 'Invoice submitted successfully!');
      router.push(`/contractor/invoices/${invoiceId}`);
    } catch (err: any) {
      console.error('Failed to create invoice:', err);
      alert(err.message || 'Failed to create invoice. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">{error}</p>
          <Button className="mt-4" onClick={() => router.push('/contractor/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4">
            <Link href="/contractor/invoices" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold font-headline ml-4">Create Invoice</h1>
          </div>
        </header>
        <main className="flex-1 container py-6 px-4">
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Projects</h3>
            <p className="text-muted-foreground mb-4">
              You need to have active projects with approved milestones to create invoices.
            </p>
            <Button asChild>
              <Link href="/contractor/projects">View Projects</Link>
            </Button>
          </div>
        </main>
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
          <h1 className="text-2xl font-bold font-headline ml-4">Create Invoice</h1>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Submit an invoice against an approved milestone. Drafts save your work without notifying the agent.</p>
          </div>

          <form className="grid grid-cols-1 lg:grid-cols-3 gap-6" onSubmit={(e) => handleSubmit(e, 'submitted')}>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Project *</Label>
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="milestone">Milestone *</Label>
                    <Select
                      value={selectedMilestoneId}
                      onValueChange={setSelectedMilestoneId}
                      disabled={!selectedProjectId}
                    >
                      <SelectTrigger id="milestone">
                        <SelectValue placeholder="Select an approved milestone" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMilestones.length > 0 ? (
                          availableMilestones.map((milestone) => (
                            <SelectItem key={milestone.id} value={milestone.id}>
                              {milestone.title || milestone.name} - ${milestone.payment.toLocaleString()}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">
                            No approved milestones available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Only approved milestones are available for invoicing.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-10"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxAmount">Tax Amount ($) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="taxAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-10"
                        value={taxAmount}
                        onChange={(e) => setTaxAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Payment Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Defaults to 30 days from today.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Total (auto-calculated)</Label>
                    <div className="p-3 rounded-md bg-muted flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount + Tax</span>
                      <span className="text-xl font-semibold">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Invoice Narrative *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the completed milestone, scope, and acceptance notes"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Supporting Documents</Label>
                  <div className="border border-dashed rounded-lg p-4 flex flex-col gap-3 bg-muted/50">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Attach completion proof, compliance certs, or invoices</p>
                        <p className="text-xs text-muted-foreground">Files are recorded as references; upload integration pending.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="file" multiple className="hidden" id="supportingDocs" onChange={handleFileChange} />
                        <Label htmlFor="supportingDocs">
                          <Button type="button" variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Add files
                          </Button>
                        </Label>
                      </div>
                    </div>
                    {supportingDocs.length > 0 && (
                      <div className="space-y-2">
                        {supportingDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between rounded-md bg-background px-3 py-2 border">
                            <div>
                              <p className="text-sm font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.type || 'document'}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveDoc(doc.id)}>Remove</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6 lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Milestone Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {selectedMilestone ? (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">Title</span><span className="font-medium">{selectedMilestone.title || selectedMilestone.name}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="font-medium">${selectedMilestone.payment.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium capitalize">{selectedMilestone.status}</span></div>
                      <div className="text-muted-foreground text-xs">Ensure acceptance evidence is attached before submitting.</div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Select a project and milestone to preview details.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Declaration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Input
                      id="declaration"
                      type="checkbox"
                      checked={acknowledged}
                      onChange={(e) => setAcknowledged(e.target.checked)}
                      className="mt-1 h-4 w-4"
                    />
                    <Label htmlFor="declaration" className="text-sm leading-6 font-normal">
                      I confirm the milestone work is completed and approved, amounts are accurate, and supporting evidence is attached. I understand false submissions may lead to delays or disputes.
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Drafts save without notifying the agent.
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Submission notifies the agent and locks milestone selection.
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button type="button" variant="outline" disabled={submitting} onClick={(e) => handleSubmit(e, 'draft')}>
                      {submitting ? 'Saving draft...' : 'Save Draft'}
                    </Button>
                    <Button type="submit" disabled={submitting || !acknowledged} className="w-full">
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Submit Invoice'
                      )}
                    </Button>
                    <Button type="button" variant="ghost" asChild>
                      <Link href="/contractor/invoices">Cancel</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <ContractorGuard>
      <CreateInvoiceContent />
    </ContractorGuard>
  );
}
