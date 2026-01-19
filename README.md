# Rentr - ATLAS Web Platform

A modern Next.js web platform with AI-powered quotation validation, built with TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- 🎨 Modern UI with shadcn/ui components
- 🤖 AI-powered quotation feasibility validation using Google Genkit
- 📊 Dashboard for managing quotations
- 🎯 Type-safe with TypeScript
- 🎭 Beautiful animations and transitions
- 📱 Fully responsive design

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **AI**: Google Genkit
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google AI API key (for Genkit)

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

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard pages
│   │   └── quotation/    # Quotation management
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── landing-page.tsx  # Landing page component
├── ai/                    # AI/Genkit integration
│   ├── flows/            # AI flows
│   └── genkit.ts         # Genkit setup
├── hooks/                 # Custom React hooks
└── lib/                   # Utility functions
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