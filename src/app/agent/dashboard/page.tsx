'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgentGuard } from '@/components/agent/agent-guard';
import { useAuth } from '@/lib/auth-context';
import { fetchProjects, fetchRFQs, fetchAuctions, fetchInvoices } from '@/lib/agent-api';
import {
  Briefcase,
  FileText,
  Gavel,
  Users,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  ArrowRight,
  Plus,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Project, RFQ, Auction, Invoice } from '@/lib/types';
import { MOCK_CONTRACTOR_APPLICATIONS, MOCK_RFQ_RECOMMENDATIONS, computeContractorFitScore } from '@/lib/mock-recommendation-data';

function DashboardContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allContractors, setAllContractors] = useState<any[]>([]);
  const [selectedRFQId, setSelectedRFQId] = useState<string>('all');
  const [recommendedContractors, setRecommendedContractors] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const [projectsData, rfqsData, auctionsData, invoicesData] = await Promise.all([
          fetchProjects(user.uid),
          fetchRFQs(user.uid),
          fetchAuctions(user.uid),
          fetchInvoices(user.uid),
        ]);

        setProjects(projectsData);
        setRFQs(rfqsData);
        setAuctions(auctionsData);
        setInvoices(invoicesData);

        // Compute contractor fit scores for all applications with RFQ details
        const allScoredApplications = MOCK_CONTRACTOR_APPLICATIONS.map((app) => {
          const mockRfq = MOCK_RFQ_RECOMMENDATIONS.find((r) => r.id === app.rfqId) || MOCK_RFQ_RECOMMENDATIONS[0];
          const { fitScore, explanation, factors } = computeContractorFitScore(app, mockRfq.budget);
          return {
            ...app,
            fitScore,
            explanation,
            factors,
            rfqInfo: {
              id: mockRfq.id,
              title: mockRfq.title,
              projectName: 'General Project'
            }
          };
        }).sort((a, b) => b.fitScore - a.fitScore);

        setAllContractors(allScoredApplications);
        
        // Set initial selected RFQ to first one with applications
        if (allScoredApplications.length > 0) {
          const firstRfqId = allScoredApplications[0].rfqId;
          setSelectedRFQId(firstRfqId);
          const filtered = allScoredApplications.filter(app => app.rfqId === firstRfqId).slice(0, 3);
          setRecommendedContractors(filtered);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  // Filter contractors when RFQ selection changes
  useEffect(() => {
    if (selectedRFQId === 'all') {
      setRecommendedContractors(allContractors.slice(0, 3));
    } else {
      const filtered = allContractors.filter(app => app.rfqId === selectedRFQId).slice(0, 3);
      setRecommendedContractors(filtered);
    }
  }, [selectedRFQId, allContractors]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Error Loading Dashboard</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeRFQs = rfqs.filter(r => r.status === 'published');
  const activeProjects = projects.filter(p => p.status === 'in-progress' || p.status === 'active');
  const pendingInvoices = invoices.filter(i => i.status === 'submitted');
  const approvedInvoices = invoices.filter(i => i.status === 'approved');
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const activeAuctions = auctions.filter(a => a.status === 'live');

  const quickActions = [
    { icon: FileText, label: 'Browse RFQs', href: '/agent/rfq', count: activeRFQs.length, color: 'blue' },
    { icon: Briefcase, label: 'My Projects', href: '/agent/projects', count: activeProjects.length, color: 'green' },
    { icon: Gavel, label: 'Auctions', href: '/agent/auctions', count: activeAuctions.length, color: 'purple' },
    { icon: Users, label: 'Vendors', href: '/agent/vendors', count: 0, color: 'orange' },
  ];

  const totalOutstanding = invoices
    .filter(i => i.status !== 'paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split("@")[0]}!
          </h1>
          <p className="text-gray-600 text-lg">Here's an overview of your procurement management</p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Active RFQs */}
        <Card className="hover:shadow-lg transition-shadow border-0">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active RFQs</p>
                <p className="text-4xl font-bold text-gray-900">{activeRFQs.length}</p>
                <p className="text-xs text-gray-500 mt-2">Published & awaiting responses</p>
              </div>
              <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                <FileText className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="hover:shadow-lg transition-shadow border-0">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Projects</p>
                <p className="text-4xl font-bold text-gray-900">{activeProjects.length}</p>
                <p className="text-xs text-gray-500 mt-2">In progress</p>
              </div>
              <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                <Briefcase className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Auctions */}
        <Card className="hover:shadow-lg transition-shadow border-0">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Auctions</p>
                <p className="text-4xl font-bold text-gray-900">{activeAuctions.length}</p>
                <p className="text-xs text-gray-500 mt-2">Live bidding</p>
              </div>
              <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                <Gavel className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card className="hover:shadow-lg transition-shadow border-0">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Invoices</p>
                <p className="text-4xl font-bold text-gray-900">{pendingInvoices.length}</p>
                <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
              </div>
              <div className="h-14 w-14 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                <DollarSign className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <Card className="border hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      action.color === 'green' ? 'bg-green-100 text-green-600' :
                      action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{action.label}</h3>
                    <div className="flex items-center justify-center gap-1 mt-2 text-gray-500">
                      <span className="text-xs">Go</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* AI-Recommended Contractors */}
      {allContractors.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Top Applicants for Your RFQs</h2>
              <Badge variant="secondary" className="bg-green-100 text-green-700">AI Ranked</Badge>
            </div>
            <select
              value={selectedRFQId}
              onChange={(e) => setSelectedRFQId(e.target.value)}
              className="h-10 pl-4 pr-6 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-800 text-center [text-align-last:center] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50"
            >
              <option value="all">All RFQs</option>
              {Array.from(new Set(allContractors.map(c => c.rfqId))).map(rfqId => {
                const rfqInfo = allContractors.find(c => c.rfqId === rfqId)?.rfqInfo;
                return (
                  <option key={rfqId} value={rfqId}>
                    {rfqInfo?.title || rfqId}
                  </option>
                );
              })}
            </select>
          </div>
          <p className="text-gray-600 mb-4">Ranked by fit score based on credibility, bid competitiveness, and delivery history</p>
          
          <div className="grid gap-4">
            {recommendedContractors.map((recommendation: any, index: number) => (
              <Card
                key={recommendation.id}
                className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/30 to-transparent"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600 font-bold text-sm">
                            #{index + 1}
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {recommendation.contractor.name}
                        </h3>
                        <Badge className="bg-green-600">
                          {recommendation.fitScore}% Fit
                        </Badge>
                      </div>

                      {/* RFQ Information */}
                      <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center gap-2 text-xs">
                          <FileText className="h-3 w-3 text-blue-600" />
                          <span className="font-medium text-blue-900">{recommendation.rfqInfo.title}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{recommendation.rfqInfo.projectName}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">ID: {recommendation.rfqInfo.id}</span>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="flex gap-4 mb-3 text-sm">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          Bid: ${recommendation.bidAmount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {recommendation.contractor.completionRate}% completion
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          Rating: {recommendation.contractor.averageRating}/5
                        </span>
                      </div>

                      {/* Explanation */}
                      <p className="text-sm text-gray-700 mb-3 font-medium text-green-700">
                        ✓ {recommendation.explanation}
                      </p>

                      {/* Fit Score Factors */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600">Credibility</div>
                          <div className="text-lg font-bold text-purple-600">{recommendation.factors.credibility}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600">Bid Fit</div>
                          <div className="text-lg font-bold text-blue-600">{recommendation.factors.bidCompetitiveness}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600">Delivery</div>
                          <div className="text-lg font-bold text-green-600">{recommendation.factors.deliveryHistory}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600">Skills</div>
                          <div className="text-lg font-bold text-yellow-600">{recommendation.factors.skillMatch}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600">Compliance</div>
                          <div className="text-lg font-bold text-emerald-600">{recommendation.factors.compliance}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600">Experience</div>
                          <div className="text-lg font-bold text-indigo-600">{recommendation.factors.pastPerformance}%</div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-xs text-gray-600">
                          {recommendation.contractor.totalProjects} projects completed • {recommendation.contractor.yearsInBusiness} years in business • {recommendation.deliveryHistory.onTimePercentage}% on-time delivery
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent RFQs Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent RFQs</h2>
          <Link href="/agent/rfq">
            <Button variant="outline" size="sm">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {rfqs.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">No RFQs published</p>
              <p className="text-gray-500 text-sm mt-1">Create RFQs to request quotations from vendors</p>
              <Link href="/agent/rfq/new">
                <Button className="mt-4" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create RFQ
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rfqs.slice(0, 3).map((rfq) => (
              <Link key={rfq.id} href={`/agent/rfq/${rfq.id}`}>
                <Card className="hover:shadow-md transition-shadow border-0 cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{rfq.title}</h3>
                          <Badge variant={rfq.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                            {rfq.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">{rfq.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(rfq.deadline).toLocaleDateString()}
                          </span>
                          {rfq.budget && (
                            <span>${rfq.budget.toLocaleString()}</span>
                          )}
                          <Badge variant="outline" className="text-xs">{rfq.responses?.length || 0} responses</Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout: Projects & Invoices */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Active Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Active Projects</h2>
            <Link href="/agent/projects">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Briefcase className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium text-sm">No projects yet</p>
                <Link href="/agent/projects/new">
                  <Button className="mt-3" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeProjects.slice(0, 4).map((project) => (
                <Link key={project.id} href={`/agent/projects/${project.id}`}>
                  <Card className="hover:shadow-md transition-shadow border-0 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{project.name}</h3>
                          <p className="text-xs text-gray-600 mt-1">{project.siteDetails?.location}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{project.status}</Badge>
                            <span className="text-xs text-gray-500">{project.milestones?.length || 0} milestones</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Summary */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Invoice Summary</h2>
            <Link href="/agent/invoices">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Pending Approval</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{pendingInvoices.length}</p>
                    <p className="text-xs text-blue-600 mt-1">Needs review</p>
                  </div>
                  <Clock className="h-12 w-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 font-medium">Approved</p>
                    <p className="text-3xl font-bold text-purple-900 mt-1">{approvedInvoices.length}</p>
                    <p className="text-xs text-purple-600 mt-1">Ready for payment</p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Paid</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">{paidInvoices.length}</p>
                    <p className="text-xs text-green-600 mt-1">${(paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / 100).toLocaleString()} total</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <Card className="border-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              {activeProjects.length > 0 && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{activeProjects.length} project{activeProjects.length !== 1 ? 's' : ''} in progress</p>
                    <p className="text-xs text-gray-600 mt-1">Monitor milestones and contractor progress</p>
                  </div>
                </div>
              )}
              {pendingInvoices.length > 0 && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{pendingInvoices.length} invoice{pendingInvoices.length !== 1 ? 's' : ''} pending approval</p>
                    <p className="text-xs text-gray-600 mt-1">Review and approve contractor invoices</p>
                  </div>
                </div>
              )}
              {activeRFQs.length > 0 && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{activeRFQs.length} active RFQ{activeRFQs.length !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-gray-600 mt-1">Awaiting vendor responses and quotations</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </main>
    </div>
  );
}

export default function AgentDashboardPage() {
  return (
    <AgentGuard>
      <DashboardContent />
    </AgentGuard>
  );
}
