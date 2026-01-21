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
      draft: { label: "Draft", color: "bg-gray-100 text-gray-800" },
      submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800" },
      pending: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approved", color: "bg-green-100 text-green-800" },
      paid: { label: "Paid", color: "bg-emerald-100 text-emerald-800" },
      rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
    };
    const config_item = config[status] || config["pending"];
    return <Badge className={config_item.color}>{config_item.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
      case "submitted":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <DollarSign className="h-10 w-10 text-blue-600" />
              Invoices
            </h1>
            <p className="text-gray-600 text-lg">Manage and track your payment requests</p>
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
          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <FileText className="h-6 w-6 text-gray-600 mb-2" />
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-3xl font-bold text-gray-900">{stats.draft}</p>
            </CardContent>
          </Card>

          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Clock className="h-6 w-6 text-yellow-600 mb-2" />
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            </CardContent>
          </Card>

          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
            </CardContent>
          </Card>

          <Card className="border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <CheckCircle className="h-6 w-6 text-emerald-600 mb-2" />
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-3xl font-bold text-gray-900">{stats.paid}</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <DollarSign className="h-6 w-6 text-blue-600 mb-2" />
              <p className="text-sm text-blue-700 font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-900">₹{stats.totalAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card className="mb-6 border-0">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by invoice ID or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
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
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">No invoices found</p>
                <p className="text-sm text-gray-500 mt-1">Create your first invoice to get started</p>
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
              <Card key={invoice.id} className="border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <Link href={`/contractor/invoices/${invoice.id}`}>
                    <div className="p-6 flex items-start justify-between cursor-pointer">
                      <div className="flex items-start gap-4 flex-1">
                        {getStatusIcon(invoice.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">Invoice #{invoice.id.slice(0, 8).toUpperCase()}</h3>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Project: {invoice.projectId || "N/A"}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
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
        <Card className="mt-8 border-0 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Invoice Payment Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <p className="text-xs text-gray-600 mt-2 text-center font-medium">Create</p>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-300 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <p className="text-xs text-gray-600 mt-2 text-center font-medium">Submit</p>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <p className="text-xs text-gray-600 mt-2 text-center font-medium">Review</p>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <p className="text-xs text-gray-600 mt-2 text-center font-medium">Paid</p>
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
