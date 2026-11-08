import Link from 'next/link';
import { ArrowRight, Check, FileText, Gavel, Receipt, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AtlasLogo } from '@/components/icons/logo';
import { PipelineBar, money } from '@/components/dashboard-kit';

const features = [
  {
    icon: FileText,
    title: 'Post work',
    description: 'Publish RFQs with scope, budget and deadline, then compare quotations side by side.',
    link: '/auth/agent/signup',
  },
  {
    icon: Search,
    title: 'Find work',
    description: 'Contractors see RFQs ranked by skills, budget, location and experience.',
    link: '/auth/contractor/signup',
  },
  {
    icon: Gavel,
    title: 'Run auctions',
    description: 'Open live bidding on a project and watch the bid history as it builds.',
    link: '/auth/agent/signup',
  },
  {
    icon: Receipt,
    title: 'Pay by milestone',
    description: 'Contractors invoice against verified milestones. Agents approve and pay.',
    link: '/auth/contractor/signup',
  },
];

const applicants = [
  { name: 'Northline Electrical', bid: 48210, fit: 91 },
  { name: 'Harbor Mechanical', bid: 52900, fit: 84 },
  { name: 'Ridgeway Civil', bid: 46750, fit: 77 },
];

const agentPoints = [
  'Create and publish detailed RFQs',
  'Run competitive auctions for vendor selection',
  'Rank applicants by a weighted fit score',
  'Approve milestones and manage payments',
];

const contractorPoints = [
  'Browse RFQs matched to your skills',
  'Check quotations with AI before you submit',
  'Build a credibility score',
  'Track progress and invoice by milestone',
];

const navLink =
  'text-sm text-muted-foreground transition-colors hover:text-foreground';

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <AtlasLogo className="h-5 w-5 text-primary" />
            <span className="text-base font-medium tracking-tight">ATLAS</span>
          </Link>
          <nav className="ml-12 hidden gap-8 md:flex" aria-label="Main">
            <Link href="#features" className={navLink}>Features</Link>
            <Link href="#roles" className={navLink}>For agents</Link>
            <Link href="#roles" className={navLink}>For contractors</Link>
          </nav>
          <div className="ml-auto flex items-center gap-5">
            <Link href="#roles" className={navLink}>Log in</Link>
            <Button asChild size="sm">
              <Link href="#roles">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:py-28">
          <div>
            <h1 className="text-4xl font-medium leading-[1.1] tracking-tight md:text-5xl">
              Procurement for agents and contractors, from RFQ to payment
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Publish RFQs and auctions, rank applicants, approve milestones and pay invoices in one workspace.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button asChild size="lg">
                <Link href="#roles">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#features">See features</Link>
              </Button>
            </div>
          </div>

          <div className="surface overflow-hidden" aria-label="Product preview">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <span className="text-sm font-medium">Ranked applicants</span>
              <span className="font-mono text-xs text-muted-foreground">RFQ-0412</span>
            </div>
            <ul className="divide-y">
              {applicants.map((a, i) => (
                <li key={a.name} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-4 font-mono text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.name}</p>
                    <p className="font-mono text-xs text-muted-foreground tabular-nums">{money(a.bid)}</p>
                  </div>
                  <div className="h-0.5 w-24 rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-foreground/60" style={{ width: `${a.fit}%` }} />
                  </div>
                  <span className={`w-8 text-right text-lg font-medium tabular-nums ${i === 0 ? 'text-primary' : ''}`}>
                    {a.fit}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t bg-secondary/50 px-5 py-5">
              <PipelineBar
                segments={[
                  { label: 'Pending approval', amount: 18400, count: 3, className: 'bg-chart-1' },
                  { label: 'Approved', amount: 12600, count: 2, className: 'bg-chart-2' },
                  { label: 'Paid', amount: 41200, count: 6, className: 'bg-chart-3' },
                ]}
              />
            </div>
          </div>
        </section>

        <section id="features" className="border-t">
          <div className="mx-auto max-w-[1200px] px-6 py-20">
            <h2 className="text-3xl font-medium tracking-tight">Everything between RFQ and payment</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <Link key={f.title} href={f.link} className="surface-link block p-6">
                  <f.icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  <h3 className="mt-6 text-base font-medium">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t bg-card">
          <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-20 lg:grid-cols-3">
            {[
              ['Role-based access', 'Agents and contractors sign in to separate workspaces and see only their own workflow.'],
              ['Milestones and escrow', 'Track each milestone from pending to verified to invoiced, with escrow state per project.'],
              ['Credibility', 'Every contractor carries a score built from delivery, compliance and past performance.'],
            ].map(([t, d]) => (
              <div key={t}>
                <h3 className="text-base font-medium">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="roles" className="border-t">
          <div className="mx-auto max-w-[1200px] px-6 py-20">
            <h2 className="text-3xl font-medium tracking-tight">Choose your workspace</h2>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[
                { role: 'Agents', sub: 'Source vendors, manage RFQs and oversee delivery.', points: agentPoints, login: '/auth/agent/login', signup: '/auth/agent/signup', cta: 'Agent log in' },
                { role: 'Contractors', sub: 'Find opportunities, submit bids and deliver projects.', points: contractorPoints, login: '/auth/contractor/login', signup: '/auth/contractor/signup', cta: 'Contractor log in' },
              ].map((r) => (
                <div key={r.role} className="surface p-8">
                  <h3 className="text-xl font-medium">{r.role}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.sub}</p>
                  <ul className="mt-6 space-y-3">
                    {r.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex gap-3">
                    <Button asChild className="flex-1">
                      <Link href={r.login}>{r.cta}</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={r.signup}>Sign up</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <AtlasLogo className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">ATLAS</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} ATLAS</p>
          <nav className="flex gap-6">
            <Link href="#" className={navLink}>Terms</Link>
            <Link href="#" className={navLink}>Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
