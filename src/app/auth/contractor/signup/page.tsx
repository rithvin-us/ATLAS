'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { signUp } from '@/lib/auth';

export default function ContractorSignupPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    password: '',
    industry: '',
    location: '',
    description: '',
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
      'contractor',
      {
        companyName: formData.companyName,
        contactName: formData.contactName,
        industry: formData.industry,
        location: formData.location,
        description: formData.description,
        verificationStatus: 'pending',
        credibilityScore: 0,
      }
    );

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Account created successfully. Pending verification.',
      });
      router.push('/contractor/dashboard');
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
      
      <Card className="w-full max-w-2xl ">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-3xl font-medium text-foreground">Contractor Registration</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Register your company and upload compliance certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name" className="text-sm font-medium text-foreground">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="Vendor LLC"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                  className="h-12 rounded-xl border-input "
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-name" className="text-sm font-medium text-foreground">Contact Person</Label>
                <Input
                  id="contact-name"
                  placeholder="Jane Smith"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  required
                  className="h-12 rounded-xl border-input "
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@vendor.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 rounded-xl border-input "
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="h-12 rounded-xl border-input "
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium text-foreground">Industry</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                  <SelectTrigger id="industry" className="h-12 rounded-xl border-input">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="mechanical">Mechanical</SelectItem>
                    <SelectItem value="civil">Civil Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-foreground">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="h-12 rounded-xl border-input "
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">Company Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your company and services"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl border-input "
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificates" className="text-sm font-medium text-foreground">Compliance Certificates</Label>
              <Input
                id="certificates"
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                className="rounded-xl border-input"
              />
              <p className="text-xs text-muted-foreground">
                Upload licenses, insurance certificates, safety credentials, and quality certifications
              </p>
            </div>
            <div className="bg-secondary border border-input rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                Your credibility score will be calculated after verification. Verification typically takes 2-3 business days.
              </p>
            </div>
            <Button 
              className="w-full h-12 text-base font-medium rounded-xl bg-primary" 
              size="lg" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Creating account' : 'Register & Submit for Verification'}
            </Button>
            <div className="text-center text-sm pt-2">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/auth/contractor/login" className="text-primary font-medium hover:text-muted-foreground hover:underline">
                Sign in
              </Link>
            </div>
            <div className="text-center pt-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                Back to home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
