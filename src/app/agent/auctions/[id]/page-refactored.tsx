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
  ArrowLeft,
  Clock,
  DollarSign,
  Gavel,
  Loader2,
  AlertCircle,
  Users,
  Award,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  MapPin,
  BookOpen,
} from 'lucide-react';
import { AgentGuard } from '@/components/agent/agent-guard';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Auction, Bid, RFQ, deriveAuctionStatus } from '@/lib/types';

function AuctionDetailContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const auctionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [linkedRfq, setLinkedRfq] = useState<RFQ | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());

  // Update current time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Load auction and compute status
  useEffect(() => {
    if (!user || !auctionId) return;

    setLoading(true);
    const auctionRef = doc(db, 'auctions', auctionId);

    const unsubscribe = onSnapshot(
      auctionRef,
      async (auctionDoc) => {
        if (!auctionDoc.exists()) {
          setError('Auction not found');
          setLoading(false);
          return;
        }

        const data = auctionDoc.data();
        const startDate = data.startDate?.toDate?.() || new Date(data.startDate);
        const endDate = data.endDate?.toDate?.() || new Date(data.endDate);

        const auction: Auction = {
          id: auctionDoc.id,
          agentId: data.agentId,
          projectId: data.projectId,
          rfqId: data.rfqId,
          type: data.type,
          title: data.title,
          status: deriveAuctionStatus(startDate, endDate),
          startDate,
          endDate,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          winnerId: data.winnerId,
        };

        setAuction(auction);

        // Load linked RFQ if present
        if (data.rfqId) {
          try {
            const rfqRef = doc(db, 'rfqs', data.rfqId);
            const rfqDoc = await getDoc(rfqRef);
            if (rfqDoc.exists()) {
              const rfqData = rfqDoc.data();
              setLinkedRfq({
                id: rfqDoc.id,
                projectId: rfqData.projectId,
                agentId: rfqData.agentId,
                title: rfqData.title,
                description: rfqData.description,
                scopeOfWork: rfqData.scopeOfWork,
                status: rfqData.status,
                deadline: rfqData.deadline?.toDate?.() || new Date(rfqData.deadline),
                eligibilityCriteria: rfqData.eligibilityCriteria || [],
                documents: rfqData.documents || [],
                responses: rfqData.responses || [],
                createdAt: rfqData.createdAt?.toDate?.() || new Date(rfqData.createdAt),
              });
            }
          } catch (err) {
            console.warn('Failed to load linked RFQ:', err);
          }
        }

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

  // Real-time bids from centralized auction_bids collection
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
      },
      (err) => {
        console.error('Failed to load bids:', err);
      }
    );

    return () => unsubscribe();
  }, [user, auctionId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    toast({ title: 'Refreshing bids...', description: 'Fetching latest data.' });
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Countdown timer
  const timeRemaining = useMemo(() => {
    if (!auction) return null;
    
    if (auction.status === 'closed') return { display: 'Closed', isActive: false };
    if (auction.status === 'scheduled') {
      const diff = auction.startDate.getTime() - now.getTime();
      if (diff <= 0) return { display: 'Starting soon…', isActive: true };
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (days > 0) return { display: `${days}d ${hours}h`, isActive: false };
      if (hours > 0) return { display: `${hours}h ${minutes}m`, isActive: false };
      return { display: `${minutes}m`, isActive: false };
    }
    
    // Live
    const diff = auction.endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return { display: `${days}d ${hours}h left`, isActive: true };
    if (hours > 0) return { display: `${hours}h ${minutes}m left`, isActive: true };
    return { display: `${minutes}m left`, isActive: true };
  }, [auction, now]);

  // Bid analysis
  const bestBid = useMemo(() => {
    if (bids.length === 0) return null;
    if (auction?.type === 'reverse') return bids.reduce((a, b) => a.amount < b.amount ? a : b);
    return bids.reduce((a, b) => a.amount > b.amount ? a : b);
  }, [bids, auction]);

  const avgBid = useMemo(
    () => bids.length > 0 ? bids.reduce((sum, b) => sum + b.amount, 0) / bids.length : 0,
    [bids]
  );

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
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/agent/auctions" className="inline-flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Auctions
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Gavel className="h-8 w-8 text-purple-600" />
                {auction.title || `Auction ${auction.id.slice(0, 8)}`}
              </h1>
              <p className="text-gray-600 mt-1">{auction.type} auction</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                auction.status === 'live' ? 'default' :
                auction.status === 'scheduled' ? 'secondary' :
                'outline'
              }>
                {auction.status.toUpperCase()}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Linked RFQ Context */}
        {linkedRfq && (
          <Card className="mb-6 border-l-4 border-l-blue-500 bg-blue-50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <CardTitle className="text-lg">{linkedRfq.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{linkedRfq.description}</p>
                  </div>
                </div>
                <Link href={`/agent/rfqs/${linkedRfq.id}`}>
                  <Button size="sm" variant="outline">View RFQ</Button>
                </Link>
              </div>
            </CardHeader>
            {linkedRfq.scopeOfWork && (
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700">
                  <strong>Scope:</strong> {linkedRfq.scopeOfWork}
                </p>
              </CardContent>
            )}
          </Card>
        )}

        {/* Auction Timeline & Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Starts</p>
                <p className="text-lg font-semibold">{auction.startDate.toLocaleString()}</p>
                <Badge variant="outline">
                  {auction.status === 'scheduled' ? '⏱ Upcoming' : '✓ Started'}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Ends</p>
                <p className="text-lg font-semibold">{auction.endDate.toLocaleString()}</p>
                {auction.status === 'live' && (
                  <Badge className="bg-red-100 text-red-800">
                    <Clock className="h-3 w-3 mr-1" />
                    {timeRemaining?.display}
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold capitalize">{auction.status}</p>
                <div className="text-xs text-gray-600">
                  {auction.status === 'live' ? '🟢 Live and accepting bids' :
                   auction.status === 'scheduled' ? '⏳ Not started yet' :
                   '🔒 Closed to new bids'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bid Summary */}
        {bids.length > 0 ? (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle>Bid Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <Users className="h-5 w-5 text-blue-600 mb-2" />
                  <p className="text-xs text-blue-700 font-medium">Total Bids</p>
                  <p className="text-3xl font-bold text-blue-900">{bids.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <Award className="h-5 w-5 text-green-600 mb-2" />
                  <p className="text-xs text-green-700 font-medium">
                    {auction.type === 'reverse' ? 'Lowest' : 'Highest'} Bid
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    ${bestBid?.amount.toLocaleString() || '—'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <DollarSign className="h-5 w-5 text-purple-600 mb-2" />
                  <p className="text-xs text-purple-700 font-medium">Average</p>
                  <p className="text-3xl font-bold text-purple-900">
                    ${Math.round(avgBid).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-yellow-900">No bids yet</p>
              <p className="text-sm text-yellow-700 mt-1">
                {auction.status === 'live'
                  ? 'Bids will appear as contractors submit them.'
                  : auction.status === 'scheduled'
                  ? 'The auction has not started yet. Bids will appear once it begins.'
                  : 'This auction is closed. No new bids can be accepted.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Bids Table */}
        {bids.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>All Bids</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contractor</TableHead>
                      <TableHead>Bid Amount</TableHead>
                      <TableHead>Credibility</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Rank</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...bids]
                      .sort((a, b) =>
                        auction.type === 'reverse'
                          ? a.amount - b.amount
                          : b.amount - a.amount
                      )
                      .map((bid, idx) => (
                        <TableRow key={bid.id}>
                          <TableCell className="font-medium">{bid.contractorName}</TableCell>
                          <TableCell>${bid.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {bid.credibilityScore ? `${bid.credibilityScore}%` : 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(bid.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {idx === 0 && (
                              <Badge className="bg-gold text-gold-900">
                                <Award className="h-3 w-3 mr-1" />
                                {auction.type === 'reverse' ? 'Lowest' : 'Highest'}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
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
