'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Briefcase,
  DollarSign,
  Award,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  Plus,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  fetchEligibleRFQs,
  fetchContractorProjects,
  fetchContractorInvoices,
  fetchContractorCredibility,
} from '@/lib/contractor-api';
import { RFQ, Project, Invoice, CredibilityScore } from '@/lib/types';

function DashboardContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [credibility, setCredibility] = useState<CredibilityScore | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        setLoading(true);
        const [rfqsData, projectsData, invoicesData, credData] = await Promise.all([
          fetchEligibleRFQs(user.uid),
          fetchContractorProjects(user.uid),
          fetchContractorInvoices(user.uid),
          fetchContractorCredibility(user.uid),
        ]);

        setRfqs(rfqsData);
        setProjects(projectsData);
        setInvoices(invoicesData);
        setCredibility(credData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

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
  const pendingInvoices = invoices.filter(i => i.status === 'submitted');
  const approvedInvoices = invoices.filter(i => i.status === 'approved');
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const activeProjects = projects.filter(p => p.status === 'in-progress' || p.status === 'active');

  const quickActions = [
    { icon: FileText, label: 'Browse RFQs', href: '/contractor/rfqs', count: activeRFQs.length, color: 'blue' },
    { icon: Briefcase, label: 'My Projects', href: '/contractor/projects', count: activeProjects.length, color: 'green' },
    { icon: DollarSign, label: 'Create Invoice', href: '/contractor/invoices/new', color: 'purple' },
    { icon: Award, label: 'Credibility', href: '/contractor/credibility', score: credibility?.score ?? 0, color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your procurement activities.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section 1: Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const colorClasses = {
                blue: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100',
                green: 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100',
                purple: 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100',
                orange: 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100',
              };
              const bgColor = {
                blue: 'bg-blue-100',
                green: 'bg-green-100',
                purple: 'bg-purple-100',
                orange: 'bg-orange-100',
              };

              return (
                <Link key={action.label} href={action.href}>
                  <Card className={`border cursor-pointer transition-all hover:shadow-md ${colorClasses[action.color as keyof typeof colorClasses]}`}>
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg ${bgColor[action.color as keyof typeof bgColor]} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-medium text-gray-900">{action.label}</h3>
                      {'count' in action ? (
                        <p className="text-2xl font-bold text-gray-900 mt-2">{action.count}</p>
                      ) : (
                        <p className="text-2xl font-bold text-gray-900 mt-2">{action.score}/100</p>
                      )}
                      <div className="flex items-center text-sm text-gray-600 mt-3">
                        <span>View details</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 2: My RFQs Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My RFQs</h2>
            <Link href="/contractor/rfqs">
              <Button variant="outline" size="sm">
                View All RFQs
              </Button>
            </Link>
          </div>

          {rfqs.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">No RFQs available</p>
                <p className="text-gray-500 text-sm mt-1">New RFQs will appear here as they're published</p>
                <Link href="/contractor/rfqs">
                  <Button className="mt-4" size="sm">
                    Browse RFQs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rfqs.slice(0, 3).map((rfq) => (
                <Card key={rfq.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{rfq.title}</h3>
                          <Badge variant={rfq.status === 'published' ? 'default' : 'secondary'}>
                            {rfq.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{rfq.description?.substring(0, 100)}...</p>
                        <div className="flex items-center gap-6 mt-4 text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(rfq.deadline).toLocaleDateString()}
                          </span>
                          <span className="text-gray-600">Project: {rfq.projectId.slice(0, 8)}</span>
                        </div>
                      </div>
                      <Link href={`/contractor/rfqs/${rfq.id}`}>
                        <Button variant="ghost" size="sm">
                          View <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Section 3 & 4: Invoices and Projects */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Invoices Overview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
              <Link href="/contractor/invoices">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {invoices.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <DollarSign className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-600 font-medium text-sm">No invoices</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700">Draft Invoices</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {invoices.filter(i => i.status === 'draft').length}
                        </p>
                      </div>
                      <Plus className="h-8 w-8 text-blue-300" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-700">Pending Review</p>
                        <p className="text-2xl font-bold text-yellow-900 mt-1">
                          ${(pendingInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / 100).toLocaleString()}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-300" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700">Paid</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          ${(paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / 100).toLocaleString()}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-300" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Active Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
              <Link href="/contractor/projects">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {activeProjects.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Briefcase className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-600 font-medium text-sm">No active projects</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeProjects.slice(0, 2).map((project) => {
                  const completedMilestones = project.milestones?.filter(m => m.status === 'completed').length ?? 0;
                  const totalMilestones = project.milestones?.length ?? 0;
                  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

                  return (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <Badge variant="outline">{progress}%</Badge>
                        </div>
                        <Progress value={progress} className="mb-2" />
                        <p className="text-xs text-gray-600">{completedMilestones} of {totalMilestones} milestones completed</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Compliance & Credibility */}
        <div className="mb-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Credibility Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  Credibility Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {credibility ? (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="text-5xl font-bold text-orange-600">{credibility.score}</div>
                      <p className="text-sm text-gray-600 mt-1">Out of 100</p>
                    </div>
                    <Progress value={credibility.score} className="h-2" />
                    <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                      <div>
                        <p className="text-gray-600">Projects Completed</p>
                        <p className="font-bold text-gray-900">0</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg. Rating</p>
                        <p className="font-bold text-gray-900">0/5</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No credibility score yet</p>
                    <p className="text-sm text-gray-500 mt-1">Complete projects to build your score</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compliance Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">GST Certificate</p>
                      <p className="text-xs text-gray-600">Verified</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Business License</p>
                      <p className="text-xs text-gray-600">Verified</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Insurance Certificate</p>
                      <p className="text-xs text-gray-600">Expires in 30 days</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <Link href="/contractor/credibility">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Documents
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 6: Recent Messages */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">No new messages</p>
                <p className="text-gray-500 text-sm mt-1">Check back later for RFQ clarifications and updates</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ContractorDashboardPage() {
  return <DashboardContent />;
}
