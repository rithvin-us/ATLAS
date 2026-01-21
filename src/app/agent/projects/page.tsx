'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AgentGuard } from '@/components/agent/agent-guard';
import { useAuth } from '@/lib/auth-context';
import { fetchProjects } from '@/lib/agent-api';
import { Project } from '@/lib/types';
import {
  Plus,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';

export default function AgentProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Project['status'] | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProjects(user.uid);
        setProjects(data);
      } catch (err: any) {
        setError(err?.message || 'Unable to load projects');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  return (
    <AgentGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4">
            <Link href="/agent/dashboard" className="text-muted-foreground hover:text-foreground">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold font-headline ml-4">Projects</h1>
          </div>
        </header>

        <main className="flex-1 container py-6 px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant={statusFilter === 'all' ? 'outline' : 'default'}
                onClick={() => setStatusFilter((prev) => (prev === 'all' ? 'active' : 'all'))}
              >
                <Filter className="mr-2 h-4 w-4" />
                {statusFilter === 'all' ? 'Show Active' : 'Show All'}
              </Button>
            </div>
            <Button asChild>
              <Link href="/agent/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading projects...</span>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProjects.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    {projects.length === 0 ? 'No projects yet. Create one to get started.' : 'No projects match your filters.'}
                  </CardContent>
                </Card>
              ) : (
                filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle>{project.name}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{project.siteDetails?.location || 'Unspecified site'}</span>
                            <span>•</span>
                            <span>Started {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                        <Badge variant={project.status === 'in-progress' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {project.contractorId && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Contractor: </span>
                            <span className="font-medium">{project.contractorId}</span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button asChild className="flex-1">
                            <Link href={`/agent/projects/${project.id}`}>View Details</Link>
                          </Button>
                          <Button asChild variant="outline" className="flex-1">
                            <Link href={`/agent/rfq/new?projectId=${project.id}`}>New RFQ</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </AgentGuard>
  );
}
