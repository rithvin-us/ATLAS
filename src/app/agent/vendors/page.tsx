'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AgentGuard } from '@/components/agent/agent-guard';
import { fetchVendors } from '@/lib/agent-api';
import { Vendor } from '@/lib/types';
import {
  Search,
  Award,
  MapPin,
  Briefcase,
  Loader2,
} from 'lucide-react';

export default function AgentVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('all');
  const [location, setLocation] = useState('all');
  const [minScore, setMinScore] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVendors();
        setVendors(data);
      } catch (err: any) {
        setError(err?.message || 'Unable to load vendors');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch = vendor.name.toLowerCase().includes(search.toLowerCase());
      const matchesIndustry = industry === 'all' || vendor.industry.toLowerCase() === industry;
      const matchesLocation = location === 'all' || vendor.location.toLowerCase().includes(location);
      const matchesScore = minScore === 'all' || vendor.credibilityScore >= Number(minScore);
      return matchesSearch && matchesIndustry && matchesLocation && matchesScore;
    });
  }, [vendors, search, industry, location, minScore]);

  return (
    <AgentGuard>
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
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={industry} onValueChange={setIndustry}>
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
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="new york">New York</SelectItem>
                    <SelectItem value="california">California</SelectItem>
                    <SelectItem value="illinois">Illinois</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={minScore} onValueChange={setMinScore}>
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

          {error && (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading vendors...</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.length === 0 ? (
                <Card className="md:col-span-2 lg:col-span-3">
                  <CardContent className="py-10 text-center text-muted-foreground">
                    {vendors.length === 0 ? 'No verified vendors found.' : 'No vendors match your filters.'}
                  </CardContent>
                </Card>
              ) : (
                filtered.map((vendor) => (
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
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </AgentGuard>
  );
}
