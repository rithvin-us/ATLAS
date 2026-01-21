import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AGENT_ID = 'TKbIdJugvPhLxMTWLxPTeghqlCD2';
const CONTRACTOR_ID = 'JwzsCM1uztPltOWLhL438fRmxrC2';

async function seedData() {
  console.log('🌱 Seeding contractor data...\n');

  try {
    console.log('Creating RFQs...');
    const rfq1 = await addDoc(collection(db, 'rfqs'), {
      agentId: AGENT_ID,
      title: 'Office Building Renovation',
      description: 'Complete renovation',
      location: 'Los Angeles, CA',
      budget: 500000,
      deadline: Timestamp.fromDate(new Date('2026-03-15')),
      status: 'open',
      scope: 'Renovation',
      eligibilityCriteria: ['Licensed'],
      responses: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✓ RFQ 1:', rfq1.id);

    console.log('Creating Projects...');
    const project1 = await addDoc(collection(db, 'projects'), {
      agentId: AGENT_ID,
      contractorId: CONTRACTOR_ID,
      rfqId: rfq1.id,
      name: 'Retail Store',
      description: 'Store renovation',
      location: 'Santa Monica, CA',
      budget: 250000,
      status: 'in-progress',
      startDate: Timestamp.fromDate(new Date('2026-01-05')),
      endDate: Timestamp.fromDate(new Date('2026-04-30')),
      milestones: [
        {
          id: 'm1',
          title: 'Demo',
          description: 'Demolition',
          payment: 50000,
          status: 'completed',
          dueDate: Timestamp.fromDate(new Date('2026-01-20')),
        },
        {
          id: 'm2',
          title: 'Electrical',
          description: 'Install',
          payment: 75000,
          status: 'approved',
          dueDate: Timestamp.fromDate(new Date('2026-02-15')),
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✓ Project:', project1.id);

    console.log('Creating Auctions...');
    await addDoc(collection(db, 'auctions'), {
      agentId: AGENT_ID,
      projectId: project1.id,
      projectName: 'HVAC',
      description: 'HVAC replacement',
      location: 'Pasadena, CA',
      budget: 800000,
      startDate: Timestamp.fromDate(new Date('2026-01-15')),
      endDate: Timestamp.fromDate(new Date('2026-02-15')),
      status: 'active',
      type: 'reverse',
      bids: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✓ Auction created');

    console.log('Creating Invoices...');
    await addDoc(collection(db, 'invoices'), {
      contractorId: CONTRACTOR_ID,
      agentId: AGENT_ID,
      projectId: project1.id,
      milestoneId: 'm1',
      amount: 5000000,
      taxAmount: 500000,
      totalAmount: 5500000,
      description: 'Invoice for Demo',
      status: 'paid',
      dueDate: Timestamp.fromDate(new Date('2026-02-05')),
      paidAt: Timestamp.fromDate(new Date('2026-02-03')),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✓ Invoice created');

    console.log('Creating Profile...');
    await setDoc(doc(db, 'contractors', CONTRACTOR_ID), {
      name: 'ABC Construction',
      email: 'abc@example.com',
      yearsExperience: 12,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✓ Profile created');

    console.log('Creating Credibility...');
    await setDoc(doc(db, 'credibilityScores', CONTRACTOR_ID), {
      contractorId: CONTRACTOR_ID,
      overallScore: 85,
      completionRate: 92,
      qualityRating: 88,
      timelinessScore: 85,
      communicationScore: 90,
      complianceScore: 95,
      history: [],
      lastUpdated: serverTimestamp(),
    });
    console.log('✓ Credibility created');

    console.log('\n✅ All data seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedData();
