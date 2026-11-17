# Development setup

## Requirements
- Node.js 20 or newer
- npm 10 or newer
- MySQL 8.0 or newer

## Install
From the repository root:

```bash
npm install
```

Create the database schema and seed the curated ideas. When upgrading an existing ForgeFlow database, rerun the schema file as well; its `CREATE TABLE IF NOT EXISTS` statements add newly introduced tables such as `revoked_tokens` without replacing existing tables:

```bash
mysql -u root -p < backend/database/schema.sql
mysql -u root -p forgeflow < backend/database/seed.sql
```

Create `backend/.env` from `backend/.env.example`. Required values are DB_HOST, DB_USER, DB_NAME and JWT_SECRET. JWT_SECRET must be at least 32 characters. Keep secrets out of Git.

Create `frontend/.env` from `frontend/.env.example` if needed. Set VITE_API_URL to the API base URL, including `/api`.

Start both apps:

```bash
npm run dev
```

Or run them separately with `npm run dev:backend` and `npm run dev:frontend`.

Run the backend integration suite with `npm test` from the repository root. The test suite expects a reachable MySQL database with the ForgeFlow schema and seeded project ideas.

- Frontend: http://localhost:5173
- API health: http://localhost:5000/api/health

## AI provider
Configure an OpenAI-compatible endpoint in backend/.env:

```dotenv
AI_API_KEY=your-provider-key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

For OpenRouter, set AI_BASE_URL to https://openrouter.ai/api/v1 and choose a model available to your account.

## Optional Base44 data migration

The curated catalogue is included in backend/database/seed.sql. The original Base44 app also held 15 saved projects and one project snapshot. After creating your ForgeFlow account, open backend/database/import_base44_saved_projects.sql, replace the placeholder email with your ForgeFlow account email, and run the script once against the forgeflow database. It assigns the old anonymous records to that account; only run it if those records are yours. The original app had no generated-idea records or feature-history records to import.
