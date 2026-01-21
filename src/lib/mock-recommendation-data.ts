// ================================
// MOCK DATA FOR AI RECOMMENDATIONS
// ================================
// 
// This file contains centralized mock data for all AI recommendation features
// across the ATLAS platform. Once the website is fully created and tested,
// all of this data will be replaced with real Firestore queries.
//
// CURRENT USAGE:
// ✓ Contractor Dashboard: Job recommendations (MOCK_RFQ_RECOMMENDATIONS)
// ✓ Agent Dashboard: Vendor recommendations (MOCK_VENDOR_RECOMMENDATIONS)
// ✓ Agent Dashboard: Top contractor applicants (MOCK_CONTRACTOR_APPLICATIONS + computeContractorFitScore)
// ✓ Agent Auctions Detail: AI-ranked contractors for specific auction (MOCK_CONTRACTOR_APPLICATIONS)
// ✓ Agent Vendors Page: Vendor profiles and details (MOCK_VENDOR_RECOMMENDATIONS)
//
// FUTURE MIGRATION:
// 1. Replace MOCK_RFQ_RECOMMENDATIONS with real fetchJobRecommendations(contractorId)
// 2. Replace MOCK_VENDOR_RECOMMENDATIONS with real fetchRecommendedVendors(agentId)
// 3. Replace MOCK_CONTRACTOR_APPLICATIONS with real fetchAuctionApplications(auctionId)
// 4. Update computeContractorFitScore to use real contractor performance data from Firestore
//
// ================================

// Mock data for AI recommendations across the platform

export const MOCK_RFQ_RECOMMENDATIONS = [
  {
    id: 'rfq_mock_1',
    title: 'Website Redesign Project',
    description: 'Modern, responsive website redesign with e-commerce integration and payment processing capabilities',
    budget: 15000,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'published',
    category: 'Web Development',
    matchScore: 95,
    explanation: 'Perfect match based on your skills and experience',
    matchFactors: {
      skillMatch: 95,
      locationMatch: 90,
      budgetMatch: 85,
      categoryMatch: 95,
      experienceMatch: 90,
    },
  },
  {
    id: 'rfq_mock_2',
    title: 'Mobile App Development',
    description: 'iOS and Android mobile application for real estate management with property listing and booking features',
    budget: 25000,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    status: 'published',
    category: 'Mobile Development',
    matchScore: 88,
    explanation: 'Strong alignment with your mobile development background',
    matchFactors: {
      skillMatch: 90,
      locationMatch: 85,
      budgetMatch: 88,
      categoryMatch: 90,
      experienceMatch: 85,
    },
  },
  {
    id: 'rfq_mock_3',
    title: 'E-Commerce Platform',
    description: 'Full-stack e-commerce platform with inventory management, order processing, and customer analytics dashboard',
    budget: 18000,
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    status: 'published',
    category: 'Full Stack Development',
    matchScore: 82,
    explanation: 'Good fit for your backend and database expertise',
    matchFactors: {
      skillMatch: 85,
      locationMatch: 80,
      budgetMatch: 82,
      categoryMatch: 85,
      experienceMatch: 78,
    },
  },
  {
    id: 'rfq_mock_4',
    title: 'Database Migration Project',
    description: 'Complex database migration from legacy system to modern cloud infrastructure with zero downtime requirement',
    budget: 12000,
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    status: 'published',
    category: 'Database Engineering',
    matchScore: 79,
    explanation: 'Matches your database management experience',
    matchFactors: {
      skillMatch: 88,
      locationMatch: 75,
      budgetMatch: 70,
      categoryMatch: 80,
      experienceMatch: 76,
    },
  },
  {
    id: 'rfq_mock_5',
    title: 'Cloud Infrastructure Setup',
    description: 'AWS and Kubernetes infrastructure setup with auto-scaling, monitoring, and disaster recovery configuration',
    budget: 10000,
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    status: 'published',
    category: 'Infrastructure',
    matchScore: 76,
    explanation: 'Your cloud infrastructure knowledge is valuable here',
    matchFactors: {
      skillMatch: 82,
      locationMatch: 78,
      budgetMatch: 65,
      categoryMatch: 75,
      experienceMatch: 72,
    },
  },
];

