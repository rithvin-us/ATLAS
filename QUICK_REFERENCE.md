# Quick Reference: Auction Module Refactor

## Core Changes at a Glance

### 1. Status is Now Auto-Derived
```typescript
// OLD: Manually set status in Firestore
auction.status = 'active'; // ❌ Manual, error-prone

// NEW: Auto-calculated from timestamps
const status = deriveAuctionStatus(auction.startDate, auction.endDate);
// Returns: 'scheduled' | 'live' | 'closed' ✅ Automatic, reliable
```

### 2. Bids are Centralized
```typescript
// OLD: Embedded in auction
auction.bids = [{contractorId, amount, ...}]; // ❌ Scattered

// NEW: Separate collection
collection(db, 'auction_bids').where('auctionId', '==', auctionId); // ✅ Centralized
```

### 3. UI is Simplified
```typescript
// OLD: Manual status dropdown
<Select value={status} onChange={updateStatus}>...</Select> // ❌ Complex

// NEW: Read-only emoji badges
<Badge>{status === 'live' ? '🟢 Live' : '⏳ Scheduled'}</Badge> // ✅ Simple
```

### 4. RFQ Context is Linked
```typescript
// OLD: No connection between auction and RFQ
// auction.projectId (vague reference)

// NEW: Direct link
// auction.rfqId → can fetch and display RFQ details ✅
```

## Status Transitions (Automatic)

```
NOW < startDate    → ⏳ SCHEDULED    (bids not accepted)
startDate < NOW < endDate → 🟢 LIVE  (bids accepted, real-time)
NOW > endDate      → 🔒 CLOSED       (no new bids, results final)
```

## Key Functions

### `deriveAuctionStatus(startDate, endDate)`
```typescript
function deriveAuctionStatus(
  startDate: Date | string,
  endDate: Date | string
): 'scheduled' | 'live' | 'closed' {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  if (now < start) return 'scheduled';
  if (now < end) return 'live';
  return 'closed';
}
```

### `useCountdown(endDate)`
```typescript
const { display, isActive, timeRemaining } = useCountdown(auction.endDate);
// display: "2d 3h" | "1h 30m" | "45m" | "Closed"
// isActive: true if still running, false if closed
// timeRemaining: milliseconds until end (0 if closed)
```

## API Endpoints

### Agent API (`src/lib/agent-api.ts`)

| Endpoint | Change |
|----------|--------|
| `fetchAuctions(agentId)` | ✨ Returns derived status + real-time bids |
| `fetchAuction(auctionId)` | ✨ Returns derived status + real-time bids |
| `createAuction({agentId, projectId, startDate, endDate})` | ✅ Simplified (no status param) |
| `submitBid(auctionId, {contractorId, amount})` | ✅ No changes |
| `updateAuctionStatus()` | ❌ **REMOVED** (no longer needed) |

### Health Endpoint

```bash
GET /api/health
→ { status: 'ok' }
→ Use for deployment health checks
```

## UI Components

### Status Badge
```tsx
// Before: <Select value={status} onChange={...}>...</Select>
// After (read-only):
<Badge>{status === 'live' ? '🟢 Live' : status === 'scheduled' ? '⏳ Scheduled' : '🔒 Closed'}</Badge>
```

### Real-Time Countdown
```tsx
const { display } = useCountdown(auction.endDate);
<div>{display}</div>
// Updates every second automatically
```

### Real-Time Bid Table
```tsx
// Before: Static list from auction.bids
// After: Real-time listener
useEffect(() => {
  const q = query(collection(db, 'auction_bids'), where('auctionId', '==', auctionId));
  const unsubscribe = onSnapshot(q, snapshot => {
    const bids = snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
    setBids(bids.sort((a, b) => a.amount - b.amount)); // lowest first
  });
  return () => unsubscribe();
}, [auctionId]);
```

## Firestore Schema

```typescript
// Collection: auctions
{
  id: string,              // Doc ID
  agentId: string,         // Agent owner
  projectId: string,       // Project reference
  type: 'reverse' | 'sealed', // Auction type
  startDate: Timestamp,    // Bidding starts
  endDate: Timestamp,      // Bidding ends
  title?: string,          // Auction title [NEW]
  rfqId?: string,          // RFQ link [NEW]
  // ❌ NO status field (derived at runtime)
  // ❌ NO bids array (moved to separate collection)
}

// Collection: auction_bids [CENTRALIZED]
{
  id: string,              // Bid ID
  auctionId: string,       // Which auction
  contractorId: string,    // Who bid
  amount: number,          // Bid amount
  submittedAt: Timestamp,  // When submitted
  credibilityScore?: number, // Contractor score
}
```

## Currency Fix

```typescript
// OLD: Always divided by 100
formatMoney(amount) => `$${(amount / 100).toLocaleString()}` // ❌

// NEW: Display whole units directly
formatMoney(amount) => `$${amount.toLocaleString()}` // ✅
// $1000 stored → $1000 displayed (not $10)
```

## Testing Quick Checks

✅ **Agent Auction List**: Statuses show as emoji badges (🟢 Live, ⏳ Scheduled, 🔒 Closed)
✅ **Agent Auction Detail**: Countdown timer updates every second
✅ **Agent Auction Detail**: Bid table updates in real-time as contractors bid
✅ **Contractor Auction**: Can bid only when status is 🟢 Live
✅ **Contractor Auction**: Bid appears on agent side immediately
✅ **Invoices**: Currency amounts correct (no /100 scaling)
✅ **Health Endpoint**: GET /api/health returns 200 with `{ status: 'ok' }`

## Deployment Steps

```bash
# 1. Build production bundle
npm run build

# 2. Deploy to hosting (Vercel/Docker/etc)
# ... deployment steps ...

# 3. Verify health endpoint
curl https://your-domain.com/api/health
# Should return: { "status": "ok" }

# 4. Test in production
# - Create/view auction
# - Verify status transitions
# - Submit bid, verify real-time update
# - Check currency amounts
```

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Status shows as undefined | Component not awaiting derived status | Use `deriveAuctionStatus()` on fetch |
| Bids not updating | Not listening to `auction_bids` collection | Add `onSnapshot` listener for auction_bids |
| Countdown stuck | useCountdown not re-rendering | Hook updates state every 1s, component re-renders |
| Currency wrong | Still dividing by 100 | Remove `/100` from formatMoney() |
| Manual status control visible | Old code still there | Remove status dropdown UI |

## File Checklist

- ✅ `src/lib/types.ts` - Auction type updated
- ✅ `src/lib/agent-api.ts` - API methods simplified
- ✅ `src/app/agent/auctions/page.tsx` - List view refactored
- ✅ `src/app/agent/auctions/[id]/page.tsx` - Detail view rewritten
- ✅ `src/app/contractor/auctions/page.tsx` - Status derived
- ✅ `src/app/contractor/auctions/[id]/page.tsx` - Status derived
- ✅ `src/app/contractor/invoices/page.tsx` - Currency fixed
- ✅ `src/app/contractor/invoices/[id]/page.tsx` - Currency fixed
- ✅ `src/hooks/use-countdown.ts` - New hook
- ✅ `src/app/api/health/route.ts` - New endpoint
- ✅ `AUCTION_REFACTOR_SUMMARY.md` - Documentation
- ✅ `IMPLEMENTATION_REPORT.md` - Full report

---

**Status**: ✅ Ready for production deployment.
