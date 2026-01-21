# Database Seeding Instructions

## Quick Start

### Step 1: Get Your User IDs

1. Open your app at http://localhost:3000
2. Log in as a **contractor** user
3. Open browser console (F12)
4. Run this command:
   ```javascript
   console.log('Contractor ID:', firebase.auth().currentUser.uid);
   ```
5. Copy the contractor ID

6. Log out and log in as an **agent** user
7. Run the same command to get the agent ID

### Step 2: Update the Seed Script

Open `scripts/seed-contractor-data.ts` and replace these lines:

```typescript
const AGENT_ID = 'your-agent-user-id'; // Replace with actual agent ID
const CONTRACTOR_ID = 'your-contractor-user-id'; // Replace with actual contractor ID
```

### Step 3: Run the Seed Script

```bash
cd scripts
npm install
npx tsx seed-contractor-data.ts
```

### Step 4: Verify

1. Log in as the contractor user
2. Navigate to `/contractor/dashboard`
3. You should now see:
   - Available RFQs (2 items)
   - Active Projects (2 items)
   - Pending Payments (1 invoice)
   - Credibility Score (85)

## What Gets Created

The seed script creates:

- **2 RFQs** (open for response)
- **2 Projects** (with multiple milestones)
- **2 Auctions** (one with bids, one without)
- **2 Invoices** (one paid, one submitted)
- **1 Contractor Profile** (with compliance docs)
- **1 Credibility Score** (85/100)

## Alternative: Manual Data Entry

If you prefer not to run the seed script, you can manually add data through Firebase Console:

1. Go to https://console.firebase.google.com
2. Select your project
3. Go to Firestore Database
4. Add collections manually using the structure from the seed script

## Troubleshooting

### "No data showing"
- Make sure you're logged in as the contractor user whose ID you used in the seed script
- Check browser console for errors
- Verify Firestore indexes are enabled (check Firebase Console)

### "Permission denied"
- Check your Firestore security rules
- Make sure the contractor user has read access to the collections

### "Index required" error
- Click the Firebase Console link in the error message
- Create the required composite index
- Wait 5-10 minutes for it to build
