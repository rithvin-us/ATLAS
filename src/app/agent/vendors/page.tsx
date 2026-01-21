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
      <div className="min-h-screen bg-gray-50">
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
              <Sparkles className="h-8 w-8 text-purple-600" />
              <h1 className="text-4xl font-bold text-gray-900">Recommended Vendors</h1>
            </div>
            <p className="text-gray-600 text-lg">AI-powered vendor recommendations based on your procurement history</p>
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {selectedVendor.contractor.name}
                        </h2>
                        <div className="flex gap-2 mb-4">
                          {selectedVendor.contractor.specialties.map((specialty: string) => (
                            <Badge key={specialty} className="bg-blue-100 text-blue-700">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span>{selectedVendor.contractor.averageRating}/5.0</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>{selectedVendor.contractor.completionRate}% completion rate</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                            <span>{selectedVendor.contractor.totalProjects} projects</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-5xl font-bold text-purple-600 mb-2">
                          {selectedVendor.matchScore}%
                        </div>
                        <Badge className="bg-purple-600">Match Score</Badge>
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
                        <div className="text-4xl font-bold text-purple-600">
                          {selectedVendor.contractor.credibilityScore}
                        </div>
                        <Progress value={selectedVendor.contractor.credibilityScore} className="h-2" />
                        <p className="text-sm text-gray-600">Based on reliability, delivery, and quality</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-4xl font-bold text-blue-600">
                          {selectedVendor.contractor.yearsInBusiness} years
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-600">In business</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
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
                    <p className="text-gray-700">{selectedVendor.explanation}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(selectedVendor.matchFactors).map(([key, value]: [string, any]) => (
                        <div key={key}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-sm font-bold text-purple-600">{value}%</span>
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
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
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
                  className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/30 to-transparent"
                  onClick={() => setSelectedVendor(recommendation)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 hover:text-purple-600">
                            {recommendation.contractor.name}
                          </h3>
                          <Badge className="bg-purple-600">
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

                        <p className="text-sm text-gray-600 mb-3">{recommendation.explanation}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {recommendation.matchFactors.specialtyMatch >= 70 && (
                            <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                              Specialty: {recommendation.matchFactors.specialtyMatch}%
                            </Badge>
                          )}
                          {recommendation.matchFactors.reliabilityMatch >= 70 && (
                            <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                              Reliability: {recommendation.matchFactors.reliabilityMatch}%
                            </Badge>
                          )}
                          {recommendation.matchFactors.pricePointMatch >= 70 && (
                            <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                              Price Fit: {recommendation.matchFactors.pricePointMatch}%
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            {recommendation.contractor.averageRating}/5.0
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {recommendation.contractor.completionRate}% Completion
                          </span>
                          <span className="text-purple-600 font-medium">
                            Score: {recommendation.contractor.credibilityScore}
                          </span>
                        </div>
                      </div>
                      <ChevronLeft className="h-5 w-5 text-gray-400 flex-shrink-0 rotate-180" />
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
