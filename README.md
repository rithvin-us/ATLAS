# ATLAS - Web Platform

AI-assisted procurement workspace for agents and contractors to manage RFQs, auctions, milestones, and invoices with clear role boundaries.

## What Problem We Solve

- Agents need a single place to publish RFQs/auctions, approve milestones, and process contractor invoices.
- Contractors need visibility into RFQs/auctions and a clean flow to submit bids, milestones, and invoices without back-and-forth email.
- AI validation (Genkit) assists feasibility checks on quotations to reduce review cycles.

## Features

- 🎨 Modern UI with shadcn/ui components
- 🤖 AI-powered quotation feasibility validation using Google Genkit
- 📊 Dashboards for RFQs, auctions, milestones, and invoices (agent vs contractor views)
- 🔐 Role-aware access guards (agent/contractor) with Firebase Auth
- 🎯 Type-safe with TypeScript
- 📱 Fully responsive design

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **AI**: Google Genkit (see `src/ai/` flows)
- **Data/Auth**: Firebase (Auth + Firestore)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## How to Run

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google AI API key (for Genkit)
  
Firebase setup (Firestore + Auth) with corresponding credentials in environment variables.

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd rentr
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Google AI API key:
```
GOOGLE_GENAI_API_KEY=your_api_key_here
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How the AI Works

- Genkit pipelines live in `src/ai/` (e.g., `src/ai/flows/validate-quotation-feasibility.ts`).
- The flow validates quotation feasibility using your Google GenAI key provided in `.env.local`.
- Frontend calls the Genkit handler via the Next.js route handlers wired in `src/ai/genkit.ts` / `src/ai/dev.ts`.

## Deployment

- Deployment link: _not yet published; deploy your own instance once Firebase/Genkit keys are configured_.
- Health check: `/api/health` returns `{ status: "ok" }`.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── agent/             # Agent dashboards (invoices, rfqs, auctions)
│   ├── contractor/        # Contractor dashboards (invoices, rfqs, auctions)
│   └── auth/              # Auth flows for each role
├── components/            # Shared UI (shadcn/ui) and guards
├── ai/                    # Genkit setup and flows
├── hooks/                 # Custom React hooks
└── lib/                   # APIs, auth, Firebase config, utilities
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Development

### Adding New Components

This project uses shadcn/ui. To add new components:

```bash
npx shadcn-ui@latest add [component-name]
```

### Environment Variables

- `GOOGLE_GENAI_API_KEY` - Required for AI-powered features

## License

MIT