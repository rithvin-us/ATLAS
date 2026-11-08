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
import { AuthSplit } from '@/components/auth-split';

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
        title: 'Success',
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
    <AuthSplit
      role="Agent"
      headline="Run procurement from RFQ to payment"
      blurb="Publish RFQs and auctions, rank applicants, approve milestones and pay invoices."
    >
          <div className="mb-8 lg:hidden">
            <h1 className="text-2xl font-medium">Agent sign in</h1>
          </div>

          <Card>
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-3xl font-medium text-foreground">Sign In</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Manage projects and coordinate with vendors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="agent@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl border-border "
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-border "
                  />
                </div>
                <Button 
                  className="w-full h-12 text-base font-medium rounded-xl " 
                  size="lg" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Signing in' : 'Sign In'}
                </Button>
                <div className="text-center text-sm pt-2">
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <Link href="/auth/agent/signup" className="text-primary font-medium hover:text-primary hover:underline">
                    Sign up
                  </Link>
                </div>
                <div className="text-center pt-2">
                  <Link href="/" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                    Back to home
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
    </AuthSplit>
  );
}
