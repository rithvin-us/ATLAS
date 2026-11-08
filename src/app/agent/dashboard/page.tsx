'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentGuard } from '@/components/agent/agent-guard';
import { useAuth } from '@/lib/auth-context';
import { fetchProjects, fetchRFQs, fetchAuctions, fetchInvoices } from '@/lib/agent-api';
import { Project, RFQ, Auction, Invoice } from '@/lib/types';
import { MOCK_CONTRACTOR_APPLICATIONS, MOCK_RFQ_RECOMMENDATIONS, computeContractorFitScore } from '@/lib/mock-recommendation-data';
import {
  Dot,
  EmptyRow,
  LoadingState,
  PageHeader,
  PipelineBar,
  SectionHeader,
  Stat,
  money,
  monthYear,
  ref,
  shortDate,
} from '@/components/dashboard-kit';

const FACTORS = [
  ['credibility', 'Credibility'],
  ['bidCompetitiveness', 'Bid fit'],
  ['deliveryHistory', 'Delivery'],
  ['skillMatch', 'Skills'],
  ['compliance', 'Compliance'],
  ['pastPerformance', 'Experience'],
] as const;

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


  if (loading) return <LoadingState label="Loading dashboard" />;

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="surface p-6">
          <h2 className="text-base font-medium">Could not load the dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const activeRFQs = rfqs.filter((r) => r.status === 'published');
  const activeProjects = projects.filter((p) => p.status === 'in-progress' || p.status === 'active');
  const pendingInvoices = invoices.filter((i) => i.status === 'submitted');
  const approvedInvoices = invoices.filter((i) => i.status === 'approved');
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const activeAuctions = auctions.filter((a) => a.status === 'live');

  const sum = (list: Invoice[]) => list.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const segments = [
    { label: 'Pending approval', amount: sum(pendingInvoices), count: pendingInvoices.length, className: 'bg-chart-1' },
    { label: 'Approved', amount: sum(approvedInvoices), count: approvedInvoices.length, className: 'bg-chart-2' },
    { label: 'Paid', amount: sum(paidInvoices), count: paidInvoices.length, className: 'bg-chart-3' },
  ];

  const attention = [
    { show: pendingInvoices.length > 0, tone: 'bg-chart-4', text: `${pendingInvoices.length} ${pendingInvoices.length === 1 ? 'invoice' : 'invoices'} waiting for approval`, href: '/agent/invoices' },
    { show: activeRFQs.length > 0, tone: 'bg-chart-1', text: `${activeRFQs.length} ${activeRFQs.length === 1 ? 'RFQ' : 'RFQs'} awaiting responses`, href: '/agent/rfq' },
    { show: activeProjects.length > 0, tone: 'bg-chart-3', text: `${activeProjects.length} ${activeProjects.length === 1 ? 'project' : 'projects'} in progress`, href: '/agent/projects' },
  ].filter((a) => a.show);

  const rfqOptions = Array.from(new Set(allContractors.map((c) => c.rfqId)));

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-8">
      <PageHeader
        title={monthYear()}
        caption={user?.email?.split('@')[0]}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/agent/projects/new">New project</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/agent/rfq/new">
                <Plus className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
                New RFQ
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Overview">
        <Stat label="Active RFQs" value={activeRFQs.length} caption="Awaiting responses" href="/agent/rfq" />
        <Stat label="Active projects" value={activeProjects.length} caption="In progress" href="/agent/projects" />
        <Stat label="Live auctions" value={activeAuctions.length} caption="Bidding open" href="/agent/auctions" />
        <Stat label="Pending invoices" value={pendingInvoices.length} caption="Needs approval" href="/agent/invoices" />
      </section>

      <section className="mt-8">
        <SectionHeader title="Ranked applicants">
          <select
            value={selectedRFQId}
            onChange={(e) => setSelectedRFQId(e.target.value)}
            aria-label="Filter by RFQ"
            className="h-9 rounded-lg border bg-card px-3 text-sm"
          >
            <option value="all">All RFQs</option>
            {rfqOptions.map((rfqId) => {
              const info = allContractors.find((c) => c.rfqId === rfqId)?.rfqInfo;
              return (
                <option key={rfqId} value={rfqId}>
                  {info?.title || rfqId}
                </option>
              );
            })}
          </select>
        </SectionHeader>

        {recommendedContractors.length > 0 ? (
          <div className="surface divide-y">
            {recommendedContractors.map((rec: any, index: number) => (
              <div key={rec.id} className="grid gap-4 p-5 lg:grid-cols-[32px_minmax(0,1fr)_minmax(0,2fr)_72px] lg:items-center">
                <span className="font-mono text-sm text-muted-foreground tabular-nums">{index + 1}</span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{rec.contractor.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{rec.rfqInfo.title}</p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
                    {money(rec.bidAmount)} · {rec.contractor.completionRate}% completion · {rec.contractor.averageRating}/5
                  </p>
                </div>

                <dl className="grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-6">
                  {FACTORS.map(([key, label]) => (
                    <div key={key}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-1 font-mono text-sm tabular-nums">{rec.factors[key]}</dd>
                      <div className="mt-1.5 h-0.5 rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-foreground/60" style={{ width: `${rec.factors[key]}%` }} />
                      </div>
                    </div>
                  ))}
                </dl>

                <div className="lg:text-right">
                  <p className={`text-2xl font-medium tabular-nums ${index === 0 ? 'text-primary' : ''}`}>{rec.fitScore}</p>
                  <p className="text-xs text-muted-foreground">Fit score</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyRow>No applicants to display</EmptyRow>
        )}
      </section>

      <section className="mt-8">
        <SectionHeader title="Quick actions" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Browse RFQs', meta: `${activeRFQs.length} active`, href: '/agent/rfq' },
            { label: 'My projects', meta: `${activeProjects.length} active`, href: '/agent/projects' },
            { label: 'Auctions', meta: `${activeAuctions.length} live`, href: '/agent/auctions' },
            { label: 'Vendors', meta: 'Manage vendors', href: '/agent/vendors' },
          ].map((q) => (
            <Link key={q.href} href={q.href} className="surface-link flex h-16 flex-col justify-center px-5">
              <span className="text-sm font-medium">{q.label}</span>
              <span className="text-xs text-muted-foreground">{q.meta}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionHeader title="Recent RFQs" href="/agent/rfq" />
          {rfqs.length === 0 ? (
            <EmptyRow>
              No RFQs published yet.{' '}
              <Link href="/agent/rfq/new" className="text-primary underline-offset-4 hover:underline">
                Create RFQ
              </Link>
            </EmptyRow>
          ) : (
            <ul className="surface divide-y">
              {rfqs.slice(0, 4).map((rfq) => (
                <li key={rfq.id}>
                  <Link href={`/agent/rfq/${rfq.id}`} className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-secondary/60">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{rfq.title}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground tabular-nums">
                        {ref('RFQ', rfq.id)} · due {shortDate(rfq.deadline)}
                        {rfq.budget ? ` · ${money(rfq.budget)}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      <span className="tabular-nums">{rfq.responses?.length || 0} responses</span>
                      <span className={`status-chip ${rfq.status === 'published' ? 'status-chip-success' : 'status-chip-info'}`}>
                        {rfq.status}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <SectionHeader title="Active projects" href="/agent/projects" />
          {projects.length === 0 ? (
            <EmptyRow>
              No projects yet.{' '}
              <Link href="/agent/projects/new" className="text-primary underline-offset-4 hover:underline">
                Create project
              </Link>
            </EmptyRow>
          ) : (
            <ul className="surface divide-y">
              {activeProjects.slice(0, 4).map((project) => (
                <li key={project.id}>
                  <Link href={`/agent/projects/${project.id}`} className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-secondary/60">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{project.name}</p>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                        {ref('PRJ', project.id)}
                        {project.siteDetails?.location ? ` · ${project.siteDetails.location}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      <span className="tabular-nums">{project.milestones?.length || 0} milestones</span>
                      <span className="status-chip status-chip-success">{project.status}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="surface p-6 lg:col-span-2">
          <SectionHeader title="Invoice pipeline" href="/agent/invoices" />
          <PipelineBar segments={segments} />
        </div>

        <div className="surface p-6">
          <SectionHeader title="Needs attention" />
          {attention.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing waiting</p>
          ) : (
            <ul className="divide-y">
              {attention.map((a) => (
                <li key={a.href}>
                  <Link
                    href={a.href}
                    className="flex h-12 items-center gap-3 text-sm transition-colors hover:text-primary"
                  >
                    <Dot className={a.tone} />
                    {a.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
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
