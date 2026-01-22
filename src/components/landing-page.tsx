import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, FileText, Search, Gavel, Receipt, Users, Briefcase, TrendingUp, ArrowRight, Target, Shield, Zap, Layers, Star, ArrowUpRight } from 'lucide-react';
import { AtlasLogo } from '@/components/icons/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const keyActions = [
  { 
    icon: FileText, 
    title: 'Post Work', 
    description: 'Create and publish RFQs to connect with qualified contractors.',
    helper: 'Start by defining your project requirements and timeline',
    link: '/auth/agent/signup',
    gradient: 'from-blue-500 to-blue-600'
  },
  { 
    icon: Search, 
    title: 'Browse RFQs', 
    description: 'Discover opportunities that match your expertise and capacity.',
    helper: 'Filter by industry, location, and project type',
    link: '/auth/contractor/signup',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  { 
    icon: Gavel, 
    title: 'View Auctions', 
    description: 'Participate in competitive bidding to secure the best talent.',
    helper: 'Real-time auction management with transparent pricing',
    link: '/auth/agent/signup',
    gradient: 'from-purple-500 to-purple-600'
  },
  { 
    icon: Receipt, 
    title: 'Track Invoices', 
    description: 'Manage project milestones and automate payment workflows.',
    helper: 'Milestone-based payments with built-in verification',
    link: '/auth/contractor/signup',
    gradient: 'from-amber-500 to-amber-600'
  },
];

export function LandingPage() {
  const agentImage = PlaceHolderImages.find((img) => img.id === 'agent-dashboard');
  const contractorImage = PlaceHolderImages.find((img) => img.id === 'contractor-dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header - Modern Glassmorphism */}
      <header className="px-6 lg:px-8 h-20 flex items-center bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/50">
        <Link href="#" className="flex items-center justify-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
            <AtlasLogo className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold font-headline text-slate-900">ATLAS</span>
        </Link>
        <div className="ml-auto flex items-center gap-8">
          <nav className="hidden lg:flex gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200">
              Features
            </Link>
            <Link href="#roles" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200">
              For Agents
            </Link>
            <Link href="#roles" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200">
              For Contractors
            </Link>
          </nav>
          <div className="flex items-center gap-4">
              <Link href="#roles" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200">
                  Log In
              </Link>
              <Button asChild className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 text-sm font-medium shadow-lg shadow-slate-900/20">
                  <Link href="#roles">Get Started</Link>
              </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - Bold & Modern */}
        <section className="w-full py-24 md:py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
          
          <div className="container max-w-6xl mx-auto px-6 relative">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-sm text-slate-300 font-medium">Procurement Operations Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
                Streamline Your<br />
                <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">Workforce Operations</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                A unified platform connecting buyers and contractors for efficient project sourcing, management, and execution.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 text-base rounded-full shadow-xl shadow-white/10">
                  <Link href="#roles">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-slate-600 text-white hover:bg-white/10 px-8 py-6 text-base rounded-full">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Actions Section - Card Grid with Hover Effects */}
        <section className="w-full py-20 md:py-28 bg-white">
          <div className="container max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                Core Features
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                Everything You Need
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Centralize your operations with purpose-built tools for modern workforce management.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {keyActions.map((action, index) => (
                <Link key={index} href={action.link}>
                  <div className="group h-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-8 hover:bg-white hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <action.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {action.title}
                    </h3>
                    <p className="text-slate-600 mb-4 leading-relaxed">
                      {action.description}
                    </p>
                    <div className="flex items-center text-sm font-medium text-slate-400 group-hover:text-blue-600 transition-colors">
                      <span>Learn more</span>
                      <ArrowUpRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Value Propositions - Dark Section with Asymmetric Layout */}
        <section id="features" className="w-full py-20 md:py-28 bg-slate-900">
          <div className="container max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 bg-white/10 text-slate-300 rounded-full text-sm font-medium mb-6">
                  Enterprise Ready
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
                  Built for Scale
                </h2>
                <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                  Trusted by organizations to manage complex procurement workflows with transparency and efficiency.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Role-Based Access</h3>
                      <p className="text-slate-400">
                        Secure authentication and permissions for buyers, contractors, and administrators.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Layers className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Project Management</h3>
                      <p className="text-slate-400">
                        Track milestones, approvals, and deliverables from initiation to completion.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Analytics & Insights</h3>
                      <p className="text-slate-400">
                        Real-time visibility into vendor performance, spend, and project health.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Visual Element */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
                <div className="relative bg-slate-800 border border-slate-700 rounded-3xl p-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Active RFQs</p>
                          <p className="text-xs text-slate-400">12 awaiting response</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-blue-400">12</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Projects</p>
                          <p className="text-xs text-slate-400">5 in progress</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-emerald-400">5</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                          <Star className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Credibility Score</p>
                          <p className="text-xs text-slate-400">Top 10% performer</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-amber-400">92</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Role-based CTA Section - Split Design */}
        <section id="roles" className="w-full py-20 md:py-28 bg-slate-50">
          <div className="container max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <span className="inline-block px-4 py-1.5 bg-slate-200 text-slate-600 rounded-full text-sm font-medium">
                Get Started
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                Choose Your Path
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Get started with the tools designed for your role in the workforce ecosystem.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Agent/Buyer Card - Dark Theme */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                    <Target className="h-7 w-7 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    For Buyers & Agents
                  </h3>
                  <p className="text-slate-400 mb-8">
                    Source talent, manage RFQs, and oversee project execution with confidence.
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">Create and publish detailed RFQs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">Run competitive auctions for vendor selection</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">Evaluate vendors with AI-powered scoring</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">Approve milestones and manage payments</span>
                    </li>
                  </ul>
                  
                  <div className="flex gap-3">
                    <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-full">
                      <Link href="/auth/agent/login">Agent Login</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 border-slate-600 text-white hover:bg-white/10 rounded-full">
                      <Link href="/auth/agent/signup">Sign Up</Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contractor/Vendor Card - Light Theme */}
              <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 lg:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                    <Zap className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    For Contractors & Vendors
                  </h3>
                  <p className="text-slate-500 mb-8">
                    Discover opportunities, submit bids, and deliver projects seamlessly.
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Browse and filter relevant RFQs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Submit AI-validated quotations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Build your credibility score</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">Track progress and handle invoicing</span>
                    </li>
                  </ul>
                  
                  <div className="flex gap-3">
                    <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-full">
                      <Link href="/auth/contractor/login">Contractor Login</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full">
                      <Link href="/auth/contractor/signup">Sign Up</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <AtlasLogo className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">ATLAS</span>
            </div>
            <p className="text-sm text-slate-400">&copy; 2024 ATLAS. All rights reserved.</p>
            <nav className="flex gap-6">
              <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
