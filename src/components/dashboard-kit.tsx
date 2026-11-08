import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export const shortDate = (d: Date | string | number) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const monthYear = () =>
  new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export const ref = (prefix: string, id: string) => `${prefix}-${id.slice(0, 4).toUpperCase()}`;

export function PageHeader({
  title,
  caption,
  actions,
}: {
  title: string;
  caption?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
        {caption && <p className="mt-1 text-sm text-muted-foreground">{caption}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeader({
  title,
  href,
  hrefLabel = 'View all',
  children,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex h-9 items-center justify-between pb-3">
      <h2 className="text-base font-medium">{title}</h2>
      <div className="flex items-center gap-3">
        {children}
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {hrefLabel}
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        )}
      </div>
    </div>
  );
}

export function Stat({
  label,
  value,
  caption,
  href,
}: {
  label: string;
  value: string | number;
  caption: string;
  href: string;
}) {
  return (
    <Link href={href} className="surface-link group block p-5">
      <div className="flex items-center justify-between">
        <p className="metric-label">{label}</p>
        <ArrowUpRight
          className="h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-foreground"
          strokeWidth={1.5}
        />
      </div>
      <p className="metric-value mt-2">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
    </Link>
  );
}

export function Dot({ className }: { className?: string }) {
  return <span className={cn('inline-block h-1.5 w-1.5 shrink-0 rounded-full', className)} />;
}

export function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export interface PipelineSegment {
  label: string;
  amount: number;
  count: number;
  className: string;
}

/** The one main chart: invoices split by stage, sized by value. */
export function PipelineBar({ segments }: { segments: PipelineSegment[] }) {
  const total = segments.reduce((s, x) => s + x.amount, 0);
  return (
    <div>
      <p className="text-3xl font-medium tabular-nums tracking-tight">{money(total)}</p>
      <p className="mt-1 text-xs text-muted-foreground">Total invoiced</p>

      <div
        className="mt-6 flex h-10 w-full gap-0.5 overflow-hidden rounded-lg"
        role="img"
        aria-label={segments.map((s) => `${s.label} ${money(s.amount)}`).join(', ')}
      >
        {total === 0 ? (
          <div className="h-full w-full bg-secondary" />
        ) : (
          segments
            .filter((s) => s.amount > 0)
            .map((s) => (
              <div
                key={s.label}
                className={cn('h-full transition-[flex-grow]', s.className)}
                style={{ flexGrow: s.amount }}
              />
            ))
        )}
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-4">
        {segments.map((s) => (
          <div key={s.label}>
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={cn('h-2 w-2 rounded-sm', s.className)} />
              {s.label}
            </dt>
            <dd className="mt-1 text-lg font-medium tabular-nums">{money(s.amount)}</dd>
            <dd className="font-mono text-xs text-muted-foreground tabular-nums">
              {s.count} {s.count === 1 ? 'invoice' : 'invoices'}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
