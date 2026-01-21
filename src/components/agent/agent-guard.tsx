'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface AgentGuardProps {
  children: React.ReactNode;
}

export function AgentGuard({ children }: AgentGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || role !== 'agent')) {
      router.replace('/auth/agent/login');
    }
  }, [loading, role, router, user]);

  if (loading || !user || role !== 'agent') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking access...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
