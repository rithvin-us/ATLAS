import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { Auction, Bid, CredibilityScore, Invoice, Project, RFQ, Vendor } from './types';

interface FirestoreEntity {
  id: string;
  [key: string]: any;
}

function convertDates<T extends FirestoreEntity>(snapshotData: any, id: string): T {
  if (!snapshotData) {
    throw new Error('Missing document data');
  }

  const normalized: Record<string, any> = {};
  Object.entries(snapshotData).forEach(([key, value]) => {
    if (value instanceof Timestamp) {
      normalized[key] = value.toDate();
    } else if (Array.isArray(value)) {
      normalized[key] = value.map((item) => (item instanceof Timestamp ? item.toDate() : item));
    } else {
      normalized[key] = value;
    }
  });

  return { id, ...normalized } as T;
}

export async function fetchProjects(agentId: string): Promise<Project[]> {
  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, where('agentId', '==', agentId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => convertDates<Project>(docSnap.data(), docSnap.id));
}

export async function fetchProject(projectId: string): Promise<Project | null> {
  const ref = doc(db, 'projects', projectId);
  const snap = await getDoc(ref);
  return snap.exists() ? convertDates<Project>(snap.data(), snap.id) : null;
}

export async function createProject(agentId: string, payload: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'agentId' | 'milestones'> & { milestones?: Project['milestones'] }): Promise<string> {
  const projectsRef = collection(db, 'projects');
  const data = {
    ...payload,
    agentId,
    status: payload.status ?? 'draft',
    milestones: payload.milestones ?? [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const newDoc = await addDoc(projectsRef, data);
  return newDoc.id;
}

export async function updateProjectStatus(projectId: string, status: Project['status']): Promise<void> {
  const ref = doc(db, 'projects', projectId);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

export async function fetchRFQs(agentId: string): Promise<RFQ[]> {
  const rfqRef = collection(db, 'rfqs');
  const q = query(rfqRef, where('agentId', '==', agentId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => convertDates<RFQ>(docSnap.data(), docSnap.id));
}

export async function fetchRFQ(rfqId: string): Promise<RFQ | null> {
  const ref = doc(db, 'rfqs', rfqId);
  const snap = await getDoc(ref);
  return snap.exists() ? convertDates<RFQ>(snap.data(), snap.id) : null;
}

export async function createRFQ(agentId: string, payload: Omit<RFQ, 'id' | 'agentId' | 'status' | 'responses' | 'createdAt'> & { status?: RFQ['status'] }): Promise<string> {
  const rfqRef = collection(db, 'rfqs');
  const data = {
    ...payload,
    agentId,
    responses: [],
    status: payload.status ?? 'draft',
    createdAt: serverTimestamp(),
  };
  const newDoc = await addDoc(rfqRef, data);
  return newDoc.id;
}

export async function updateRFQStatus(rfqId: string, status: RFQ['status']): Promise<void> {
  const ref = doc(db, 'rfqs', rfqId);
  await updateDoc(ref, { status });
}

export async function fetchAuctions(agentId: string): Promise<Auction[]> {
  const auctionsRef = collection(db, 'auctions');
  const q = query(auctionsRef, where('agentId', '==', agentId), orderBy('startDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => convertDates<Auction>(docSnap.data(), docSnap.id));
}

export async function fetchAuction(auctionId: string): Promise<Auction | null> {
  const ref = doc(db, 'auctions', auctionId);
  const snap = await getDoc(ref);
  return snap.exists() ? convertDates<Auction>(snap.data(), snap.id) : null;
}

export async function createAuction(agentId: string, payload: Omit<Auction, 'id' | 'agentId' | 'status' | 'bids'> & { status?: Auction['status'] }): Promise<string> {
  const ref = collection(db, 'auctions');
  const data = {
    ...payload,
    agentId,
    bids: [],
    status: payload.status ?? 'draft',
    createdAt: serverTimestamp(),
  };
  const newDoc = await addDoc(ref, data);
  return newDoc.id;
}

export async function updateAuctionStatus(auctionId: string, status: Auction['status']): Promise<void> {
  const ref = doc(db, 'auctions', auctionId);
  await updateDoc(ref, { status });
}

export async function fetchInvoices(agentId: string): Promise<Invoice[]> {
  const invoicesRef = collection(db, 'invoices');
  const q = query(invoicesRef, where('agentId', '==', agentId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => convertDates<Invoice>(docSnap.data(), docSnap.id));
}

export async function fetchInvoice(invoiceId: string): Promise<Invoice | null> {
  const ref = doc(db, 'invoices', invoiceId);
  const snap = await getDoc(ref);
  return snap.exists() ? convertDates<Invoice>(snap.data(), snap.id) : null;
}

export async function updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<void> {
  const ref = doc(db, 'invoices', invoiceId);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

export async function fetchVendors(): Promise<Vendor[]> {
  const vendorsRef = collection(db, 'vendors');
  const q = query(vendorsRef, where('verificationStatus', '==', 'verified'));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => convertDates<Vendor>(docSnap.data(), docSnap.id));
}

export async function fetchVendor(vendorId: string): Promise<Vendor | null> {
  const ref = doc(db, 'vendors', vendorId);
  const snap = await getDoc(ref);
  return snap.exists() ? convertDates<Vendor>(snap.data(), snap.id) : null;
}

export async function fetchCredibilityScore(contractorId: string): Promise<CredibilityScore | null> {
  const ref = doc(db, 'credibilityScores', contractorId);
  const snap = await getDoc(ref);
  return snap.exists() ? convertDates<CredibilityScore>(snap.data(), snap.id) : null;
}

/**
 * Fetch all bids for a specific auction from the auction_bids collection
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
