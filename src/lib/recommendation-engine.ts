/**
 * AI-Assisted Recommendation Engine
 * Rule-based weighted scoring for job and contractor recommendations
 * No external APIs - fully deterministic and explainable
 */

import { RFQ, Project, Auction } from './types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ContractorProfile {
  id: string;
  skills?: string[];
  category?: string;
  location?: string;
  budgetRange?: { min: number; max: number };
  pastProjects?: Array<{ type?: string; budget?: number; success?: boolean }>;
  credibilityScore?: number;
  completedProjects?: number;
  onTimeDeliveryRate?: number;
}

export interface JobRecommendation {
  rfq: RFQ;
  matchScore: number; // 0-100
  explanation: string;
  matchFactors: {
    skillMatch: number;
    locationMatch: number;
    budgetMatch: number;
    categoryMatch: number;
    experienceMatch: number;
  };
}

export interface ContractorApplication {
  contractorId: string;
  contractorName?: string;
  bidAmount?: number;
  credibilityScore?: number;
  skills?: string[];
  complianceStatus?: 'verified' | 'pending' | 'unverified';
  pastProjectCount?: number;
  onTimeDeliveryRate?: number;
  averageRating?: number;
  proposedTimeline?: number; // days
}

export interface ContractorRecommendation {
  application: ContractorApplication;
  fitScore: number; // 0-100
  explanation: string;
  scoreBreakdown: {
    credibilityScore: number;
    bidCompetitiveness: number;
    complianceScore: number;
    experienceScore: number;
    deliveryScore: number;
    skillMatchScore: number;
  };
}

// ============================================================================
// SCORING WEIGHTS (adjustable for fine-tuning)
// ============================================================================

const JOB_MATCH_WEIGHTS = {
  skills: 0.35,        // 35% - Most important
  budget: 0.25,        // 25% - Financial fit
  location: 0.15,      // 15% - Geographic proximity
  category: 0.15,      // 15% - Project type match
  experience: 0.10,    // 10% - Past project relevance
};

