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
        if (!user) return;
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

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active' || p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'draft').length,
  };

  return (
    <AgentGuard>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Projects
            </h1>
            <p className="text-gray-600 text-lg">Manage and track all your construction projects</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <svg className="h-6 w-6 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <svg className="h-6 w-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <svg className="h-6 w-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <svg className="h-6 w-6 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-600">Planning</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.planning}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search projects by name..."
              className="pl-10 h-12 rounded-xl border-gray-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <Link href="/agent/projects/new">
            <Button size="lg" className="h-12">
              <Plus className="mr-2 h-5 w-5" />
              Create Project
            </Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center gap-3">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-gray-600 font-medium">
                {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {projects.length === 0 ? 'Create a project to get started' : 'Try adjusting your search or filter'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow border-0">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <Badge variant={project.status === 'in-progress' || project.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{project.siteDetails?.location || 'Unspecified site'}</p>
                      <p className="text-xs text-gray-500 mt-1">Started {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  {project.contractorId && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Contractor</p>
                      <p className="text-sm font-medium text-gray-900">{project.contractorId.substring(0, 8)}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/agent/projects/${project.id}`} className="flex-1">
                      <Button className="w-full" size="sm">View Details</Button>
                    </Link>
                    <Link href={`/agent/rfq/new?projectId=${project.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">New RFQ</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </main>
      </div>
    </AgentGuard>
  );
}
