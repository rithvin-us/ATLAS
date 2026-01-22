'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { signUp } from '@/lib/auth';

export default function AgentSignupPage() {
  const [formData, setFormData] = useState({
    orgName: '',
    adminName: '',
    email: '',
    password: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signUp(
      formData.email,
      formData.password,
      'agent',
      {
        organizationName: formData.orgName,
        adminName: formData.adminName,
        address: formData.address,
        verificationStatus: 'pending',
      }
    );

    if (result.success) {
      toast({
        title: 'Success!',
        description: 'Account created successfully. Pending verification.',
      });
      router.push('/agent/dashboard');
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to create account.',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-50 via-mint-100 to-base p-4 py-8 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-mint-200 rounded-full opacity-30 blur-xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-coral-200 rounded-full opacity-30 blur-xl"></div>
      
      <Card className="w-full max-w-2xl border-0 shadow-card rounded-2xl relative z-10">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-3xl font-bold text-gray-900">Agent Registration</CardTitle>
          <CardDescription className="text-base text-gray-500">
            Create your organization account and upload verification documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="org-name" className="text-sm font-semibold text-gray-700">Organization Name</Label>
                <Input
                  id="org-name"
                  placeholder="Company Inc."
                  value={formData.orgName}
                  onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                  required
                  className="h-12 rounded-xl border-mint-200 focus:border-mint focus:ring-mint"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-name" className="text-sm font-semibold text-gray-700">Admin Name</Label>
                <Input
                  id="admin-name"
                  placeholder="John Doe"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  required
                  className="h-12 rounded-xl border-mint-200 focus:border-mint focus:ring-mint"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 rounded-xl border-mint-200 focus:border-mint focus:ring-mint"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="h-12 rounded-xl border-mint-200 focus:border-mint focus:ring-mint"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Organization Address</Label>
              <Textarea
                id="address"
                placeholder="Full address of your organization"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="rounded-xl border-mint-200 focus:border-mint focus:ring-mint"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documents" className="text-sm font-semibold text-gray-700">Company Documents</Label>
              <Input
                id="documents"
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                className="rounded-xl border-mint-200"
              />
              <p className="text-xs text-gray-500">
                Upload registration certificates, tax documents, and other verification documents
              </p>
            </div>
            <Button 
              className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-mint to-mint-dark hover:from-mint-dark hover:to-mint-dark shadow-soft hover:shadow-soft-lg transition-all" 
              size="lg" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Register & Submit for Verification'}
            </Button>
            <div className="text-center text-sm pt-2">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/auth/agent/login" className="text-mint-dark font-semibold hover:text-coral-dark hover:underline">
                Sign in
              </Link>
            </div>
            <div className="text-center pt-2">
              <Link href="/" className="text-sm text-gray-500 hover:text-mint-dark hover:underline">
                ← Back to home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