const CONTRACTOR_FIT_WEIGHTS = {
  credibility: 0.25,   // 25% - Trust and reliability
  bidPrice: 0.20,      // 20% - Cost competitiveness
  compliance: 0.15,    // 15% - Documentation status
  experience: 0.15,    // 15% - Track record
  delivery: 0.15,      // 15% - On-time delivery history
  skillMatch: 0.10,    // 10% - Skill alignment
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely normalize a value to 0-100 range
 */
function normalize(value: number, min = 0, max = 100): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

/**
 * Calculate Jaccard similarity between two string arrays (case-insensitive)
 */
function calculateSimilarity(arr1: string[] = [], arr2: string[] = []): number {
  if (arr1.length === 0 || arr2.length === 0) return 0;
  
  const set1 = new Set(arr1.map(s => s.toLowerCase().trim()));
  const set2 = new Set(arr2.map(s => s.toLowerCase().trim()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size === 0 ? 0 : (intersection.size / union.size) * 100;
}

/**
 * Calculate geographic distance score (simplified - can be enhanced with actual coordinates)
 */
function calculateLocationScore(contractorLocation?: string, rfqLocation?: string): number {
  if (!contractorLocation || !rfqLocation) return 50; // Neutral score if unknown
  
  const loc1 = contractorLocation.toLowerCase().trim();
  const loc2 = rfqLocation.toLowerCase().trim();
  
  if (loc1 === loc2) return 100; // Exact match
  
  // Check if they share common words (city, state, region)
  const words1 = loc1.split(/[\s,]+/);
  const words2 = loc2.split(/[\s,]+/);
  const commonWords = words1.filter(w => words2.includes(w) && w.length > 2);
  
  if (commonWords.length > 0) return 70; // Partial match
  
  return 30; // Different locations
}

/**
 * Calculate budget compatibility score
 */
function calculateBudgetScore(
  contractorBudget?: { min: number; max: number },
  rfqBudget?: number
): number {
  if (!rfqBudget || !contractorBudget) return 50; // Neutral if unknown
  
  const { min, max } = contractorBudget;
  
  // Perfect fit if within range
  if (rfqBudget >= min && rfqBudget <= max) return 100;
  
  // Calculate how far outside the range
  if (rfqBudget < min) {
    const diff = min - rfqBudget;
    const range = max - min;
    return Math.max(0, 100 - (diff / range) * 100);
  }
  
  if (rfqBudget > max) {
    const diff = rfqBudget - max;
    const range = max - min;
    return Math.max(0, 100 - (diff / range) * 50); // Less penalty for higher budgets
  }
  
  return 50;
}

/**
 * Calculate bid competitiveness (lower is better, but not too low)
 */
function calculateBidCompetitiveness(bidAmount: number, allBids: number[], rfqBudget?: number): number {
  if (allBids.length === 0) return 50; // Neutral if no comparison
  
  const avgBid = allBids.reduce((a, b) => a + b, 0) / allBids.length;
  const minBid = Math.min(...allBids);
  const maxBid = Math.max(...allBids);
  
  // Optimal bid is slightly below average
  const optimalBid = avgBid * 0.9;
  
  // Calculate distance from optimal
  const distance = Math.abs(bidAmount - optimalBid);
  const range = maxBid - minBid;
  
  if (range === 0) return 80; // All bids same
  
  const score = 100 - (distance / range) * 100;
  
  // Penalty for extremely low bids (might be unrealistic)
  if (bidAmount < minBid * 0.8) return Math.max(30, score * 0.7);
  
  return Math.max(0, Math.min(100, score));
}

// ============================================================================
// JOB RECOMMENDATION ENGINE (Contractor → RFQ Matching)
// ============================================================================

/**
 * Score a single RFQ for a contractor
 */
export function scoreRFQForContractor(
  rfq: RFQ,
  contractor: ContractorProfile
): JobRecommendation {
  // Calculate individual factor scores
  const skillMatch = calculateSimilarity(
    contractor.skills || [],
    rfq.requiredSkills || []
  );
  
  const locationMatch = calculateLocationScore(
    contractor.location,
    rfq.location || rfq.siteLocation
  );
  
  const budgetMatch = calculateBudgetScore(
    contractor.budgetRange,
    rfq.budget
  );
  
  const categoryMatch = contractor.category && rfq.projectType
    ? (contractor.category.toLowerCase() === rfq.projectType.toLowerCase() ? 100 : 50)
    : 50;
  
  // Experience match based on past projects
  let experienceMatch = 50;
  if (contractor.pastProjects && contractor.pastProjects.length > 0) {
    const relevantProjects = contractor.pastProjects.filter(p => 
      p.type?.toLowerCase().includes(rfq.projectType?.toLowerCase() || '') ||
      (p.budget && rfq.budget && Math.abs(p.budget - rfq.budget) < rfq.budget * 0.3)
    );
    experienceMatch = Math.min(100, 60 + (relevantProjects.length * 10));
  }
  
  // Weighted final score
  const matchScore = 
    skillMatch * JOB_MATCH_WEIGHTS.skills +
    budgetMatch * JOB_MATCH_WEIGHTS.budget +
    locationMatch * JOB_MATCH_WEIGHTS.location +
    categoryMatch * JOB_MATCH_WEIGHTS.category +
    experienceMatch * JOB_MATCH_WEIGHTS.experience;
  
  // Generate explanation
  const explanation = generateJobMatchExplanation(
    { skillMatch, locationMatch, budgetMatch, categoryMatch, experienceMatch },
    matchScore
  );
  
  return {
    rfq,
    matchScore: Math.round(matchScore),
    explanation,
    matchFactors: {
      skillMatch: Math.round(skillMatch),
      locationMatch: Math.round(locationMatch),
      budgetMatch: Math.round(budgetMatch),
      categoryMatch: Math.round(categoryMatch),
      experienceMatch: Math.round(experienceMatch),
    },
  };
}

/**
 * Get top N job recommendations for a contractor
 */
export function getJobRecommendations(
  allRFQs: RFQ[],
  contractor: ContractorProfile,
  topN: number = 10
): JobRecommendation[] {
  if (!allRFQs || allRFQs.length === 0) return [];
  if (!contractor || !contractor.id) return [];
  
  // Score all RFQs
  const scored = allRFQs.map(rfq => scoreRFQForContractor(rfq, contractor));
  
  // Sort by match score (descending)
  scored.sort((a, b) => b.matchScore - a.matchScore);
  
  // Return top N with score >= 60 (good matches only)
  return scored.filter(rec => rec.matchScore >= 60).slice(0, topN);
}

function generateJobMatchExplanation(
  factors: {
    skillMatch: number;
    locationMatch: number;
    budgetMatch: number;
    categoryMatch: number;
    experienceMatch: number;
  },
  totalScore: number
): string {
  const reasons: string[] = [];
  
  if (factors.skillMatch >= 70) {
    reasons.push('strong skill match');
  } else if (factors.skillMatch >= 50) {
    reasons.push('good skill alignment');
  }
  
  if (factors.budgetMatch >= 80) {
    reasons.push('budget within your range');
  }
  
  if (factors.locationMatch >= 80) {
    reasons.push('local project');
  } else if (factors.locationMatch >= 60) {
    reasons.push('nearby location');
  }
  
  if (factors.categoryMatch >= 80) {
    reasons.push('matches your specialty');
  }
  
  if (factors.experienceMatch >= 70) {
    reasons.push('similar past projects');
  }
  
  if (reasons.length === 0) {
    return 'Recommended based on overall profile fit';
  }
  
  return `Recommended: ${reasons.join(', ')}`;
}

// ============================================================================
// CONTRACTOR RECOMMENDATION ENGINE (Agent → Contractor Matching)
// ============================================================================

/**
 * Score a contractor application for an RFQ/Auction
 */
export function scoreContractorForRFQ(
  application: ContractorApplication,
  rfq: RFQ,
  allApplications: ContractorApplication[]
): ContractorRecommendation {
  // 1. Credibility Score (0-100)
  const credibilityScore = Math.min(100, application.credibilityScore || 50);
  
  // 2. Bid Competitiveness
  const allBids = allApplications
    .map(a => a.bidAmount)
    .filter((bid): bid is number => typeof bid === 'number');
  
  const bidCompetitiveness = application.bidAmount
    ? calculateBidCompetitiveness(application.bidAmount, allBids, rfq.budget)
    : 50;
  
  // 3. Compliance Score
  const complianceScore = 
    application.complianceStatus === 'verified' ? 100 :
    application.complianceStatus === 'pending' ? 60 : 30;
  
  // 4. Experience Score
  const projectCount = application.pastProjectCount || 0;
  const experienceScore = Math.min(100, 50 + (projectCount * 5));
  
  // 5. Delivery Score
  const deliveryRate = application.onTimeDeliveryRate ?? 0.75;
  const deliveryScore = deliveryRate * 100;
  
  // 6. Skill Match Score
  const skillMatchScore = calculateSimilarity(
    application.skills || [],
    rfq.requiredSkills || []
  );
  
  // Weighted final score
  const fitScore = 
    credibilityScore * CONTRACTOR_FIT_WEIGHTS.credibility +
    bidCompetitiveness * CONTRACTOR_FIT_WEIGHTS.bidPrice +
    complianceScore * CONTRACTOR_FIT_WEIGHTS.compliance +
    experienceScore * CONTRACTOR_FIT_WEIGHTS.experience +
    deliveryScore * CONTRACTOR_FIT_WEIGHTS.delivery +
    skillMatchScore * CONTRACTOR_FIT_WEIGHTS.skillMatch;
  
  // Generate explanation
  const explanation = generateContractorFitExplanation({
    credibilityScore,
    bidCompetitiveness,
    complianceScore,
    experienceScore,
    deliveryScore,
    skillMatchScore,
  }, fitScore);
  
  return {
    application,
    fitScore: Math.round(fitScore),
    explanation,
    scoreBreakdown: {
      credibilityScore: Math.round(credibilityScore),
      bidCompetitiveness: Math.round(bidCompetitiveness),
      complianceScore: Math.round(complianceScore),
      experienceScore: Math.round(experienceScore),
      deliveryScore: Math.round(deliveryScore),
      skillMatchScore: Math.round(skillMatchScore),
    },
  };
}

/**
 * Get top N contractor recommendations for an RFQ/Auction
 */
export function getContractorRecommendations(
  applications: ContractorApplication[],
  rfq: RFQ,
  topN: number = 5
): ContractorRecommendation[] {
  if (!applications || applications.length === 0) return [];
  if (!rfq) return [];
  
  // Score all applications
  const scored = applications.map(app => scoreContractorForRFQ(app, rfq, applications));
  
  // Sort by fit score (descending)
  scored.sort((a, b) => b.fitScore - a.fitScore);
  
  // Return top N
  return scored.slice(0, topN);
}

function generateContractorFitExplanation(
  breakdown: {
    credibilityScore: number;
    bidCompetitiveness: number;
    complianceScore: number;
    experienceScore: number;
    deliveryScore: number;
    skillMatchScore: number;
  },
  totalScore: number
): string {
  const reasons: string[] = [];
  
  if (breakdown.credibilityScore >= 80) {
    reasons.push('high credibility score');
  }
  
  if (breakdown.bidCompetitiveness >= 70) {
    reasons.push('competitive bid');
  }
  
  if (breakdown.complianceScore >= 80) {
    reasons.push('verified compliance');
  }
  
  if (breakdown.deliveryScore >= 85) {
    reasons.push('excellent delivery history');
  } else if (breakdown.deliveryScore >= 70) {
    reasons.push('good delivery record');
  }
  
  if (breakdown.experienceScore >= 75) {
    reasons.push('extensive experience');
  }
  
  if (breakdown.skillMatchScore >= 70) {
    reasons.push('strong skill match');
  }
  
  if (reasons.length === 0) {
    return 'Qualified candidate - review full profile';
  }
  
  return `Recommended: ${reasons.join(', ')}`;
}

// ============================================================================
// EXPORT DEFAULT RECOMMENDATION ENGINE
// ============================================================================

export const RecommendationEngine = {
  // Job recommendations
  scoreRFQForContractor,
  getJobRecommendations,
  
  // Contractor recommendations
  scoreContractorForRFQ,
  getContractorRecommendations,
  
  // Utilities
  calculateSimilarity,
  calculateLocationScore,
  calculateBudgetScore,
};

export default RecommendationEngine;
