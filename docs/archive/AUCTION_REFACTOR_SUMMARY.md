# Auction Module Refactor Summary

## Overview
The auction module has been refactored to enforce a **system-controlled lifecycle** where auction status (Scheduled → Live → Closed) is automatically derived from `startDate` and `endDate` rather than being manually mutable. This removes user error, simplifies the UI, and ensures consistent state management across the platform.

## Key Changes

### 1. **Type Definitions** (`src/lib/types.ts`)

#### Added `deriveAuctionStatus` Function
```typescript
export function deriveAuctionStatus(startDate: Date | string, endDate: Date | string): 'scheduled' | 'live' | 'closed' {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  
  if (now < start) return 'scheduled';
  if (now < end) return 'live';
  return 'closed';
}
```

#### Updated Auction Interface
- **Removed**: `bids: Bid[]` (now stored separately in `auction_bids` collection)
- **Changed**: `status: 'scheduled' | 'live' | 'closed'` (now read-only, auto-derived)
- **Added**: `rfqId?: string` (link to parent RFQ for context)
- **Added**: `title?: string` (auction title for display)

### 2. **Agent API Layer** (`src/lib/agent-api.ts`)

#### Updated `fetchAuctions(agentId)`
- Now derives status on every fetch: `deriveAuctionStatus(auction.startDate, auction.endDate)`
- Status is **not** stored in Firestore, calculated at runtime
- Returns auctions with auto-calculated status

#### Updated `fetchAuction(auctionId)`
- Similar auto-derive behavior
- Fetches real-time bids from `auction_bids` collection via `where('auctionId', '==', auctionId)`

#### Removed `updateAuctionStatus(auctionId, status)`
- No longer needed; status is read-only and auto-derived from time

#### Updated `createAuction(...)`
- Removed `status` parameter (no longer settable)
- Removed `bids: []` default (bids stored separately)

### 3. **Contractor API Layer** (`src/lib/contractor-api.ts`)

#### Updated `fetchContractorAuctions(contractorId)`
- Similar auto-derive pattern for consistency
- Fetches accessible auctions and auto-calculates status

### 4. **Agent Auction Pages**

#### List Page (`src/app/agent/auctions/page.tsx`)
- **Status Display**: Now uses `deriveAuctionStatus()` with emoji badges
  - 🟢 Live (blue badge)
  - ⏳ Scheduled (gray badge)
  - 🔒 Closed (red badge)
- **RFQ Links**: Updated to link to `auction.rfqId` instead of hard-coded project lookup
- **Removed**: Manual status dropdowns

#### Detail Page (`src/app/agent/auctions/[id]/page.tsx`) - **MAJOR REFACTOR**
- **Real-time Status**: Auto-derived on page load and updates via Firestore listener
- **Countdown Timer**: Displays time-remaining via `useCountdown` hook (or inline calculation)
- **Linked RFQ Context**: Card at top showing RFQ title, scope, and view link
- **Real-time Bids Table**: Fetches from `auction_bids` collection with `onSnapshot`
  - Sorted by amount (reverse auction = lowest first, sealed = highest first)
  - Shows contractor name, amount, submission time, credibility score
- **Status Badges**: Read-only, no manual override possible
  - Displays current lifecycle stage (Scheduled/Live/Closed) with emoji
- **Empty States**: Context-specific explanations
  - "Scheduled": Bids will appear when auction goes live
  - "Live": No bids yet; waiting for contractors to submit
  - "Closed": Auction ended; no new bids accepted
- **Removed**: Manual status dropdown, AI recommendation section (simplified)
- **Removed**: `handleStatusChange()` logic

### 5. **Contractor Auction Pages**

#### List Page (`src/app/contractor/auctions/page.tsx`)
- **Status Display**: Updated to use `deriveAuctionStatus()` with emoji badges
- **Currency Fix**: Removed `/100` scaling (stored as whole units, displayed as-is)
- **Format**: `$1000` instead of `$10.00` (matches business requirement)

#### Detail Page (`src/app/contractor/auctions/[id]/page.tsx`)
- **Status Derivation**: Updated to use `deriveAuctionStatus()` for consistency
- **Currency Fix**: Already displayed correctly (removed `/100` dividers)
- **Lifecycle Logic**: `isActive` and `isClosed` now based on derived status

### 6. **Countdown Hook** (`src/hooks/use-countdown.ts`) - **NEW**
```typescript
export function useCountdown(endDate: Date | string) {
  const [tick, setTick] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  
  const now = Date.now();
  const end = new Date(endDate).getTime();
  const diff = end - now;
  
  if (diff <= 0) return { display: 'Closed', isActive: false, timeRemaining: 0 };
  
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  const display = days > 0 
    ? `${days}d ${hours}h`
    : hours > 0
    ? `${hours}h ${minutes}m`
    : `${minutes}m ${seconds}s`;
  
  return { display, isActive: true, timeRemaining: diff };
}
```

