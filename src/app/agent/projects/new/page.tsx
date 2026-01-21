'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { AgentGuard } from '@/components/agent/agent-guard';
import { createProject } from '@/lib/agent-api';
import { Loader2 } from 'lucide-react';

export default function CreateProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    plantType: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.name || !formData.location) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const projectId = await createProject(user.uid, {
        name: formData.name,
        siteDetails: {
          name: formData.name,
          location: formData.location,
          address: formData.address,
          plantType: formData.plantType || undefined,
          description: formData.description,
        },
        status: 'draft',
        milestones: [],
      });

      toast({
        title: 'Success',
        description: 'Project created successfully.',
      });

      router.push(`/agent/projects/${projectId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create project.',
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
            <Link href="/agent/projects" className="text-muted-foreground hover:text-foreground">
              ← Projects
            </Link>
            <h1 className="text-2xl font-bold font-headline ml-4">Create Project</h1>
          </div>
        </header>

        <main className="flex-1 container py-6 px-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>New Project</CardTitle>
              <CardDescription>Create a new project to manage and track work.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Office Complex HVAC Installation"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., New York, NY"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="e.g., 123 Main Street, New York, NY 10001"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plantType">Plant Type</Label>
                  <Input
                    id="plantType"
                    name="plantType"
                    placeholder="e.g., Industrial Plant, Office Building"
                    value={formData.plantType}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide a detailed description of the project..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
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
                      'Create Project'
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/agent/projects">Cancel</Link>
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
