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
  MessageSquare,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    // Use centralized mock recommendations
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split("@")[0]}! 
          </h1>
          <p className="text-gray-600 text-lg">Here's what's happening with your opportunities</p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Pending RFQs */}
          <Card className="hover:shadow-lg transition-shadow border-0">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending RFQs</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.pendingRFQs}</p>
                  <p className="text-xs text-gray-500 mt-2">Awaiting your response</p>
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
                  <p className="text-4xl font-bold text-gray-900">{stats.activeProjects}</p>
                  <p className="text-xs text-gray-500 mt-2">In progress</p>
                </div>
                <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                  <TrendingUp className="h-7 w-7" />
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
                  <p className="text-4xl font-bold text-gray-900">{stats.activeAuctions}</p>
                  <p className="text-xs text-gray-500 mt-2">Place your bid</p>
                </div>
                <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                  <Hammer className="h-7 w-7" />
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
                  <p className="text-4xl font-bold text-gray-900">{stats.pendingInvoices}</p>
                  <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
                </div>
                <div className="h-14 w-14 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                  <DollarSign className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credibility Score Card */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                <div>
                  <CardTitle>Your Credibility Score</CardTitle>
                  <CardDescription>Build trust with agents and win more projects</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-blue-600">{stats.credibilityScore}</p>
                <p className="text-sm text-gray-600 mt-1">/ 100</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                  style={{ width: `${stats.credibilityScore}%` }}
                ></div>
              </div>
              <Link href="/contractor/credibility">
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/contractor/rfqs">
              <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer h-full">
                <FileText className="h-8 w-8 text-blue-600 mb-3" />
                <p className="font-semibold text-gray-900 mb-1">Browse RFQs</p>
                <p className="text-sm text-gray-600">Find new opportunities</p>
              </div>
            </Link>

            <Link href="/contractor/auctions">
              <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer h-full">
                <Hammer className="h-8 w-8 text-purple-600 mb-3" />
                <p className="font-semibold text-gray-900 mb-1">Place a Bid</p>
                <p className="text-sm text-gray-600">Participate in auctions</p>
              </div>
            </Link>

            <Link href="/contractor/invoices/new">
              <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer h-full">
                <DollarSign className="h-8 w-8 text-green-600 mb-3" />
                <p className="font-semibold text-gray-900 mb-1">Create Invoice</p>
                <p className="text-sm text-gray-600">Submit payment request</p>
              </div>
            </Link>

            <Link href="/contractor/credibility">
              <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer h-full">
                <Star className="h-8 w-8 text-amber-600 mb-3" />
                <p className="font-semibold text-gray-900 mb-1">View Profile</p>
                <p className="text-sm text-gray-600">Check your credibility</p>
              </div>
            </Link>
          </div>
        </div>

        {/* AI-Recommended Jobs */}
        {recommendedJobs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Recommended Jobs for You</h2>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">AI Powered</Badge>
            </div>
            <p className="text-gray-600 mb-4">Based on your skills, experience, and preferences</p>
            
            <div className="grid gap-4">
              {recommendedJobs.slice(0, 5).map((recommendation: any) => (
                <Card key={recommendation.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/30 to-transparent">
                  <CardContent className="p-5">
                    <Link href={`/contractor/rfqs/${recommendation.rfq.id}`}>
                      <div className="cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900 hover:text-purple-600 transition-colors">
                                {recommendation.rfq.title}
                              </h3>
                              <Badge className="bg-purple-600">
                                {recommendation.matchScore}% Match
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{recommendation.rfq.description}</p>
                            
                            {/* Match Explanation */}
                            <div className="flex items-center gap-2 mb-3 text-sm">
                              <Sparkles className="h-4 w-4 text-purple-600" />
                              <span className="text-purple-700 font-medium">{recommendation.explanation}</span>
                            </div>

                            {/* Match Factors */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {recommendation.matchFactors.skillMatch >= 70 && (
                                <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                                  Skills: {recommendation.matchFactors.skillMatch}%
                                </Badge>
                              )}
                              {recommendation.matchFactors.budgetMatch >= 70 && (
                                <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                                  Budget Fit: {recommendation.matchFactors.budgetMatch}%
                                </Badge>
                              )}
                              {recommendation.matchFactors.locationMatch >= 70 && (
                                <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                                  Location: {recommendation.matchFactors.locationMatch}%
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Deadline: {new Date(recommendation.rfq.deadline).toLocaleDateString()}
                              </span>
                              {recommendation.rfq.budget && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Budget: ${recommendation.rfq.budget.toLocaleString()}
                                </span>
                              )}
                              <span>Status: {recommendation.rfq.status}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-2" />
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Two Column Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent RFQs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent RFQs</h2>
              <Link href="/contractor/rfqs">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            {rfqs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-600 font-medium">No RFQs yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {rfqs.slice(0, 3).map((rfq: any) => (
                  <Card key={rfq.id} className="hover:shadow-md transition-shadow border-0 bg-white">
                    <CardContent className="p-4">
                      <Link href={`/contractor/rfqs/${rfq.id}`}>
                        <div className="flex items-start justify-between cursor-pointer">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{rfq.title}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{rfq.description}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(rfq.deadline).toLocaleDateString()}
                              </span>
                              <span>Status: {rfq.status}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Active Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Active Projects</h2>
              <Link href="/contractor/projects">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {activeProjects.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-600 font-medium">No active projects</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeProjects.slice(0, 3).map((project: any) => {
                  const completedMilestones = project.milestones?.filter((m: any) => m.status === "completed").length ?? 0;
                  const totalMilestones = project.milestones?.length ?? 1;
                  const progress = Math.round((completedMilestones / totalMilestones) * 100);

                  return (
                    <Card key={project.id} className="hover:shadow-md transition-shadow border-0 bg-white">
                      <CardContent className="p-4">
                        <Link href={`/contractor/projects/${project.id}`}>
                          <div className="cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors flex-1">{project.projectName}</h3>
                              <Badge variant="secondary">{progress}%</Badge>
                            </div>
                            <Progress value={progress} className="h-2 mb-2" />
                            <p className="text-xs text-gray-500">{completedMilestones} of {totalMilestones} milestones</p>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Invoice & Auction Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Invoice Summary */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Invoice Summary</h2>
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-blue-50 border-0">
                <CardContent className="p-4">
                  <FileText className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{invoices.filter((i: any) => i.status === "draft").length}</p>
                  <p className="text-xs text-blue-700 mt-1">Draft</p>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-0">
                <CardContent className="p-4">
                  <Clock className="h-6 w-6 text-yellow-600 mb-2" />
                  <p className="text-2xl font-bold text-yellow-900">{pendingInvoices.length}</p>
                  <p className="text-xs text-yellow-700 mt-1">Pending</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-0">
                <CardContent className="p-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-900">{paidInvoices.length}</p>
                  <p className="text-xs text-green-700 mt-1">Paid</p>
                </CardContent>
              </Card>
            </div>
            <Link href="/contractor/invoices" className="block mt-4">
              <Button className="w-full" variant="outline">
                View All Invoices
              </Button>
            </Link>
          </div>

          {/* Auction Summary */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Auctions</h2>
            <div className="space-y-3">
              {auctions.filter((a: any) => a.status === "active").length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Hammer className="h-10 w-10 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-600">No active auctions</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {auctions.filter((a: any) => a.status === "active").slice(0, 2).map((auction: any) => (
                    <Card key={auction.id} className="border-0">
                      <CardContent className="p-4">
                        <Link href={`/contractor/auctions/${auction.id}`}>
                          <div className="cursor-pointer">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-gray-900 hover:text-blue-600">Auction {auction.id.slice(0, 8)}</h3>
                              <Badge variant="default">Active</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Project: {auction.projectId.slice(0, 12)}...</p>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                  <Link href="/contractor/auctions" className="block">
                    <Button className="w-full" variant="outline">
                      View All Auctions
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
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
