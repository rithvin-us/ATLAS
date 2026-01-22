'use client';

/**
 * Client-side layout wrapper
 * This component handles all client-side providers and components
 * that depend on Firebase or browser APIs
 */

import dynamic from 'next/dynamic';
import { Toaster } from "@/components/ui/toaster";

// Dynamically import AuthProvider with ssr: false to prevent Firebase loading during build
const ClientAuthProvider = dynamic(
  () => import('@/lib/auth-context').then(mod => ({ default: mod.AuthProvider })),
  { ssr: false }
);

// Dynamically import Chatbot
const Chatbot = dynamic(
  () => import('@/components/chatbot').then(mod => ({ default: mod.Chatbot })),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthProvider>
      {children}
      <Toaster />
      <Chatbot />
    </ClientAuthProvider>
  );
}
