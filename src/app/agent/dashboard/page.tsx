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
} from 'lucide-react';
import { Project, RFQ, Auction, Invoice } from '@/lib/types';

function DashboardContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

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
  const activeProjects = projects.filter(p => p.status === 'in-progress' || p.status === 'active');
  const pendingInvoices = invoices.filter(i => i.status === 'submitted');
  const approvedInvoices = invoices.filter(i => i.status === 'approved');
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const activeAuctions = auctions.filter(a => a.status === 'active');

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
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your procurement management.</p>
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
                      <p className="text-2xl font-bold text-gray-900 mt-2">{action.count}</p>
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

        {/* Section 2: Key Statistics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 font-medium uppercase">Active Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{activeProjects.length}</p>
                  <p className="text-xs text-green-600">All ongoing</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 font-medium uppercase">Pending Invoices</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingInvoices.length}</p>
                  <p className="text-xs text-blue-600">Awaiting approval</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 font-medium uppercase">Outstanding Amount</p>
                  <p className="text-3xl font-bold text-gray-900">${(totalOutstanding / 100).toLocaleString()}</p>
                  <p className="text-xs text-orange-600">Not yet paid</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 font-medium uppercase">Total Paid</p>
                  <p className="text-3xl font-bold text-gray-900">${paidInvoices.length}</p>
                  <p className="text-xs text-green-600">{paidInvoices.length} invoices settled</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 3: My RFQs Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My RFQs</h2>
            <Link href="/agent/rfq">
              <Button variant="outline" size="sm">
                View All RFQs
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
                          <Badge variant="outline">{rfq.responses?.length || 0} responses</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{rfq.description?.substring(0, 100)}...</p>
                        <div className="flex items-center gap-6 mt-4 text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Deadline: {new Date(rfq.deadline).toLocaleDateString()}
                          </span>
                          {rfq.budget && (
                            <span className="text-gray-600">Budget: ${rfq.budget.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <Link href={`/agent/rfq/${rfq.id}`}>
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

        {/* Section 4 & 5: Projects and Invoices */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* My Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Projects</h2>
              <Link href="/agent/projects">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {projects.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Briefcase className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-600 font-medium text-sm">No projects</p>
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
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700">Active Projects</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">{activeProjects.length}</p>
                      </div>
                      <Briefcase className="h-10 w-10 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                {activeProjects.slice(0, 3).map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{project.name}</h3>
                          <p className="text-xs text-gray-600 mt-1">{project.siteDetails?.location}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline" className="text-xs">{project.status}</Badge>
                            <span className="text-xs text-gray-600">{project.milestones?.length || 0} milestones</span>
                          </div>
                        </div>
                        <Link href={`/agent/projects/${project.id}`}>
                          <Button variant="ghost" size="sm" className="h-8">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Invoices Overview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
              <Link href="/agent/invoices">
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
                        <p className="text-sm text-blue-700">Pending Approval</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{pendingInvoices.length}</p>
                      </div>
                      <Clock className="h-10 w-10 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-700">Approved</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">{approvedInvoices.length}</p>
                      </div>
                      <CheckCircle className="h-10 w-10 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700">Paid</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">${paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-10 w-10 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Section 6: Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {activeProjects.length > 0 && (
                  <div className="flex items-start gap-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activeProjects.length} project{activeProjects.length !== 1 ? 's' : ''} in progress</p>
                      <p className="text-xs text-gray-600 mt-1">Monitor milestones and contractor progress</p>
                    </div>
                  </div>
                )}
                {pendingInvoices.length > 0 && (
                  <div className="flex items-start gap-4 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pendingInvoices.length} invoice{pendingInvoices.length !== 1 ? 's' : ''} pending approval</p>
                      <p className="text-xs text-gray-600 mt-1">Review and approve contractor invoices</p>
                    </div>
                  </div>
                )}
                {activeRFQs.length > 0 && (
                  <div className="flex items-start gap-4 p-3 rounded-lg bg-purple-50 border border-purple-100">
                    <FileText className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activeRFQs.length} active RFQ{activeRFQs.length !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-600 mt-1">Awaiting vendor responses and quotations</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
