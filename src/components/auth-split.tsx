import Link from 'next/link';

interface AuthSplitProps {
  role: 'Agent' | 'Contractor';
  headline: string;
  blurb: string;
  children: React.ReactNode;
}

export function AuthSplit({ role, headline, blurb, children }: AuthSplitProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="hidden flex-col justify-between border-r bg-[hsl(var(--sidebar-background))] p-12 lg:flex lg:w-1/2">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-base font-medium tracking-tight">ATLAS</span>
          <span className="font-mono text-xs text-muted-foreground">{role.toLowerCase()}</span>
        </Link>
        <div className="max-w-md">
          <h2 className="text-3xl font-medium leading-tight tracking-tight">{headline}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{blurb}</p>
        </div>
        <p className="font-mono text-xs text-muted-foreground">Procurement, end to end</p>
      </aside>
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
