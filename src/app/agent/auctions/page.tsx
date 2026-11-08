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
import { Auction, deriveAuctionStatus } from '@/lib/types';
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
    active: auctions.filter(a => a.status === 'live').length,
    completed: auctions.filter(a => a.status === 'closed').length,
    pending: auctions.filter(a => a.status === 'scheduled').length,
  };

  return (
    <AgentGuard>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-foreground flex items-center gap-3 mb-2">
              <Gavel className="h-10 w-10 text-primary" />
              Auctions
            </h1>
            <p className="text-muted-foreground text-lg">Create and manage bidding auctions for RFQs</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 hover:border-foreground/25 transition-shadow">
            <CardContent className="p-5">
              <Gavel className="h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Total Auctions</p>
              <p className="text-3xl font-medium text-foreground mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:border-foreground/25 transition-shadow">
            <CardContent className="p-5">
              <Gavel className="h-6 w-6 text-success mb-2" />
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-3xl font-medium text-foreground mt-1">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:border-foreground/25 transition-shadow">
            <CardContent className="p-5">
              <Gavel className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-medium text-foreground mt-1">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:border-foreground/25 transition-shadow">
            <CardContent className="p-5">
              <Gavel className="h-6 w-6 text-warning mb-2" />
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-medium text-foreground mt-1">{stats.pending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search auctions by ID"
              className="pl-10 h-12 rounded-xl border-border"
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
          <Card className="mb-6 bg-destructive/10 border-destructive/30">
            <CardContent className="p-4 flex items-center gap-3">
              <svg className="h-5 w-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Gavel className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">
                {auctions.length === 0 ? 'No auctions yet' : 'No auctions match your search'}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {auctions.length === 0 ? 'Start an auction to collect bids from contractors' : 'Try adjusting your search'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((auction) => (
              <Card key={auction.id} className="hover:border-foreground/25 transition-shadow border-0">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">
                          {auction.title || `Auction ${auction.id.substring(0, 8)}`}
                        </h3>
                        <Badge 
                          variant={
                            auction.status === 'live' ? 'default' :
                            auction.status === 'scheduled' ? 'secondary' :
                            'outline'
                          } 
                          className="text-xs"
                        >
                          {auction.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{auction.type} auction</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Starts</p>
                      <p className="text-sm font-medium text-foreground">{new Date(auction.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ends</p>
                      <p className="text-sm font-medium text-foreground">{new Date(auction.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/agent/auctions/${auction.id}`} className="flex-1">
                      <Button className="w-full" size="sm">View Auction</Button>
                    </Link>
                    {auction.rfqId && (
                      <Link href={`/agent/rfqs/${auction.rfqId}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">Linked RFQ</Button>
                      </Link>
                    )}
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
