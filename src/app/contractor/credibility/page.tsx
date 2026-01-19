import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  Award,
  Clock,
  Star,
  CheckCircle
} from 'lucide-react';

export default function ContractorCredibilityPage() {
  const credibilityData = {
    overallScore: 87,
    factors: {
      projectCompletion: 90,
      timelyDelivery: 85,
      qualityRating: 88,
      complianceScore: 92,
      communicationScore: 82
    },
    recentProjects: [
      { name: 'Project Alpha', rating: 5, feedback: 'Excellent work, delivered on time', date: '2026-01-15' },
      { name: 'Project Beta', rating: 4, feedback: 'Good quality, minor delays', date: '2025-12-20' },
    ],
    stats: {
      totalProjects: 45,
      onTimeDelivery: '85%',
      avgRating: 4.5,
      clientRetention: '90%'
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/contractor/dashboard" className="text-muted-foreground hover:text-foreground">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold font-headline ml-4">Credibility & Performance</h1>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        {/* Overall Score */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-600" />
              Overall Credibility Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-6xl font-bold text-green-600">{credibilityData.overallScore}</div>
                <div className="text-sm text-muted-foreground mt-2">Excellent Performance</div>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">+3 from last month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You're in the top 15% of contractors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Factors */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(credibilityData.factors).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-bold">{value}%</span>
                </div>
                <Progress value={value} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Projects</span>
                <span className="text-lg font-bold">{credibilityData.stats.totalProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">On-Time Delivery</span>
                <span className="text-lg font-bold text-green-600">{credibilityData.stats.onTimeDelivery}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold">{credibilityData.stats.avgRating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Client Retention</span>
                <span className="text-lg font-bold">{credibilityData.stats.clientRetention}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {credibilityData.recentProjects.map((project, index) => (
                <div key={index} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{project.name}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(project.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{project.feedback}</p>
                  <p className="text-xs text-muted-foreground">{project.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Improvement Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Improve Your Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Complete projects on time</div>
                <p className="text-sm text-muted-foreground">Meeting deadlines consistently improves your delivery score</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Maintain active communication</div>
                <p className="text-sm text-muted-foreground">Regular updates and quick responses boost your communication score</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Keep compliance documents updated</div>
                <p className="text-sm text-muted-foreground">Valid certificates and credentials improve your compliance score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
