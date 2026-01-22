"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  ArrowRight,
  FileText,
  Hammer,
  DollarSign,
  Star,
  Activity,
  Loader2,
  Plus,
  Briefcase,
  Sparkles,
  Zap,
  ArrowUpRight,
  Circle,
  Target,
  Award,
  Rocket,
  Eye,
  Send,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ContractorGuard } from "@/components/contractor/contractor-guard";
import { useAuth } from "@/lib/auth-context";
import { fetchEligibleRFQs, fetchContractorProjects, fetchContractorAuctions, fetchContractorInvoices } from "@/lib/contractor-api";
import { MOCK_RFQ_RECOMMENDATIONS } from "@/lib/mock-recommendation-data";

function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingRFQs: 0,
    activeProjects: 0,
    activeAuctions: 0,
    pendingInvoices: 0,
    credibilityScore: 85,
  });
  const [data, setData] = useState<any>({ rfqs: [], projects: [], auctions: [], invoices: [] });
  const [loading, setLoading] = useState(true);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);

  useEffect(() => {
    const formattedRecommendations = MOCK_RFQ_RECOMMENDATIONS.map((rec) => ({
      id: rec.id,
      rfq: {
        id: rec.id,
        title: rec.title,
        description: rec.description,
        budget: rec.budget,
        deadline: rec.deadline,
        status: rec.status,
      },
      matchScore: rec.matchScore,
      explanation: rec.explanation,
      matchFactors: rec.matchFactors,
    }));

    setRecommendedJobs(formattedRecommendations);
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.uid) return;
      try {
        const [rfqs, projects, auctions, invoices] = await Promise.all([
          fetchEligibleRFQs(user.uid),
          fetchContractorProjects(user.uid),
          fetchContractorAuctions(user.uid),
          fetchContractorInvoices(user.uid),
        ]);

        setData({ rfqs, projects, auctions, invoices });
        setStats({
          pendingRFQs: rfqs.length,
          activeProjects: projects.filter((p: any) => p.status === "active" || p.status === "in-progress").length,
          activeAuctions: auctions.filter((a: any) => a.status === "active").length,
          pendingInvoices: invoices.filter((i: any) => i.status === "submitted" || i.status === "approved").length,
          credibilityScore: 85,
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  const { rfqs, projects, auctions, invoices } = data;
  const pendingInvoices = invoices.filter((i: any) => i.status === "submitted" || i.status === "approved");
  const paidInvoices = invoices.filter((i: any) => i.status === "paid");
  const activeProjects = projects.filter((p: any) => p.status === "in-progress" || p.status === "active");

  if (loading) {
    return (
      <div className="min-h-screen contractor-zone flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="text-slate-600 text-sm font-medium">Loading Task Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen contractor-zone">
      {/* Floating Action Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Task Hub</h1>
                <p className="text-sm text-slate-500">Welcome, {user?.email?.split("@")[0]}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Credibility Score Pill */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-full">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-amber-700">{stats.credibilityScore}</span>
                <span className="text-xs text-amber-600">Score</span>
              </div>
              <Link href="/contractor/invoices/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 gap-2 shadow-lg shadow-emerald-500/25">
                  <Plus className="h-4 w-4" />
                  New Invoice
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* SECTION 1: Quick Stats Strip */}
        <section className="mb-10">
          <div className="flex flex-wrap gap-3">
            <Link href="/contractor/rfqs" className="flex-1 min-w-[200px]">
              <div className="contractor-card-action p-5 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{stats.pendingRFQs}</p>
                      <p className="text-sm text-slate-500">Open RFQs</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </Link>

            <Link href="/contractor/projects" className="flex-1 min-w-[200px]">
              <div className="contractor-card-action p-5 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <Briefcase className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{stats.activeProjects}</p>
                      <p className="text-sm text-slate-500">Active Projects</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>
            </Link>

            <Link href="/contractor/auctions" className="flex-1 min-w-[200px]">
              <div className="contractor-card-action p-5 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Hammer className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{stats.activeAuctions}</p>
                      <p className="text-sm text-slate-500">Live Auctions</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
                </div>
              </div>
            </Link>

            <Link href="/contractor/invoices" className="flex-1 min-w-[200px]">
              <div className="contractor-card-action p-5 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <DollarSign className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{stats.pendingInvoices}</p>
                      <p className="text-sm text-slate-500">Pending Pay</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* SECTION 2: Quick Actions - Large Touch Targets */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <Zap className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/contractor/rfqs">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-1 transition-all cursor-pointer">
                <Eye className="h-8 w-8 mb-4 opacity-90" />
                <h3 className="font-bold text-lg mb-1">Browse RFQs</h3>
                <p className="text-blue-100 text-sm">Find new work</p>
              </div>
            </Link>

            <Link href="/contractor/auctions">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-1 transition-all cursor-pointer">
                <Hammer className="h-8 w-8 mb-4 opacity-90" />
                <h3 className="font-bold text-lg mb-1">Place Bid</h3>
                <p className="text-purple-100 text-sm">Win auctions</p>
              </div>
            </Link>

            <Link href="/contractor/invoices/new">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-1 transition-all cursor-pointer">
                <Send className="h-8 w-8 mb-4 opacity-90" />
                <h3 className="font-bold text-lg mb-1">Send Invoice</h3>
                <p className="text-emerald-100 text-sm">Get paid faster</p>
              </div>
            </Link>

            <Link href="/contractor/credibility">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 text-white hover:shadow-xl hover:shadow-amber-500/25 hover:-translate-y-1 transition-all cursor-pointer">
                <Award className="h-8 w-8 mb-4 opacity-90" />
                <h3 className="font-bold text-lg mb-1">My Profile</h3>
                <p className="text-amber-100 text-sm">Build credibility</p>
              </div>
            </Link>
          </div>
        </section>

        {/* SECTION 3: AI Recommended Jobs - Card Stack */}
        {recommendedJobs.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Recommended for You</h2>
                <Badge className="bg-purple-100 text-purple-700 border-0">AI Match</Badge>
              </div>
              <Link href="/contractor/rfqs">
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {recommendedJobs.slice(0, 3).map((recommendation: any, index: number) => (
                <Link key={recommendation.id} href={`/contractor/rfqs/${recommendation.rfq.id}`}>
                  <div className={`contractor-card p-0 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer ${
                    index === 0 ? 'ring-2 ring-purple-200' : ''
                  }`}>
                    {/* Match Score Bar */}
                    <div className="h-1.5 bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${recommendation.matchScore}%` }}></div>
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900 hover:text-purple-600 transition-colors">
                              {recommendation.rfq.title}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                              {recommendation.matchScore}% Match
                            </span>
                          </div>
                          
                          <p className="text-sm text-slate-500 line-clamp-1 mb-3">{recommendation.rfq.description}</p>
                          
                          {/* Match Factors Pills */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {recommendation.matchFactors.skillMatch >= 70 && (
                              <span className="status-chip status-chip-info">
                                <CheckCircle className="h-3 w-3" />
                                Skills Match
                              </span>
                            )}
                            {recommendation.matchFactors.budgetMatch >= 70 && (
                              <span className="status-chip status-chip-success">
                                <DollarSign className="h-3 w-3" />
                                Budget Fit
                              </span>
                            )}
                            {recommendation.matchFactors.locationMatch >= 70 && (
                              <span className="status-chip status-chip-warning">
                                <Target className="h-3 w-3" />
                                Location
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(recommendation.rfq.deadline).toLocaleDateString()}
                            </span>
                            {recommendation.rfq.budget && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${recommendation.rfq.budget.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: Active Work - Timeline Style */}
        <section className="mb-10">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Active Projects - Timeline */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Active Projects</h2>
                </div>
                <Link href="/contractor/projects">
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {activeProjects.length === 0 ? (
                <div className="contractor-card border-dashed border-2 p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 mb-2 font-medium">No active projects</p>
                  <p className="text-sm text-slate-400">Browse RFQs to find new work</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeProjects.slice(0, 3).map((project: any) => {
                    const completedMilestones = project.milestones?.filter((m: any) => m.status === "completed").length ?? 0;
                    const totalMilestones = project.milestones?.length ?? 1;
                    const progress = Math.round((completedMilestones / totalMilestones) * 100);

                    return (
                      <Link key={project.id} href={`/contractor/projects/${project.id}`}>
                        <div className="contractor-card p-4 hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors">{project.projectName}</h3>
                            <span className="text-sm font-bold text-emerald-600">{progress}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>{completedMilestones} of {totalMilestones} milestones</span>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent RFQs - Simple List */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Recent RFQs</h2>
                </div>
                <Link href="/contractor/rfqs">
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {rfqs.length === 0 ? (
                <div className="contractor-card border-dashed border-2 p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 mb-2 font-medium">No RFQs available</p>
                  <p className="text-sm text-slate-400">Check back soon for new opportunities</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rfqs.slice(0, 3).map((rfq: any) => (
                    <Link key={rfq.id} href={`/contractor/rfqs/${rfq.id}`}>
                      <div className="contractor-card p-4 hover:shadow-md transition-all cursor-pointer">
                        <h3 className="font-semibold text-slate-900 hover:text-blue-600 transition-colors mb-2">{rfq.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-1 mb-3">{rfq.description}</p>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(rfq.deadline).toLocaleDateString()}
                            </span>
                            <span className="status-chip status-chip-info text-[10px] py-0.5">{rfq.status}</span>
                          </div>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 5: Invoice & Auction Summary - Compact Cards */}
        <section>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Invoice Summary */}
            <div className="contractor-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Invoice Summary</h2>
                </div>
                <Link href="/contractor/invoices" className="text-blue-600 text-sm font-medium hover:underline">
                  View all
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <FileText className="h-5 w-5 text-slate-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{invoices.filter((i: any) => i.status === "draft").length}</p>
                  <p className="text-xs text-slate-500 mt-1">Draft</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 text-center">
                  <Clock className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-600">{pendingInvoices.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Pending</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-600">{paidInvoices.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Paid</p>
                </div>
              </div>
            </div>

            {/* Active Auctions */}
            <div className="contractor-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Hammer className="h-4 w-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Live Auctions</h2>
                </div>
                <Link href="/contractor/auctions" className="text-blue-600 text-sm font-medium hover:underline">
                  View all
                </Link>
              </div>
              
              {auctions.filter((a: any) => a.status === "active").length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-6 text-center">
                  <Hammer className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No active auctions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auctions.filter((a: any) => a.status === "active").slice(0, 2).map((auction: any) => (
                    <Link key={auction.id} href={`/contractor/auctions/${auction.id}`}>
                      <div className="bg-gradient-to-r from-purple-50 to-slate-50 rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">Auction {auction.id.slice(0, 8)}</h3>
                            <p className="text-xs text-slate-500 mt-1">Project: {auction.projectId.slice(0, 12)}...</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="status-chip bg-purple-100 text-purple-700 border-purple-200">
                              <Circle className="h-2 w-2 fill-current animate-pulse" />
                              Live
                            </span>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ContractorDashboardPage() {
  return (
    <ContractorGuard>
      <DashboardContent />
    </ContractorGuard>
  );
}
