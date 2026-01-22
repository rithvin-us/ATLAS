import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  Project,
  RFQ,
  RFQResponse,
  Auction,
  Bid,
  Invoice,
  CredibilityScore,
  Vendor,
  ComplianceDocument,
} from './types';

// ============================================================================
// Utility: Convert Firestore Timestamp to Date
// ============================================================================
const toDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return timestamp;
};

// ============================================================================
// Fetch Functions
// ============================================================================

/**
 * Fetch all RFQs that are eligible for the contractor to respond to
 * (status = 'published' and not expired)
 */
export async function fetchEligibleRFQs(contractorId: string): Promise<RFQ[]> {
  const rfqsRef = collection(db, 'rfqs');
  const q = query(
    rfqsRef,
    where('status', '==', 'published'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  const now = new Date();
  
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: toDate(data.createdAt),
        deadline: toDate(data.deadline),
      } as RFQ;
    })
    .filter((rfq) => rfq.deadline > now); // Filter out expired RFQs
}

/**
 * Fetch RFQs where the contractor has already submitted a response
 */
export async function fetchContractorRFQResponses(contractorId: string): Promise<RFQ[]> {
  const rfqsRef = collection(db, 'rfqs');
  const q = query(rfqsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: toDate(data.createdAt),
        deadline: toDate(data.deadline),
      } as RFQ;
    })
    .filter((rfq) =>
      rfq.responses?.some((response) => response.contractorId === contractorId)
    );
}

/**
 * Fetch projects where the contractor is assigned
 */
export async function fetchContractorProjects(contractorId: string): Promise<Project[]> {
  const projectsRef = collection(db, 'projects');
  const q = query(
    projectsRef,
    where('contractorId', '==', contractorId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: toDate(data.createdAt),
      milestones: data.milestones?.map((m: any) => ({
        ...m,
        targetDate: toDate(m.targetDate),
        completedDate: m.completedDate ? toDate(m.completedDate) : undefined,
      })),
    } as Project;
  });
}

/**
 * Fetch auctions where the contractor can participate
 * (status = 'active' or contractor has already placed a bid)
 */
export async function fetchContractorAuctions(contractorId: string): Promise<Auction[]> {
  const auctionsRef = collection(db, 'auctions');
  const q = query(auctionsRef, orderBy('startDate', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: toDate(data.createdAt),
        startDate: toDate(data.startDate),
        endDate: toDate(data.endDate),
      } as unknown as Auction;
    })
    .filter(
      (auction) =>
        auction.status === 'live' ||
        auction.status === 'scheduled'
    );
}

/**
 * Fetch invoices created by the contractor
 */
export async function fetchContractorInvoices(contractorId: string): Promise<Invoice[]> {
  const invoicesRef = collection(db, 'invoices');
  const q = query(
    invoicesRef,
    where('contractorId', '==', contractorId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: toDate(data.createdAt),
      dueDate: toDate(data.dueDate),
      paidAt: data.paidAt ? toDate(data.paidAt) : undefined,
    } as unknown as Invoice;
  });
}

/**
 * Fetch a single RFQ by ID
 */
export async function fetchRFQ(rfqId: string): Promise<RFQ | null> {
  const rfqRef = doc(db, 'rfqs', rfqId);
  const rfqSnap = await getDoc(rfqRef);

  if (!rfqSnap.exists()) {
    return null;
  }

  const data = rfqSnap.data();
  return {
    ...data,
    id: rfqSnap.id,
    createdAt: toDate(data.createdAt),
    deadline: toDate(data.deadline),
  } as RFQ;
}

/**
 * Fetch a single project by ID
 */
export async function fetchProject(projectId: string): Promise<Project | null> {
  const projectRef = doc(db, 'projects', projectId);
  const projectSnap = await getDoc(projectRef);

  if (!projectSnap.exists()) {
    return null;
  }

  const data = projectSnap.data();
  return {
    ...data,
    id: projectSnap.id,
    createdAt: toDate(data.createdAt),
    milestones: data.milestones?.map((m: any) => ({
      ...m,
      targetDate: toDate(m.targetDate),
      completedDate: m.completedDate ? toDate(m.completedDate) : undefined,
    })),
  } as Project;
}

