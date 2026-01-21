'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AgentGuard } from '@/components/agent/agent-guard';
import { useAuth } from '@/lib/auth-context';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import {
  Briefcase,
  FileText,
  Gavel,
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Settings,
  User,
} from 'lucide-react';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Logged out successfully.',
      });
      router.push('/');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to log out.',
        variant: 'destructive',
      });
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/agent/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'RFQs',
      href: '/agent/rfq',
      icon: FileText,
    },
    {
      label: 'Projects',
      href: '/agent/projects',
      icon: Briefcase,
    },
    {
      label: 'Auctions',
      href: '/agent/auctions',
      icon: Gavel,
    },
    {
      label: 'Vendors',
      href: '/agent/vendors',
      icon: Users,
    },
    {
      label: 'Invoices',
      href: '/agent/invoices',
      icon: FileText,
    },
  ];

  return (
    <AgentGuard>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Top Navigation Bar */}
        <header className="border-b bg-white sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between">
              {/* Logo and Brand */}
              <div className="flex items-center gap-3">
                <Link href="/agent/dashboard" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-lg text-gray-900 hidden sm:inline">ATLAS</span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        size="sm"
                        className={isActive ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>

              {/* Right Side Actions */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-600 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                      </div>
                      <Link href="/agent/profile">
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Profile
                        </button>
                      </Link>
                      <Link href="/agent/settings">
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Settings
                        </button>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-200"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <nav className="lg:hidden pb-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        </header>

        {/* Page Content */}
        {children}
      </div>
    </AgentGuard>
  );
}
