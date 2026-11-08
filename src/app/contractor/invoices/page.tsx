"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  DollarSign, 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Search,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Loader2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ContractorGuard } from "@/components/contractor/contractor-guard";
import { useAuth } from "@/lib/auth-context";
import { fetchContractorInvoices } from "@/lib/contractor-api";

function InvoicesPageContent() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadInvoices() {
      if (!user?.uid) return;
      try {
        const data = await fetchContractorInvoices(user.uid);
        setInvoices(data);
        setFilteredInvoices(data);
      } catch (error) {
        console.error("Failed to load invoices:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, [user]);

  useEffect(() => {
    let filtered = invoices;

    if (statusFilter !== "all") {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.projectId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInvoices(filtered);
  }, [invoices, statusFilter, searchTerm]);

  const stats = {
    draft: invoices.filter(i => i.status === "draft").length,
    pending: invoices.filter(i => i.status === "submitted" || i.status === "pending").length,
    approved: invoices.filter(i => i.status === "approved").length,
    paid: invoices.filter(i => i.status === "paid").length,
    totalAmount: invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      draft: { label: "Draft", color: "bg-secondary text-foreground" },
      submitted: { label: "Submitted", color: "bg-secondary text-primary" },
      pending: { label: "Pending Review", color: "bg-warning/10 text-warning" },
      approved: { label: "Approved", color: "bg-success/10 text-success" },
      paid: { label: "Paid", color: "bg-success/10 text-success" },
      rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive" },
    };
    const config_item = config[status] || config["pending"];
    return <Badge className={config_item.color}>{config_item.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "approved":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "pending":
      case "submitted":
        return <Clock className="h-5 w-5 text-warning" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-medium text-foreground flex items-center gap-3 mb-2">
              <DollarSign className="h-10 w-10 text-primary" />
              Invoices
            </h1>
            <p className="text-muted-foreground text-lg">Manage and track your payment requests</p>
          </div>
          <Link href="/contractor/invoices/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create Invoice
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="border-0 hover:border-foreground/25 transition-shadow">
            <CardContent className="p-4">
              <FileText className="h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Draft</p>
              <p className="text-3xl font-medium text-foreground">{stats.draft}</p>
            </CardContent>
          </Card>

          <Card className="border-0 hover:border-foreground/25 transition-shadow">
            <CardContent className="p-4">
              <Clock className="h-6 w-6 text-warning mb-2" />
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-medium text-foreground">{stats.pending}</p>
            </CardContent>
          </Card>

          <Card className="border-0 hover:border-foreground/25 transition-shadow">
            <CardContent className="p-4">
              <CheckCircle className="h-6 w-6 text-success mb-2" />
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-3xl font-medium text-foreground">{stats.approved}</p>
            </CardContent>
          </Card>

          <Card className="border-0 hover:border-foreground/25 transition-shadow">
            <CardContent className="p-4">
              <CheckCircle className="h-6 w-6 text-success mb-2" />
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-3xl font-medium text-foreground">{stats.paid}</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-secondary hover:border-foreground/25 transition-shadow">
            <CardContent className="p-4">
              <DollarSign className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm text-primary font-medium">Total</p>
              <p className="text-3xl font-medium text-primary">₹{stats.totalAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card className="mb-6 border-0">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice ID or project"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <div className="space-y-3">
          {filteredInvoices.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">No invoices found</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first invoice to get started</p>
                <Link href="/contractor/invoices/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="border-0 hover:border-foreground/25 transition-shadow">
                <CardContent className="p-0">
                  <Link href={`/contractor/invoices/${invoice.id}`}>
                    <div className="p-6 flex items-start justify-between cursor-pointer">
                      <div className="flex items-start gap-4 flex-1">
                        {getStatusIcon(invoice.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-foreground">Invoice #{invoice.id.slice(0, 8).toUpperCase()}</h3>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">Project: {invoice.projectId || "N/A"}</p>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span>Amount: ₹{invoice.totalAmount.toLocaleString()}</span>
                            <span>Created: {new Date(invoice.createdAt).toLocaleDateString()}</span>
                            {invoice.dueDate && <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Payment Timeline */}
        <Card className="mt-8 border-0 bg-secondary">
          <CardHeader>
            <CardTitle className="text-lg">Invoice Payment Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-medium">1</div>
                  <p className="text-xs text-muted-foreground mt-2 text-center font-medium">Create</p>
                </div>
                <div className="flex-1 h-1 bg-border mx-2"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-secondary text-foreground rounded-full flex items-center justify-center font-medium">2</div>
                  <p className="text-xs text-muted-foreground mt-2 text-center font-medium">Submit</p>
                </div>
                <div className="flex-1 h-1 bg-border mx-2"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-border text-foreground rounded-full flex items-center justify-center font-medium">3</div>
                  <p className="text-xs text-muted-foreground mt-2 text-center font-medium">Review</p>
                </div>
                <div className="flex-1 h-1 bg-border mx-2"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-border text-foreground rounded-full flex items-center justify-center font-medium">4</div>
                  <p className="text-xs text-muted-foreground mt-2 text-center font-medium">Paid</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <ContractorGuard>
      <InvoicesPageContent />
    </ContractorGuard>
  );
}
