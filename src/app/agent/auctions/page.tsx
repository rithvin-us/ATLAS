'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AgentGuard } from '@/components/agent/agent-guard';
import { useAuth } from '@/lib/auth-context';
import { fetchAuctions } from '@/lib/agent-api';
import { Auction } from '@/lib/types';
import { Gavel, Loader2, Search } from 'lucide-react';

export default function AgentAuctionsPage() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (!user) return;
        const data = await fetchAuctions(user.uid);
        setAuctions(data);
      } catch (err: any) {
        setError(err?.message || 'Unable to load auctions');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const filtered = useMemo(() => {
    return auctions.filter((auction) => auction.id.toLowerCase().includes(search.toLowerCase()));
  }, [auctions, search]);

  const stats = {
    total: auctions.length,
    active: auctions.filter(a => a.status === 'active').length,
    completed: auctions.filter(a => a.status === 'closed').length,
    pending: auctions.filter(a => a.status === 'draft').length,
  };

  return (
    <AgentGuard>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <Gavel className="h-10 w-10 text-purple-600" />
              Auctions
            </h1>
            <p className="text-gray-600 text-lg">Create and manage bidding auctions for RFQs</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <Gavel className="h-6 w-6 text-gray-600 mb-2" />
              <p className="text-sm text-gray-600">Total Auctions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <Gavel className="h-6 w-6 text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <Gavel className="h-6 w-6 text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <Gavel className="h-6 w-6 text-yellow-600 mb-2" />
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search auctions by ID..."
              className="pl-10 h-12 rounded-xl border-gray-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/agent/auctions/new">
            <Button size="lg" className="h-12">
              <Gavel className="mr-2 h-5 w-5" />
              Create Auction
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
              <Gavel className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">
                {auctions.length === 0 ? 'No auctions yet' : 'No auctions match your search'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {auctions.length === 0 ? 'Start an auction to collect bids from contractors' : 'Try adjusting your search'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((auction) => (
              <Card key={auction.id} className="hover:shadow-lg transition-shadow border-0">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">RFQ {auction.projectId?.substring(0, 8)}</h3>
                        <Badge variant={auction.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {auction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{auction.type} auction</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Starts</p>
                      <p className="text-sm font-medium text-gray-900">{auction.startDate ? new Date(auction.startDate).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ends</p>
                      <p className="text-sm font-medium text-gray-900">{auction.endDate ? new Date(auction.endDate).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/agent/auctions/${auction.id}`} className="flex-1">
                      <Button className="w-full" size="sm">View Auction</Button>
                    </Link>
                    <Link href={`/agent/rfq/${auction.projectId}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">Linked RFQ</Button>
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
