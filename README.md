# ForgeFlow

ForgeFlow is a project discovery and planning platform migrated from its original Base44 implementation to an independently hosted React frontend and Express/MySQL API.

## Stack
- Frontend: React 18, Vite, React Router, TanStack Query, Tailwind CSS
- Backend: Node.js 20+, Express 4, JWT authentication, bcryptjs
- Database: MySQL 8+
- AI: OpenRouter and Groq through an OpenAI-compatible chat completions client

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
3. Run `backend/database/seed.sql` to add the curated project ideas.
4. Copy `backend/.env.example` to `backend/.env` and set the database credentials and a random JWT secret of at least 32 characters.
5. Copy `frontend/.env.example` to `frontend/.env` if the API is not at `http://localhost:5000/api`.
6. From the repository root run `npm install`, then `npm run dev`.

The frontend runs at http://localhost:5173 and the API at http://localhost:5000. See [Development setup](docs/SETUP.md) for details.

## AI generation and provider failover
ForgeFlow keeps the existing `POST /api/ai/generate` endpoint and response contract. The backend currently supports **OpenRouter** and **Groq** only. The default provider order is `openrouter,groq`; providers without API keys are skipped. Rate limits, temporary outages, timeouts, and unusable provider responses can trigger fallback to the next configured provider. A failed provider is temporarily cooled down before it is tried again.

The defaults are OpenRouter's `openrouter/free` model route and Groq's `openai/gpt-oss-20b` model. Free access is subject to provider account eligibility, model availability, quotas, rate limits, and provider policies. It is not unlimited or guaranteed. See [AI provider setup](docs/AI_PROVIDERS.md) for configuration details. Never commit real keys.

## Tests
Run the backend test suite from the repository root:

```bash
npm test
```

The MySQL integration test is skipped by default. To run it, set `RUN_DB_INTEGRATION_TESTS=1` and provide a MySQL account that can create and use the dedicated `forgeflow_test` database. The integration test clears tables in that test database, so never point it at your normal development or production database.

## Security notes
- Never commit real `.env` files or API keys.
- User passwords are hashed with bcrypt.
- User-owned projects and versions are scoped to the authenticated account.
- The first registered account is a normal user. Assign the admin role manually in MySQL only when needed.
- Use HTTPS and a unique, randomly generated JWT secret in production.
- Password reset, email verification, OAuth, and refresh-token rotation are not implemented yet. Review [Authentication](docs/AUTHENTICATION.md) before a public production launch.
