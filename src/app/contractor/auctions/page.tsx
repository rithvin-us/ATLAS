'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Search,
  Gavel,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
  Clock4,
  Eye,
  Send,
  Shield,
  LockKeyhole,
  History,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { fetchContractorAuctions } from '@/lib/contractor-api';
import { Auction, Bid, deriveAuctionStatus } from '@/lib/types';

function formatMoney(amount?: number) {
  if (amount == null) return '—';
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
}

function timeRemaining(end: Date) {
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
}

function AuctionsContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    async function loadAuctions() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await fetchContractorAuctions(user.uid);
        setAuctions(data);
        setSelectedAuction((prev) => prev || data[0] || null);
      } catch (err) {
        console.error('Failed to load auctions:', err);
        setError('Failed to load auctions. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadAuctions();
  }, [user]);

  // tick for countdown
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const filteredAuctions = useMemo(() => {
    return auctions.filter((auction) =>
      auction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.projectId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [auctions, searchQuery]);

  useEffect(() => {
    if (selectedAuction && !filteredAuctions.find((a) => a.id === selectedAuction.id)) {
      setSelectedAuction(filteredAuctions[0] || null);
    }
  }, [filteredAuctions, selectedAuction]);

  const myBids = bids.filter((b) => b.contractorId === user?.uid);
  const myLatestBid: Bid | undefined = myBids.length ? myBids[myBids.length - 1] : undefined;
  const currentBest = bids.length
    ? Math.min(...bids.map((b) => b.amount))
    : undefined;
  const auctionStatus = (auction?: Auction) => {
    if (!auction) return '—';
    return deriveAuctionStatus(auction.startDate, auction.endDate) === 'scheduled'
      ? 'Scheduled'
      : deriveAuctionStatus(auction.startDate, auction.endDate) === 'live'
      ? 'Live'
      : 'Closed';
  };

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuction) return;
    setStatusMessage('Bid submitted (mock). Only you can see your bids.');
    setBidAmount('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 flex gap-3">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <div>
            <h3 className="font-medium text-destructive">Unable to load auctions</h3>
            <p className="text-sm text-destructive mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-foreground">Auctions</h1>
            <p className="text-muted-foreground mt-2">Participate in reverse auctions with confidential bids.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LockKeyhole className="h-4 w-4" /> Bids are confidential and unseen by others.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {statusMessage && (
          <div className="rounded-md border border-border bg-secondary px-4 py-3 text-sm text-primary">
            {statusMessage}
          </div>
        )}

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by auction or project code"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-muted-foreground" /> Fair-play policy: no bidder identities exposed.
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredAuctions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <Gavel className="h-14 w-14 text-muted-foreground/50 mx-auto" />
              <h3 className="text-lg font-medium text-foreground">No active auctions</h3>
              <p className="text-sm text-muted-foreground">Check back later for new opportunities.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Auctions table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Active auctions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary">
                      <TableHead className="font-medium">Project</TableHead>
                      <TableHead className="font-medium">Starting price</TableHead>
                      <TableHead className="font-medium">Current bid</TableHead>
                      <TableHead className="font-medium">Time remaining</TableHead>
                      <TableHead className="font-medium text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuctions.map((auction) => {
                      const isSelected = selectedAuction?.id === auction.id;
                      const remaining = timeRemaining(new Date(auction.endDate));
                      return (
                        <TableRow
                          key={auction.id}
                          className={`cursor-pointer ${isSelected ? 'bg-secondary' : 'hover:bg-secondary'}`}
                          onClick={() => setSelectedAuction(auction)}
                        >
                          <TableCell>
                            <div className="font-medium text-foreground">{auction.projectId?.slice(0, 10) || 'Project'}</div>
                            <div className="text-xs text-muted-foreground">Auction {auction.id.slice(0, 8)}</div>
                          </TableCell>
                          <TableCell>{formatMoney(undefined)}</TableCell>
                          <TableCell>{currentBest ? formatMoney(currentBest) : '—'}</TableCell>
                          <TableCell className="text-sm text-foreground flex items-center gap-2">
                            <Clock4 className="h-4 w-4 text-muted-foreground" /> {remaining}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedAuction(auction)}>
                              View <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Detail / participation */}
            <Card>
              <CardHeader>
                <CardTitle>Auction participation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedAuction ? (
                  <p className="text-sm text-muted-foreground">Select an auction to view details and place a bid.</p>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Project</div>
                        <div className="font-medium text-foreground">{selectedAuction.projectId}</div>
                        <div className="text-xs text-muted-foreground">Auction {selectedAuction.id}</div>
                      </div>
                      <Badge variant="outline">{auctionStatus(selectedAuction)}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Starts</div>
                        <div className="font-medium text-foreground">{new Date(selectedAuction.startDate).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Ends</div>
                        <div className="font-medium text-foreground">{new Date(selectedAuction.endDate).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Current bid</div>
                        <div className="font-medium text-foreground">{currentBest ? formatMoney(currentBest) : '—'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Your latest</div>
                        <div className="font-medium text-foreground">{myLatestBid ? formatMoney(myLatestBid.amount) : '—'}</div>
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-foreground text-sm">
                        <Clock4 className="h-4 w-4 text-muted-foreground" /> Time remaining: {timeRemaining(new Date(selectedAuction.endDate))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">Place a bid</div>
                      <form className="space-y-2" onSubmit={handleBid}>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="Enter bid amount (confidential)"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                        />
                        <Button type="submit" className="w-full gap-2" disabled={!bidAmount.trim()}>
                          <Send className="h-4 w-4" /> Submit bid
                        </Button>
                      </form>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <LockKeyhole className="h-3 w-3" /> Only you and the buyer see your bids. Other bidders stay anonymous.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <History className="h-4 w-4 text-muted-foreground" /> Your bid history
                      </div>
                      {myBids.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No bids yet. Submit your first bid to participate.</p>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {myBids.slice().reverse().map((bid) => (
                            <div key={bid.id} className="rounded-lg border p-3 bg-secondary flex items-center justify-between text-sm">
                              <div>
                                <div className="font-medium text-foreground">{formatMoney(bid.amount)}</div>
                                <div className="text-xs text-muted-foreground">{new Date(bid.submittedAt).toLocaleString()}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">My bid</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContractorAuctionsPage() {
  return <AuctionsContent />;
}
