import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Briefcase, 
  DollarSign, 
  Award,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function ContractorDashboardPage() {
  // Mock data - will be replaced with real data
  const stats = {
    availableRFQs: 8,
    activeProjects: 5,
    pendingPayments: 2,
    credibilityScore: 87,
  };

  const availableRFQs = [
    { id: 1, title: 'HVAC System Installation', deadline: '2026-01-25', budget: '$50,000' },
    { id: 2, title: 'Electrical Wiring - Phase 2', deadline: '2026-01-28', budget: '$35,000' },
    { id: 3, title: 'Plumbing Infrastructure', deadline: '2026-02-05', budget: '$42,000' },
  ];

  const activeProjects = [
    { id: 1, name: 'Project Alpha', progress: 75, nextMilestone: 'Final inspection' },
    { id: 2, name: 'Project Beta', progress: 45, nextMilestone: 'Equipment delivery' },
  ];

  const notifications = [
    { id: 1, message: 'New RFQ matching your profile posted', time: '1 hour ago' },
    { id: 2, message: 'Milestone approved for Project Alpha', time: '3 hours ago' },
    { id: 3, message: 'Payment processed for Invoice #1234', time: '1 day ago' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold font-headline">Contractor Dashboard</h1>
          <nav className="ml-auto flex items-center space-x-4">
            <Link href="/contractor/rfqs">
              <Button variant="ghost">RFQs</Button>
            </Link>
            <Link href="/contractor/projects">
              <Button variant="ghost">Projects</Button>
            </Link>
            <Link href="/contractor/auctions">
              <Button variant="ghost">Auctions</Button>
            </Link>
            <Link href="/contractor/invoices">
              <Button variant="ghost">Invoices</Button>
            </Link>
            <Link href="/contractor/credibility">
              <Button variant="ghost">Credibility</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available RFQs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableRFQs}</div>
              <p className="text-xs text-muted-foreground">
                Matching your profile
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                2 milestones due soon
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">
                $28,500 total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credibility Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.credibilityScore}</div>
              <p className="text-xs text-green-600">
                +3 from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Available RFQs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Available RFQs
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/contractor/rfqs">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableRFQs.map((rfq) => (
                <div key={rfq.id} className="p-4 rounded-lg border hover:bg-muted transition-colors">
                  <h4 className="font-semibold">{rfq.title}</h4>
                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {rfq.deadline}
                    </span>
                    <Badge variant="outline">{rfq.budget}</Badge>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    View Details
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Active Projects
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/contractor/projects">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeProjects.map((project) => (
                <div key={project.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{project.name}</h4>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Next: {project.nextMilestone}
                  </p>
                  <Button size="sm" variant="outline" className="w-full mt-3">
                    Update Progress
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <Button asChild className="w-full">
              <Link href="/contractor/rfqs">
                <FileText className="mr-2 h-4 w-4" />
                Browse RFQs
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/contractor/invoices/new">
                <DollarSign className="mr-2 h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/contractor/compliance">
                <CheckCircle className="mr-2 h-4 w-4" />
                Update Compliance
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/contractor/credibility">
                <Award className="mr-2 h-4 w-4" />
                View Credibility
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
