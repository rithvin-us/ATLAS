"use client";

import { Award, TrendingUp, Clock, CheckCircle, AlertTriangle, Upload, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContractorGuard } from "@/components/contractor/contractor-guard";

function CredibilityPageContent() {
  const score = 85;

  const metrics = [
    { label: "On-Time Completion", value: 95, max: 100, color: "text-success", bg: "bg-success/10" },
    { label: "Quality Rating", value: 4.8, max: 5, color: "text-primary", bg: "bg-secondary" },
    { label: "Response Rate", value: 92, max: 100, color: "text-primary", bg: "bg-secondary" },
    { label: "Compliance Score", value: 88, max: 100, color: "text-warning", bg: "bg-warning/10" },
  ];

  const documents = [
    { name: "GST Certificate", status: "verified", uploadedDate: "2024-01-15" },
    { name: "Business License", status: "verified", uploadedDate: "2024-01-10" },
    { name: "Insurance Certificate", status: "expiring", expiryDate: "2026-02-20" },
    { name: "Bank Details", status: "verified", uploadedDate: "2024-01-08" },
  ];

  const tips = [
    { icon: CheckCircle, text: "Complete projects on time to boost your on-time completion score", tip: "Current: 95%" },
    { icon: TrendingUp, text: "Request client feedback after project completion", tip: "Helps improve quality rating" },
    { icon: Clock, text: "Respond to RFQs within 24 hours", tip: "Increases response rate" },
    { icon: FileText, text: "Keep compliance documents up to date", tip: "Renew insurance before expiry" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-medium text-foreground flex items-center gap-3 mb-2">
            <Award className="h-10 w-10 text-warning fill-warning" />
            Your Credibility Profile
          </h1>
          <p className="text-muted-foreground text-lg">Build trust and credibility to win more projects</p>
        </div>

        {/* Big Score Meter */}
        <Card className="mb-8 bg-secondary border-0">
          <CardHeader>
            <CardTitle>Credibility Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between">
              {/* Score Circle */}
              <div className="flex flex-col items-center mb-8 md:mb-0">
                <div className="relative h-48 w-48 rounded-full bg-card flex items-center justify-center border-8 border-primary">
                  <div className="text-center">
                    <div className="text-6xl font-medium text-foreground">{score}</div>
                    <div className="text-muted-foreground text-sm font-medium mt-1">out of 100</div>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="flex-1 md:ml-12">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">{score}%</span>
                    </div>
                    <div className="h-4 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full transition-colors duration-500"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-foreground mb-3">
                      <span className="font-medium text-success">Excellent</span> - You're in the top 20% of contractors. Keep up the great work!
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-success/10 text-success">Verified</Badge>
                      <Badge className="bg-secondary text-primary">Active</Badge>
                      <Badge className="bg-secondary text-primary">Trusted</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-foreground mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, idx) => (
              <Card key={idx} className="border-0 hover:border-foreground/25 transition-shadow">
                <CardContent className="p-6">
                  <div className={`h-12 w-12 rounded-xl ${metric.bg} flex items-center justify-center mb-4`}>
                    <TrendingUp className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-medium ${metric.color}`}>{metric.value}</span>
                    <span className="text-muted-foreground">/ {metric.max}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full transition-colors ${metric.color.replace('text-', 'bg-')}`}
                      style={{ width: `${(metric.value / metric.max) * 100}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Compliance Documents */}
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-foreground mb-4">Compliance Documents</h2>
          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <Card key={idx} className="border-0 hover:border-foreground/25 transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.status === "verified" && `Verified on ${doc.uploadedDate}`}
                        {doc.status === "expiring" && `Expires on ${doc.expiryDate}`}
                      </p>
                    </div>
                  </div>
                  {doc.status === "verified" && (
                    <Badge className="bg-success/10 text-success">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {doc.status === "expiring" && (
                    <Badge className="bg-warning/10 text-warning">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Expiring Soon
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <Button className="w-full mt-4" variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload New Document
          </Button>
        </div>

        {/* Tips to Improve */}
        <Card className="border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Tips to Improve Your Credibility
            </CardTitle>
            <CardDescription>Follow these recommendations to boost your score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tips.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex gap-4 p-4 bg-secondary rounded-lg">
                    <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-foreground mb-1">{item.text}</p>
                      <p className="text-sm text-muted-foreground">{item.tip}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="border-0">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { event: "Project Completed", project: "Website Redesign", date: "2 days ago", impact: "+2" },
                { event: "Positive Review", project: "Mobile App Dev", date: "1 week ago", impact: "+3" },
                { event: "On-Time Delivery", project: "API Integration", date: "2 weeks ago", impact: "+2" },
                { event: "GST Certificate Verified", project: "Compliance", date: "1 month ago", impact: "+5" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{item.event}</p>
                      <p className="text-sm text-muted-foreground">{item.project} • {item.date}</p>
                    </div>
                  </div>
                  <span className="font-medium text-success">{item.impact} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function CredibilityPage() {
  return (
    <ContractorGuard>
      <CredibilityPageContent />
    </ContractorGuard>
  );
}

