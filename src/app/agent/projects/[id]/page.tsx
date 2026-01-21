'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AgentGuard } from '@/components/agent/agent-guard';
import { fetchProject, updateProjectStatus } from '@/lib/agent-api';
import { Project } from '@/lib/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProject(projectId);
        if (!data) {
          setError('Project not found');
          setProject(null);
        } else {
          setProject(data);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projectId]);

  const handleStatusChange = async (newStatus: Project['status']) => {
    if (!project) return;
    
    setUpdating(true);
    try {
      await updateProjectStatus(projectId, newStatus);
      setProject({ ...project, status: newStatus });
      toast({
        title: 'Success',
        description: 'Project status updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AgentGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4">
            <Link href="/agent/projects" className="text-muted-foreground hover:text-foreground flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Projects
            </Link>
            <h1 className="text-2xl font-bold font-headline ml-4">Project Details</h1>
          </div>
        </header>

        <main className="flex-1 container py-6 px-4">
          {error && !loading && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading project...</span>
            </div>
          ) : project ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl">{project.name}</CardTitle>
                      <p className="text-muted-foreground mt-2">{project.siteDetails?.description}</p>
                    </div>
                    <Badge variant={project.status === 'in-progress' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{project.siteDetails?.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{project.siteDetails?.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Plant Type</p>
                      <p className="font-medium">{project.siteDetails?.plantType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Update Status</label>
                    <div className="flex gap-2">
                      <Select 
                        value={project.status} 
                        onValueChange={(value) => handleStatusChange(value as Project['status'])}
                        disabled={updating}
                      >
                        <SelectTrigger className="w-full max-w-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      {updating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button asChild>
                    <Link href={`/agent/rfq/new?projectId=${project.id}`}>Create RFQ</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/agent/auctions/new?projectId=${project.id}`}>Create Auction</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </main>
      </div>
    </AgentGuard>
  );
}