export const MOCK_VENDOR_RECOMMENDATIONS = [
  {
    id: 'vendor_mock_1',
    contractor: {
      id: 'contractor_1',
      name: 'BuildRight Construction',
      specialties: ['Commercial Projects', 'Heavy Equipment'],
      credibilityScore: 95,
      completionRate: 98,
      averageRating: 4.8,
      totalProjects: 45,
      yearsInBusiness: 12,
    },
    matchScore: 92,
    explanation: 'Excellent match for your commercial projects',
    matchFactors: {
      specialtyMatch: 95,
      reliabilityMatch: 90,
      pricePointMatch: 85,
      locationMatch: 92,
      experienceMatch: 96,
    },
  },
  {
    id: 'vendor_mock_2',
    contractor: {
      id: 'contractor_2',
      name: 'TechPro Solutions',
      specialties: ['Software Development', 'IT Infrastructure'],
      credibilityScore: 88,
      completionRate: 96,
      averageRating: 4.6,
      totalProjects: 32,
      yearsInBusiness: 8,
    },
    matchScore: 87,
    explanation: 'Strong technical capabilities and on-time delivery',
    matchFactors: {
      specialtyMatch: 92,
      reliabilityMatch: 92,
      pricePointMatch: 78,
      locationMatch: 88,
      experienceMatch: 85,
    },
  },
  {
    id: 'vendor_mock_3',
    contractor: {
      id: 'contractor_3',
      name: 'QuickFix Maintenance',
      specialties: ['General Maintenance', 'HVAC Services'],
      credibilityScore: 82,
      completionRate: 94,
      averageRating: 4.5,
      totalProjects: 58,
      yearsInBusiness: 6,
    },
    matchScore: 81,
    explanation: 'Reliable vendor for maintenance and support services',
    matchFactors: {
      specialtyMatch: 88,
      reliabilityMatch: 88,
      pricePointMatch: 92,
      locationMatch: 85,
      experienceMatch: 72,
    },
  },
  {
    id: 'vendor_mock_4',
    contractor: {
      id: 'contractor_4',
      name: 'DesignStudio Creative',
      specialties: ['Design Services', 'Branding'],
      credibilityScore: 85,
      completionRate: 93,
      averageRating: 4.7,
      totalProjects: 72,
      yearsInBusiness: 10,
    },
    matchScore: 78,
    explanation: 'Creative excellence with consistent project delivery',
    matchFactors: {
      specialtyMatch: 89,
      reliabilityMatch: 85,
      pricePointMatch: 75,
      locationMatch: 80,
      experienceMatch: 78,
    },
  },
  {
    id: 'vendor_mock_5',
    contractor: {
      id: 'contractor_5',
      name: 'SafeGuard Security',
      specialties: ['Security Systems', 'Compliance'],
      credibilityScore: 90,
      completionRate: 97,
      averageRating: 4.9,
      totalProjects: 28,
      yearsInBusiness: 9,
    },
    matchScore: 74,
    explanation: 'Top-tier security expertise with excellent compliance record',
    matchFactors: {
      specialtyMatch: 85,
      reliabilityMatch: 94,
      pricePointMatch: 68,
      locationMatch: 78,
      experienceMatch: 82,
    },
  },
];

