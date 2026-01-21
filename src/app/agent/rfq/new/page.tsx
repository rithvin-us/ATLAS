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
import { fetchProjects, createRFQ } from '@/lib/agent-api';
import { Project } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function CreateRFQPage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    projectId: searchParams.get('projectId') || '',
    title: '',
    description: '',
    scopeOfWork: '',
    deadline: '',
    vendorId: searchParams.get('vendorId') || '',
  });

  useEffect(() => {
    if (!user) return;

    async function loadProjects() {
      try {
        const data = await fetchProjects(user.uid);
        setProjects(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load projects.',
          variant: 'destructive',
        });
      } finally {
        setProjectsLoading(false);
      }
    }

    loadProjects();
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
    
    if (!user || !formData.projectId || !formData.title || !formData.deadline) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const rfqId = await createRFQ(user.uid, {
        projectId: formData.projectId,
        title: formData.title,
        description: formData.description,
        scopeOfWork: formData.scopeOfWork,
        deadline: new Date(formData.deadline),
        eligibilityCriteria: [],
        documents: [],
      });

      toast({
        title: 'Success',
        description: 'RFQ created successfully.',
      });

      router.push(`/agent/rfq/${rfqId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create RFQ.',
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
            <Link href="/agent/rfq" className="text-muted-foreground hover:text-foreground">
              ← RFQs
            </Link>
            <h1 className="text-2xl font-bold font-headline ml-4">Create RFQ</h1>
          </div>
        </header>

        <main className="flex-1 container py-6 px-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>New RFQ</CardTitle>
              <CardDescription>Create a new Request for Quotation to invite vendors.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project *</Label>
                  {projectsLoading ? (
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
                  <Label htmlFor="title">RFQ Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., HVAC System Installation"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief overview of the RFQ..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scopeOfWork">Scope of Work *</Label>
                  <Textarea
                    id="scopeOfWork"
                    name="scopeOfWork"
                    placeholder="Detailed scope of work..."
                    value={formData.scopeOfWork}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={formData.deadline}
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
                      'Create RFQ'
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/agent/rfq">Cancel</Link>
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
