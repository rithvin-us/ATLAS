'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Activity,
  Target,
  Zap,
  BarChart3,
  Bell,
  Settings,
  Search,
  ExternalLink,
  PieChart,
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
      <div className="min-h-screen contractor-zone flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="text-slate-600 text-sm font-medium">Loading Control Center...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen contractor-zone p-8">
        <div className="max-w-2xl mx-auto">
          <div className="contractor-card p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">System Error</h3>
                <p className="text-slate-500 text-sm mt-1">{error}</p>
                <Button className="mt-4 bg-red-500 hover:bg-red-600" size="sm">
                  Retry Connection
                </Button>
              </div>
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

  return (
    <div className="min-h-screen contractor-zone">
      {/* Top Command Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Control Center</h1>
                  <p className="text-xs text-slate-500">Agent Dashboard</p>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <span className="status-chip status-chip-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  System Online
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search everything..." 
                  className="w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="contractor-card p-8 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium mb-2">Welcome back</p>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {user?.email?.split("@")[0]}
              </h2>
              <p className="text-slate-500">Your procurement operations at a glance</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/agent/rfq/new">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-500/25">
                  <Plus className="h-4 w-4" />
                  New RFQ
                </Button>
              </Link>
              <Link href="/agent/projects/new">
                <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-2">
                  <Briefcase className="h-4 w-4" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION 1: Overview Metrics */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Overview</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active RFQs */}
            <div className="contractor-card p-6 group hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <Link href="/agent/rfq" className="text-slate-400 hover:text-blue-600 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              <p className="metric-label text-slate-500">Active RFQs</p>
              <p className="metric-value text-slate-900">{activeRFQs.length}</p>
              <p className="text-xs text-slate-500 mt-2">Awaiting responses</p>
            </div>

            {/* Active Projects */}
            <div className="contractor-card p-6 group hover:border-emerald-300 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <Briefcase className="h-6 w-6 text-emerald-600" />
                </div>
                <Link href="/agent/projects" className="text-slate-400 hover:text-emerald-600 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              <p className="metric-label text-slate-500">Active Projects</p>
              <p className="metric-value text-slate-900">{activeProjects.length}</p>
              <p className="text-xs text-slate-500 mt-2">In progress</p>
            </div>

            {/* Live Auctions */}
            <div className="contractor-card p-6 group hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Gavel className="h-6 w-6 text-purple-600" />
                </div>
                <Link href="/agent/auctions" className="text-slate-400 hover:text-purple-600 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              <p className="metric-label text-slate-500">Live Auctions</p>
              <p className="metric-value text-slate-900">{activeAuctions.length}</p>
              <p className="text-xs text-slate-500 mt-2">Bidding active</p>
            </div>

            {/* Pending Invoices */}
            <div className="contractor-card p-6 group hover:border-amber-300 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <DollarSign className="h-6 w-6 text-amber-600" />
                </div>
                <Link href="/agent/invoices" className="text-slate-400 hover:text-amber-600 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              <p className="metric-label text-slate-500">Pending Invoices</p>
              <p className="metric-value text-slate-900">{pendingInvoices.length}</p>
              <p className="text-xs text-slate-500 mt-2">Needs approval</p>
            </div>
          </div>
        </section>

        {/* SECTION 2: Active Items - AI Recommendations */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">AI-Ranked Applicants</h2>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Smart Selection</Badge>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
            <select
              value={selectedRFQId}
              onChange={(e) => setSelectedRFQId(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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

          {recommendedContractors.length > 0 ? (
            <div className="space-y-4">
              {recommendedContractors.map((rec: any, index: number) => (
                <div
                  key={rec.id}
                  className="contractor-card p-6 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-start gap-6">
                    {/* Rank Badge */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-500/25' :
                      index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 shadow-slate-400/25' :
                      'bg-gradient-to-br from-amber-600 to-amber-700 shadow-amber-600/25'
                    }`}>
                      <span className="text-xl font-bold text-white">#{index + 1}</span>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {rec.contractor.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {rec.rfqInfo.title}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">{rec.fitScore}%</p>
                            <p className="text-xs text-slate-500">Fit Score</p>
                          </div>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-6 gap-3 mb-4">
                        <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
                          <p className="text-lg font-bold text-purple-600">{rec.factors.credibility}%</p>
                          <p className="text-[10px] text-slate-500 uppercase">Credibility</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                          <p className="text-lg font-bold text-blue-600">{rec.factors.bidCompetitiveness}%</p>
                          <p className="text-[10px] text-slate-500 uppercase">Bid Fit</p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
                          <p className="text-lg font-bold text-emerald-600">{rec.factors.deliveryHistory}%</p>
                          <p className="text-[10px] text-slate-500 uppercase">Delivery</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
                          <p className="text-lg font-bold text-amber-600">{rec.factors.skillMatch}%</p>
                          <p className="text-[10px] text-slate-500 uppercase">Skills</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-3 text-center border border-teal-100">
                          <p className="text-lg font-bold text-teal-600">{rec.factors.compliance}%</p>
                          <p className="text-[10px] text-slate-500 uppercase">Compliance</p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-100">
                          <p className="text-lg font-bold text-indigo-600">{rec.factors.pastPerformance}%</p>
                          <p className="text-[10px] text-slate-500 uppercase">Experience</p>
                        </div>
                      </div>

                      {/* Bottom Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            Bid: ${rec.bidAmount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            {rec.contractor.completionRate}% completion
                          </span>
                          <span className="flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            {rec.contractor.averageRating}/5 rating
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="contractor-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500">No applicants to display</p>
            </div>
          )}
        </section>

        {/* SECTION 3: Quick Actions Grid */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/agent/rfq" className="group">
              <div className="contractor-card p-6 text-center hover:bg-blue-50 transition-all hover:border-blue-300">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-200 group-hover:scale-110 transition-all">
                  <FileText className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Browse RFQs</h3>
                <p className="text-xs text-slate-500">{activeRFQs.length} active</p>
              </div>
            </Link>

            <Link href="/agent/projects" className="group">
              <div className="contractor-card p-6 text-center hover:bg-emerald-50 transition-all hover:border-emerald-300">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 mx-auto mb-4 flex items-center justify-center group-hover:bg-emerald-200 group-hover:scale-110 transition-all">
                  <Briefcase className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">My Projects</h3>
                <p className="text-xs text-slate-500">{activeProjects.length} active</p>
              </div>
            </Link>

            <Link href="/agent/auctions" className="group">
              <div className="contractor-card p-6 text-center hover:bg-purple-50 transition-all hover:border-purple-300">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 mx-auto mb-4 flex items-center justify-center group-hover:bg-purple-200 group-hover:scale-110 transition-all">
                  <Gavel className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Auctions</h3>
                <p className="text-xs text-slate-500">{activeAuctions.length} live</p>
              </div>
            </Link>

            <Link href="/agent/vendors" className="group">
              <div className="contractor-card p-6 text-center hover:bg-amber-50 transition-all hover:border-amber-300">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 mx-auto mb-4 flex items-center justify-center group-hover:bg-amber-200 group-hover:scale-110 transition-all">
                  <Users className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Vendors</h3>
                <p className="text-xs text-slate-500">Manage vendors</p>
              </div>
            </Link>
          </div>
        </section>

        {/* SECTION 4: Two Column - RFQs & Projects */}
        <section className="mb-12">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent RFQs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Recent RFQs</h2>
                </div>
                <Link href="/agent/rfq">
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {rfqs.length === 0 ? (
                <div className="contractor-card border-dashed border-2 border-slate-200 p-8 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No RFQs published yet</p>
                  <Link href="/agent/rfq/new">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500">
                      <Plus className="h-4 w-4 mr-2" />
                      Create RFQ
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {rfqs.slice(0, 3).map((rfq) => (
                    <Link key={rfq.id} href={`/agent/rfq/${rfq.id}`}>
                      <div className="contractor-card p-4 hover:bg-slate-50 transition-all group cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">{rfq.title}</h3>
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] ${rfq.status === 'published' ? 'border-emerald-300 text-emerald-600 bg-emerald-50' : 'border-slate-200 text-slate-500'}`}
                              >
                                {rfq.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-1">{rfq.description}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(rfq.deadline).toLocaleDateString()}
                              </span>
                              {rfq.budget && (
                                <span className="text-xs text-slate-500">
                                  ${rfq.budget.toLocaleString()}
                                </span>
                              )}
                              <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500">
                                {rfq.responses?.length || 0} responses
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Active Projects */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Active Projects</h2>
                </div>
                <Link href="/agent/projects">
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {projects.length === 0 ? (
                <div className="contractor-card border-dashed border-2 border-slate-200 p-8 text-center">
                  <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No projects yet</p>
                  <Link href="/agent/projects/new">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeProjects.slice(0, 4).map((project) => (
                    <Link key={project.id} href={`/agent/projects/${project.id}`}>
                      <div className="contractor-card p-4 hover:bg-slate-50 transition-all group cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{project.name}</h3>
                            <p className="text-xs text-slate-500 mt-1">{project.siteDetails?.location}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-600 bg-emerald-50">
                                {project.status}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {project.milestones?.length || 0} milestones
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-600 transition-colors flex-shrink-0 ml-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 5: Insights - Invoice Summary + Activity */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <PieChart className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Insights</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Invoice Summary Cards */}
            <div className="contractor-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-slate-900">Invoice Pipeline</h3>
                <Link href="/agent/invoices" className="text-blue-600 text-sm hover:underline">View all</Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-slate-700">Pending</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{pendingInvoices.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-slate-700">Approved</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">{approvedInvoices.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm text-slate-700">Paid</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-600">{paidInvoices.length}</span>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="lg:col-span-2 contractor-card p-6">
              <h3 className="font-medium text-slate-900 mb-4">Recent Activity</h3>
              <div className="space-y-1">
                {activeProjects.length > 0 && (
                  <div className="timeline-item">
                    <div className="timeline-dot bg-blue-500"></div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{activeProjects.length} project{activeProjects.length !== 1 ? 's' : ''} in progress</p>
                        <p className="text-xs text-slate-500 mt-1">Monitor milestones and contractor progress</p>
                      </div>
                    </div>
                  </div>
                )}
                {pendingInvoices.length > 0 && (
                  <div className="timeline-item">
                    <div className="timeline-dot bg-amber-500"></div>
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{pendingInvoices.length} invoice{pendingInvoices.length !== 1 ? 's' : ''} pending approval</p>
                        <p className="text-xs text-slate-500 mt-1">Review and approve contractor invoices</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeRFQs.length > 0 && (
                  <div className="timeline-item">
                    <div className="timeline-dot bg-purple-500"></div>
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <FileText className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{activeRFQs.length} active RFQ{activeRFQs.length !== 1 ? 's' : ''}</p>
                        <p className="text-xs text-slate-500 mt-1">Awaiting vendor responses and quotations</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeProjects.length === 0 && pendingInvoices.length === 0 && activeRFQs.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
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
