import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter,
  MessageSquare
} from 'lucide-react';

export default function AgentRFQPage() {
  const rfqs = [
    { 
      id: 1, 
      title: 'HVAC System Installation', 
      status: 'published', 
      responses: 5,
      deadline: '2026-01-25',
      project: 'Office Complex HVAC'
    },
    { 
      id: 2, 
      title: 'Electrical Wiring Phase 2', 
      status: 'draft', 
      responses: 0,
      deadline: '2026-02-01',
      project: 'Industrial Plant Renovation'
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/agent/dashboard" className="text-muted-foreground hover:text-foreground">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold font-headline ml-4">RFQ Management</h1>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search RFQs..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
          <Button asChild>
            <Link href="/agent/rfq/new">
              <Plus className="mr-2 h-4 w-4" />
              Create RFQ
            </Link>
          </Button>
        </div>

        {/* RFQ List */}
        <div className="grid gap-4">
          {rfqs.map((rfq) => (
            <Card key={rfq.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle>{rfq.title}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Project: {rfq.project}
                    </div>
                  </div>
                  <Badge variant={rfq.status === 'published' ? 'default' : 'secondary'}>
                    {rfq.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="font-medium">{rfq.deadline}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Responses:</span>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">{rfq.responses}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button asChild className="flex-1">
                      <Link href={`/agent/rfq/${rfq.id}`}>View Details</Link>
                    </Button>
                    {rfq.responses > 0 && (
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/agent/rfq/${rfq.id}/responses`}>
                          View Responses ({rfq.responses})
                        </Link>
                      </Button>
                    )}
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
