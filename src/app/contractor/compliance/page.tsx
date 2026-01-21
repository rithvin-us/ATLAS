'use client';

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Upload,
  FileText,
  Download,
  Trash2,
  Edit2
} from 'lucide-react';
import { ContractorGuard } from '@/components/contractor/contractor-guard';
import { useAuth } from '@/lib/auth-context';
import { fetchContractorProfile, updateComplianceDocument } from '@/lib/contractor-api';
import { Document, Vendor } from '@/lib/types';

// Mandatory compliance document types
const MANDATORY_DOCS = [
  { 
    id: 'gst', 
    name: 'GST Registration', 
    description: 'Goods and Services Tax registration certificate',
    required: true 
  },
  { 
    id: 'company-reg', 
    name: 'Company Registration', 
    description: 'Certificate of incorporation or business registration',
    required: true 
  },
  { 
    id: 'safety-cert', 
    name: 'Safety Certificates', 
    description: 'OSHA, ISO 45001, or equivalent safety compliance',
    required: true 
  },
  { 
    id: 'insurance', 
    name: 'Insurance Certificate', 
    description: 'General liability or workers\' compensation insurance',
    required: true 
  },
  { 
    id: 'quality-cert', 
    name: 'Quality Certification', 
    description: 'ISO 9001 or equivalent quality management',
    required: false 
  },
  { 
    id: 'environmental', 
    name: 'Environmental Compliance', 
    description: 'ISO 14001 or environmental compliance proof',
    required: false 
  },
];

function StatusBadge({ status, expiryDate }: { status: string; expiryDate?: Date }) {
  const now = new Date();
  const isExpiring = expiryDate && new Date(expiryDate).getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000;
  const isExpired = expiryDate && new Date(expiryDate) < now;

  let config = { label: 'Pending', color: 'bg-gray-100 text-gray-900', icon: Clock };
  
  if (isExpired) {
    config = { label: 'Expired', color: 'bg-red-100 text-red-900', icon: AlertTriangle };
  } else if (status === 'verified' && isExpiring) {
    config = { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-900', icon: AlertTriangle };
  } else if (status === 'verified') {
    config = { label: 'Verified', color: 'bg-green-100 text-green-900', icon: CheckCircle2 };
  } else if (status === 'pending') {
    config = { label: 'Pending Review', color: 'bg-blue-100 text-blue-900', icon: Clock };
  }

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </div>
  );
}

