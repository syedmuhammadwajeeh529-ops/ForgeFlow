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

## AI generation
Set `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` in `backend/.env`. AI generation is intentionally disabled until an API key is configured. OpenAI-compatible providers such as OpenRouter can be used by changing the base URL and model.

## Security notes
- Never commit real `.env` files or API keys.
- User passwords are hashed with bcrypt.
- User-owned projects and versions are scoped to the authenticated account.
- The first registered account is a normal user. Assign the admin role manually in MySQL only when needed.
