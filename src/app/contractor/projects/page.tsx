'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Briefcase,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  Building2,
  ListChecks,
  ClipboardList,
  Send,
  ArrowRight,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { fetchContractorProjects } from '@/lib/contractor-api';
import { Project, Milestone } from '@/lib/types';

function ProjectsContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [progressNote, setProgressNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const buildDummyProject = (): Project => {
    const today = new Date();
    const inSeven = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const inThirty = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const milestones: Milestone[] = [
      {
        id: 'demo-m1',
        projectId: 'demo-project',
        title: 'Site Mobilization',
        description: 'Set up site, safety briefing, and staging area.',
        status: 'pending',
        dueDate: inSeven,
        paymentAmount: 15000,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 'demo-m2',
        projectId: 'demo-project',
        title: 'Foundation Pour',
        description: 'Rebar, formwork, and concrete pour with QA.',
        status: 'in-progress',
        dueDate: inThirty,
        paymentAmount: 32000,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 'demo-m3',
        projectId: 'demo-project',
        title: 'Quality Verification',
        description: 'Agent verification and punch list closure.',
        status: 'verification-pending',
        dueDate: inThirty,
        paymentAmount: 8000,
        createdAt: today,
        updatedAt: today,
      },
    ];

    return {
      id: 'demo-project',
      name: 'Demo Logistics Hub',
      description: 'Sample project to exercise milestone state machine and planning UI.',
      status: 'in-progress',
      totalBudget: 55000,
      siteDetails: {
        location: 'Demo City, DC',
        latitude: 0,
        longitude: 0,
      },
      milestones,
      createdAt: today,
      updatedAt: today,
      contractorId: user?.uid ?? 'demo-contractor',
      agentId: 'demo-agent',
    } as Project;
  };

  useEffect(() => {
    async function loadProjects() {
      if (!user) return;

      try {
        setLoading(true);
        const data = await fetchContractorProjects(user.uid);
        if (data.length === 0) {
          const dummy = buildDummyProject();
          setProjects([dummy]);
          setSelectedProject(dummy);
        } else {
          setProjects(data);
          setSelectedProject((prev) => prev || data[0] || null);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [user]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.siteDetails.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  useEffect(() => {
    if (selectedProject && !filteredProjects.find((p) => p.id === selectedProject.id)) {
      setSelectedProject(filteredProjects[0] || null);
    }
  }, [filteredProjects, selectedProject]);

  const statusTone = (status: Project['status']) => {
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'in-progress' || status === 'active') return 'bg-blue-100 text-blue-800';
    if (status === 'closed') return 'bg-gray-100 text-gray-800';
    return 'bg-amber-100 text-amber-800';
  };

  const formatDate = (date?: Date) => (date ? new Date(date).toLocaleDateString() : '—');

  const calcProgress = (project: Project) => {
    const completed = project.milestones?.filter((m) => m.status === 'completed').length ?? 0;
    const total = project.milestones?.length ?? 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getStartEndDates = (project: Project) => {
    const milestones = project.milestones || [];
    if (milestones.length === 0) {
      return { start: project.createdAt, end: project.createdAt };
    }
    const dates = milestones
      .map((m) => (m as any).targetDate ?? m.dueDate)
      .filter(Boolean)
      .map((d) => new Date(d as Date).getTime());
    if (dates.length === 0) {
      return { start: project.createdAt, end: project.createdAt };
    }
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    return { start: min, end: max };
  };

  const handleProgressSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setToast('Progress update saved for ' + selectedProject.name + '.');
    setProgressNote('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 flex gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Unable to load projects</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-2">Awarded and ongoing projects with milestones and contacts.</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {projects.length} total projects
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {toast && (
          <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {toast}
          </div>
        )}

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by code, name, or location"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <Briefcase className="h-14 w-14 text-gray-300 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">No projects match your filters</h3>
              <p className="text-sm text-gray-600">Try adjusting search keywords or status filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project list</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Project Code</TableHead>
                      <TableHead className="font-semibold">Project</TableHead>
                      <TableHead className="font-semibold">Client / Agent</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Start / End</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => {
                      const progress = calcProgress(project);
                      const { start, end } = getStartEndDates(project);
                      const isSelected = selectedProject?.id === project.id;
                      return (
                        <TableRow
                          key={project.id}
                          className={`cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                          onClick={() => setSelectedProject(project)}
                        >
                          <TableCell className="font-mono text-sm text-blue-700">{project.id.slice(0, 8)}</TableCell>
                          <TableCell>
                            <div className="text-gray-900 font-semibold">{project.name}</div>
                            <div className="text-xs text-gray-500">{project.siteDetails.description?.slice(0, 60)}{project.siteDetails.description?.length > 60 ? '…' : ''}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              {project.siteDetails.name || 'Agent organization'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusTone(project.status)}>{project.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-800">{formatDate(start)}</div>
                            <div className="text-xs text-gray-500">to {formatDate(end)}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedProject(project)}>
                              View <ArrowRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedProject ? (
                  <div className="text-sm text-gray-600">Select a project to view details.</div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Project Code</div>
                        <div className="font-mono text-sm text-blue-700">{selectedProject.id}</div>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1">{selectedProject.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                          {selectedProject.siteDetails.description}
                        </p>
                      </div>
                      <Badge className={statusTone(selectedProject.status)}>{selectedProject.status}</Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-400" /> {selectedProject.siteDetails.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-400" /> {formatDate(getStartEndDates(selectedProject).start)} — {formatDate(getStartEndDates(selectedProject).end)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Building2 className="h-4 w-4 text-gray-400" /> {selectedProject.siteDetails.name || 'Agent contact pending'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">{calcProgress(selectedProject)}%</span>
                      </div>
                      <Progress value={calcProgress(selectedProject)} />
                      <p className="text-xs text-gray-500">
                        {selectedProject.milestones?.filter((m) => m.status === 'completed').length ?? 0} of {selectedProject.milestones?.length ?? 0} milestones completed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <ListChecks className="h-4 w-4 text-gray-500" /> Milestones
                      </div>
                      {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                        <div className="space-y-2">
                          {selectedProject.milestones.slice(0, 4).map((milestone) => (
                            <div key={milestone.id} className="rounded-lg border p-3 bg-gray-50">
                              <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                                {milestone.name}
                                <Badge variant="outline" className="text-xs capitalize">{milestone.status}</Badge>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">Target: {formatDate((milestone as any).targetDate ?? milestone.dueDate)}</div>
                              {milestone.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{milestone.description}</p>
                              )}
                            </div>
                          ))}
                          {selectedProject.milestones.length > 4 && (
                            <p className="text-xs text-gray-500">+ more milestones in project detail</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">Milestones not provided.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <ClipboardList className="h-4 w-4 text-gray-500" /> Deliverables
                      </div>
                      <p className="text-sm text-gray-600">Deliverables align with listed milestones and agreed acceptance criteria.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-gray-800">Progress update</div>
                      <form className="space-y-2" onSubmit={handleProgressSubmit}>
                        <Textarea
                          placeholder="Share progress, blockers, or upcoming deliverables."
                          value={progressNote}
                          onChange={(e) => setProgressNote(e.target.value)}
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button type="submit" size="sm" className="gap-2" disabled={!progressNote.trim()}>
                            <Send className="h-4 w-4" />
                            Save update
                          </Button>
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContractorProjectsPage() {
  return <ProjectsContent />;
}