export const MOCK_CONTRACTOR_APPLICATIONS = [
  {
    id: 'app_1',
    rfqId: 'rfq_mock_1',
    contractorId: 'contractor_app_1',
    contractor: {
      id: 'contractor_app_1',
      name: 'WebDev Pro Studio',
      credibilityScore: 92,
      completionRate: 96,
      averageRating: 4.8,
      yearsInBusiness: 8,
      totalProjects: 45,
      complianceStatus: 'compliant',
      skillMatch: 95,
    },
    bidAmount: 14500,
    proposedTimeline: 35,
    deliveryHistory: {
      onTimePercentage: 95,
      withinBudgetPercentage: 94,
      qualitySatisfactionScore: 4.8,
    },
    pastPerformance: {
      projectsCompleted: 45,
      averageProjectValue: 12000,
      customerRetentionRate: 88,
    },
  },
  {
    id: 'app_2',
    rfqId: 'rfq_mock_1',
    contractorId: 'contractor_app_2',
    contractor: {
      id: 'contractor_app_2',
      name: 'Creative Dev Agency',
      credibilityScore: 85,
      completionRate: 88,
      averageRating: 4.5,
      yearsInBusiness: 6,
      totalProjects: 32,
      complianceStatus: 'compliant',
      skillMatch: 88,
    },
    bidAmount: 13000,
    proposedTimeline: 40,
    deliveryHistory: {
      onTimePercentage: 88,
      withinBudgetPercentage: 85,
      qualitySatisfactionScore: 4.5,
    },
    pastPerformance: {
      projectsCompleted: 32,
      averageProjectValue: 10000,
      customerRetentionRate: 75,
    },
  },
  {
    id: 'app_3',
    rfqId: 'rfq_mock_1',
    contractorId: 'contractor_app_3',
    contractor: {
      id: 'contractor_app_3',
      name: 'Code Masters Inc',
      credibilityScore: 78,
      completionRate: 82,
      averageRating: 4.2,
      yearsInBusiness: 4,
      totalProjects: 18,
      complianceStatus: 'compliant',
      skillMatch: 82,
    },
    bidAmount: 12000,
    proposedTimeline: 45,
    deliveryHistory: {
      onTimePercentage: 82,
      withinBudgetPercentage: 80,
      qualitySatisfactionScore: 4.2,
    },
    pastPerformance: {
      projectsCompleted: 18,
      averageProjectValue: 9500,
      customerRetentionRate: 65,
    },
  },
  {
    id: 'app_4',
    rfqId: 'rfq_mock_2',
    contractorId: 'contractor_app_4',
    contractor: {
      id: 'contractor_app_4',
      name: 'Mobile Innovators',
      credibilityScore: 89,
      completionRate: 94,
      averageRating: 4.7,
      yearsInBusiness: 7,
      totalProjects: 38,
      complianceStatus: 'compliant',
      skillMatch: 93,
    },
    bidAmount: 24500,
    proposedTimeline: 48,
    deliveryHistory: {
      onTimePercentage: 94,
      withinBudgetPercentage: 92,
      qualitySatisfactionScore: 4.7,
    },
    pastPerformance: {
      projectsCompleted: 38,
      averageProjectValue: 18000,
      customerRetentionRate: 85,
    },
  },
  {
    id: 'app_5',
    rfqId: 'rfq_mock_2',
    contractorId: 'contractor_app_5',
    contractor: {
      id: 'contractor_app_5',
      name: 'App Craft Solutions',
      credibilityScore: 82,
      completionRate: 90,
      averageRating: 4.4,
      yearsInBusiness: 5,
      totalProjects: 25,
      complianceStatus: 'compliant',
      skillMatch: 87,
    },
    bidAmount: 22000,
    proposedTimeline: 52,
    deliveryHistory: {
      onTimePercentage: 90,
      withinBudgetPercentage: 88,
      qualitySatisfactionScore: 4.4,
    },
    pastPerformance: {
      projectsCompleted: 25,
      averageProjectValue: 15000,
      customerRetentionRate: 72,
    },
  },
  {
    id: 'app_6',
    rfqId: 'rfq_mock_3',
    contractorId: 'contractor_app_6',
    contractor: {
      id: 'contractor_app_6',
      name: 'Enterprise Solutions Co',
      credibilityScore: 94,
      completionRate: 97,
      averageRating: 4.9,
      yearsInBusiness: 10,
      totalProjects: 58,
      complianceStatus: 'compliant',
      skillMatch: 91,
    },
    bidAmount: 17500,
    proposedTimeline: 38,
    deliveryHistory: {
      onTimePercentage: 97,
      withinBudgetPercentage: 96,
      qualitySatisfactionScore: 4.9,
    },
    pastPerformance: {
      projectsCompleted: 58,
      averageProjectValue: 16000,
      customerRetentionRate: 92,
    },
  },
];

