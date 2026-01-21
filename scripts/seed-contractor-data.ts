import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';

// Firebase config - update with your credentials
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
const AGENT_ID = 'TKbIdJugvPhLxMTWLxPTeghqlCD2'; // Replace with actual agent ID
const CONTRACTOR_ID = 'JwzsCM1uztPltOWLhL438fRmxrC2'; // Replace with actual contractor ID

async function seedData() {
  console.log('🌱 Seeding contractor data...\n');

  try {
    // 1. Create RFQs
    console.log('Creating RFQs...');
    const rfq1 = await addDoc(collection(db, 'rfqs'), {
      agentId: AGENT_ID,
      title: 'Office Building Renovation',
      description: 'Complete renovation of 5-story office building including electrical, plumbing, and HVAC updates',
      location: 'Downtown Los Angeles, CA',
      budget: 500000,
      deadline: new Date('2026-03-15'),
      status: 'open',
      scope: 'Full interior renovation including:\n- Electrical system upgrade\n- HVAC replacement\n- Plumbing modernization\n- Interior finishing\n- ADA compliance updates',
      eligibilityCriteria: [
        'Licensed contractor with commercial experience',
        'Minimum 5 years experience',
        'Insurance coverage of at least $2M',
        'OSHA certified team'
      ],
      responses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✓ RFQ 1 created:', rfq1.id);

    const rfq2 = await addDoc(collection(db, 'rfqs'), {
      agentId: AGENT_ID,
      title: 'Residential Complex Construction',
      description: 'New construction of 20-unit residential complex with parking',
      location: 'San Diego, CA',
      budget: 3500000,
      deadline: Timestamp.fromDate(new Date('2026-02-28')),
      status: 'open',
      scope: 'Ground-up construction including:\n- Site preparation\n- Foundation\n- Framing and structure\n- MEP installation\n- Finishing work\n- Landscaping',
      eligibilityCriteria: [
        'General contractor license',
        'Previous multi-unit residential experience',
        'Bonding capacity of $4M+',
        'Local references required'
      ],
      responses: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✓ RFQ 2 created:', rfq2.id);

    // 2. Create Projects
    console.log('\nCreating Projects...');
    const project1 = await addDoc(collection(db, 'projects'), {
      agentId: AGENT_ID,
      contractorId: CONTRACTOR_ID,
      rfqId: rfq1.id,
      name: 'Retail Store Renovation',
      description: 'Complete interior renovation of retail space',
      location: 'Santa Monica, CA',
      budget: 250000,
      status: 'in-progress',
      startDate: Timestamp.fromDate(new Date('2026-01-05')),
      endDate: Timestamp.fromDate(new Date('2026-04-30')),
      milestones: [
        {
          id: 'milestone-1',
          title: 'Demolition and Site Prep',
          description: 'Remove existing fixtures and prepare site',
          payment: 50000,
          status: 'completed',
          dueDate: Timestamp.fromDate(new Date('2026-01-20')),
        },
        {
          id: 'milestone-2',
          title: 'Electrical and Plumbing',
          description: 'Install new electrical and plumbing systems',
          payment: 75000,
          status: 'approved',
          dueDate: Timestamp.fromDate(new Date('2026-02-15')),
        },
        {
          id: 'milestone-3',
          title: 'Interior Finishing',
          description: 'Drywall, painting, and flooring installation',
          payment: 80000,
          status: 'in-progress',
          dueDate: Timestamp.fromDate(new Date('2026-03-30')),
        },
        {
          id: 'milestone-4',
          title: 'Final Inspection',
          description: 'Final walkthrough and punch list completion',
          payment: 45000,
          status: 'pending',
          dueDate: Timestamp.fromDate(new Date('2026-04-30')),
        },
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✓ Project 1 created:', project1.id);

    const project2 = await addDoc(collection(db, 'projects'), {
      agentId: AGENT_ID,
      contractorId: CONTRACTOR_ID,
      rfqId: rfq2.id,
      name: 'Warehouse Expansion',
      description: 'Expand existing warehouse facility',
      location: 'Long Beach, CA',
      budget: 450000,
      status: 'active',
      startDate: Timestamp.fromDate(new Date('2026-01-15')),
      endDate: Timestamp.fromDate(new Date('2026-06-30')),
      milestones: [
        {
          id: 'milestone-5',
          title: 'Foundation Work',
          description: 'Pour foundation for expansion',
          payment: 120000,
          status: 'approved',
          dueDate: Timestamp.fromDate(new Date('2026-02-28')),
        },
        {
          id: 'milestone-6',
          title: 'Structural Steel',
          description: 'Erect steel framework',
          payment: 180000,
          status: 'pending',
          dueDate: Timestamp.fromDate(new Date('2026-04-15')),
        },
        {
          id: 'milestone-7',
          title: 'Roofing and Siding',
          description: 'Complete exterior envelope',
          payment: 150000,
          status: 'pending',
          dueDate: Timestamp.fromDate(new Date('2026-06-30')),
        },
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✓ Project 2 created:', project2.id);

    // 3. Create Auctions
    console.log('\nCreating Auctions...');
    const auction1 = await addDoc(collection(db, 'auctions'), {
      agentId: AGENT_ID,
      projectId: project1.id,
      projectName: 'Hospital HVAC Upgrade',
      description: 'Complete HVAC system replacement for 3-story hospital',
      location: 'Pasadena, CA',
      budget: 800000,
      startDate: Timestamp.fromDate(new Date('2026-01-15')),
      endDate: Timestamp.fromDate(new Date('2026-02-15')),
      status: 'active',
      type: 'reverse',
      bids: [
        {
          contractorId: 'other-contractor-1',
          amount: 785000,
          createdAt: Timestamp.fromDate(new Date('2026-01-16')),
        },
        {
          contractorId: 'other-contractor-2',
          amount: 795000,
          createdAt: Timestamp.fromDate(new Date('2026-01-17')),
        },
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✓ Auction 1 created:', auction1.id);

    const auction2 = await addDoc(collection(db, 'auctions'), {
      agentId: AGENT_ID,
      projectId: project2.id,
      projectName: 'School Playground Installation',
      description: 'Design and install new playground equipment and safety surfacing',
      location: 'Irvine, CA',
      budget: 150000,
      startDate: Timestamp.fromDate(new Date('2026-01-10')),
      endDate: Timestamp.fromDate(new Date('2026-02-28')),
      status: 'active',
      type: 'reverse',
      bids: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✓ Auction 2 created:', auction2.id);

    // 4. Create Invoices
    console.log('\nCreating Invoices...');
    const invoice1 = await addDoc(collection(db, 'invoices'), {
      contractorId: CONTRACTOR_ID,
      agentId: AGENT_ID,
      projectId: project1.id,
      milestoneId: 'milestone-1',
      amount: 5000000, // $50,000 in cents
      taxAmount: 500000, // $5,000 in cents
      totalAmount: 5500000, // $55,000 in cents
      description: 'Invoice for Milestone 1: Demolition and Site Prep - Completed all demolition work and site preparation as specified.',
      status: 'paid',
      dueDate: Timestamp.fromDate(new Date('2026-02-05')),
      paidAt: Timestamp.fromDate(new Date('2026-02-03')),
      createdAt: Timestamp.fromDate(new Date('2026-01-22')),
      updatedAt: Timestamp.fromDate(new Date('2026-02-03')),
    });
    console.log('✓ Invoice 1 created:', invoice1.id);

    const invoice2 = await addDoc(collection(db, 'invoices'), {
      contractorId: CONTRACTOR_ID,
      agentId: AGENT_ID,
      projectId: project1.id,
      milestoneId: 'milestone-2',
      amount: 7500000, // $75,000 in cents
      taxAmount: 750000, // $7,500 in cents
      totalAmount: 8250000, // $82,500 in cents
      description: 'Invoice for Milestone 2: Electrical and Plumbing - All electrical and plumbing work completed and inspected.',
      status: 'submitted',
      dueDate: Timestamp.fromDate(new Date('2026-03-01')),
      createdAt: Timestamp.fromDate(new Date('2026-02-18')),
      updatedAt: Timestamp.fromDate(new Date('2026-02-18')),
    });
    console.log('✓ Invoice 2 created:', invoice2.id);

    // 5. Create Contractor Profile with Credibility
    console.log('\nCreating Contractor Profile...');
    await setDoc(doc(db, 'contractors', CONTRACTOR_ID), {
      email: 'contractor@example.com',
      name: 'ABC Construction LLC',
      phone: '(555) 123-4567',
      address: '123 Builder St, Los Angeles, CA 90012',
      license: 'CA-LICENSE-123456',
      insurance: 'Policy #INS-789012',
      specializations: ['Commercial', 'Residential', 'Renovation'],
      yearsExperience: 12,
      complianceDocuments: [
        {
          type: 'License',
          url: 'https://example.com/license.pdf',
          expiryDate: Timestamp.fromDate(new Date('2027-12-31')),
          uploadedAt: Timestamp.fromDate(new Date('2025-01-15')),
        },
        {
          type: 'Insurance',
          url: 'https://example.com/insurance.pdf',
          expiryDate: Timestamp.fromDate(new Date('2026-12-31')),
          uploadedAt: Timestamp.fromDate(new Date('2025-06-01')),
        },
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
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
      history: [
        {
          date: Timestamp.fromDate(new Date('2025-12-01')),
          score: 82,
          reason: 'Initial assessment',
        },
        {
          date: Timestamp.fromDate(new Date('2026-01-01')),
          score: 85,
          reason: 'Completed project on time',
        },
      ],
      lastUpdated: Timestamp.now(),
    });
    console.log('✓ Credibility score created');

    console.log('\n✅ All seed data created successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update AGENT_ID and CONTRACTOR_ID in this script with your actual Firebase Auth user IDs');
    console.log('2. Make sure you\'re logged in as the contractor user in the app');
    console.log('3. Refresh the contractor dashboard to see the data');
    console.log('\nTo get user IDs:');
    console.log('- Sign in to your app');
    console.log('- Open browser console');
    console.log('- Run: firebase.auth().currentUser.uid');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedData();
