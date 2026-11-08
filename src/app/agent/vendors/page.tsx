'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AgentGuard } from '@/components/agent/agent-guard';
import {
  ChevronLeft,
  Star,
  CheckCircle,
  Briefcase,
  Award,
  Clock,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { MOCK_VENDOR_RECOMMENDATIONS } from '@/lib/mock-recommendation-data';

export default function AgentVendorsPage() {
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  return (
    <AgentGuard>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/agent/dashboard">
              <Button variant="ghost" className="mb-4">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-medium text-foreground">Recommended Vendors</h1>
            </div>
            <p className="text-muted-foreground text-lg">AI-powered vendor recommendations based on your procurement history</p>
          </div>

          {selectedVendor ? (
            // Vendor Detail View
            <div>
              <Button
                variant="ghost"
                onClick={() => setSelectedVendor(null)}
                className="mb-6"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Vendors
              </Button>

              <div className="grid gap-6">
                {/* Vendor Header */}
                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h2 className="text-3xl font-medium text-foreground mb-2">
                          {selectedVendor.contractor.name}
                        </h2>
                        <div className="flex gap-2 mb-4">
                          {selectedVendor.contractor.specialties.map((specialty: string) => (
                            <Badge key={specialty} className="bg-secondary text-primary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-warning fill-warning" />
                            <span>{selectedVendor.contractor.averageRating}/5.0</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span>{selectedVendor.contractor.completionRate}% completion rate</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <span>{selectedVendor.contractor.totalProjects} projects</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-5xl font-medium text-primary mb-2">
                          {selectedVendor.matchScore}%
                        </div>
                        <Badge className="bg-primary">Match Score</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vendor Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Credibility Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-4xl font-medium text-primary">
                          {selectedVendor.contractor.credibilityScore}
                        </div>
                        <Progress value={selectedVendor.contractor.credibilityScore} className="h-2" />
                        <p className="text-sm text-muted-foreground">Based on reliability, delivery, and quality</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-4xl font-medium text-primary">
                          {selectedVendor.contractor.yearsInBusiness} years
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">In business</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Completed {selectedVendor.contractor.totalProjects} successful projects
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Match Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Match Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-foreground">{selectedVendor.explanation}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(selectedVendor.matchFactors).map(([key, value]: [string, any]) => (
                        <div key={key}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-sm font-medium text-primary">{value}%</span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Button */}
                <div className="flex gap-4">
                  <Link href={`/agent/vendors/${selectedVendor.contractor.id}`} className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary text-lg py-6">
                      View Full Profile
                      <TrendingUp className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Button variant="outline" className="flex-1 text-lg py-6">
                    Send RFQ
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Vendor List View
            <div className="grid gap-4">
              {MOCK_VENDOR_RECOMMENDATIONS.map((recommendation) => (
                <Card
                  key={recommendation.id}
                  className="hover:border-foreground/25 transition-shadow cursor-pointer border-l-4 border-l-primary bg-secondary"
                  onClick={() => setSelectedVendor(recommendation)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-lg text-foreground hover:text-primary">
                            {recommendation.contractor.name}
                          </h3>
                          <Badge className="bg-primary">
                            {recommendation.matchScore}% Match
                          </Badge>
                        </div>
                        <div className="flex gap-2 mb-3">
                          {recommendation.contractor.specialties.map((specialty: string) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{recommendation.explanation}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {recommendation.matchFactors.specialtyMatch >= 70 && (
                            <Badge variant="outline" className="text-xs bg-secondary border-border text-primary">
                              Specialty: {recommendation.matchFactors.specialtyMatch}%
                            </Badge>
                          )}
                          {recommendation.matchFactors.reliabilityMatch >= 70 && (
                            <Badge variant="outline" className="text-xs bg-success/10 border-success/30 text-success">
                              Reliability: {recommendation.matchFactors.reliabilityMatch}%
                            </Badge>
                          )}
                          {recommendation.matchFactors.pricePointMatch >= 70 && (
                            <Badge variant="outline" className="text-xs bg-warning/10 border-warning/30 text-warning">
                              Price Fit: {recommendation.matchFactors.pricePointMatch}%
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-warning fill-warning" />
                            {recommendation.contractor.averageRating}/5.0
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {recommendation.contractor.completionRate}% Completion
                          </span>
                          <span className="text-primary font-medium">
                            Score: {recommendation.contractor.credibilityScore}
                          </span>
                        </div>
                      </div>
                      <ChevronLeft className="h-5 w-5 text-muted-foreground flex-shrink-0 rotate-180" />
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
