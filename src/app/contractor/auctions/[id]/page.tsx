"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Gavel,
  Info,
  Loader2,
  TrendingDown,
  Users,
} from "lucide-react";
import { ContractorGuard } from "@/components/contractor/contractor-guard";
import { useAuth } from "@/lib/auth-context";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase-client";
import { Auction, Bid, deriveAuctionStatus } from "@/lib/types";
import { submitBid } from "@/lib/contractor-api";

function AuctionDetailContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const auctionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);

  // Real-time auction
  useEffect(() => {
    if (!user || !auctionId) return;

    const db = getFirebaseDb();
    if (!db) return;

    setLoading(true);
    const auctionRef = doc(db, "auctions", auctionId);
    const unsubscribe = onSnapshot(
      auctionRef,
      (snap) => {
        if (!snap.exists()) {
          setError("Auction not found");
          setLoading(false);
          return;
        }
        const data = snap.data();
        const normalized: Auction = {
          id: snap.id,
          agentId: data.agentId,
          projectId: data.projectId,
          type: data.type,
          status: data.status,
          startDate: data.startDate?.toDate?.() || new Date(data.startDate),
          endDate: data.endDate?.toDate?.() || new Date(data.endDate),
        };
        setAuction(normalized);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load auction", err);
        setError("Failed to load auction. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, auctionId]);

  // Real-time bids from auction_bids collection
  useEffect(() => {
    if (!user || !auctionId) return;

    const db = getFirebaseDb();
    if (!db) return;

    const bidsQuery = query(collection(db, "auction_bids"), where("auctionId", "==", auctionId));
    const unsubscribe = onSnapshot(
      bidsQuery,
      (snapshot) => {
        const fetched: Bid[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetched.push({
            id: docSnap.id,
            auctionId: data.auctionId,
            contractorId: data.contractorId,
            contractorName: data.contractorName,
            amount: data.amount,
            submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
            credibilityScore: data.credibilityScore,
          });
        });
        setBids(fetched.sort((a, b) => a.amount - b.amount));
      },
      (err) => {
        console.error("Failed to load bids", err);
      }
    );

    return () => unsubscribe();
  }, [user, auctionId]);

  // timers & status
  const timeRemaining = useMemo(() => {
    if (!auction) return null;
    const now = Date.now();
    const end = new Date(auction.endDate).getTime();
    const diff = end - now;
    if (diff <= 0) return "Auction Closed";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  }, [auction]);

  const now = new Date();
  const startDate = auction ? new Date(auction.startDate) : null;
  const endDate = auction ? new Date(auction.endDate) : null;
  const auctionStatus = auction ? deriveAuctionStatus(auction.startDate, auction.endDate) : null;
  const isActive = auctionStatus === 'live';
  const isClosed = auctionStatus === 'closed';

  const myBids = bids.filter((b) => b.contractorId === user?.uid);
  const myBid = myBids.length ? myBids[myBids.length - 1] : null;
  const allAmounts = bids.map((b) => b.amount).sort((a, b) => a - b);
  const lowestBid = allAmounts[0];
  const highestBid = allAmounts[allAmounts.length - 1];
  const isMyBidLowest = myBid && myBid.amount === lowestBid;

  const validateBid = () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) return "Please enter a valid bid amount";
    if (auction?.type === "reverse" && lowestBid !== undefined && amount >= lowestBid) {
      return `Your bid must be lower than the current lowest bid ($${lowestBid.toLocaleString()})`;
    }
    if (myBid && Math.abs(amount - myBid.amount) < 1) return "Your new bid must be different from your previous bid";
    return null;
  };

  const handleSubmitBid = async () => {
    if (!user || !auction) return;
    const validationError = validateBid();
    if (validationError) {
      setBidError(validationError);
      return;
    }
    const amount = parseFloat(bidAmount);
    try {
      setSubmitting(true);
      setBidError(null);
      await submitBid(auctionId, {
        contractorId: user.uid,
        auctionId,
        amount,
      });
      setBidSuccess(true);
      setBidAmount("");
      setShowConfirmDialog(false);
      setTimeout(() => setBidSuccess(false), 4000);
    } catch (err: any) {
      console.error("Failed to submit bid", err);
      setBidError(err.message || "Failed to submit bid. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
          <Button className="mt-4" onClick={() => router.push('/contractor/auctions')}>
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
          <Link href="/contractor/auctions" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold font-headline ml-4">Auction Details</h1>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Message */}
          {bidSuccess && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Bid Submitted Successfully!</p>
                <p className="text-sm text-green-700">Your bid has been recorded and the agent will review it.</p>
              </div>
            </div>
          )}

          {/* Section 1: Active Auction Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">Project: {auction.projectId.slice(0, 12)}...</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={isActive ? 'default' : 'secondary'} className="text-sm">
                      {auctionStatus === 'scheduled' ? '⏳ Scheduled' : auctionStatus === 'live' ? '🟢 Live' : '🔒 Closed'}
                    </Badge>
                    {!isClosed && (
                      <Badge variant="outline" className="text-sm flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeRemaining}
                      </Badge>
                    )}
                  </div>
                </div>
                <Gavel className="h-10 w-10 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auction Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Auction Type</p>
                    <p className="font-semibold capitalize">{auction.type || 'Reverse'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time Remaining</p>
                    <p className="font-semibold">{timeRemaining}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="font-semibold">{endDate?.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Bids</p>
                    <p className="font-semibold">{bids.length} bids</p>
                  </div>
                </div>
              </div>

              {/* Your Last Bid */}
              {myBid && (
                <div className={`p-4 rounded-lg border-2 ${isMyBidLowest ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Your Last Submitted Bid</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        <DollarSign className="h-6 w-6 inline" />
                        {myBid.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Submitted: {new Date(myBid.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    {isMyBidLowest && (
                      <div className="text-right">
                        <Badge className="bg-green-600">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Lowest Bid
                        </Badge>
                        <p className="text-xs text-green-700 mt-1">You're winning!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bid Range Info */}
              {lowestBid && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 border">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Lowest Bid</p>
                    <p className="text-xl font-bold text-green-600">${lowestBid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Highest Bid</p>
                    <p className="text-xl font-bold text-red-600">${highestBid?.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Place Bid Box */}
          <Card className={isClosed ? 'opacity-60' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Place Your Bid
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isClosed ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-gray-900">Auction Closed</p>
                  <p className="text-sm text-muted-foreground mt-1">This auction is no longer accepting bids.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bidAmount" className="text-base font-semibold">
                      Enter your bid amount
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="bidAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={bidAmount}
                        onChange={(e) => {
                          setBidAmount(e.target.value);
                          setBidError(null);
                        }}
                        className="pl-10 text-lg h-12"
                        disabled={submitting}
                      />
                    </div>
                    <div className="flex items-start gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <p>
                        {auction.type === 'reverse' 
                          ? 'Lower bid increases your chances of winning'
                          : 'Higher bid increases your chances of winning'}
                      </p>
                    </div>
                  </div>

                  {bidError && (
                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <p>{bidError}</p>
                    </div>
                  )}

                  <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        size="lg" 
                        className="w-full text-lg"
                        disabled={!bidAmount || submitting}
                        onClick={() => {
                          const error = validateBid();
                          if (error) {
                            setBidError(error);
                          } else {
                            setShowConfirmDialog(true);
                          }
                        }}
                      >
                        <Gavel className="h-5 w-5 mr-2" />
                        Place Bid
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Your Bid</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to submit this bid? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">Your Bid Amount</p>
                          <p className="text-3xl font-bold mt-1">${parseFloat(bidAmount).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="flex-1">
                          Cancel
                        </Button>
                        <Button onClick={handleSubmitBid} disabled={submitting} className="flex-1">
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Confirm Bid'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
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
    <ContractorGuard>
      <AuctionDetailContent />
    </ContractorGuard>
  );
}
