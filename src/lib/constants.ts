// Role-based route definitions
export const AGENT_ROUTES = {
  DASHBOARD: '/agent/dashboard',
  PROJECTS: '/agent/projects',
  RFQ: '/agent/rfq',
  AUCTIONS: '/agent/auctions',
  VENDORS: '/agent/vendors',
  INVOICES: '/agent/invoices',
  COMPLIANCE: '/agent/compliance',
  COMMUNICATION: '/agent/communication',
  DISPUTES: '/agent/disputes',
  ANALYTICS: '/agent/analytics',
  SETTINGS: '/agent/settings',
} as const;

export const CONTRACTOR_ROUTES = {
  DASHBOARD: '/contractor/dashboard',
  RFQS: '/contractor/rfqs',
  PROJECTS: '/contractor/projects',
  AUCTIONS: '/contractor/auctions',
  INVOICES: '/contractor/invoices',
  COMPLIANCE: '/contractor/compliance',
  COMMUNICATION: '/contractor/communication',
  DISPUTES: '/contractor/disputes',
  CREDIBILITY: '/contractor/credibility',
  SETTINGS: '/contractor/settings',
} as const;

export const AUTH_ROUTES = {
  LANDING: '/',
  AGENT_LOGIN: '/auth/agent/login',
  AGENT_SIGNUP: '/auth/agent/signup',
  CONTRACTOR_LOGIN: '/auth/contractor/login',
  CONTRACTOR_SIGNUP: '/auth/contractor/signup',
} as const;

// Status badges colors
export const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  approved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800',
  disputed: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  verified: 'bg-green-100 text-green-800',
} as const;

// Credibility score thresholds
export const CREDIBILITY_LEVELS = {
  EXCELLENT: { min: 90, label: 'Excellent', color: 'text-green-600' },
  GOOD: { min: 75, label: 'Good', color: 'text-blue-600' },
  AVERAGE: { min: 60, label: 'Average', color: 'text-yellow-600' },
  FAIR: { min: 40, label: 'Fair', color: 'text-orange-600' },
  POOR: { min: 0, label: 'Poor', color: 'text-red-600' },
} as const;

// Permission definitions
export const PERMISSIONS = {
  // Agent permissions
  AGENT_CREATE_PROJECT: 'agent:create:project',
  AGENT_CREATE_RFQ: 'agent:create:rfq',
  AGENT_CREATE_AUCTION: 'agent:create:auction',
  AGENT_APPROVE_INVOICE: 'agent:approve:invoice',
  AGENT_VIEW_VENDORS: 'agent:view:vendors',
  AGENT_MANAGE_USERS: 'agent:manage:users',
  
  // Contractor permissions
  CONTRACTOR_SUBMIT_BID: 'contractor:submit:bid',
  CONTRACTOR_CREATE_INVOICE: 'contractor:create:invoice',
  CONTRACTOR_UPDATE_MILESTONE: 'contractor:update:milestone',
  
  // Finance permissions
  FINANCE_APPROVE_PAYMENT: 'finance:approve:payment',
  FINANCE_VIEW_INVOICES: 'finance:view:invoices',
  
  // Auditor permissions
  AUDITOR_VIEW_ALL: 'auditor:view:all',
  AUDITOR_VIEW_LOGS: 'auditor:view:logs',
} as const;

// Document types
export const DOCUMENT_TYPES = {
  CERTIFICATE: 'certificate',
  LICENSE: 'license',
  INSURANCE: 'insurance',
  POLICY: 'policy',
  INVOICE: 'invoice',
  PROOF: 'proof',
  QUOTATION: 'quotation',
  CONTRACT: 'contract',
} as const;
