'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  DollarSign,
  FileText,
  Loader2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { ContractorGuard } from '@/components/contractor/contractor-guard';
import { useAuth } from '@/lib/auth-context';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { submitRFQResponse } from '@/lib/contractor-api';
import { RFQ, Question } from '@/lib/types';

function SubmitRFQResponseContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rfq, setRFQ] = useState<RFQ | null>(null);

  // Form fields
  const [quotation, setQuotation] = useState('');
  const [executionPlan, setExecutionPlan] = useState('');
  const [timeline, setTimeline] = useState('');
  const [questions, setQuestions] = useState('');

  useEffect(() => {
    async function loadRFQ() {
      if (!user) return;

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
          projectId: data.projectId || '',
          agentId: data.agentId,
          title: data.title,
          description: data.description,
          scopeOfWork: data.scopeOfWork || data.scope || '',
          location: data.location,
          budget: data.budget,
          deadline: data.deadline?.toDate?.() || new Date(data.deadline),
          status: data.status,
          scope: data.scope,
          documents: data.documents || [],
          eligibilityCriteria: data.eligibilityCriteria,
          responses: data.responses || [],
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        };

        // Check if already responded
        const hasResponded = rfq.responses?.some(r => r.contractorId === user.uid);
        if (hasResponded) {
          setError('You have already submitted a response to this RFQ');
          return;
        }

        // Check if RFQ is published and not expired
        const now = new Date();
        if (rfq.status !== 'published' || new Date(rfq.deadline) < now) {
          setError('This RFQ is no longer accepting responses');
          return;
        }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !rfq) return;

    const quotationValue = parseFloat(quotation);
    if (isNaN(quotationValue) || quotationValue <= 0) {
      alert('Please enter a valid quotation amount');
      return;
    }

    if (!executionPlan.trim()) {
      alert('Please provide an execution plan');
      return;
    }

    if (!timeline.trim()) {
      alert('Please provide a timeline');
      return;
    }

    try {
      setSubmitting(true);
      await submitRFQResponse(rfqId, {
        rfqId,
        contractorId: user.uid,
        quotation: quotationValue,
        executionPlan,
        documents: [], // Add actual documents if available
        questions: (questions || '').split('\n').filter(q => q.trim()).map((q, i) => ({
          id: `q_${i}`,
          text: q.trim(),
          order: i
        })) as Question[]
      });
      alert('Response submitted successfully!');
      router.push(`/contractor/rfqs/${rfqId}`);
    } catch (err: any) {
      console.error('Failed to submit response:', err);
      alert(err.message || 'Failed to submit response. Please try again.');
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href={`/contractor/rfqs/${rfqId}`} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold font-headline ml-4">Submit Response</h1>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Quotation */}
                  <div className="space-y-2">
                    <Label htmlFor="quotation">Quotation Amount ($) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="quotation"
                        type="number"
                        step="0.01"
                        placeholder="Enter your quotation"
                        className="pl-10"
                        value={quotation}
                        onChange={(e) => setQuotation(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      RFQ Budget: ${(rfq.budget || 0).toLocaleString()}
                    </p>
                  </div>

                  {/* Execution Plan */}
                  <div className="space-y-2">
                    <Label htmlFor="executionPlan">Execution Plan *</Label>
                    <Textarea
                      id="executionPlan"
                      placeholder="Describe how you plan to execute this project..."
                      rows={6}
                      value={executionPlan}
                      onChange={(e) => setExecutionPlan(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Provide a detailed plan of how you will complete the work
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2">
                    <Label htmlFor="timeline">Proposed Timeline *</Label>
                    <Textarea
                      id="timeline"
                      placeholder="e.g., Phase 1: Weeks 1-2 - Site preparation..."
                      rows={4}
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Break down your timeline by phases or milestones
                    </p>
                  </div>

                  {/* Questions (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="questions">Questions or Clarifications (Optional)</Label>
                    <Textarea
                      id="questions"
                      placeholder="Any questions or clarifications you need..."
                      rows={3}
                      value={questions}
                      onChange={(e) => setQuestions(e.target.value)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1" 
                      asChild
                    >
                      <Link href={`/contractor/rfqs/${rfqId}`}>Cancel</Link>
                    </Button>
                    <Button type="submit" className="flex-1" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Response'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - RFQ Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>RFQ Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Title</div>
                  <div className="font-semibold">{rfq.title}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div>{rfq.location}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Budget</div>
                  <div className="font-semibold">${(rfq.budget || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Deadline</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(rfq.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scope of Work</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">
                  {rfq.scope}
                </p>
                <Button variant="link" className="px-0 mt-2" asChild>
                  <Link href={`/contractor/rfqs/${rfqId}`}>View Full Details</Link>
                </Button>
              </CardContent>
            </Card>

            {rfq.eligibilityCriteria && rfq.eligibilityCriteria.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    {rfq.eligibilityCriteria.slice(0, 3).map((criterion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SubmitRFQResponsePage() {
  return (
    <ContractorGuard>
      <SubmitRFQResponseContent />
    </ContractorGuard>
  );
}
