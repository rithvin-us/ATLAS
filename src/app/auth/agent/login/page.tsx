'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signIn } from '@/lib/auth';

export default function AgentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn(email, password);

    if (result.success && result.role === 'agent') {
      toast({
        title: 'Success!',
        description: 'Logged in successfully.',
      });
      router.push('/agent/dashboard');
    } else if (result.success && result.role !== 'agent') {
      toast({
        title: 'Error',
        description: 'This account is not registered as an agent.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to sign in.',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Illustration & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-12 items-center justify-center relative overflow-hidden">
        <div className="max-w-lg text-center z-10">
          {/* Placeholder Illustration */}
          <div className="mb-8 flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome Back, Agent!</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Manage projects, coordinate with vendors, and streamline your workflow with ATLAS's powerful tools.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-indigo-300 rounded-full opacity-20 blur-xl"></div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo/Heading */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Login</h1>
            <p className="text-gray-600">Welcome back! Please sign in to continue.</p>
          </div>

          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900">Sign In</CardTitle>
              <CardDescription className="text-base text-gray-500">
                Manage projects and coordinate with vendors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="agent@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Button 
                  className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all" 
                  size="lg" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                <div className="text-center text-sm pt-2">
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link href="/auth/agent/signup" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                    Sign up
                  </Link>
                </div>
                <div className="text-center pt-2">
                  <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
                    ← Back to home
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