// Algorithm to compute contractor fit score
export function computeContractorFitScore(
  application: (typeof MOCK_CONTRACTOR_APPLICATIONS)[0],
  rfqBudget: number
): {
  fitScore: number;
  explanation: string;
  factors: Record<string, number>;
} {
  const contractor = application.contractor;
  const bidAmount = application.bidAmount;

  // Weight factors
  const weights = {
    credibilityScore: 0.25,
    bidCompetitiveness: 0.20,
    deliveryHistory: 0.20,
    skillMatch: 0.15,
    complianceStatus: 0.10,
    pastPerformance: 0.10,
  };

  // Calculate individual scores (0-100)
  const credibilityScore = contractor.credibilityScore; // Already 0-100

  // Bid competitiveness (lower is better, but not too low)
  const bidRatio = bidAmount / rfqBudget;
  let bidCompetitivenessScore = 0;
  if (bidRatio < 0.8) {
    bidCompetitivenessScore = Math.max(0, 80 - (0.8 - bidRatio) * 200); // Penalize very low bids
  } else if (bidRatio <= 1.0) {
    bidCompetitivenessScore = 100; // Perfect bid
  } else {
    bidCompetitivenessScore = Math.max(0, 100 - (bidRatio - 1.0) * 50); // Penalize high bids
  }

  // Delivery history
  const deliveryHistoryScore =
    (application.deliveryHistory.onTimePercentage +
      application.deliveryHistory.withinBudgetPercentage +
      application.deliveryHistory.qualitySatisfactionScore * 20) /
    3;

  // Skill match
  const skillMatchScore = contractor.skillMatch;

  // Compliance status (binary to score)
  const complianceStatusScore = contractor.complianceStatus === 'compliant' ? 100 : 50;

  // Past performance composite
  const pastPerformanceScore =
    (contractor.completionRate +
      (contractor.averageRating / 5) * 100 +
      contractor.yearsInBusiness * 8) /
    3;

  // Calculate weighted fit score
  const fitScore = Math.round(
    credibilityScore * weights.credibilityScore +
      bidCompetitivenessScore * weights.bidCompetitiveness +
      deliveryHistoryScore * weights.deliveryHistory +
      skillMatchScore * weights.skillMatch +
      complianceStatusScore * weights.complianceStatus +
      Math.min(pastPerformanceScore, 100) * weights.pastPerformance
  );

  // Generate explanation based on scores
  const factors = {
    credibility: credibilityScore,
    bidCompetitiveness: Math.round(bidCompetitivenessScore),
    deliveryHistory: Math.round(deliveryHistoryScore),
    skillMatch: skillMatchScore,
    compliance: complianceStatusScore,
    pastPerformance: Math.round(Math.min(pastPerformanceScore, 100)),
  };

  const explanations: string[] = [];
  if (credibilityScore >= 90) explanations.push('High credibility score');
  if (bidCompetitivenessScore >= 90) explanations.push('competitive bid');
  if (deliveryHistoryScore >= 90) explanations.push('strong delivery history');
  if (skillMatchScore >= 90) explanations.push('excellent skill match');
  if (contractor.completionRate >= 95) explanations.push('outstanding project completion rate');

  const explanation =
    explanations.length > 0
      ? explanations.join(', ').charAt(0).toUpperCase() + explanations.join(', ').slice(1) + '.'
      : 'Solid overall profile with balanced strengths.';

  return { fitScore, explanation, factors };
}
