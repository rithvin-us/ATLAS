import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, FileText, Search, Gavel, Receipt, Users, Briefcase, TrendingUp, ArrowRight } from 'lucide-react';
import { AtlasLogo } from '@/components/icons/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const keyActions = [
  { 
    icon: FileText, 
    title: 'Post Work', 
    description: 'Create and publish RFQs to connect with qualified contractors.',
    helper: 'Start by defining your project requirements and timeline',
    link: '/auth/agent/signup'
  },
  { 
    icon: Search, 
    title: 'Browse RFQs', 
    description: 'Discover opportunities that match your expertise and capacity.',
    helper: 'Filter by industry, location, and project type',
    link: '/auth/contractor/signup'
  },
  { 
    icon: Gavel, 
    title: 'View Auctions', 
    description: 'Participate in competitive bidding to secure the best talent.',
    helper: 'Real-time auction management with transparent pricing',
    link: '/auth/agent/signup'
  },
  { 
    icon: Receipt, 
    title: 'Track Invoices', 
    description: 'Manage project milestones and automate payment workflows.',
    helper: 'Milestone-based payments with built-in verification',
    link: '/auth/contractor/signup'
  },
];

export function LandingPage() {
  const agentImage = PlaceHolderImages.find((img) => img.id === 'agent-dashboard');
  const contractorImage = PlaceHolderImages.find((img) => img.id === 'contractor-dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-6 lg:px-8 h-16 flex items-center bg-white sticky top-0 z-50 border-b border-gray-200">
        <Link href="#" className="flex items-center justify-center gap-2 flex-shrink-0">
          <AtlasLogo className="h-6 w-6 text-gray-900" />
          <span className="text-lg font-bold font-headline text-gray-900">ATLAS</span>
        </Link>
        <div className="ml-auto flex items-center gap-8">
          <nav className="hidden lg:flex gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">
              Features
            </Link>
            <Link href="#roles" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">
              For Agents
            </Link>
            <Link href="#roles" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">
              For Contractors
            </Link>
          </nav>
          <div className="flex items-center gap-4">
              <Link href="#roles" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Log In
              </Link>
              <Button asChild className="bg-black text-white hover:bg-gray-800 rounded-full px-6 text-sm font-medium">
                  <Link href="#roles">Sign up</Link>
              </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - Clean and Minimal */}
        <section className="w-full py-16 md:py-20 bg-white border-b border-gray-200">
          <div className="container max-w-6xl mx-auto px-6">
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                Streamline Your Workforce Operations
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                A unified platform connecting buyers and contractors for efficient project sourcing, management, and execution.
              </p>
              <div className="pt-4">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base">
                  <Link href="#roles">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Actions Section - Card-based Layout */}
        <section className="w-full py-16 md:py-20 bg-gray-50 border-t border-gray-200">
          <div className="container max-w-6xl mx-auto px-6">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Everything You Need to Manage Work
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Centralize your operations with purpose-built tools for modern workforce management.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {keyActions.map((action, index) => (
                <Card key={index} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 bg-sky-50 rounded-lg">
                        <action.icon className="h-6 w-6 text-sky-600" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {action.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-base text-gray-700 leading-relaxed">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">{action.helper}</p>
                    <Link href={action.link} className="text-sky-600 hover:text-sky-700 font-medium text-sm inline-flex items-center">
                      Learn more <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Value Propositions - Clean Dividers */}
        <section id="features" className="w-full py-16 md:py-20 bg-slate-50 border-t border-gray-200">
          <div className="container max-w-6xl mx-auto px-6">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Built for Enterprise-Grade Operations
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Trusted by organizations to manage complex procurement workflows with transparency and efficiency.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex p-3 bg-gray-100 rounded-lg">
                  <Users className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Role-Based Access</h3>
                <p className="text-gray-600 leading-relaxed">
                  Secure authentication and permissions for buyers, contractors, and administrators.
                </p>
              </div>
              
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex p-3 bg-gray-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track milestones, approvals, and deliverables from initiation to completion.
                </p>
              </div>
              
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex p-3 bg-gray-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics & Insights</h3>
                <p className="text-gray-600 leading-relaxed">
                  Real-time visibility into vendor performance, spend, and project health.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Role-based CTA Section - Simplified Cards */}
        <section id="roles" className="w-full py-16 md:py-20 bg-zinc-50 border-t border-gray-200">
          <div className="container max-w-6xl mx-auto px-6">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Choose Your Path
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get started with the tools designed for your role in the workforce ecosystem.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Agent/Buyer Card */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="space-y-4 pb-6">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      For Buyers & Agents
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      Source talent, manage RFQs, and oversee project execution with confidence.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Create and publish detailed RFQs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Run competitive auctions for vendor selection</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Evaluate vendors with credibility scores</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Approve milestones and manage payments</span>
                    </li>
                  </ul>
                  
                  <div className="flex gap-3 pt-4 mt-2 border-t border-gray-100">
                    <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Link href="/auth/agent/login">Agent Login</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Link href="/auth/agent/signup">Sign Up</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contractor/Vendor Card */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="space-y-4 pb-6">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      For Contractors & Vendors
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      Discover opportunities, submit bids, and deliver projects seamlessly.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Browse and filter relevant RFQs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Submit AI-validated quotations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Manage compliance and onboarding</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Track progress and handle invoicing</span>
                    </li>
                  </ul>
                  
                  <div className="flex gap-3 pt-4 mt-2 border-t border-gray-100">
                    <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Link href="/auth/contractor/login">Contractor Login</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Link href="/auth/contractor/signup">Sign Up</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>
      
      <footer className="bg-gray-900 border-t border-gray-800 py-10">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-300">&copy; 2024 ATLAS. All rights reserved.</p>
            <nav className="flex gap-6">
              <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
