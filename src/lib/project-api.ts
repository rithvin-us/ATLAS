/**
 * Project and Milestone Management API
 * Handles work management, milestone state transitions, and auto-invoice generation
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase-client';
import {
  Project,
  Milestone,
  MilestoneState,
  canTransitionMilestoneState,
  Invoice,
} from './types';

// Helper to get db with null check
function getDb(): Firestore {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore not initialized. This function must be called on the client side.');
  }
  return db;
}

// ============================================================================
// PROJECT MANAGEMENT
// ============================================================================

/**
 * Create a project from completed auction (auto-called after auction ends)
 */
export async function createProjectFromAuction(
  auctionId: string,
  contractorId: string,
  agentId: string,
  projectData: Partial<Project>
): Promise<Project> {
  try {
    const projectRef = doc(collection(getDb(), 'projects'));
    const newProject: Project = {
      id: projectRef.id,
      name: projectData.name || `Project ${projectRef.id.slice(0, 8)}`,
      agentId,
      contractorId,
      rfqId: projectData.rfqId,
      status: 'active',
      siteDetails: projectData.siteDetails || {
        name: 'To be updated',
        location: projectData.location || '',
        address: projectData.location || '',
        description: '',
      },
      milestones: [],
      budget: projectData.budget,
      escrowEnabled: true,
      startDate: new Date(),
      endDate: projectData.endDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(projectRef, newProject);
    return newProject;
  } catch (error) {
    console.error('Failed to create project from auction:', error);
    throw error;
  }
}

/**
 * Fetch all projects for a contractor
 */
export async function fetchContractorProjects(contractorId: string): Promise<Project[]> {
  try {
    const q = query(collection(getDb(), 'projects'), where('contractorId', '==', contractorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    })) as Project[];
  } catch (error) {
    console.error('Failed to fetch contractor projects:', error);
    throw error;
  }
}

/**
 * Fetch all projects for an agent
 */
export async function fetchAgentProjects(agentId: string): Promise<Project[]> {
  try {
    const q = query(collection(getDb(), 'projects'), where('agentId', '==', agentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    })) as Project[];
  } catch (error) {
    console.error('Failed to fetch agent projects:', error);
    throw error;
  }
}

/**
 * Fetch a single project with real-time listener
 */
export function subscribeToProject(
  projectId: string,
  onSuccess: (project: Project) => void,
  onError: (error: Error) => void
) {
  try {
    const projectRef = doc(getDb(), 'projects', projectId);
    return onSnapshot(
      projectRef,
      (snap) => {
        if (!snap.exists()) {
          onError(new Error('Project not found'));
          return;
        }
        const data = snap.data();
        const project: Project = {
          ...data,
          id: snap.id,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          milestones: (data.milestones || []).map((m: any) => ({
            ...m,
            dueDate: m.dueDate?.toDate?.() || new Date(m.dueDate),
            submittedAt: m.submittedAt?.toDate?.() || undefined,
            verifiedAt: m.verifiedAt?.toDate?.() || undefined,
            invoiceGeneratedAt: m.invoiceGeneratedAt?.toDate?.() || undefined,
            createdAt: m.createdAt?.toDate?.() || new Date(),
            updatedAt: m.updatedAt?.toDate?.() || new Date(),
          })),
        } as Project;
        onSuccess(project);
      },
      (error) => {
        console.error('Error subscribing to project:', error);
        onError(error);
      }
    );
  } catch (error) {
    console.error('Failed to subscribe to project:', error);
    throw error;
  }
}

// ============================================================================
// MILESTONE MANAGEMENT
// ============================================================================

/**
 * Create a milestone (by contractor) with custom amount, duration, and proforma
 */
