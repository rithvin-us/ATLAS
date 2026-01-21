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

export default function ContractorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn(email, password);

    if (result.success && result.role === 'contractor') {
      toast({
        title: 'Success!',
        description: 'Logged in successfully.',
      });
      router.push('/contractor/dashboard');
    } else if (result.success && result.role !== 'contractor') {
      toast({
        title: 'Error',
        description: 'This account is not registered as a contractor.',
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-12 items-center justify-center relative overflow-hidden">
        <div className="max-w-lg text-center z-10">
          {/* Placeholder Illustration */}
          <div className="mb-8 flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome Back, Contractor!</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Access exclusive RFQs, manage your projects, and grow your business with ATLAS's trusted platform.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-green-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-emerald-300 rounded-full opacity-20 blur-xl"></div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo/Heading */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contractor Login</h1>
            <p className="text-gray-600">Welcome back! Please sign in to continue.</p>
          </div>

          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900">Sign In</CardTitle>
              <CardDescription className="text-base text-gray-500">
                Access RFQs and manage your projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contractor@vendor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
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
                    className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <Button 
                  className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all" 
                  size="lg" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                <div className="text-center text-sm pt-2">
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link href="/auth/contractor/signup" className="text-green-600 font-semibold hover:text-green-700 hover:underline">
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
