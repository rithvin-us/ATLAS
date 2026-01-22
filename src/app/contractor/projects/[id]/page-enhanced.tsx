'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  subscribeToProject,
  fetchProjectMilestones,
  fetchProjectInvoices,
  submitMilestoneCompletion,
  updateMilestoneState,
  createContractorMilestone,
} from '@/lib/project-api';
import { Project, Milestone, Invoice } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Clock, FileText, Upload, Plus, Shield, DollarSign, Calendar } from 'lucide-react';

const getMilestoneStateColor = (state: string) => {
  const colors: Record<string, string> = {
    'pending': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-yellow-100 text-yellow-800',
    'verification-pending': 'bg-orange-100 text-orange-800',
    'verified': 'bg-green-100 text-green-800',
    'invoiced': 'bg-purple-100 text-purple-800',
  };
  return colors[state] || 'bg-gray-100 text-gray-800';
};

const getMilestoneStateLabel = (state: string) => {
  const labels: Record<string, string> = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'verification-pending': 'Awaiting Verification',
    'verified': 'Verified',
    'invoiced': 'Invoiced',
  };
  return labels[state] || state;
};

const getEscrowStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'not-funded': 'bg-gray-100 text-gray-700',
    'funded': 'bg-green-100 text-green-700',
    'released': 'bg-blue-100 text-blue-700',
    'disputed': 'bg-red-100 text-red-700',
    'refunded': 'bg-orange-100 text-orange-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getApprovalStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'revision-requested': 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('milestones');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [submittingMilestone, setSubmittingMilestone] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [proformaFiles, setProformaFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proformaInputRef = useRef<HTMLInputElement>(null);

  // Create milestone dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creatingMilestone, setCreatingMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    description: '',
    durationDays: 30,
    paymentAmount: 0,
  });

  // Load project data
  useEffect(() => {
    if (!projectId || !user) return;

    setLoading(true);
    setError(null);

    const unsubscribeProject = subscribeToProject(
      projectId,
      (projectData) => {
        setProject(projectData);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading project:', err);
        setError('Failed to load project');
        setLoading(false);
      }
    );

    return () => unsubscribeProject();
  }, [projectId, user]);

  // Load milestones
  useEffect(() => {
    if (!projectId) return;

    const loadMilestones = async () => {
      try {
        const data = await fetchProjectMilestones(projectId);
        setMilestones(data);
      } catch (err) {
        console.error('Error loading milestones:', err);
        setError('Failed to load milestones');
      }
    };

    loadMilestones();
  }, [projectId]);

  // Load invoices
  useEffect(() => {
    if (!projectId) return;

    const loadInvoices = async () => {
      try {
        const data = await fetchProjectInvoices(projectId);
        setInvoices(data);
      } catch (err) {
        console.error('Error loading invoices:', err);
      }
    };

    loadInvoices();
  }, [projectId]);

  // Create new milestone
  const handleCreateMilestone = async () => {
    if (!user || !projectId) return;

    setCreatingMilestone(true);
    try {
      // Convert proforma files to base64
      const proformaDocuments = await Promise.all(
        proformaFiles.map(async (file) => {
          return new Promise<{ name: string; url: string; type: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                name: file.name,
                url: e.target?.result as string,
                type: file.type,
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      await createContractorMilestone(projectId, user.uid, {
        ...newMilestone,
        proformaDocuments,
      });

      // Refresh milestones
      const data = await fetchProjectMilestones(projectId);
      setMilestones(data);

      // Reset form
      setShowCreateDialog(false);
      setNewMilestone({
        name: '',
        description: '',
        durationDays: 30,
        paymentAmount: 0,
      });
      setProformaFiles([]);
      setError('Milestone created and sent to agent for approval');
    } catch (err) {
      console.error('Error creating milestone:', err);
      setError('Failed to create milestone');
    } finally {
      setCreatingMilestone(false);
    }
  };

  // Handle milestone state transition
  const handleStartMilestone = async (milestone: Milestone) => {
    if (!user) return;

    // Check if milestone is approved and funded
    if (milestone.agentApprovalStatus !== 'approved') {
      setError('Milestone must be approved by agent before starting');
      return;
    }

    if (milestone.escrowStatus !== 'funded') {
      setError('Escrow must be funded before starting milestone');
      return;
    }

    try {
      await updateMilestoneState(milestone.id, 'in-progress', {
        userId: user.uid,
        userName: user.email || user.uid,
      });
      // Refresh milestones
      const data = await fetchProjectMilestones(projectId);
      setMilestones(data);
    } catch (err) {
      console.error('Error starting milestone:', err);
      setError('Failed to start milestone');
    }
  };

  // Handle milestone completion submission
  const handleSubmitCompletion = async () => {
    if (!selectedMilestone || !user) return;

    setSubmittingMilestone(true);
    try {
      // Convert files to base64 for storage
      const proofDocuments = await Promise.all(
        uploadedFiles.map(async (file) => {
          return new Promise<{ name: string; url: string; type: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                name: file.name,
                url: e.target?.result as string,
                type: file.type,
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      await submitMilestoneCompletion(selectedMilestone.id, proofDocuments, user.uid);

      // Refresh milestones
      const data = await fetchProjectMilestones(projectId);
      setMilestones(data);

      // Reset dialog
      setSelectedMilestone(null);
      setSubmissionNotes('');
      setUploadedFiles([]);

      setError('Milestone completion submitted for verification');
    } catch (err) {
      console.error('Error submitting completion:', err);
      setError('Failed to submit completion');
    } finally {
      setSubmittingMilestone(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleProformaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProformaFiles(Array.from(e.target.files));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Project not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const completedMilestones = milestones.filter((m) => ['completed', 'verification-pending', 'verified', 'invoiced'].includes(m.status)).length;
  const totalMilestones = milestones.length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const totalEscrowFunded = milestones.filter(m => m.escrowStatus === 'funded' || m.escrowStatus === 'released').reduce((sum, m) => sum + (m.paymentAmount || 0), 0);
  const totalEarned = milestones.filter(m => m.escrowStatus === 'released').reduce((sum, m) => sum + (m.paymentAmount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Project Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.description}</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${(project.totalBudget || project.budget || 0).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalMilestones}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Escrow Funded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-600">${totalEscrowFunded.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalEarned.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Project Milestones</CardTitle>
                    <CardDescription>Create and manage milestone payments with escrow protection</CardDescription>
                  </div>
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-sky-600 hover:bg-sky-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Milestone
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Milestone</DialogTitle>
                        <DialogDescription>
                          Define milestone details, payment amount, and timeline. Agent approval required before work starts.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Milestone Name *</Label>
                          <Input
                            id="name"
                            value={newMilestone.name}
                            onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                            placeholder="e.g., Phase 1: Site Preparation"
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            value={newMilestone.description}
                            onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                            placeholder="Detailed scope of work for this milestone..."
                            className="min-h-24"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="duration">Duration (Days) *</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={newMilestone.durationDays}
                              onChange={(e) => setNewMilestone({ ...newMilestone, durationDays: parseInt(e.target.value) || 0 })}
                              min="1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="amount">Payment Amount ($) *</Label>
                            <Input
                              id="amount"
                              type="number"
                              value={newMilestone.paymentAmount}
                              onChange={(e) => setNewMilestone({ ...newMilestone, paymentAmount: parseFloat(e.target.value) || 0 })}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Proforma Invoice / Documents (Optional)</Label>
                          <div
                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                            onClick={() => proformaInputRef.current?.click()}
                          >
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload proforma or supporting documents</p>
                            <input
                              ref={proformaInputRef}
                              type="file"
                              multiple
                              onChange={handleProformaChange}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.png,.xls,.xlsx"
                            />
                          </div>
                          {proformaFiles.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {proformaFiles.map((file) => (
                                <div key={file.name} className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  {file.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 justify-end pt-4 border-t">
                          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                          <Button
                            onClick={handleCreateMilestone}
                            disabled={creatingMilestone || !newMilestone.name || !newMilestone.description || newMilestone.paymentAmount <= 0}
                            className="bg-sky-600 hover:bg-sky-700"
                          >
                            {creatingMilestone ? 'Creating...' : 'Create & Submit for Approval'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {milestones.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No milestones yet</p>
                      <Button onClick={() => setShowCreateDialog(true)} className="bg-sky-600 hover:bg-sky-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Milestone
                      </Button>
                    </div>
                  ) : (
                    milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{milestone.title || milestone.name}</h3>
                            <Badge className={getMilestoneStateColor(milestone.status)}>
                              {getMilestoneStateLabel(milestone.status)}
                            </Badge>
                            <Badge className={getApprovalStatusColor(milestone.agentApprovalStatus)}>
                              {milestone.agentApprovalStatus === 'pending' && 'Awaiting Agent Approval'}
                              {milestone.agentApprovalStatus === 'approved' && 'Agent Approved'}
                              {milestone.agentApprovalStatus === 'rejected' && 'Rejected'}
                              {milestone.agentApprovalStatus === 'revision-requested' && 'Revision Requested'}
                            </Badge>
                            <Badge className={getEscrowStatusColor(milestone.escrowStatus)} variant="outline">
                              <Shield className="h-3 w-3 mr-1" />
                              Escrow: {milestone.escrowStatus.replace('-', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              ${(milestone.paymentAmount || 0).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {milestone.durationDays} days
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {milestone.rejectionReason && (
                            <Alert className="mt-3 border-red-200 bg-red-50">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <AlertDescription className="text-red-800">
                                <strong>Rejection reason:</strong> {milestone.rejectionReason}
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {milestone.revisionNotes && milestone.agentApprovalStatus === 'revision-requested' && (
                            <Alert className="mt-3 border-orange-200 bg-orange-50">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <AlertDescription className="text-orange-800">
                                <strong>Revision needed:</strong> {milestone.revisionNotes}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {milestone.agentApprovalStatus === 'pending' && (
                            <Badge variant="outline" className="w-fit whitespace-nowrap">
                              Pending Agent Review
                            </Badge>
                          )}

                          {milestone.status === 'pending' && milestone.agentApprovalStatus === 'approved' && milestone.escrowStatus !== 'funded' && (
                            <Badge variant="outline" className="w-fit whitespace-nowrap text-orange-700 border-orange-300">
                              Awaiting Escrow Funding
                            </Badge>
                          )}

                          {milestone.status === 'pending' && milestone.agentApprovalStatus === 'approved' && milestone.escrowStatus === 'funded' && (
                            <Button
                              onClick={() => handleStartMilestone(milestone)}
                              variant="default"
                              size="sm"
                              className="bg-sky-600 hover:bg-sky-700"
                            >
                              Start Work
                            </Button>
                          )}

                          {milestone.status === 'in-progress' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  onClick={() => setSelectedMilestone(milestone)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Mark Complete
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Submit Milestone Completion</DialogTitle>
                                  <DialogDescription>
                                    Provide proof documents that demonstrate completion of "{milestone.title || milestone.name}"
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Proof Documents *
                                    </label>
                                    <div
                                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                                      onClick={() => fileInputRef.current?.click()}
                                    >
                                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                      <p className="text-sm text-gray-600">Click to upload or drag files</p>
                                      <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.jpg,.png,.zip"
                                      />
                                    </div>
                                    {uploadedFiles.length > 0 && (
                                      <div className="mt-3 space-y-2">
                                        {uploadedFiles.map((file) => (
                                          <div key={file.name} className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            {file.name}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Notes (optional)
                                    </label>
                                    <Textarea
                                      value={submissionNotes}
                                      onChange={(e) => setSubmissionNotes(e.target.value)}
                                      placeholder="Add any notes about this milestone completion..."
                                      className="min-h-24"
                                    />
                                  </div>

                                  <div className="flex gap-2 justify-end pt-4">
                                    <Button variant="outline" onClick={() => setSelectedMilestone(null)}>Cancel</Button>
                                    <Button
                                      onClick={handleSubmitCompletion}
                                      disabled={submittingMilestone || uploadedFiles.length === 0}
                                      className="bg-sky-600 hover:bg-sky-700"
                                    >
                                      {submittingMilestone ? 'Submitting...' : 'Submit for Verification'}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {['completed', 'verification-pending'].includes(milestone.status) && (
                            <Badge variant="outline" className="w-fit">
                              Awaiting Agent Verification
                            </Badge>
                          )}

                          {['verified', 'invoiced'].includes(milestone.status) && (
                            <div className="space-y-2">
                              <Badge variant="outline" className="w-fit bg-green-50 text-green-700 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                              {milestone.escrowStatus === 'released' && (
                                <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-200">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  Payment Released
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generated Invoices</CardTitle>
                <CardDescription>Invoices automatically generated upon milestone verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">No invoices generated yet</p>
                  ) : (
                    invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">Invoice #{invoice.id.slice(0, 8)}</h3>
                            <Badge variant="outline">{invoice.status}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
                            <span>Amount: ${invoice.amount.toLocaleString()}</span>
                            <span>Tax (5%): ${invoice.taxAmount.toLocaleString()}</span>
                            <span>Total: ${invoice.totalAmount.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Invoice
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
