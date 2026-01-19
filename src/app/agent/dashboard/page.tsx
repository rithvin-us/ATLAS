import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  FileText, 
  Gavel, 
  Users, 
  DollarSign, 
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function AgentDashboardPage() {
  // Mock data - will be replaced with real data
  const stats = {
    activeRFQs: 12,
    activeProjects: 8,
    pendingApprovals: 5,
    outstandingInvoices: 3,
  };

  const recentActivities = [
    { id: 1, type: 'rfq', message: 'New RFQ response from ABC Contractors', time: '2 hours ago' },
    { id: 2, type: 'milestone', message: 'Milestone approval required for Project Alpha', time: '4 hours ago' },
    { id: 3, type: 'invoice', message: 'Invoice submitted for Project Beta', time: '1 day ago' },
  ];

  const alerts = [
    { id: 1, type: 'delay', message: 'Project Gamma is 2 days behind schedule', severity: 'warning' },
    { id: 2, type: 'compliance', message: 'Vendor XYZ certificate expiring in 7 days', severity: 'info' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold font-headline">Agent Dashboard</h1>
          <nav className="ml-auto flex items-center space-x-4">
            <Link href="/agent/projects">
              <Button variant="ghost">Projects</Button>
            </Link>
            <Link href="/agent/rfq">
              <Button variant="ghost">RFQs</Button>
            </Link>
            <Link href="/agent/vendors">
              <Button variant="ghost">Vendors</Button>
            </Link>
            <Link href="/agent/auctions">
              <Button variant="ghost">Auctions</Button>
            </Link>
            <Link href="/agent/invoices">
              <Button variant="ghost">Invoices</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active RFQs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRFQs}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
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
                3 in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">
                Milestones & invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.outstandingInvoices}</div>
              <p className="text-xs text-muted-foreground">
                $45,000 total
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  <AlertCircle className={`h-5 w-5 flex-shrink-0 ${
                    alert.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <Badge variant="outline" className="mt-1">
                      {alert.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <Button asChild className="w-full">
              <Link href="/agent/projects/new">
                <Briefcase className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/agent/rfq/new">
                <FileText className="mr-2 h-4 w-4" />
                Create RFQ
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/agent/auctions/new">
                <Gavel className="mr-2 h-4 w-4" />
                Create Auction
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/agent/vendors">
                <Users className="mr-2 h-4 w-4" />
                Browse Vendors
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
