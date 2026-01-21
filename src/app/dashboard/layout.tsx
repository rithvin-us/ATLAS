import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarFooter } from "@/components/ui/sidebar";
import { AtlasLogo } from "@/components/icons/logo";
import { LayoutDashboard, Settings, LogOut, Briefcase, Receipt, FileText, MessageSquare, Search, Bell } from 'lucide-react';
import Link from 'next/link';
import { NotificationButton } from '@/components/notification-button';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Input } from "@/components/ui/input";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  return (
    <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-2">
            <Link href="/" className="flex items-center gap-2" >
              <Button variant="ghost" className="p-1 h-auto" asChild>
                <>
                <AtlasLogo className="w-8 h-8 text-primary" />
                <span className="font-headline text-xl font-semibold text-foreground group-data-[state=collapsed]:hidden">ATLAS</span>
                </>
              </Button>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link href="/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="RFQs">
                  <Link href="#"><Briefcase /><span>RFQs</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Invoices">
                  <Link href="#"><Receipt /><span>Invoices</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Documents">
                  <Link href="#"><FileText /><span>Documents</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Messages">
                  <Link href="#"><MessageSquare /><span>Messages</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="mt-auto border-t border-sidebar-border p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link href="#"><Settings /><span>Settings</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
                <SidebarTrigger className="md:hidden" />
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search projects, RFQs..."
                    className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[320px]"
                  />
                </div>
                <NotificationButton />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Avatar className="h-8 w-8">
                                {userAvatar && <AvatarImage src={userAvatar.imageUrl} data-ai-hint={userAvatar.imageHint} />}
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Contractor Name</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <main className="p-4 sm:p-6">
              {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  )
}
