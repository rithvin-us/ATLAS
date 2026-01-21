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
        if (!user) return;
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

  const stats = {
    total: rfqs.length,
    published: rfqs.filter(r => r.status === 'published').length,
    draft: rfqs.filter(r => r.status === 'draft').length,
    closed: rfqs.filter(r => r.status === 'closed').length,
  };

  return (
    <AgentGuard>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <MessageSquare className="h-10 w-10 text-blue-600" />
              RFQ Management
            </h1>
            <p className="text-gray-600 text-lg">Create and manage requests for quotations</p>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <MessageSquare className="h-6 w-6 text-gray-600 mb-2" />
              <p className="text-sm text-gray-600">Total RFQs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <MessageSquare className="h-6 w-6 text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.published}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <MessageSquare className="h-6 w-6 text-yellow-600 mb-2" />
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.draft}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <MessageSquare className="h-6 w-6 text-red-600 mb-2" />
              <p className="text-sm text-gray-600">Closed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.closed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search RFQs by title..."
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
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
          <Link href="/agent/rfq/new">
            <Button size="lg" className="h-12">
              <Plus className="mr-2 h-5 w-5" />
              Create RFQ
            </Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center gap-3">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">
                {rfqs.length === 0 ? 'No RFQs yet' : 'No RFQs match your filters'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {rfqs.length === 0 ? 'Create RFQs to request quotations from vendors' : 'Try adjusting your search or filter'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((rfq) => (
              <Card key={rfq.id} className="hover:shadow-lg transition-shadow border-0">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{rfq.title}</h3>
                        <Badge variant={rfq.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                          {rfq.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Project: {rfq.projectId?.substring(0, 8)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Deadline</p>
                      <p className="text-sm font-medium text-gray-900">{rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Responses</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {rfq.responses?.length || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/agent/rfq/${rfq.id}`} className="flex-1">
                      <Button className="w-full" size="sm">View Details</Button>
                    </Link>
                    <Link href={`/agent/auctions/new?rfqId=${rfq.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">Start Auction</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </main>
      </div>
    </AgentGuard>
  );
}
