import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config
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

// Replace these with your actual IDs from Firebase Auth
const AGENT_ID = 'TKbIdJugvPhLxMTWLxPTeghqlCD2';
const CONTRACTOR_ID = 'JwzsCM1uztPltOWLhL438fRmxrC2';

async function seedData() {
  console.log('🌱 Seeding contractor data...\n');

  try {
    // 1. Create RFQs
    console.log('Creating RFQs...');
    const rfq1 = await addDoc(collection(db, 'rfqs'), {
      agentId: AGENT_ID,
      title: 'Office Building Renovation',
      description: 'Complete renovation of 5-story office building',
      location: 'Downtown Los Angeles, CA',
      budget: 500000,
      deadline: new Date('2026-03-15'),
      status: 'open',
      scope: 'Full interior renovation',
      eligibilityCriteria: ['Licensed contractor', 'Min 5 years experience'],
      responses: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✓ RFQ 1 created:', rfq1.id);

    const rfq2 = await addDoc(collection(db, 'rfqs'), {
      agentId: AGENT_ID,
      title: 'Residential Complex Construction',
      description: 'New construction of 20-unit residential complex',
      location: 'San Diego, CA',
      budget: 3500000,
      deadline: new Date('2026-02-28'),
      status: 'open',
      scope: 'Ground-up construction',
      eligibilityCriteria: ['General contractor license'],
      responses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✓ RFQ 2 created:', rfq2.id);

    // 2. Create Projects
    console.log('\nCreating Projects...');
    const project1 = await addDoc(collection(db, 'projects'), {
      agentId: AGENT_ID,
      contractorId: CONTRACTOR_ID,
      rfqId: rfq1.id,
      name: 'Retail Store Renovation',
      description: 'Interior renovation of retail space',
      location: 'Santa Monica, CA',
      budget: 250000,
      status: 'in-progress',
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-04-30'),
      milestones: [
        {
          id: 'milestone-1',
          title: 'Demolition and Site Prep',
          description: 'Remove fixtures',
          payment: 50000,
          status: 'completed',
          dueDate: new Date('2026-01-20'),
        },
        {
          id: 'milestone-2',
          title: 'Electrical and Plumbing',
          description: 'Install systems',
          payment: 75000,
          status: 'approved',
          dueDate: new Date('2026-02-15'),
        },
        {
          id: 'milestone-3',
          title: 'Interior Finishing',
          description: 'Finishing work',
          payment: 80000,
          status: 'in-progress',
          dueDate: new Date('2026-03-30'),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✓ Project 1 created:', project1.id);

    const project2 = await addDoc(collection(db, 'projects'), {
      agentId: AGENT_ID,
      contractorId: CONTRACTOR_ID,
      rfqId: rfq2.id,
      name: 'Warehouse Expansion',
      description: 'Expand warehouse',
      location: 'Long Beach, CA',
      budget: 450000,
      status: 'active',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-06-30'),
      milestones: [
        {
          id: 'milestone-5',
          title: 'Foundation Work',
          description: 'Foundation',
          payment: 120000,
          status: 'approved',
          dueDate: new Date('2026-02-28'),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✓ Project 2 created:', project2.id);

    // 3. Create Auctions
    console.log('\nCreating Auctions...');
    const auction1 = await addDoc(collection(db, 'auctions'), {
      agentId: AGENT_ID,
      projectId: project1.id,
      projectName: 'Hospital HVAC Upgrade',
      description: 'HVAC replacement',
      location: 'Pasadena, CA',
      budget: 800000,
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-02-15'),
      status: 'active',
      type: 'reverse',
      bids: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✓ Auction 1 created:', auction1.id);

    // 4. Create Invoices
    console.log('\nCreating Invoices...');
    const invoice1 = await addDoc(collection(db, 'invoices'), {
      contractorId: CONTRACTOR_ID,
      agentId: AGENT_ID,
      projectId: project1.id,
      milestoneId: 'milestone-1',
      amount: 5000000,
      taxAmount: 500000,
      totalAmount: 5500000,
      description: 'Invoice for Milestone 1',
      status: 'paid',
      dueDate: new Date('2026-02-05'),
      paidAt: new Date('2026-02-03'),
      createdAt: new Date('2026-01-22'),
      updatedAt: new Date('2026-02-03'),
    });
    console.log('✓ Invoice 1 created:', invoice1.id);

    // 5. Create Contractor Profile
    console.log('\nCreating Contractor Profile...');
    await setDoc(doc(db, 'contractors', CONTRACTOR_ID), {
      email: 'contractor@example.com',
      name: 'ABC Construction LLC',
      phone: '(555) 123-4567',
      yearsExperience: 12,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✓ Contractor profile created');

    // 6. Create Credibility Score
    console.log('\nCreating Credibility Score...');
    await setDoc(doc(db, 'credibilityScores', CONTRACTOR_ID), {
      contractorId: CONTRACTOR_ID,
      overallScore: 85,
      completionRate: 92,
      qualityRating: 88,
      timelinessScore: 85,
      communicationScore: 90,
      complianceScore: 95,
      history: [],
      lastUpdated: new Date(),
    });
    console.log('✓ Credibility score created');

    console.log('\n✅ All seed data created successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedData();