export async function createContractorMilestone(
  projectId: string,
  contractorId: string,
  milestoneData: {
    name: string;
    description: string;
    durationDays: number;
    paymentAmount: number;
    proformaDocuments?: any[];
  }
): Promise<Milestone> {
  try {
    const batch = writeBatch(getDb());
    const milestoneRef = doc(collection(getDb(), 'milestones'));
    
    const startDate = new Date();
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + milestoneData.durationDays);

    const milestone: Milestone = {
      id: milestoneRef.id,
      projectId,
      name: milestoneData.name,
      title: milestoneData.name,
      description: milestoneData.description,
      status: 'pending',
      dueDate,
      durationDays: milestoneData.durationDays,
      paymentAmount: milestoneData.paymentAmount,
      proofDocuments: [],
      proformaDocuments: milestoneData.proformaDocuments || [],
      createdBy: contractorId,
      agentApprovalStatus: 'pending',
      escrowStatus: 'not-funded',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    batch.set(milestoneRef, milestone);

    // Update project with new milestone
    const projectRef = doc(getDb(), 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (projectSnap.exists()) {
      const projectData = projectSnap.data();
      const existingMilestones = projectData.milestones || [];
      batch.update(projectRef, {
        milestones: [...existingMilestones, milestone],
        updatedAt: new Date(),
      });
    }

    await batch.commit();
    return milestone;
  } catch (error) {
    console.error('Failed to create contractor milestone:', error);
    throw error;
  }
}

/**
 * Create initial milestones for a project (legacy function for auction-based projects)
 */
export async function createMilestones(
  projectId: string,
  milestonesData: Omit<Milestone, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>[]
): Promise<Milestone[]> {
  try {
    const batch = writeBatch(getDb());
    const createdMilestones: Milestone[] = [];

    for (const data of milestonesData) {
      const milestoneRef = doc(collection(getDb(), 'milestones'));
      const milestone: Milestone = {
        id: milestoneRef.id,
        projectId,
        name: data.name,
        title: data.title,
        description: data.description,
        status: 'pending',
        dueDate: data.dueDate,
        durationDays: data.durationDays || 30,
        paymentAmount: data.paymentAmount || 0,
        proofDocuments: [],
        proformaDocuments: data.proformaDocuments || [],
        createdBy: data.createdBy,
        agentApprovalStatus: data.agentApprovalStatus || 'approved',
        escrowStatus: 'not-funded',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      batch.set(milestoneRef, milestone);
      createdMilestones.push(milestone);
    }

    // Add milestones to project
    const projectRef = doc(getDb(), 'projects', projectId);
    batch.update(projectRef, {
      milestones: createdMilestones,
      updatedAt: new Date(),
    });

    await batch.commit();
    return createdMilestones;
  } catch (error) {
    console.error('Failed to create milestones:', error);
    throw error;
  }
}

/**
 * Fetch all milestones for a project
 */
export async function fetchProjectMilestones(projectId: string): Promise<Milestone[]> {
  try {
    const q = query(collection(getDb(), 'milestones'), where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          dueDate: data.dueDate?.toDate?.() || new Date(data.dueDate),
          submittedAt: data.submittedAt?.toDate?.() || undefined,
          verifiedAt: data.verifiedAt?.toDate?.() || undefined,
          invoiceGeneratedAt: data.invoiceGeneratedAt?.toDate?.() || undefined,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as Milestone;
      })
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  } catch (error) {
    console.error('Failed to fetch milestones:', error);
    throw error;
  }
}

/**
 * Agent approves a milestone (allows funding and contractor to start work)
 */
export async function agentApproveMilestone(
  milestoneId: string,
  agentId: string,
  notes?: string
): Promise<Milestone> {
  try {
    const milestoneRef = doc(getDb(), 'milestones', milestoneId);
    const milestoneSnap = await getDoc(milestoneRef);

    if (!milestoneSnap.exists()) {
      throw new Error('Milestone not found');
    }

    await updateDoc(milestoneRef, {
      agentApprovalStatus: 'approved',
      approvedBy: agentId,
      approvedAt: new Date(),
      revisionNotes: notes,
      updatedAt: new Date(),
    });

    const milestone = milestoneSnap.data() as Milestone;
    return {
      ...milestone,
      agentApprovalStatus: 'approved',
      approvedBy: agentId,
      approvedAt: new Date(),
      revisionNotes: notes,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Failed to approve milestone:', error);
    throw error;
  }
}

/**
 * Agent rejects a milestone with reason
 */
export async function agentRejectMilestone(
  milestoneId: string,
  agentId: string,
  reason: string
): Promise<Milestone> {
  try {
    const milestoneRef = doc(getDb(), 'milestones', milestoneId);
    const milestoneSnap = await getDoc(milestoneRef);

    if (!milestoneSnap.exists()) {
      throw new Error('Milestone not found');
    }

    await updateDoc(milestoneRef, {
      agentApprovalStatus: 'rejected',
      approvedBy: agentId,
      approvedAt: new Date(),
      rejectionReason: reason,
      updatedAt: new Date(),
    });

    const milestone = milestoneSnap.data() as Milestone;
    return {
      ...milestone,
      agentApprovalStatus: 'rejected',
      approvedBy: agentId,
      approvedAt: new Date(),
      rejectionReason: reason,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Failed to reject milestone:', error);
    throw error;
  }
}

/**
 * Agent requests revision to a milestone
 */
export async function agentRequestMilestoneRevision(
  milestoneId: string,
  agentId: string,
  revisionNotes: string
): Promise<Milestone> {
  try {
    const milestoneRef = doc(getDb(), 'milestones', milestoneId);
    const milestoneSnap = await getDoc(milestoneRef);

    if (!milestoneSnap.exists()) {
      throw new Error('Milestone not found');
    }

    await updateDoc(milestoneRef, {
      agentApprovalStatus: 'revision-requested',
      approvedBy: agentId,
      approvedAt: new Date(),
      revisionNotes,
      updatedAt: new Date(),
    });

    const milestone = milestoneSnap.data() as Milestone;
    return {
      ...milestone,
      agentApprovalStatus: 'revision-requested',
      approvedBy: agentId,
      approvedAt: new Date(),
      revisionNotes,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Failed to request milestone revision:', error);
    throw error;
  }
}

/**
 * Fund escrow for a milestone (agent action after approval)
 */
export async function fundMilestoneEscrow(
  milestoneId: string,
  agentId: string
): Promise<Milestone> {
  try {
    const milestoneRef = doc(getDb(), 'milestones', milestoneId);
    const milestoneSnap = await getDoc(milestoneRef);

    if (!milestoneSnap.exists()) {
      throw new Error('Milestone not found');
    }

    const milestone = milestoneSnap.data() as Milestone;
    
    // Check if milestone is approved
    if (milestone.agentApprovalStatus !== 'approved') {
      throw new Error('Milestone must be approved before funding escrow');
    }

    await updateDoc(milestoneRef, {
      escrowStatus: 'funded',
      escrowFundedAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      ...milestone,
      escrowStatus: 'funded',
      escrowFundedAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Failed to fund milestone escrow:', error);
    throw error;
  }
}

/**
 * Release escrow after verification (auto-called or manual agent action)
 */
export async function releaseMilestoneEscrow(
  milestoneId: string,
  agentId: string
): Promise<Milestone> {
  try {
    const milestoneRef = doc(getDb(), 'milestones', milestoneId);
    const milestoneSnap = await getDoc(milestoneRef);

    if (!milestoneSnap.exists()) {
      throw new Error('Milestone not found');
    }

    const milestone = milestoneSnap.data() as Milestone;
    
    // Check if milestone is verified
    if (milestone.status !== 'verified' && milestone.status !== 'invoiced') {
      throw new Error('Milestone must be verified before releasing escrow');
    }

    await updateDoc(milestoneRef, {
      escrowStatus: 'released',
      escrowReleasedAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      ...milestone,
      escrowStatus: 'released',
      escrowReleasedAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Failed to release milestone escrow:', error);
    throw error;
  }
}

/**
 * Update milestone state with validation
 */
export async function updateMilestoneState(
  milestoneId: string,
  newState: MilestoneState,
  userData?: { userId: string; userName: string }
): Promise<Milestone> {
  try {
    const milestoneRef = doc(getDb(), 'milestones', milestoneId);
    const milestoneSnap = await getDoc(milestoneRef);

    if (!milestoneSnap.exists()) {
      throw new Error('Milestone not found');
    }

    const currentMilestone = milestoneSnap.data() as Milestone;
    const currentState = currentMilestone.status as MilestoneState;

    // Validate state transition
    if (!canTransitionMilestoneState(currentState, newState)) {
      throw new Error(`Invalid transition from ${currentState} to ${newState}`);
    }

    // Prepare update data based on new state
    const updateData: any = {
      status: newState,
      updatedAt: new Date(),
    };

    // Set timestamps based on state
    if (newState === 'completed') {
      updateData.submittedBy = userData?.userId;
      updateData.submittedAt = new Date();
    } else if (newState === 'verified') {
      updateData.verifiedBy = userData?.userId;
      updateData.verifiedAt = new Date();
    }

    await updateDoc(milestoneRef, updateData);

    // If verified, auto-generate invoice and release escrow
    if (newState === 'verified' && !currentMilestone.invoiceId) {
      const invoice = await generateMilestoneInvoice(currentMilestone);
      await updateDoc(milestoneRef, {
        invoiceId: invoice.id,
        invoiceGeneratedAt: new Date(),
        status: 'invoiced',
      });
      
      // Auto-release escrow if funded
      if (currentMilestone.escrowStatus === 'funded') {
        await releaseMilestoneEscrow(milestoneId, userData?.userId || 'system');
      }
    }

    return {
      ...currentMilestone,
      ...updateData,
    };
  } catch (error) {
    console.error('Failed to update milestone state:', error);
    throw error;
  }
}

/**
 * Submit milestone completion with proof documents
 */
export async function submitMilestoneCompletion(
  milestoneId: string,
  proofDocuments: any[],
  userId: string
): Promise<Milestone> {
  try {
    const milestoneRef = doc(getDb(), 'milestones', milestoneId);
    const milestoneSnap = await getDoc(milestoneRef);

    if (!milestoneSnap.exists()) {
      throw new Error('Milestone not found');
    }

    await updateDoc(milestoneRef, {
      status: 'completed',
      proofDocuments,
      submittedBy: userId,
      submittedAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      ...(milestoneSnap.data() as Milestone),
      status: 'completed',
      proofDocuments,
      submittedBy: userId,
      submittedAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Failed to submit milestone completion:', error);
    throw error;
  }
}

// ============================================================================
// INVOICE AUTO-GENERATION
// ============================================================================

/**
 * Auto-generate invoice when milestone is verified
 */
export async function generateMilestoneInvoice(milestone: Milestone): Promise<Invoice> {
  try {
    // Fetch project to get contractor and agent info
    const projectRef = doc(getDb(), 'projects', milestone.projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      throw new Error('Project not found');
    }

    const project = projectSnap.data() as Project;
    const invoiceRef = doc(collection(getDb(), 'invoices'));

    const invoice: Invoice = {
      id: invoiceRef.id,
      projectId: milestone.projectId,
      milestoneId: milestone.id,
      contractorId: project.contractorId || '',
      agentId: project.agentId,
      amount: milestone.paymentAmount || 0,
      taxAmount: Math.round((milestone.paymentAmount || 0) * 0.05), // 5% tax
      totalAmount: Math.round((milestone.paymentAmount || 0) * 1.05),
      description: `Invoice for milestone: ${milestone.name}`,
      status: 'submitted',
      documents: milestone.proofDocuments,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(invoiceRef, invoice);
    return invoice;
  } catch (error) {
    console.error('Failed to generate invoice:', error);
    throw error;
  }
}

/**
 * Fetch all invoices generated from milestones
 */
export async function fetchProjectInvoices(projectId: string): Promise<Invoice[]> {
  try {
    const q = query(collection(getDb(), 'invoices'), where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          dueDate: data.dueDate?.toDate?.() || new Date(),
          paidAt: data.paidAt?.toDate?.() || undefined,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as Invoice;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Failed to fetch project invoices:', error);
    throw error;
  }
}
