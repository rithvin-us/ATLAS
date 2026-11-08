"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractorGuard } from "@/components/contractor/contractor-guard";
import { useAuth } from "@/lib/auth-context";
import { fetchEligibleRFQs, fetchContractorProjects, fetchContractorAuctions, fetchContractorInvoices } from "@/lib/contractor-api";
import { MOCK_RFQ_RECOMMENDATIONS } from "@/lib/mock-recommendation-data";
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
} from "@/components/dashboard-kit";

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
  const draftInvoices = invoices.filter((i: any) => i.status === "draft");
  const pendingInvoices = invoices.filter((i: any) => i.status === "submitted" || i.status === "approved");
  const paidInvoices = invoices.filter((i: any) => i.status === "paid");
  const activeProjects = projects.filter((p: any) => p.status === "in-progress" || p.status === "active");
  const liveAuctions = auctions.filter((a: any) => a.status === "active");

  if (loading) return <LoadingState label="Loading dashboard" />;

  const sum = (list: any[]) => list.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const segments = [
    { label: "Paid", amount: sum(paidInvoices), count: paidInvoices.length, className: "bg-chart-1" },
    { label: "Pending", amount: sum(pendingInvoices), count: pendingInvoices.length, className: "bg-chart-2" },
    { label: "Draft", amount: sum(draftInvoices), count: draftInvoices.length, className: "bg-chart-3" },
  ];

  const matchFactors = [
    ["Skills", "skillMatch"],
    ["Budget", "budgetMatch"],
    ["Location", "locationMatch"],
  ] as const;

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-8">
      <PageHeader
        title={monthYear()}
        caption={`${user?.email?.split("@")[0] ?? ""} · credibility ${stats.credibilityScore}`}
        actions={
          <Button asChild size="sm">
            <Link href="/contractor/invoices/new">
              <Plus className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
              New invoice
            </Link>
          </Button>
        }
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Overview">
        <Stat label="Open RFQs" value={stats.pendingRFQs} caption="Eligible for you" href="/contractor/rfqs" />
        <Stat label="Active projects" value={stats.activeProjects} caption="In progress" href="/contractor/projects" />
        <Stat label="Live auctions" value={stats.activeAuctions} caption="Bidding open" href="/contractor/auctions" />
        <Stat label="Pending pay" value={stats.pendingInvoices} caption="Submitted or approved" href="/contractor/invoices" />
      </section>

      <section className="mt-8">
        <SectionHeader title="Quick actions" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Browse RFQs", meta: "Find new work", href: "/contractor/rfqs" },
            { label: "Place bid", meta: "Open auctions", href: "/contractor/auctions" },
            { label: "Send invoice", meta: "Bill a milestone", href: "/contractor/invoices/new" },
            { label: "My profile", meta: "Credibility and documents", href: "/contractor/credibility" },
          ].map((q) => (
            <Link key={q.href} href={q.href} className="surface-link flex h-16 flex-col justify-center px-5">
              <span className="text-sm font-medium">{q.label}</span>
              <span className="text-xs text-muted-foreground">{q.meta}</span>
            </Link>
          ))}
        </div>
      </section>

      {recommendedJobs.length > 0 && (
        <section className="mt-8">
          <SectionHeader title="Recommended for you" href="/contractor/rfqs" />
          <ul className="surface divide-y">
            {recommendedJobs.slice(0, 3).map((rec: any, index: number) => (
              <li key={rec.id}>
                <Link
                  href={`/contractor/rfqs/${rec.rfq.id}`}
                  className="grid gap-3 p-5 transition-colors hover:bg-secondary/60 lg:grid-cols-[minmax(0,1fr)_240px_72px] lg:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{rec.rfq.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{rec.rfq.description}</p>
                    <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
                      {ref("RFQ", rec.rfq.id)} · due {shortDate(rec.rfq.deadline)}
                      {rec.rfq.budget ? ` · ${money(rec.rfq.budget)}` : ""}
                    </p>
                  </div>

                  <dl className="grid grid-cols-3 gap-4">
                    {matchFactors.map(([label, key]) => (
                      <div key={key}>
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="mt-1 font-mono text-sm tabular-nums">{rec.matchFactors[key]}</dd>
                        <div className="mt-1.5 h-0.5 rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-foreground/60" style={{ width: `${rec.matchFactors[key]}%` }} />
                        </div>
                      </div>
                    ))}
                  </dl>

                  <div className="lg:text-right">
                    <p className={`text-2xl font-medium tabular-nums ${index === 0 ? "text-primary" : ""}`}>{rec.matchScore}</p>
                    <p className="text-xs text-muted-foreground">Match</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionHeader title="Active projects" href="/contractor/projects" />
          {activeProjects.length === 0 ? (
            <EmptyRow>No active projects. Browse RFQs to find new work</EmptyRow>
          ) : (
            <ul className="surface divide-y">
              {activeProjects.slice(0, 3).map((project: any) => {
                const completed = project.milestones?.filter((m: any) => m.status === "completed").length ?? 0;
                const total = project.milestones?.length ?? 1;
                const progress = Math.round((completed / total) * 100);
                return (
                  <li key={project.id}>
                    <Link href={`/contractor/projects/${project.id}`} className="block px-5 py-4 transition-colors hover:bg-secondary/60">
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="truncate text-sm font-medium">{project.projectName}</p>
                        <span className="font-mono text-sm tabular-nums">{progress}%</span>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
                        {ref("PRJ", project.id)} · {completed} of {total} milestones
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <SectionHeader title="Recent RFQs" href="/contractor/rfqs" />
          {rfqs.length === 0 ? (
            <EmptyRow>No RFQs available. Check back soon</EmptyRow>
          ) : (
            <ul className="surface divide-y">
              {rfqs.slice(0, 3).map((rfq: any) => (
                <li key={rfq.id}>
                  <Link href={`/contractor/rfqs/${rfq.id}`} className="block px-5 py-4 transition-colors hover:bg-secondary/60">
                    <div className="flex items-start justify-between gap-4">
                      <p className="truncate text-sm font-medium">{rfq.title}</p>
                      <span className="status-chip status-chip-info shrink-0">{rfq.status}</span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{rfq.description}</p>
                    <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
                      {ref("RFQ", rfq.id)} · due {shortDate(rfq.deadline)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="surface p-6 lg:col-span-2">
          <SectionHeader title="Invoice summary" href="/contractor/invoices" />
          <PipelineBar segments={segments} />
        </div>

        <div className="surface p-6">
          <SectionHeader title="Live auctions" href="/contractor/auctions" />
          {liveAuctions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active auctions</p>
          ) : (
            <ul className="divide-y">
              {liveAuctions.slice(0, 3).map((auction: any) => (
                <li key={auction.id}>
                  <Link
                    href={`/contractor/auctions/${auction.id}`}
                    className="flex h-14 items-center justify-between gap-3 text-sm transition-colors hover:text-primary"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{ref("AUC", auction.id)}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{ref("PRJ", auction.projectId)}</p>
                    </div>
                    <span className="status-chip status-chip-success shrink-0">
                      <Dot className="bg-current" />
                      Live
                    </span>
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

export default function ContractorDashboardPage() {
  return (
    <ContractorGuard>
      <DashboardContent />
    </ContractorGuard>
  );
}
