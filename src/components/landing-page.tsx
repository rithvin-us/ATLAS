import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, Briefcase, Filter, Bot, Award, BarChart, ArrowRight } from 'lucide-react';
import { AtlasLogo } from '@/components/icons/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  { icon: Users, title: 'Multi-Tenant Access', description: 'Secure, role-based access for both agents and contractors with verified company profiles.' },
  { icon: Briefcase, title: 'RFQ & Project Management', description: 'Agents can create detailed RFQs and manage projects from start to finish.' },
  { icon: Filter, title: 'Vendor Discovery', description: 'Contractors can easily find and filter relevant RFQs based on various criteria.' },
  { icon: Bot, title: 'AI-Powered Planning', description: 'Leverage GenAI to validate quotation feasibility and get go/no-go suggestions.' },
  { icon: BarChart, title: 'Controlled Auctions', description: 'Participate in multiple auction formats for competitive and fair vendor selection.' },
  { icon: Award, title: 'Credibility Scoring', description: 'Build trust with a data-driven credibility score for both agents and contractors.' },
];

export function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');
  const agentImage = PlaceHolderImages.find((img) => img.id === 'agent-dashboard');
  const contractorImage = PlaceHolderImages.find((img) => img.id === 'contractor-dashboard');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Link href="#" className="flex items-center justify-center gap-2">
          <AtlasLogo className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold font-headline">ATLAS</span>
        </Link>
        <nav className="ml-auto hidden lg:flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="#roles" className="text-sm font-medium hover:underline underline-offset-4">
            For Agents
          </Link>
          <Link href="#roles" className="text-sm font-medium hover:underline underline-offset-4">
            For Contractors
          </Link>
        </nav>
        <div className="ml-auto lg:ml-4 flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="#roles">Log In</Link>
            </Button>
            <Button asChild>
                <Link href="#roles">Get Started</Link>
            </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    ATLAS
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Designed for structured execution.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="#roles">Get Started Free <ArrowRight className="ml-2" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              {heroImage && <Image
                src={heroImage.imageUrl}
                width="1200"
                height="800"
                alt={heroImage.description}
                data-ai-hint={heroImage.imageHint}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />}
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">A Unified Platform for Sourcing & Management</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Manage the entire procurement lifecycle with powerful tools for both agents and contractors, building trust and efficiency across organizations.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 mt-12">
              {features.map((feature, index) => (
                <div key={index} className="grid gap-1 p-4 rounded-lg hover:bg-card transition-colors">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <h3 className="text-lg font-bold font-headline">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Built for a Two-Sided Marketplace</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Whether you're posting work or executing it, ATLAS provides the tools you need to succeed.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="flex flex-col items-center justify-start space-y-4 text-left bg-background">
                <CardHeader className="w-full">
                  <CardTitle className="text-2xl font-headline">For Agents / Buyers</CardTitle>
                  <p className="text-muted-foreground">Post jobs, manage RFQs, and select the best vendors with confidence.</p>
                </CardHeader>
                <CardContent className="w-full space-y-4">
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />Create detailed projects and RFQs.</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />Manage competitive auctions to select the best vendor.</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />Evaluate vendors using credibility scores and history.</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />Oversee project execution and approve milestones.</li>
                  </ul>
                  {agentImage && <Image
                    src={agentImage.imageUrl}
                    width="600"
                    height="400"
                    alt={agentImage.description}
                    data-ai-hint={agentImage.imageHint}
                    className="rounded-lg object-cover w-full aspect-video"
                  />}
                  <div className="flex gap-3 pt-4">
                    <Button asChild className="flex-1">
                      <Link href="/auth/agent/login">Agent Login</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/auth/agent/signup">Sign Up</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center justify-start space-y-4 text-left bg-background">
                <CardHeader className="w-full">
                  <CardTitle className="text-2xl font-headline">For Contractors / Vendors</CardTitle>
                  <p className="text-muted-foreground">Find relevant work, submit competitive bids, and manage projects seamlessly.</p>
                </CardHeader>
                <CardContent className="w-full space-y-4">
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />Discover relevant RFQs and participate in auctions.</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />Submit structured, AI-validated quotations.</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />Manage compliance and onboarding documents.</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />Update project progress and handle invoicing.</li>
                  </ul>
                  {contractorImage && <Image
                    src={contractorImage.imageUrl}
                    width="600"
                    height="400"
                    alt={contractorImage.description}
                    data-ai-hint={contractorImage.imageHint}
                    className="rounded-lg object-cover w-full aspect-video"
                  />}
                  <div className="flex gap-3 pt-4">
                    <Button asChild className="flex-1">
                      <Link href="/auth/contractor/login">Contractor Login</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/auth/contractor/signup">Sign Up</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 ATLAS. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
