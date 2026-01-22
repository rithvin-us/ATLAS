'use client';

/**
 * Client-only Auth Provider Wrapper
 * This component wraps children with AuthProvider and is designed
 * to be dynamically imported with ssr: false
 */

import { AuthProvider } from '@/lib/auth-context';

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default ClientAuthProvider;