/**
 * Fetch a single auction by ID
 */
export async function fetchAuction(auctionId: string): Promise<Auction | null> {
  const auctionRef = doc(db, 'auctions', auctionId);
  const auctionSnap = await getDoc(auctionRef);

  if (!auctionSnap.exists()) {
    return null;
  }

  const data = auctionSnap.data();
  return {
    ...data,
    id: auctionSnap.id,
    createdAt: toDate(data.createdAt),
    startDate: toDate(data.startDate),
    endDate: toDate(data.endDate),
  } as unknown as Auction;
}

/**
 * Fetch a single invoice by ID
 */
export async function fetchInvoice(invoiceId: string): Promise<Invoice | null> {
  const invoiceRef = doc(db, 'invoices', invoiceId);
  const invoiceSnap = await getDoc(invoiceRef);

  if (!invoiceSnap.exists()) {
    return null;
  }

  const data = invoiceSnap.data();
  return {
    ...data,
    id: invoiceSnap.id,
    createdAt: toDate(data.createdAt),
    dueDate: toDate(data.dueDate),
    paidAt: data.paidAt ? toDate(data.paidAt) : undefined,
  } as unknown as Invoice;
}

/**
 * Fetch the contractor's credibility score
 */
export async function fetchContractorCredibility(
  contractorId: string
): Promise<CredibilityScore | null> {
  const credRef = doc(db, 'credibilityScores', contractorId);
  const credSnap = await getDoc(credRef);

  if (!credSnap.exists()) {
    return null;
  }

  const data = credSnap.data();
  return {
    ...data,
    id: credSnap.id,
    updatedAt: toDate(data.updatedAt),
    history: data.history?.map((m: any) => ({
      ...m,
      date: toDate(m.date),
    })),
  } as CredibilityScore;
}

/**
 * Fetch the contractor's vendor profile
 */
export async function fetchContractorProfile(contractorId: string): Promise<Vendor | null> {
  const vendorRef = doc(db, 'vendors', contractorId);
  const vendorSnap = await getDoc(vendorRef);

  if (!vendorSnap.exists()) {
    return null;
  }

  const data = vendorSnap.data();
  return {
    ...data,
    id: vendorSnap.id,
    credibilityScore: data.credibilityScore || 0,
  } as Vendor;
}

// ============================================================================
// Create/Update Functions
// ============================================================================

/**
 * Submit a response to an RFQ
 */
export async function submitRFQResponse(
  rfqId: string,
  response: Omit<RFQResponse, 'id' | 'submittedAt'>
): Promise<void> {
  const rfqRef = doc(db, 'rfqs', rfqId);
  const rfqSnap = await getDoc(rfqRef);

  if (!rfqSnap.exists()) {
    throw new Error('RFQ not found');
  }

  const rfqData = rfqSnap.data() as RFQ;
  const newResponse: RFQResponse = {
    ...response,
    id: `response_${Date.now()}`,
    submittedAt: new Date(),
  };

  const updatedResponses = [...(rfqData.responses || []), newResponse];

  await updateDoc(rfqRef, {
    responses: updatedResponses,
  });
}

/**
 * Submit a bid to an auction (stores in separate auction_bids collection)
 */
