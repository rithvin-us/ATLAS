# Mock Data Migration Guide

## Overview
This document outlines how to migrate from mock data to real Firestore data for the AI recommendation system across the ATLAS platform.

---

## Current Mock Data Usage

### 1. **Contractor Dashboard** - Job Recommendations
**File:** `src/app/contractor/dashboard/page.tsx`
**Mock Data Source:** `MOCK_RFQ_RECOMMENDATIONS`
**Display:** "Recommended Jobs for You" section

**Current Flow:**
```typescript
const formattedRecommendations = MOCK_RFQ_RECOMMENDATIONS.map((rec) => ({
  id: rec.id,
  rfq: { /* ... */ },
  matchScore: rec.matchScore,
  explanation: rec.explanation,
  matchFactors: rec.matchFactors,
}));
```

**Future Migration:**
```typescript
// Replace with real Firestore query
const formattedRecommendations = await getJobRecommendations(user.uid);
// Should return same structure with real match scores computed by backend
```

---

### 2. **Agent Dashboard** - Vendor Recommendations
**File:** `src/app/agent/dashboard/page.tsx`
**Mock Data Source:** `MOCK_VENDOR_RECOMMENDATIONS`
**Display:** "Recommended Vendors for You" section

**Current Flow:**
```typescript
setRecommendedVendors(MOCK_VENDOR_RECOMMENDATIONS);
```

**Future Migration:**
```typescript
// Replace with real Firestore query
const vendors = await getRecommendedVendors(user.uid);
setRecommendedVendors(vendors);
```

---

### 3. **Agent Dashboard** - Top Applicants for RFQ
**File:** `src/app/agent/dashboard/page.tsx`
**Mock Data Source:** `MOCK_CONTRACTOR_APPLICATIONS` + `computeContractorFitScore`
**Display:** "Top Applicants for Your RFQ" section

**Current Flow:**
```typescript
const applicationsForRFQ = MOCK_CONTRACTOR_APPLICATIONS.filter(
  (app) => app.rfqId === firstRfq.id
);

const scoredApplications = applicationsForRFQ.map((app) => {
  const { fitScore, explanation, factors } = computeContractorFitScore(app, rfqBudget);
  return { ...app, fitScore, explanation, factors };
});
```

**Future Migration:**
```typescript
// Replace with real Firestore query
const applications = await getAuctionApplications(firstRFQ.id);
// Backend should already compute fitScore and factors
const scoredApplications = applications.map(app => ({
  ...app,
  fitScore: app.computedFitScore,
  explanation: app.aiExplanation,
  factors: app.scoringFactors,
}));
```

---

### 4. **Agent Auction Detail Page** - Recommended Contractors
**File:** `src/app/agent/auctions/[id]/page.tsx`
**Mock Data Source:** `MOCK_CONTRACTOR_APPLICATIONS` + `computeContractorFitScore`
**Display:** "AI-Recommended Contractors" section

**Current Flow:**
```typescript
const applicationsForAuction = MOCK_CONTRACTOR_APPLICATIONS.map((app) => {
  const { fitScore, explanation, factors } = computeContractorFitScore(app, rfqBudget);
  return { ...app, fitScore, explanation, factors };
});

const topContractors = applicationsForAuction
  .sort((a, b) => b.fitScore - a.fitScore)
  .slice(0, 3);
```

**Future Migration:**
```typescript
// Replace with real Firestore query
const applications = await getAuctionApplications(auctionId);
// Assuming backend returns sorted by fitScore
const topContractors = applications.slice(0, 3);
```

---

### 5. **Agent Vendors Page** - Vendor Details
**File:** `src/app/agent/vendors/page.tsx`
**Mock Data Source:** `MOCK_VENDOR_RECOMMENDATIONS`
**Display:** Full vendor list with detail views

**Current Flow:**
```typescript
{MOCK_VENDOR_RECOMMENDATIONS.map((recommendation) => (
  // Vendor card with click to expand detail view
))}
```

**Future Migration:**
```typescript
// Replace with real Firestore query
const vendors = await getRecommendedVendors(user.uid);
setVendors(vendors);
// Keep the UI structure, just swap the data source
```

---

## Mock Data Structures

