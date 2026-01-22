// User roles
export type UserRole = 'agent' | 'contractor' | 'admin' | 'finance' | 'auditor';

// User and organization types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  type: 'agent' | 'contractor';
  documents: Document[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  adminId: string;
  createdAt: Date;
}

export interface Vendor {
  id: string;
  name: string;
  industry: string;
  location: string;
  credibilityScore: number;
  projectsCompleted: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  specialties?: string[];
  complianceDocs?: Document[];
  createdAt: Date;
}

// Project types
export interface Project {
  id: string;
  name: string;
  projectName?: string;
  agentId: string;
  contractorId?: string;
  rfqId?: string;
  status: 'draft' | 'active' | 'in-progress' | 'completed' | 'closed';
  siteDetails: SiteDetails;
  milestones: Milestone[];
  description?: string;
  location?: string;
  totalBudget?: number;  // Total project budget
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  projectType?: string;
  
  // Escrow settings
  escrowEnabled: boolean;  // Whether escrow is required for this project
  escrowAccountId?: string;  // External escrow account reference
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteDetails {
  name: string;
  location: string;
  address: string;
  plantType?: string;
  description: string;
}

export type EscrowStatus = 'not-funded' | 'funded' | 'released' | 'disputed' | 'refunded';

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  title?: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'verification-pending' | 'verified' | 'invoiced';
  dueDate: Date;
  durationDays: number;  // Number of days estimated for completion
  paymentAmount: number;  // Required payment amount for this milestone
  proofDocuments: Document[];
  proformaDocuments: Document[];  // Proforma invoice/documents submitted by contractor
  
  // Contractor submission
  createdBy: string;  // User ID who created the milestone (contractor)
  submittedBy?: string;
  submittedAt?: Date;
  
  // Agent approval
  agentApprovalStatus: 'pending' | 'approved' | 'rejected' | 'revision-requested';
  approvedBy?: string;  // Agent user ID
  approvedAt?: Date;
  rejectionReason?: string;
  revisionNotes?: string;
  
  // Agent verification (after completion)
  verifiedBy?: string;
  verifiedAt?: Date;
  
  // Escrow & Payment
  escrowStatus: EscrowStatus;
  escrowFundedAt?: Date;
  escrowReleasedAt?: Date;
  invoiceId?: string;
  invoiceGeneratedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// RFQ/RFI types
export interface RFQ {
  id: string;
  projectId: string;
  agentId: string;
  title: string;
  description: string;
  scopeOfWork: string;
  scope?: string;
  location?: string;
  siteLocation?: string;
  budget?: number;
  projectType?: string;
  requiredSkills?: string[];
  eligibilityCriteria: string[];
  documents: Document[];
  status: 'draft' | 'published' | 'closed';
  deadline: Date;
  responses: RFQResponse[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface RFQResponse {
  id: string;
  rfqId: string;
  contractorId: string;
  quotation: number;
  executionPlan: string;
  documents: Document[];
  questions: Question[];
  submittedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  order: number;
}

// Auction types
export interface Auction {
  id: string;
  projectId: string;
  rfqId?: string;  // Link to source RFQ for context
  agentId: string;
  type: 'reverse' | 'sealed';
  status: 'scheduled' | 'live' | 'closed';  // Derived from startDate/endDate on fetch
  startDate: Date;
  endDate: Date;
  title?: string;  // Auction title/description
  createdAt?: Date;
  updatedAt?: Date;
  winnerId?: string;
}

/**
 * Derive auction status from current time and stored times.
 * Scheduled: now < startDate
 * Live: startDate <= now < endDate
 * Closed: now >= endDate
 */
export function deriveAuctionStatus(startDate: Date, endDate: Date): 'scheduled' | 'live' | 'closed' {
  const now = new Date();
  if (now < startDate) return 'scheduled';
  if (now < endDate) return 'live';
  return 'closed';
}

export interface Bid {
  id: string;
  auctionId: string;
  contractorId: string;
  contractorName?: string;
  amount: number;
  submittedAt: Date;
  credibilityScore?: number;
}

// Invoice types
export interface Invoice {
  id: string;
  projectId: string;
  milestoneId: string;
  contractorId: string;
  agentId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  description?: string;
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'disputed';
  documents: Document[];
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

// Credibility types
export interface CredibilityScore {
  id: string;
  contractorId: string;
  score: number;
  factors: {
    projectCompletion: number;
    timelyDelivery: number;
    qualityRating: number;
    complianceScore: number;
    communicationScore: number;
  };
  history: PerformanceMetric[];
  updatedAt: Date;
}

export interface PerformanceMetric {
  projectId: string;
  rating: number;
  feedback: string;
  completionTime: number;
  onTimeDelivery: boolean;
  date: Date;
}

// Document types
export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  expiryDate?: Date;
}

// Compliance types
export interface ComplianceDocument {
  id: string;
  organizationId: string;
  type: 'certificate' | 'license' | 'insurance' | 'policy';
  name: string;
  documentUrl: string;
  issuedDate: Date;
  expiryDate: Date;
  status: 'valid' | 'expiring-soon' | 'expired';
  acknowledgedBy?: string[];
}

// Dispute types
export interface Dispute {
  id: string;
  projectId?: string;
  invoiceId?: string;
  raisedBy: string;
  against: string;
  type: 'payment' | 'quality' | 'timeline' | 'scope' | 'other';
  description: string;
  evidence: Document[];
  status: 'open' | 'under-review' | 'resolved' | 'escalated';
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

// Audit log types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

// Communication types
export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  attachments: Document[];
  createdAt: Date;
}

export interface Thread {
  id: string;
  projectId?: string;
  rfqId?: string;
  participants: string[];
  messages: Message[];
  createdAt: Date;
}

/**
 * Milestone State Machine: Defines valid transitions for milestone lifecycle
 * 
 * pending → in-progress → completed → verification-pending → verified → invoiced
 * 
 * States:
 * - pending: Initial state, awaiting contractor to start work
 * - in-progress: Contractor is working on the milestone
 * - completed: Contractor marked as complete, submitted proof documents
 * - verification-pending: Awaiting agent verification
 * - verified: Agent verified the completion and proof
 * - invoiced: Invoice auto-generated and ready for payment
 */
export type MilestoneState = 'pending' | 'in-progress' | 'completed' | 'verification-pending' | 'verified' | 'invoiced';

export function deriveMilestoneState(milestone: Milestone): MilestoneState {
  // State is stored explicitly for milestones (unlike auctions)
  // This function can be used for state validation
  return milestone.status as MilestoneState;
}

export function canTransitionMilestoneState(from: MilestoneState, to: MilestoneState): boolean {
  const validTransitions: Record<MilestoneState, MilestoneState[]> = {
    pending: ['in-progress'],
    'in-progress': ['completed', 'pending'], // Can revert
    completed: ['verification-pending', 'in-progress'], // Can revert
    'verification-pending': ['verified', 'completed'], // Agent can reject back
    verified: ['invoiced'],
    invoiced: [], // Terminal state
  };
  
  return validTransitions[from]?.includes(to) ?? false;
}
