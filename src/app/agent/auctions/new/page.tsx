'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { AgentGuard } from '@/components/agent/agent-guard';
import { fetchRFQs, fetchProjects, createAuction } from '@/lib/agent-api';
import { Project, RFQ } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function CreateAuctionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [rfqsLoading, setRfqsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    rfqId: searchParams.get('rfqId') || '',
    projectId: searchParams.get('projectId') || '',
    type: 'reverse' as 'reverse' | 'sealed',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        const [rfqData, projectData] = await Promise.all([
          fetchRFQs(user.uid),
          fetchProjects(user.uid),
        ]);
        setRfqs(rfqData);
        setProjects(projectData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load data.',
          variant: 'destructive',
        });
      } finally {
        setRfqsLoading(false);
      }
    }

    loadData();
  }, [user, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.projectId || !formData.type || !formData.startDate || !formData.endDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      toast({
        title: 'Error',
        description: 'End date must be after start date.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const auctionId = await createAuction(user.uid, {
        projectId: formData.projectId,
        type: formData.type,
        startDate,
        endDate,
      });

      toast({
        title: 'Success',
        description: 'Auction created successfully.',
      });

      router.push(`/agent/auctions/${auctionId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create auction.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AgentGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4">
            <Link href="/agent/auctions" className="text-muted-foreground hover:text-foreground">
              ← Auctions
            </Link>
            <h1 className="text-2xl font-bold font-headline ml-4">Create Auction</h1>
          </div>
        </header>

        <main className="flex-1 container py-6 px-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>New Auction</CardTitle>
              <CardDescription>Create a new auction to collect bids from contractors.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project *</Label>
                  {rfqsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading projects...
                    </div>
                  ) : (
                    <Select value={formData.projectId} onValueChange={(value) => handleSelectChange('projectId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Auction Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select auction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reverse">Reverse Auction</SelectItem>
                      <SelectItem value="sealed">Sealed Bid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Auction'
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/agent/auctions">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </AgentGuard>
  );
}
