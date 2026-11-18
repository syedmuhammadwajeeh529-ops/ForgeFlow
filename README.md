# ForgeFlow

ForgeFlow is a project discovery and planning platform migrated from its original Base44 implementation to an independently hosted React frontend and Express/MySQL API.

## Stack
- Frontend: React 18, Vite, React Router, TanStack Query, Tailwind CSS
- Backend: Node.js 20+, Express 4, JWT authentication, bcryptjs
- Database: MySQL 8+
- AI: OpenAI-compatible chat completions API (OpenAI, OpenRouter, or another compatible provider)

## Repository layout
```text
ForgeFlow/
├── backend/       Express API, MySQL schema, models, routes and services
├── frontend/      React application and Vite configuration
├── docs/          Setup, API, database and authentication guides
├── package.json   npm workspace scripts
└── README.md
```

## Quick start
1. Install Node.js 20+ and MySQL 8+.
2. Create the database by running `backend/database/schema.sql` in MySQL.
3. Run `backend/database/seed.sql` to add the original curated project ideas.
4. Copy `backend/.env.example` to `backend/.env` and set the database credentials and a random JWT secret of at least 32 characters.
5. Copy `frontend/.env.example` to `frontend/.env` if the API is not at `http://localhost:5000/api`.
6. From the repository root run `npm install`, then `npm run dev`.

The frontend runs at http://localhost:5173 and the API at http://localhost:5000. See [Setup](docs/SETUP.md) for details.

## AI generation and provider failover
ForgeFlow keeps the existing `POST /api/ai/generate` endpoint and response contract. The backend can route requests through OpenRouter, Gemini, Groq, Mistral, DeepSeek, and OpenAI-compatible endpoints. Providers are attempted in the order configured by `AI_PROVIDER_ORDER`; providers without keys are skipped. Rate limits, temporary outages, timeouts, invalid credentials, and malformed provider responses trigger fallback to the next configured provider. A provider that fails is temporarily cooled down and automatically becomes eligible again after the cooldown.

TinyFish is integrated separately for web search, page fetching, and browser automation. It is not treated as a chat-completion fallback because it performs a different job.

Copy the new variables from `backend/.env.example` into your local `backend/.env`. See [AI provider setup](docs/AI_PROVIDERS.md) for provider order, model settings, API routes, and key setup. Never commit real keys.

## Security notes
- Never commit real `.env` files or API keys.
- User passwords are hashed with bcrypt.
- User-owned projects and versions are scoped to the authenticated account.
- The first registered account is a normal user. Assign the admin role manually in MySQL only when needed.
