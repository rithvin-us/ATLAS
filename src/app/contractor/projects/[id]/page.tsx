'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { ContractorGuard } from '@/components/contractor/contractor-guard';
import { useAuth } from '@/lib/auth-context';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, Milestone } from '@/lib/types';

function ProjectDetailContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    async function loadProject() {
      if (!user) return;

      try {
        setLoading(true);
        const projectRef = doc(db, 'projects', projectId);
        const projectDoc = await getDoc(projectRef);

        if (!projectDoc.exists()) {
          setError('Project not found');
          return;
        }

        const data = projectDoc.data();
        const project: Project = {
          id: projectDoc.id,
          agentId: data.agentId,
          contractorId: data.contractorId,
          rfqId: data.rfqId,
          name: data.name || data.projectName || 'Untitled Project',
          projectName: data.projectName,
          description: data.description,
          location: data.location,
          budget: data.budget,
          projectType: data.projectType,
          status: data.status,
          startDate: data.startDate?.toDate?.() || (data.startDate ? new Date(data.startDate) : undefined),
          endDate: data.endDate?.toDate?.() || (data.endDate ? new Date(data.endDate) : undefined),
          siteDetails: data.siteDetails || {
            name: data.name || 'Site',
            location: data.location || 'TBD',
            address: data.address || 'TBD',
            description: data.description || '',
          },
          milestones: data.milestones || [],
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        };

        // Verify this project belongs to the contractor
        if (project.contractorId !== user.uid) {
          setError('You do not have access to this project');
          return;
        }

        setProject(project);
      } catch (err) {
        console.error('Failed to load project:', err);
        setError('Failed to load project. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [user, projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">{error || 'Project not found'}</p>
          <Button className="mt-4" onClick={() => router.push('/contractor/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const completedMilestones = project.milestones?.filter(m => m.status === 'completed').length || 0;
  const totalMilestones = project.milestones?.length || 0;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/contractor/projects" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold font-headline ml-4">{project.name}</h1>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{project.location}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Budget</div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>${project.budget?.toLocaleString() || 'TBD'}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Start Date</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">End Date</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Milestones</CardTitle>
                  <Badge variant="outline">
                    {completedMilestones} / {totalMilestones} completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.milestones && project.milestones.length > 0 ? (
                    project.milestones.map((milestone) => (
                      <div key={milestone.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3 flex-1">
                            {milestone.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : milestone.status === 'in-progress' ? (
                              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-300 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold">{milestone.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {milestone.description}
                              </p>
                            </div>
                          </div>
                          <Badge variant={
                            milestone.status === 'completed' ? 'default' :
                            milestone.status === 'in-progress' ? 'secondary' :
                            'outline'
                          }>
                            {milestone.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Payment: </span>
                            <span className="font-semibold">${milestone.payment?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Due: </span>
                            <span>{new Date(milestone.dueDate).toLocaleDateString()}</span>
                          </div>
                          {milestone.status === 'approved' && (
                            <Button size="sm" asChild>
                              <Link href={`/contractor/invoices/new?milestoneId=${milestone.id}&projectId=${project.id}`}>
                                Create Invoice
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No milestones defined for this project.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge 
                  variant={
                    project.status === 'completed' ? 'default' :
                    project.status === 'in-progress' ? 'secondary' :
                    'outline'
                  }
                  className="text-base px-4 py-2"
                >
                  {project.status}
                </Badge>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground">
                    {completedMilestones} of {totalMilestones} milestones completed
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/contractor/invoices/new">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ContractorProjectDetailPage() {
  return (
    <ContractorGuard>
      <ProjectDetailContent />
    </ContractorGuard>
  );
}
