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

Create the database and seed the curated ideas:

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
