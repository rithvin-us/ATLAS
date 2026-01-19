import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical
} from 'lucide-react';

export default function AgentProjectsPage() {
  const projects = [
    { 
      id: 1, 
      name: 'Industrial Plant Renovation', 
      status: 'in-progress', 
      contractor: 'ABC Contractors',
      progress: 65,
      startDate: '2026-01-10',
      location: 'Site A'
    },
    { 
      id: 2, 
      name: 'Office Complex HVAC', 
      status: 'active', 
      contractor: null,
      progress: 0,
      startDate: '2026-01-20',
      location: 'Site B'
    },
  ];

  return (
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
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
          <Button asChild>
            <Link href="/agent/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Link>
          </Button>
        </div>

        {/* Projects List */}
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{project.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{project.location}</span>
                      <span>•</span>
                      <span>Started {project.startDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={project.status === 'in-progress' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.contractor && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Contractor: </span>
                      <span className="font-medium">{project.contractor}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/agent/projects/${project.id}`}>View Details</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/agent/projects/${project.id}/milestones`}>Milestones</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