### MOCK_RFQ_RECOMMENDATIONS
```typescript
{
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: Date;
  status: 'published' | 'active' | 'closed';
  category: string;
  matchScore: number;        // 0-100
  explanation: string;
  matchFactors: {
    skillMatch: number;
    locationMatch: number;
    budgetMatch: number;
    categoryMatch: number;
    experienceMatch: number;
  };
}
```

### MOCK_VENDOR_RECOMMENDATIONS
```typescript
{
  id: string;
  contractor: {
    id: string;
    name: string;
    specialties: string[];
    credibilityScore: number;
    completionRate: number;
    averageRating: number;
    totalProjects: number;
    yearsInBusiness: number;
  };
  matchScore: number;        // 0-100
  explanation: string;
  matchFactors: {
    specialtyMatch: number;
    reliabilityMatch: number;
    pricePointMatch: number;
    locationMatch: number;
    experienceMatch: number;
  };
}
```

### MOCK_CONTRACTOR_APPLICATIONS
```typescript
{
  id: string;
  rfqId: string;
  contractorId: string;
  contractor: {
    id: string;
    name: string;
    credibilityScore: number;
    completionRate: number;
    averageRating: number;
    yearsInBusiness: number;
    totalProjects: number;
    complianceStatus: 'compliant' | 'non-compliant';
    skillMatch: number;
  };
  bidAmount: number;
  proposedTimeline: number;
  deliveryHistory: {
    onTimePercentage: number;
    withinBudgetPercentage: number;
    qualitySatisfactionScore: number;
  };
  pastPerformance: {
    projectsCompleted: number;
    averageProjectValue: number;
    customerRetentionRate: number;
  };
}
```

---

## Fit Score Algorithm

The `computeContractorFitScore()` function computes contractor suitability using:

**Weights:**
- Credibility Score: 25%
- Bid Competitiveness: 20%
- Delivery History: 20%
- Skill Match: 15%
- Compliance Status: 10%
- Past Performance: 10%

**This calculation can be moved to:**
1. Backend Cloud Function (recommended for performance)
2. Firestore document field (pre-computed)
3. Keep in frontend for low-latency computation

---

## Migration Steps

### Phase 1: Backend Preparation
1. Create Firestore collections: `rfq_recommendations`, `vendor_recommendations`, `auction_applications`
2. Implement Cloud Functions for:
   - `computeJobMatchScore()` - for contractor job recommendations
   - `computeVendorMatchScore()` - for vendor recommendations
   - `computeContractorFitScore()` - for contractor ranking
3. Set up indexes for efficient queries

### Phase 2: Frontend Migration
1. Replace `MOCK_RFQ_RECOMMENDATIONS` in contractor dashboard
2. Replace `MOCK_VENDOR_RECOMMENDATIONS` in agent dashboard
3. Replace `MOCK_CONTRACTOR_APPLICATIONS` in agent pages
4. Remove `computeContractorFitScore()` usage (assume backend computes)
5. Remove unused mock data imports

### Phase 3: Testing & Optimization
1. Performance test with real data volume
2. Optimize queries with proper indexing
3. Add caching if needed
4. Remove final mock data files

---

## Quick Reference: File Locations

| Feature | File | Mock Data |
|---------|------|-----------|
| Contractor Dashboard | `src/app/contractor/dashboard/page.tsx` | `MOCK_RFQ_RECOMMENDATIONS` |
| Agent Dashboard - Vendors | `src/app/agent/dashboard/page.tsx` | `MOCK_VENDOR_RECOMMENDATIONS` |
| Agent Dashboard - Contractors | `src/app/agent/dashboard/page.tsx` | `MOCK_CONTRACTOR_APPLICATIONS` |
| Agent Auctions Detail | `src/app/agent/auctions/[id]/page.tsx` | `MOCK_CONTRACTOR_APPLICATIONS` |
| Agent Vendors Page | `src/app/agent/vendors/page.tsx` | `MOCK_VENDOR_RECOMMENDATIONS` |
| Fit Score Algorithm | `src/lib/mock-recommendation-data.ts` | `computeContractorFitScore()` |

---

## Notes

- All mock data is defined in `src/lib/mock-recommendation-data.ts`
- The same data structures should be maintained when migrating to real data
- Keep the explanation field even in real data for UX consistency
- Consider caching recommendation data to reduce Firestore reads
