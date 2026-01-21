'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  Gavel,
  Loader2,
  AlertCircle,
  Users,
  Clock,
  TrendingDown,
  TrendingUp,
  Minus,
  Award,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { AgentGuard } from '@/components/agent/agent-guard';
import { useAuth } from '@/lib/auth-context';
import { doc, getDoc, updateDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Auction, Bid } from '@/lib/types';

function AuctionDetailContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const auctionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [updating, setUpdating] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Real-time auction updates
  useEffect(() => {
    if (!user || !auctionId) return;

    setLoading(true);
    const auctionRef = doc(db, 'auctions', auctionId);

    const unsubscribe = onSnapshot(
      auctionRef,
      (auctionDoc) => {
        if (!auctionDoc.exists()) {
          setError('Auction not found');
          setLoading(false);
          return;
        }

        const data = auctionDoc.data();
        const auction: Auction = {
          id: auctionDoc.id,
          agentId: data.agentId,
          projectId: data.projectId,
          type: data.type,
          status: data.status,
          startDate: data.startDate?.toDate?.() || new Date(data.startDate),
          endDate: data.endDate?.toDate?.() || new Date(data.endDate),
          bids: data.bids || [],
        };

        setAuction(auction);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load auction:', err);
        setError('Failed to load auction. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, auctionId]);

  // Real-time bids updates from auction_bids collection
  useEffect(() => {
    if (!user || !auctionId) return;

    const bidsQuery = query(
      collection(db, 'auction_bids'),
      where('auctionId', '==', auctionId)
    );

    const unsubscribe = onSnapshot(
      bidsQuery,
      (snapshot) => {
        const fetchedBids: Bid[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedBids.push({
            id: doc.id,
            auctionId: data.auctionId,
            contractorId: data.contractorId,
            contractorName: data.contractorName,
            amount: data.amount,
            submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
            credibilityScore: data.credibilityScore,
          });
        });
        setBids(fetchedBids);
        setLastRefresh(new Date());
      },
      (err) => {
        console.error('Failed to load bids:', err);
      }
    );

    return () => unsubscribe();
  }, [user, auctionId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!auction) return;

    try {
      setUpdating(true);
      const auctionRef = doc(db, 'auctions', auctionId);
      await updateDoc(auctionRef, {
        status: newStatus,
      });
    } catch (err) {
      console.error('Failed to update auction status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Countdown timer
  const timeRemaining = useMemo(() => {
    if (!auction) return null;
    const now = new Date().getTime();
    const end = new Date(auction.endDate).getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'Closed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, [auction]);

  const now = new Date();
  const startDate = auction ? new Date(auction.startDate) : null;
  const endDate = auction ? new Date(auction.endDate) : null;
  const isActive = auction?.status === 'active' && startDate && endDate && now >= startDate && now <= endDate;

  // Process bids with ranking - use bids from auction_bids collection
  const processedBids = useMemo(() => {
    if (!bids || bids.length === 0) return [];

    const sortedBids = [...bids].sort((a, b) => {
      if (auction?.type === 'reverse') {
        return a.amount - b.amount; // Lower is better
      }
      return b.amount - a.amount; // Higher is better
    });

    const lowestBid = Math.min(...bids.map(b => b.amount));
    const highestBid = Math.max(...bids.map(b => b.amount));

    return sortedBids.map((bid, index) => {
      let rank: 'best' | 'average' | 'high';
      
      if (auction?.type === 'reverse') {
        if (bid.amount === lowestBid) rank = 'best';
        else if (bid.amount === highestBid) rank = 'high';
        else rank = 'average';
      } else {
        if (bid.amount === highestBid) rank = 'best';
        else if (bid.amount === lowestBid) rank = 'high';
        else rank = 'average';
      }

      return {
        ...bid,
        rank,
        position: index + 1,
      };
    });
  }, [auction, bids]);

  const bestBid = processedBids[0];
  const avgBidAmount = bids?.length 
    ? bids.reduce((sum, b) => sum + b.amount, 0) / bids.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">{error || 'Auction not found'}</p>
          <Button className="mt-4" onClick={() => router.push('/agent/auctions')}>
            Back to Auctions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/agent/auctions" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold font-headline ml-4">Auction Management</h1>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Auction Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">Project: {auction.projectId.slice(0, 12)}...</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {auction.status}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeRemaining}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLastRefresh(new Date())}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Select value={auction.status} onValueChange={handleStatusChange} disabled={updating}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <Users className="h-5 w-5 text-blue-600 mb-2" />
                  <p className="text-xs text-blue-700 font-medium">Total Bids</p>
                  <p className="text-2xl font-bold text-blue-900">{bids.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <Award className="h-5 w-5 text-green-600 mb-2" />
                  <p className="text-xs text-green-700 font-medium">Best Bid</p>
                  <p className="text-2xl font-bold text-green-900">
                    {bestBid ? `$${bestBid.amount.toLocaleString()}` : '-'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <DollarSign className="h-5 w-5 text-purple-600 mb-2" />
                  <p className="text-xs text-purple-700 font-medium">Average Bid</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {avgBidAmount ? `$${Math.round(avgBidAmount).toLocaleString()}` : '-'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <Calendar className="h-5 w-5 text-orange-600 mb-2" />
                  <p className="text-xs text-orange-700 font-medium">Ends On</p>
                  <p className="text-sm font-bold text-orange-900">{endDate?.toLocaleDateString()}</p>
                  <p className="text-xs text-orange-700">{endDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contractor Bids Received */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Contractor Bids Received
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {processedBids.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold text-muted-foreground">No Bids Received Yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Contractors haven't submitted any bids. Check back later.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Rank</TableHead>
                      <TableHead>Contractor ID</TableHead>
                      <TableHead>Bid Amount</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedBids.map((bid) => (
                      <TableRow 
                        key={bid.id}
                        className={bid.rank === 'best' ? 'bg-green-50' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">#{bid.position}</span>
                            {bid.rank === 'best' && (
                              <Award className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{bid.contractorId.slice(0, 12)}...</p>
                            <Badge variant="outline" className="text-xs">
                              {bid.rank === 'best' ? (
                                <><CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> Best</>
                              ) : bid.rank === 'high' ? (
                                <><TrendingUp className="h-3 w-3 mr-1 text-red-600" /> High</>
                              ) : (
                                <><Minus className="h-3 w-3 mr-1" /> Average</>
                              )}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className={`text-lg font-bold ${
                            bid.rank === 'best' ? 'text-green-600' : 
                            bid.rank === 'high' ? 'text-red-600' : 
                            'text-gray-900'
                          }`}>
                            ${bid.amount.toLocaleString()}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(bid.submittedAt).toLocaleDateString()}</p>
                            <p className="text-muted-foreground">
                              {new Date(bid.submittedAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={bid.rank === 'best' ? 'default' : 'secondary'}>
                            {bid.rank === 'best' ? 'Winning' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Shortlist
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function AuctionDetailPage() {
  return (
    <AgentGuard>
      <AuctionDetailContent />
    </AgentGuard>
  );
}