### 7. **Health Endpoint** (`src/app/api/health/route.ts`) - **NEW**
- Returns `{ status: 'ok' }` on GET
- Used for deployment health checks
- Ready for production use

### 8. **Currency Fixes Across All Invoice Views**
- **Removed** `/100` scaling in:
  - `src/app/agent/invoices/page.tsx` (list)
  - `src/app/agent/invoices/[id]/page.tsx` (detail)
  - `src/app/contractor/invoices/page.tsx` (list)
  - `src/app/contractor/invoices/[id]/page.tsx` (detail)
- **Format**: Displays stored whole units directly (e.g., `$1000` not `$10.00`)

## Data Model

### Firestore Schema (Unchanged Core, Enhanced with New Fields)

**Collection: `auctions`**
```
{
  id: string (doc ID),
  agentId: string,
  projectId: string,
  type: 'reverse' | 'sealed',
  startDate: Timestamp,
  endDate: Timestamp,
  title?: string,
  rfqId?: string,
  // NO: status (derived), bids (moved to separate collection)
}
```

**Collection: `auction_bids`** (Already existed, now centralized)
```
{
  id: string (doc ID),
  auctionId: string,
  contractorId: string,
  contractorName?: string,
  amount: number,
  submittedAt: Timestamp,
  credibilityScore?: number,
}
```

**Collection: `rfqs`**
```
{
  id: string,
  title: string,
  scope: string,
  // ... other RFQ fields
}
```

## Status Lifecycle

```
Scheduled
  ↓ (when startDate is reached)
Live
  ↓ (when endDate is reached)
Closed
```

**All transitions are automatic** based on current time vs. stored dates. No manual intervention possible.

## UI Patterns Applied

### Agent Auction Detail View
1. **Header**: Shows project, RFQ link, lifecycle status badge
2. **RFQ Context Card**: Title, scope, linked RFQ details
3. **Countdown Timer**: Real-time display of time remaining (updates every second)
4. **Bid Table**: Real-time feed from `auction_bids` collection
   - Sorted by amount (reverse = ascending, sealed = descending)
   - Shows winning position for contractors
5. **Status Badge**: Read-only emoji badge (🟢 Live, ⏳ Scheduled, 🔒 Closed)
6. **Empty State**: Context-specific message explaining why no bids yet

### Contractor Auction Detail View
1. **Status Badge**: Derived status with emoji (matches agent view)
2. **Bid Placement**: Only enabled when `status === 'live'`
3. **My Last Bid**: Highlighted section showing submission time and amount
4. **Bid Range**: Shows lowest and highest bids (confidentiality maintained)
5. **Countdown**: Time remaining with real-time updates

## Benefits

✅ **Eliminates Manual Error**: Status can't be set incorrectly; derived from time automatically
✅ **Simplified UI**: No status dropdowns; users see clear lifecycle badges with emoji
✅ **Real-time Accuracy**: Status recalculated on every fetch; always matches server time
✅ **Consistent State**: No inconsistencies between agent/contractor views
✅ **Centralized Bids**: Single source of truth in `auction_bids` collection
✅ **Linked RFQ Context**: Agents can see why an auction was created
✅ **Non-technical UX**: Auctions open/close automatically; contractors don't need to understand backend logic

## Testing Checklist

- [ ] Agent auction list shows auto-derived status (Scheduled/Live/Closed)
- [ ] Agent auction detail shows linked RFQ card at top
- [ ] Countdown timer updates every second on detail page
- [ ] Real-time bid table updates as new bids arrive
- [ ] Contractor auction list shows auto-derived status
- [ ] Contractor auction detail allows bids only when status is 'live'
- [ ] Currency displays correctly (whole units, not divided by 100)
- [ ] No manual status controls available on any page
- [ ] Health endpoint returns 200 OK at `/api/health`
- [ ] Dev server compiles without errors
- [ ] Production build succeeds: `npm run build`

## Deployment Notes

1. **No Database Migration Needed**: Existing auctions will work; status is calculated at runtime
2. **Backward Compatible**: Old auctions with manual status field are ignored; derived status takes precedence
3. **Optional**: Add Firestore security rules to enforce read/write access by role
4. **Optional**: Re-add AI recommendation section later if needed
5. **Test**: Use `/api/health` endpoint to verify deployment health

## Next Steps (Future Enhancements)

1. **Firestore Security Rules**: Enforce role-based access to auctions/bids
2. **AI Recommendations**: Re-add explainable contractor ranking (was removed for simplicity)
3. **Contractor Refactor**: Apply similar simplification to contractor-side auction pages
4. **Email Notifications**: Notify contractors when their bid is lowest/highest
5. **Audit Logging**: Track all status changes for compliance (timestamps only, since status is read-only)

