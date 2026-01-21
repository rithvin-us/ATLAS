"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Bell, LogOut, Menu, X, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";

interface TopNavProps {
  userRole: "contractor" | "agent";
}

export function TopNav({ userRole }: TopNavProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    // TODO: Implement logout
    router.push("/");
  };

  const isContractor = userRole === "contractor";
  const basePath = isContractor ? "/contractor" : "/agent";

  const navItems = isContractor
    ? [
        { href: `${basePath}/dashboard`, label: "Dashboard", icon: "📊" },
        { href: `${basePath}/rfqs`, label: "RFQs", icon: "📋" },
        { href: `${basePath}/projects`, label: "Projects", icon: "🏗️" },
        { href: `${basePath}/auctions`, label: "Auctions", icon: "🔨" },
        { href: `${basePath}/invoices`, label: "Invoices", icon: "💵" },
        { href: `${basePath}/credibility`, label: "Credibility", icon: "⭐" },
      ]
    : [
        { href: `${basePath}/dashboard`, label: "Dashboard", icon: "📊" },
        { href: `${basePath}/projects`, label: "Projects", icon: "🏗️" },
        { href: `${basePath}/rfqs`, label: "RFQs", icon: "📋" },
        { href: `${basePath}/auctions`, label: "Auctions", icon: "🔨" },
        { href: `${basePath}/invoices`, label: "💵" },
      ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Logo */}
        <Link href={`${basePath}/dashboard`} className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="hidden md:inline text-gray-900">ATLAS</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-700">
                  {user?.email?.split("@")[0]}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`${basePath}/profile`} className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${basePath}/settings`} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-gray-50 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
