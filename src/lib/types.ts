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
  agentId: string;
  contractorId?: string;
  status: 'draft' | 'active' | 'in-progress' | 'completed' | 'closed';
  siteDetails: SiteDetails;
  milestones: Milestone[];
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

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'approved';
  dueDate: Date;
  proofDocuments: Document[];
  approvedBy?: string;
  approvedAt?: Date;
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
  budget?: number;
  eligibilityCriteria: string[];
  documents: Document[];
  status: 'draft' | 'published' | 'closed';
  deadline: Date;
  responses: RFQResponse[];
  createdAt: Date;
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
  rfqId: string;
  contractorId: string;
  question: string;
  answer?: string;
  answeredAt?: Date;
  createdAt: Date;
}

// Auction types
export interface Auction {
  id: string;
  projectId: string;
  agentId: string;
  type: 'reverse' | 'sealed';
  status: 'draft' | 'active' | 'closed';
  startDate: Date;
  endDate: Date;
  bids: Bid[];
  winnerId?: string;
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
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'disputed';
  documents: Document[];
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
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
