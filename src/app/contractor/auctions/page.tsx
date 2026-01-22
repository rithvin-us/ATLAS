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

  const myBids = (selectedAuction?.bids || []).filter((b) => b.contractorId === user?.uid);
  const myLatestBid: Bid | undefined = myBids.length ? myBids[myBids.length - 1] : undefined;
  const currentBest = selectedAuction?.bids?.length
    ? Math.min(...selectedAuction.bids.map((b) => b.amount))
    : undefined;
  const auctionStatus = (auction?: Auction) => {
    if (!auction) return '—';
    return deriveAuctionStatus(auction.startDate, auction.endDate) === 'scheduled'
      ? '⏳ Scheduled'
      : deriveAuctionStatus(auction.startDate, auction.endDate) === 'live'
      ? '🟢 Live'
      : '🔒 Closed';
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 flex gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Unable to load auctions</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Auctions</h1>
            <p className="text-gray-600 mt-2">Participate in reverse auctions with confidential bids.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <LockKeyhole className="h-4 w-4" /> Bids are confidential and unseen by others.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {statusMessage && (
          <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {statusMessage}
          </div>
        )}

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by auction or project code"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-gray-500" /> Fair-play policy: no bidder identities exposed.
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredAuctions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <Gavel className="h-14 w-14 text-gray-300 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">No active auctions</h3>
              <p className="text-sm text-gray-600">Check back later for new opportunities.</p>
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
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Project</TableHead>
                      <TableHead className="font-semibold">Starting price</TableHead>
                      <TableHead className="font-semibold">Current bid</TableHead>
                      <TableHead className="font-semibold">Time remaining</TableHead>
                      <TableHead className="font-semibold text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuctions.map((auction) => {
                      const best = auction.bids?.length ? Math.min(...auction.bids.map((b) => b.amount)) : undefined;
                      const isSelected = selectedAuction?.id === auction.id;
                      const remaining = timeRemaining(new Date(auction.endDate));
                      return (
                        <TableRow
                          key={auction.id}
                          className={`cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                          onClick={() => setSelectedAuction(auction)}
                        >
                          <TableCell>
                            <div className="font-semibold text-gray-900">{auction.projectId?.slice(0, 10) || 'Project'}</div>
                            <div className="text-xs text-gray-500">Auction {auction.id.slice(0, 8)}</div>
                          </TableCell>
                          <TableCell>{formatMoney(undefined)}</TableCell>
                          <TableCell>{best ? formatMoney(best) : '—'}</TableCell>
                          <TableCell className="text-sm text-gray-800 flex items-center gap-2">
                            <Clock4 className="h-4 w-4 text-gray-500" /> {remaining}
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
                  <p className="text-sm text-gray-600">Select an auction to view details and place a bid.</p>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs text-gray-500">Project</div>
                        <div className="font-semibold text-gray-900">{selectedAuction.projectId}</div>
                        <div className="text-xs text-gray-500">Auction {selectedAuction.id}</div>
                      </div>
                      <Badge variant="outline">{auctionStatus(selectedAuction)}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500">Starts</div>
                        <div className="font-medium text-gray-900">{new Date(selectedAuction.startDate).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Ends</div>
                        <div className="font-medium text-gray-900">{new Date(selectedAuction.endDate).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Current bid</div>
                        <div className="font-semibold text-gray-900">{currentBest ? formatMoney(currentBest) : '—'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Your latest</div>
                        <div className="font-semibold text-gray-900">{myLatestBid ? formatMoney(myLatestBid.amount) : '—'}</div>
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-gray-700 text-sm">
                        <Clock4 className="h-4 w-4 text-gray-500" /> Time remaining: {timeRemaining(new Date(selectedAuction.endDate))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-800">Place a bid</div>
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
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <LockKeyhole className="h-3 w-3" /> Only you and the buyer see your bids. Other bidders stay anonymous.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <History className="h-4 w-4 text-gray-500" /> Your bid history
                      </div>
                      {myBids.length === 0 ? (
                        <p className="text-sm text-gray-600">No bids yet. Submit your first bid to participate.</p>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {myBids.slice().reverse().map((bid) => (
                            <div key={bid.id} className="rounded-lg border p-3 bg-gray-50 flex items-center justify-between text-sm">
                              <div>
                                <div className="font-semibold text-gray-900">{formatMoney(bid.amount)}</div>
                                <div className="text-xs text-gray-600">{new Date(bid.submittedAt).toLocaleString()}</div>
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
