# Architecture

## Overview

Next.js App Router frontend. Firebase Auth identifies users, Firestore stores records, Genkit calls Gemini for quotation review. No custom backend server.

```
Browser ── Next.js (React) ──┬── Firebase Auth      identity and role
                             ├── Firestore          RFQs, auctions, projects, invoices
                             └── Server action ──── Genkit ── Gemini 2.5 Flash
```

## Routes

| Path | Audience | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/auth/{agent,contractor}/{login,signup}` | Public | Authentication |
| `/agent/*` | Agents | Dashboard, RFQs, projects, auctions, vendors, invoices, profile, settings |
| `/contractor/*` | Contractors | Dashboard, RFQs, auctions, projects, invoices, compliance, credibility, profile, settings |
| `/api/health` | Public | Returns `{ "status": "ok" }` |

## Access control

`AgentGuard` and `ContractorGuard` (`src/components/*/`) wrap each role's layout. They read the signed-in user from `src/lib/auth-context.tsx` and redirect users whose role does not match.

## Data layer

| File | Responsibility |
| --- | --- |
| `src/lib/firebase-client.ts` | Client-only Firebase singleton |
| `src/lib/agent-api.ts` | Agent queries: projects, RFQs, auctions, invoices |
| `src/lib/contractor-api.ts` | Contractor queries |
| `src/lib/project-api.ts` | Project and milestone reads and writes |
| `src/lib/types.ts` | Shared domain types |

Core entities: `Project`, `Milestone`, `RFQ`, `RFQResponse`, `Auction`, `Bid`, `Invoice`, `CredibilityScore`, `ComplianceDocument`, `Dispute`, `AuditLog`.

Milestone lifecycle: `pending` → `in-progress` → `completed` → `verification-pending` → `verified` → `invoiced`.

Escrow states: `not-funded`, `funded`, `released`, `disputed`, `refunded`.

## Recommendations

Rule-based and deterministic. Weights live in `src/lib/recommendation-engine.ts`.

Job match (contractor sees ranked RFQs):

| Factor | Weight |
| --- | --- |
| Skills | 35% |
| Budget | 25% |
| Location | 15% |
| Category | 15% |
| Experience | 10% |

Contractor fit (agent sees ranked applicants):

| Factor | Weight |
| --- | --- |
| Credibility | 25% |
| Bid price | 20% |
| Compliance | 15% |
| Experience | 15% |
| Delivery history | 15% |
| Skill match | 10% |

The dashboards currently rank sample applicants from `src/lib/mock-recommendation-data.ts`, which uses slightly different weights. See [mock data](guides/mock-data.md).

## AI quotation review

`src/ai/flows/validate-quotation-feasibility.ts` defines a Genkit flow. Input: scope, site details, safety rules, costs, execution plan, payment schedule, history and contractor credibility. Output: a feasibility verdict with reasoning. It is called from a server action in `src/app/dashboard/quotation/new/actions.ts`.
