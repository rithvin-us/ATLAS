'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AgentGuard } from '@/components/agent/agent-guard';
import { fetchRFQ, updateRFQStatus } from '@/lib/agent-api';
import { RFQ } from '@/lib/types';
import { Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RFQDetailPage() {
  const params = useParams();
  const rfqId = params.id as string;
  const { toast } = useToast();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRFQ(rfqId);
        if (!data) {
          setError('RFQ not found');
          setRfq(null);
        } else {
          setRfq(data);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load RFQ');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [rfqId]);

  const handleStatusChange = async (newStatus: RFQ['status']) => {
    if (!rfq) return;
    
    setUpdating(true);
    try {
      await updateRFQStatus(rfqId, newStatus);
      setRfq({ ...rfq, status: newStatus });
      toast({
        title: 'Success',
        description: 'RFQ status updated.',
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
          <Link href="/agent/rfq" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to RFQs
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">RFQ Details</h1>
            <p className="text-gray-600 text-lg">View and manage quotation request</p>
          </div>
          {error && !loading && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading RFQ...</span>
            </div>
          ) : rfq ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl">{rfq.title}</CardTitle>
                      <p className="text-muted-foreground mt-2">{rfq.description}</p>
                    </div>
                    <Badge variant={rfq.status === 'published' ? 'default' : 'secondary'}>
                      {rfq.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Project ID</p>
                      <p className="font-medium">{rfq.projectId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-medium">{new Date(rfq.deadline).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Responses</p>
                      <p className="font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {rfq.responses?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">{new Date(rfq.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Scope of Work</p>
                    <p className="text-sm">{rfq.scopeOfWork}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>RFQ Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Update Status</label>
                    <div className="flex gap-2">
                      <Select 
                        value={rfq.status} 
                        onValueChange={(value) => handleStatusChange(value as RFQ['status'])}
                        disabled={updating}
                      >
                        <SelectTrigger className="w-full max-w-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      {updating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {rfq.responses && rfq.responses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Responses ({rfq.responses.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {rfq.responses.map((response) => (
                        <div key={response.id} className="p-3 rounded-lg border flex items-center justify-between">
                          <div>
                            <p className="font-medium">{response.contractorId}</p>
                            <p className="text-sm text-muted-foreground">Quotation: ${(response.quotation / 100).toFixed(2)}</p>
                          </div>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/agent/rfq/${rfqId}/responses/${response.id}`}>View</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button asChild>
                    <Link href={`/agent/auctions/new?rfqId=${rfq.id}`}>Create Auction</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/agent/projects/${rfq.projectId}`}>View Project</Link>
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
