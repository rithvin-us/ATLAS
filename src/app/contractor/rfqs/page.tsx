import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter,
  Clock,
  DollarSign
} from 'lucide-react';

export default function ContractorRFQsPage() {
  const rfqs = [
    { 
      id: 1, 
      title: 'HVAC System Installation', 
      agentCompany: 'TechCorp Industries',
      budget: '$50,000',
      deadline: '2026-01-25',
      location: 'New York, NY',
      matchScore: 95,
      status: 'open'
    },
    { 
      id: 2, 
      title: 'Electrical Infrastructure Upgrade', 
      agentCompany: 'Global Manufacturing',
      budget: '$75,000',
      deadline: '2026-02-01',
      location: 'Chicago, IL',
      matchScore: 88,
      status: 'open'
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/contractor/dashboard" className="text-muted-foreground hover:text-foreground">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold font-headline ml-4">Available RFQs</h1>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        {/* Actions Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search RFQs..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter by Match
          </Button>
        </div>

        {/* RFQ List */}
        <div className="grid gap-4">
          {rfqs.map((rfq) => (
            <Card key={rfq.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{rfq.title}</CardTitle>
                      <Badge variant="outline" className="bg-green-50">
                        {rfq.matchScore}% Match
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Posted by {rfq.agentCompany}
                    </div>
                  </div>
                  <Badge variant={rfq.status === 'open' ? 'default' : 'secondary'}>
                    {rfq.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Budget</div>
                        <div className="font-medium">{rfq.budget}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Deadline</div>
                        <div className="font-medium">{rfq.deadline}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Location: </span>
                    <span className="font-medium">{rfq.location}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button asChild className="flex-1">
                      <Link href={`/contractor/rfqs/${rfq.id}`}>View Details</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/contractor/rfqs/${rfq.id}/submit`}>
                        Submit Quotation
                      </Link>
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
