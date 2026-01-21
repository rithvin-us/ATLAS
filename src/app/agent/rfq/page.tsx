'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AgentGuard } from '@/components/agent/agent-guard';
import { useAuth } from '@/lib/auth-context';
import { fetchRFQs } from '@/lib/agent-api';
import { RFQ } from '@/lib/types';
import {
  Plus,
  Search,
  Filter,
  MessageSquare,
  Loader2,
} from 'lucide-react';

export default function AgentRFQPage() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RFQ['status'] | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRFQs(user.uid);
        setRfqs(data);
      } catch (err: any) {
        setError(err?.message || 'Unable to load RFQs');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const filtered = useMemo(() => {
    return rfqs.filter((rfq) => {
      const matchesSearch = rfq.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rfqs, search, statusFilter]);

  return (
    <AgentGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4">
            <Link href="/agent/dashboard" className="text-muted-foreground hover:text-foreground">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold font-headline ml-4">RFQ Management</h1>
          </div>
        </header>

        <main className="flex-1 container py-6 px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search RFQs..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant={statusFilter === 'all' ? 'outline' : 'default'}
                onClick={() => setStatusFilter((prev) => (prev === 'all' ? 'published' : 'all'))}
              >
                <Filter className="mr-2 h-4 w-4" />
                {statusFilter === 'all' ? 'Show Published' : 'Show All'}
              </Button>
            </div>
            <Button asChild>
              <Link href="/agent/rfq/new">
                <Plus className="mr-2 h-4 w-4" />
                Create RFQ
              </Link>
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
              <span>Loading RFQs...</span>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    {rfqs.length === 0 ? 'No RFQs yet. Create one to publish for vendors.' : 'No RFQs match your filters.'}
                  </CardContent>
                </Card>
              ) : (
                filtered.map((rfq) => (
                  <Card key={rfq.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle>{rfq.title}</CardTitle>
                          <div className="text-sm text-muted-foreground">
                            Project: {rfq.projectId}
                          </div>
                        </div>
                        <Badge variant={rfq.status === 'published' ? 'default' : 'secondary'}>
                          {rfq.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Deadline:</span>
                          <span className="font-medium">{rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Responses:</span>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span className="font-medium">{rfq.responses?.length || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button asChild className="flex-1">
                            <Link href={`/agent/rfq/${rfq.id}`}>View Details</Link>
                          </Button>
                          <Button asChild variant="outline" className="flex-1">
                            <Link href={`/agent/auctions/new?rfqId=${rfq.id}`}>Start Auction</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </AgentGuard>
  );
}
