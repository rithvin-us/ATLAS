import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter,
  Award,
  MapPin,
  Briefcase
} from 'lucide-react';

export default function AgentVendorsPage() {
  const vendors = [
    { 
      id: 1, 
      name: 'ABC Contractors', 
      industry: 'HVAC',
      location: 'New York, NY',
      credibilityScore: 92,
      projectsCompleted: 45,
      verificationStatus: 'verified'
    },
    { 
      id: 2, 
      name: 'Elite Electrical Services', 
      industry: 'Electrical',
      location: 'Los Angeles, CA',
      credibilityScore: 88,
      projectsCompleted: 38,
      verificationStatus: 'verified'
    },
    { 
      id: 3, 
      name: 'Premier Plumbing Co', 
      industry: 'Plumbing',
      location: 'Chicago, IL',
      credibilityScore: 85,
      projectsCompleted: 52,
      verificationStatus: 'verified'
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/agent/dashboard" className="text-muted-foreground hover:text-foreground">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold font-headline ml-4">Vendor Network</h1>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  className="pl-10"
                />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="ny">New York</SelectItem>
                  <SelectItem value="ca">California</SelectItem>
                  <SelectItem value="il">Illinois</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Min Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Score</SelectItem>
                  <SelectItem value="90">90+</SelectItem>
                  <SelectItem value="80">80+</SelectItem>
                  <SelectItem value="70">70+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vendors List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{vendor.name}</CardTitle>
                    <Badge variant="outline">{vendor.industry}</Badge>
                  </div>
                  {vendor.verificationStatus === 'verified' && (
                    <Badge className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {vendor.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  {vendor.projectsCompleted} projects completed
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="text-sm font-medium">Credibility Score</div>
                      <div className="text-2xl font-bold text-green-600">{vendor.credibilityScore}</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button asChild className="flex-1">
                    <Link href={`/agent/vendors/${vendor.id}`}>View Profile</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/agent/rfq/new?vendorId=${vendor.id}`}>
                      Invite to RFQ
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
