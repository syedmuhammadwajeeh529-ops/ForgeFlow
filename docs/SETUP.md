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

Create `backend/.env` from `backend/.env.example`. Required values are `DB_HOST`, `DB_USER`, `DB_NAME`, and `JWT_SECRET`. `JWT_SECRET` must be at least 32 characters. Keep secrets out of Git.

Create `frontend/.env` from `frontend/.env.example` if needed. Set `VITE_API_URL` to the API base URL, including `/api`.

Start both apps:

```bash
npm run dev
```

Or run them separately with `npm run dev:backend` and `npm run dev:frontend`.

- Frontend: http://localhost:5173
- API health: http://localhost:5000/api/health

## Tests

Run the default backend test suite from the repository root:

```bash
npm test
```

The database integration test is skipped unless `RUN_DB_INTEGRATION_TESTS=1` is set. It connects to MySQL, creates/uses the dedicated `forgeflow_test` database, and truncates its test tables. The MySQL account must be allowed to create the database and tables. Do not run this test against your normal development database or any production database.

On Windows Command Prompt:

```cmd
set RUN_DB_INTEGRATION_TESTS=1 && npm test
```

On macOS/Linux:

```bash
RUN_DB_INTEGRATION_TESTS=1 npm test
```

## AI provider configuration

ForgeFlow currently supports OpenRouter and Groq only. Configure one or both providers in `backend/.env` using the variables in `backend/.env.example`:

```dotenv
AI_PROVIDER_ORDER=openrouter,groq
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openrouter/free
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-20b
```

You only need to configure the API key for the provider(s) you intend to use. Keep the default model settings initially. Free-tier availability, quotas, and rate limits are controlled by each provider and can change. See [AI provider setup](AI_PROVIDERS.md) for failover behavior and operational notes.

## Optional Base44 data migration

The curated catalogue is included in `backend/database/seed.sql`. The original Base44 app also held 15 saved projects and one project snapshot. After creating your ForgeFlow account, open `backend/database/import_base44_saved_projects.sql`, replace the placeholder email with your ForgeFlow account email, and run the script once against the `forgeflow` database. It assigns the old anonymous records to that account; only run it if those records are yours. The original app had no generated-idea records or feature-history records to import.
