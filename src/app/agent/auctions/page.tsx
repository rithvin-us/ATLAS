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

  return (
    <AgentGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4">
            <Link href="/agent/dashboard" className="text-muted-foreground hover:text-foreground">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold font-headline ml-4">Auctions</h1>
          </div>
        </header>

        <main className="flex-1 container py-6 px-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search auctions by id..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button asChild className="ml-4">
              <Link href="/agent/auctions/new">
                <Gavel className="mr-2 h-4 w-4" />
                Create Auction
              </Link>
            </Button>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading auctions...</span>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    {auctions.length === 0 ? 'No auctions yet. Start one to collect bids.' : 'No auctions match your search.'}
                  </CardContent>
                </Card>
              ) : (
                filtered.map((auction) => (
                  <Card key={auction.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle>RFQ {auction.projectId}</CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {auction.type} auction
                          </div>
                        </div>
                        <Badge variant={auction.status === 'active' ? 'default' : 'secondary'}>
                          {auction.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Starts</span>
                        <span className="font-medium">{auction.startDate ? new Date(auction.startDate).toLocaleString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ends</span>
                        <span className="font-medium">{auction.endDate ? new Date(auction.endDate).toLocaleString() : 'N/A'}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button asChild className="flex-1">
                          <Link href={`/agent/auctions/${auction.id}`}>View Auction</Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                          <Link href={`/agent/rfq/${auction.projectId}`}>Linked RFQ</Link>
                        </Button>
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
