# Getting started

## Requirements

- Node.js 20 or newer
- A Firebase project with Authentication (email and password) and Firestore enabled
- A Gemini API key from Google AI Studio

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Source |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` (six values) | Firebase console, Project settings, Your apps |
| `GEMINI_API_KEY` | Google AI Studio. `GOOGLE_API_KEY` is also read by the Genkit plugin |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## First run

1. Visit `/auth/agent/signup` and create an agent account.
2. Visit `/auth/contractor/signup` in a private window and create a contractor account.
3. Optionally load demo data. See [seeding](guides/seeding.md).

## Troubleshooting

- **Blank page or auth errors**: a `NEXT_PUBLIC_FIREBASE_*` value is missing. Restart the dev server after editing `.env.local`.
- **Quotation review fails**: check `GEMINI_API_KEY`.