function UploadDialog({ 
  docId, 
  docName, 
  existingDoc,
  onUpload 
}: { 
  docId: string; 
  docName: string; 
  existingDoc?: any;
  onUpload: (docId: string, file: File, expiryDate: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file');
      return;
    }
    if (!expiryDate) {
      alert('Please enter an expiry date');
      return;
    }

    try {
      setUploading(true);
      await onUpload(docId, file, expiryDate);
      setFile(null);
      setExpiryDate('');
      setOpen(false);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={existingDoc ? 'outline' : 'default'} className="gap-1">
          <Upload className="h-4 w-4" />
          {existingDoc ? 'Update' : 'Upload'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existingDoc ? 'Update' : 'Upload'} {docName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`file-${docId}`}>Document File *</Label>
            <Input
              id={`file-${docId}`}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              required
            />
            <p className="text-xs text-muted-foreground">Accepted: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`expiry-${docId}`}>Expiry Date *</Label>
            <Input
              id={`expiry-${docId}`}
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Required for verification and renewal tracking</p>
          </div>

          {file && (
            <div className="p-2 rounded-md bg-blue-50 border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Selected: {file.name}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading} className="flex-1">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                `${existingDoc ? 'Update' : 'Upload'} Document`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ComplianceContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      try {
        setLoading(true);
        const data = await fetchContractorProfile(user.uid);
        setProfile(data || {
          id: user.uid,
          name: 'Your Company',
          industry: '',
          location: '',
          credibilityScore: 0,
          projectsCompleted: 0,
          verificationStatus: 'pending',
          complianceDocs: [],
          createdAt: new Date(),
        } as Vendor);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load compliance data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleUpload = async (docId: string, file: File, expiryDate: string) => {
    if (!user || !profile) return;

    try {
      setSubmitting(true);
      
      // Mock document upload - replace with actual storage integration
      const newDoc: Document = {
        id: `${docId}_${Date.now()}`,
        name: file.name,
        type: docId,
        url: 'pending-upload', // Replace with actual storage URL
        uploadedBy: user.uid,
        uploadedAt: new Date(),
        expiryDate: new Date(expiryDate),
      };

      await updateComplianceDocument(user.uid, newDoc);
      
      // Refresh profile
      const updated = await fetchContractorProfile(user.uid);
      setProfile(updated);
      
      alert('Document uploaded successfully!');
    } catch (err) {
      console.error('Upload failed:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const getDocumentStatus = (docId: string) => {
    if (!profile?.complianceDocs) return null;
    return profile.complianceDocs.find(d => d.type === docId);
  };

  const getMissingDocs = () => {
    const required = MANDATORY_DOCS.filter(d => d.required);
    return required.filter(d => !getDocumentStatus(d.id));
  };

  const getComplianceScore = () => {
    const required = MANDATORY_DOCS.filter(d => d.required);
    const uploaded = required.filter(d => getDocumentStatus(d.id));
    return Math.round((uploaded.length / required.length) * 100);
  };

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

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Unable to load profile</p>
        </div>
      </div>
    );
  }

  const missingDocs = getMissingDocs();
  const complianceScore = getComplianceScore();
  const allRequiredUploaded = missingDocs.length === 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/contractor/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold font-headline ml-4">Compliance Management</h1>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compliance Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Compliance Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{complianceScore}%</div>
                    <p className="text-sm text-muted-foreground">Complete</p>
                  </div>
                  <div className="relative h-16 w-16">
                    <svg className="h-16 w-16 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={allRequiredUploaded ? '#22c55e' : '#f59e0b'}
                        strokeWidth="8"
                        strokeDasharray={`${(complianceScore / 100) * 282.6} 282.6`}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                {allRequiredUploaded ? (
                  <div className="p-3 rounded-md bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2 text-sm text-green-900">
                      <CheckCircle2 className="h-4 w-4" />
                      All required documents submitted
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center gap-2 text-sm text-yellow-900">
                      <AlertTriangle className="h-4 w-4" />
                      {missingDocs.length} document{missingDocs.length !== 1 ? 's' : ''} pending
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Why compliance matters:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Verified documents prevent RFQ rejections</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Agents can confidently assign projects</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Boosts your credibility and trust score</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Checklist */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Mandatory Documents</h2>
              <p className="text-sm text-muted-foreground">Upload and manage your compliance documentation</p>
            </div>
            <div className="space-y-3">
              {MANDATORY_DOCS.map((docType) => {
                const uploadedDoc = getDocumentStatus(docType.id);
                const isExpired = uploadedDoc?.expiryDate && new Date(uploadedDoc.expiryDate) < new Date();

                return (
                  <Card key={docType.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{docType.name}</h3>
                            {docType.required && (
                              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{docType.description}</p>

                          {uploadedDoc && (
                            <div className="pt-2 space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-muted-foreground">
                                  Uploaded: {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                                </span>
                              </div>
                              {uploadedDoc.expiryDate && (
                                <div className="text-sm text-muted-foreground">
                                  Expires: {new Date(uploadedDoc.expiryDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 items-end">
                          {uploadedDoc && (
                            <>
                              <StatusBadge status="verified" expiryDate={uploadedDoc.expiryDate} />
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="gap-1 h-8">
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                                <UploadDialog
                                  docId={docType.id}
                                  docName={docType.name}
                                  existingDoc={uploadedDoc}
                                  onUpload={handleUpload}
                                />
                              </div>
                            </>
                          )}
                          {!uploadedDoc && (
                            <>
                              <StatusBadge status="pending" />
                              <UploadDialog
                                docId={docType.id}
                                docName={docType.name}
                                onUpload={handleUpload}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Additional Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-blue-900">Document Upload Guidelines</h3>
                <ul className="text-sm text-blue-900 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Upload clear, legible copies of original documents</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Supported formats: PDF, DOC, DOCX, JPG, PNG</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Maximum file size: 10MB per document</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Expiry dates will trigger renewal reminders</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Agents review documents for compliance verification</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function CompliancePage() {
  return (
    <ContractorGuard>
      <ComplianceContent />
    </ContractorGuard>
  );
}
