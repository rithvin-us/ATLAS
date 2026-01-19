import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Megaphone, Briefcase, CheckCircle, Clock, Award, ShieldCheck, FileWarning, Receipt, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Contractor Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, here's your operational overview.</p>
          </div>
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
            <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Credibility Score</p>
                <p className="text-2xl font-bold flex items-center gap-2 justify-end">
                  88 
                  <Award className="h-6 w-6 text-yellow-500" />
                </p>
            </div>
            <Button variant="outline" size="sm">View Details</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active RFQs</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 viewing since last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects in Progress</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">1 milestone needs attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">34</div>
              <p className="text-xs text-muted-foreground">+3 this quarter</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 invoices, 1 RFQ response</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Invoice Status</CardTitle>
              <CardDescription>Track your outstanding and paid invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Project Phoenix</TableCell>
                    <TableCell>$12,500.00</TableCell>
                    <TableCell><Badge className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300" variant="outline">Overdue</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm">View</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Site Upgrade Alpha</TableCell>
                    <TableCell>$8,200.00</TableCell>
                    <TableCell><Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300" variant="outline">Pending</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm">View</Button></TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="font-medium">HVAC Maintenance</TableCell>
                    <TableCell>$5,000.00</TableCell>
                     <TableCell><Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300" variant="outline">Paid</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm">View</Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Keep your company profile up to date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold">ISO 9001:2015</p>
                  <p className="text-sm text-muted-foreground">Verified on 2024-01-15</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FileWarning className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold">General Liability Insurance</p>
                  <p className="text-sm text-muted-foreground">Expires in 28 days</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full">Manage Documents</Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                🚀 AI-Powered Quotation Analysis
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                    Got a new RFQ? Submit your quotation details to get an AI-powered feasibility and competitiveness analysis before you bid.
                </p>
                <Button asChild>
                    <Link href="/dashboard/quotation/new">
                        Analyze a New Quotation
                        <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    )
}
