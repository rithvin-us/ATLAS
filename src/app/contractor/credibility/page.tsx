'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ContractorGuard } from '@/components/contractor/contractor-guard';
import { useAuth } from '@/lib/auth-context';
import { fetchContractorCredibility } from '@/lib/contractor-api';
import { CredibilityScore } from '@/lib/types';

function CircularGauge({ score, size = 120 }: { score: number; size?: number }) {
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const offset = circumference - (score / 100) * circumference;

  let color = '#ef4444'; // red
  if (score >= 75) color = '#22c55e'; // green
  else if (score >= 60) color = '#f59e0b'; // amber
  else if (score >= 45) color = '#f97316'; // orange

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold">{score}</div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FactorCard({ label, score, description, icon: Icon }: { label: string; score: number; description: string; icon: any }) {
  const getStatus = (s: number) => {
    if (s >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-900' };
    if (s >= 70) return { label: 'Good', color: 'bg-blue-100 text-blue-900' };
    if (s >= 60) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-900' };
    return { label: 'Needs Work', color: 'bg-red-100 text-red-900' };
  };

  const status = getStatus(score);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">{label}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{score}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                score >= 80
                  ? 'bg-green-500'
                  : score >= 70
                    ? 'bg-blue-500'
                    : score >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TipCard({ title, description, priority }: { title: string; description: string; priority: 'high' | 'medium' | 'low' }) {
  const priorityConfig = {
    high: { label: 'High Priority', color: 'bg-red-50 border-red-200 text-red-900', icon: AlertTriangle },
    medium: { label: 'Medium Priority', color: 'bg-yellow-50 border-yellow-200 text-yellow-900', icon: TrendingUp },
    low: { label: 'Suggestion', color: 'bg-blue-50 border-blue-200 text-blue-900', icon: CheckCircle2 },
  };

  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 ${config.color}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
    </div>
  );
}

function CredibilityContent() {
  const { user } = useAuth();
  const [credibility, setCredibility] = useState<CredibilityScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCredibility() {
      if (!user) return;

      try {
        setLoading(true);
        const data = await fetchContractorCredibility(user.uid);
        if (!data) {
          // Mock default credibility for new contractors
          setCredibility({
            id: user.uid,
            contractorId: user.uid,
            score: 65,
            factors: {
              projectCompletion: 70,
              timelyDelivery: 60,
              qualityRating: 65,
              complianceScore: 72,
              communicationScore: 68,
            },
            history: [],
            updatedAt: new Date(),
          });
        } else {
          setCredibility(data);
        }
      } catch (err) {
        console.error('Failed to load credibility:', err);
        setError('Failed to load your credibility score. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadCredibility();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!credibility) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Unable to load credibility data</p>
          <Button className="mt-4" asChild>
            <Link href="/contractor/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const generateTips = () => {
    const tips = [];

    if (credibility.factors.projectCompletion < 75) {
      tips.push({
        title: 'Complete More Projects',
        description: 'Successfully completing projects boosts your project completion rate and overall credibility.',
        priority: 'high' as const,
      });
    }

    if (credibility.factors.timelyDelivery < 80) {
      tips.push({
        title: 'Improve On-Time Delivery',
        description: 'Meeting deadlines consistently is critical for building trust with agents. Plan resources carefully.',
        priority: 'high' as const,
      });
    }

    if (credibility.factors.complianceScore < 75) {
      tips.push({
        title: 'Keep Compliance Documents Current',
        description: 'Ensure all certifications, licenses, and insurance are up to date and verified.',
        priority: 'high' as const,
      });
    }

    if (credibility.factors.qualityRating < 75) {
      tips.push({
        title: 'Maintain Quality Standards',
        description: 'Quality work leads to better ratings and repeat business opportunities.',
        priority: 'medium' as const,
      });
    }

    if (credibility.factors.communicationScore < 75) {
      tips.push({
        title: 'Enhance Communication',
        description: 'Respond promptly to inquiries and keep agents updated on project progress.',
        priority: 'medium' as const,
      });
    }

    if (credibility.factors.timelyDelivery >= 90 && credibility.factors.qualityRating >= 85) {
      tips.push({
        title: 'You\'re Doing Great!',
        description: 'Your high performance metrics make you a trusted partner. Keep up the excellent work.',
        priority: 'low' as const,
      });
    }

    return tips.length > 0 ? tips : [{ title: 'Continue Excellent Work', description: 'Maintain your high standards across all projects.', priority: 'low' as const }];
  };

  const tips = generateTips();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/contractor/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold font-headline ml-4">Your Credibility</h1>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Score Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Overall Credibility</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CircularGauge score={credibility.score} />
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Based on your performance metrics and compliance history
                </p>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase">Completed Projects</p>
                    <p className="text-3xl font-bold">8</p>
                    <p className="text-xs text-green-600">+2 in last 30 days</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase">On-Time Rate</p>
                    <p className="text-3xl font-bold">{credibility.factors.timelyDelivery}%</p>
                    <p className="text-xs text-muted-foreground">Of projects delivered on schedule</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase">Avg Rating</p>
                    <p className="text-3xl font-bold">{(credibility.factors.qualityRating / 10).toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Out of 10 from agents</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase">Compliance</p>
                    <p className="text-3xl font-bold">{credibility.factors.complianceScore}%</p>
                    <p className="text-xs text-muted-foreground">Document verification status</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detailed Factors */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Performance Factors</h2>
              <p className="text-sm text-muted-foreground">Detailed breakdown of your credibility metrics</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FactorCard
                label="Project Completion"
                score={credibility.factors.projectCompletion}
                description="Rate of successfully completed projects"
                icon={CheckCircle2}
              />
              <FactorCard
                label="On-Time Delivery"
                score={credibility.factors.timelyDelivery}
                description="Percentage of projects delivered on schedule"
                icon={TrendingUp}
              />
              <FactorCard
                label="Quality Rating"
                score={credibility.factors.qualityRating}
                description="Average quality feedback from agents"
                icon={CheckCircle2}
              />
              <FactorCard
                label="Compliance Completeness"
                score={credibility.factors.complianceScore}
                description="Verification of required certifications and documents"
                icon={AlertTriangle}
              />
              <FactorCard
                label="Communication"
                score={credibility.factors.communicationScore}
                description="Responsiveness and professionalism in interactions"
                icon={TrendingUp}
              />
              <FactorCard
                label="Invoice Accuracy"
                score={Math.round((credibility.factors.projectCompletion + credibility.factors.complianceScore) / 2)}
                description="Accuracy and timeliness of invoice submissions"
                icon={CheckCircle2}
              />
            </div>
          </div>

          {/* Tips & Recommendations */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Improvement Tips</h2>
              <p className="text-sm text-muted-foreground">Actionable recommendations to build trust and increase your credibility</p>
            </div>
            <div className="space-y-3">
              {tips.map((tip, idx) => (
                <TipCard key={idx} title={tip.title} description={tip.description} priority={tip.priority} />
              ))}
            </div>
          </div>

          {/* Trust Statement */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Building Trust Matters</h3>
                <p className="text-sm text-muted-foreground">
                  Agents prioritize contractors with strong credibility scores because it reduces risk and ensures project success. By maintaining high standards in delivery, quality, compliance, and communication, you build a reputation that leads to better opportunities, repeat business, and fair negotiations.
                </p>
                <div className="pt-2 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>High credibility contractors receive better project offers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Quality work is valued over lowest price</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Regular performance reviews help track your progress</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function CredibilityPage() {
  return (
    <ContractorGuard>
      <CredibilityContent />
    </ContractorGuard>
  );
}