export async function submitBid(
  auctionId: string,
  bid: Omit<Bid, 'id' | 'submittedAt'>
): Promise<void> {
  const auctionRef = doc(db, 'auctions', auctionId);
  const auctionSnap = await getDoc(auctionRef);

  if (!auctionSnap.exists()) {
    throw new Error('Auction not found');
  }

  const auctionData = auctionSnap.data() as Auction;
  
  if (auctionData.status !== 'live') {
    throw new Error('Auction is not live');
  }

  const now = new Date();
  const startDate = auctionData.startDate instanceof Date 
    ? auctionData.startDate 
    : (auctionData.startDate as any)?.toDate?.() || new Date(auctionData.startDate);
  const endDate = auctionData.endDate instanceof Date 
    ? auctionData.endDate 
    : (auctionData.endDate as any)?.toDate?.() || new Date(auctionData.endDate);
  
  if (now < startDate || now > endDate) {
    throw new Error('Auction is not currently accepting bids');
  }

  // Get contractor info for credibility score
  const contractorRef = doc(db, 'contractors', bid.contractorId);
  const contractorSnap = await getDoc(contractorRef);
  let credibilityScore = 0;
  let contractorName = 'Unknown';
  
  if (contractorSnap.exists()) {
    const contractorData = contractorSnap.data();
    credibilityScore = contractorData.credibilityScore || 0;
    contractorName = contractorData.name || contractorData.email || 'Unknown';
  }

  const bidId = `bid_${Date.now()}_${bid.contractorId.slice(0, 8)}`;
  const newBid: Bid = {
    ...bid,
    id: bidId,
    submittedAt: now,
    credibilityScore,
    contractorName,
  };

  // Store bid in separate auction_bids collection
  const bidRef = doc(db, 'auction_bids', bidId);
  await setDoc(bidRef, {
    ...newBid,
    submittedAt: now,
  });
}

/**
 * Fetch all bids for a specific auction
 */
export async function fetchAuctionBids(auctionId: string): Promise<Bid[]> {
  const bidsQuery = query(
    collection(db, 'auction_bids'),
    where('auctionId', '==', auctionId)
  );
  
  const snapshot = await getDocs(bidsQuery);
  const bids: Bid[] = [];
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    bids.push({
      id: doc.id,
      auctionId: data.auctionId,
      contractorId: data.contractorId,
      contractorName: data.contractorName,
      amount: data.amount,
      submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
      credibilityScore: data.credibilityScore,
    });
  });
  
  return bids.sort((a, b) => a.amount - b.amount); // Sort by amount (lowest first for reverse auction)
}

/**
 * Fetch bids for a specific contractor in an auction
 */
export async function fetchMyAuctionBids(auctionId: string, contractorId: string): Promise<Bid[]> {
  const bidsQuery = query(
    collection(db, 'auction_bids'),
    where('auctionId', '==', auctionId),
    where('contractorId', '==', contractorId)
  );
  
  const snapshot = await getDocs(bidsQuery);
  const bids: Bid[] = [];
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    bids.push({
      id: doc.id,
      auctionId: data.auctionId,
      contractorId: data.contractorId,
      contractorName: data.contractorName,
      amount: data.amount,
      submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
      credibilityScore: data.credibilityScore,
    });
  });
  
  return bids.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()); // Sort by time (newest first)
}

/**
 * Create an invoice for a completed milestone
 */
export async function createInvoice(
  payload: Omit<Invoice, 'id' | 'createdAt'>
): Promise<string> {
  // Validate that the milestone is approved
  if (payload.milestoneId) {
    const projectRef = doc(db, 'projects', payload.projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      throw new Error('Project not found');
    }

    const project = projectSnap.data() as Project;
    const milestone = project.milestones?.find((m) => m.id === payload.milestoneId);

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.status !== 'verified' && milestone.status !== 'invoiced') {
      throw new Error('Invoice can only be created for verified milestones');
    }
  }

  const invoicesRef = collection(db, 'invoices');
  const docRef = await addDoc(invoicesRef, {
    ...payload,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Update compliance document for the contractor
 */
export async function updateComplianceDocument(
  contractorId: string,
  document: any
): Promise<void> {
  const vendorRef = doc(db, 'vendors', contractorId);
  const vendorSnap = await getDoc(vendorRef);

  if (!vendorSnap.exists()) {
    throw new Error('Contractor profile not found');
  }

  const vendorData = vendorSnap.data() as Vendor;
  const updatedDocs = (vendorData.complianceDocs || []).filter(
    (d: any) => d.type !== document.type
  );
  updatedDocs.push(document);

  await updateDoc(vendorRef, {
    complianceDocs: updatedDocs,
  });
}

/**
 * Update contractor profile information
 */
export async function updateContractorProfile(
  contractorId: string,
  updates: Partial<Vendor>
): Promise<void> {
  const vendorRef = doc(db, 'vendors', contractorId);
  await updateDoc(vendorRef, updates);
}
