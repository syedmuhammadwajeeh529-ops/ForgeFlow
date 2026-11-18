# API reference

All routes are prefixed with `/api`. Successful responses use `{ success, message, data }`; errors use `{ success: false, message, errors? }`.

## Health
- `GET /health` public health check. The server only starts listening after the MySQL connection succeeds.

## Authentication
- `POST /auth/register` body: name, email, password.
- `POST /auth/login` body: email, password.
- `GET /auth/me` authenticated current user.
- `POST /auth/logout` authenticated logout. The backend stores a SHA-256 hash of the token until its expiry, immediately invalidating that session. The client should also discard its copy.

Send authenticated requests with `Authorization: Bearer <token>`.

## Project ideas
- `GET /project-ideas` public list. Supports category, difficulty, search, page, limit.
- `GET /project-ideas/:id` public detail.
- `POST /project-ideas`, `PATCH /project-ideas/:id`, `DELETE /project-ideas/:id` admin only.

## Generated ideas
- `GET /generated-ideas` authenticated list of the current user's generated ideas.
- `GET /generated-ideas/:id` authenticated detail.
- `POST /generated-ideas` authenticated create.
- `POST /generated-ideas/bulk` authenticated bulk create (1–20 items).
- `DELETE /generated-ideas/:id` authenticated delete.

## Saved projects
- `GET /saved-projects` authenticated list.
- `POST /saved-projects` authenticated create.
- `GET /saved-projects/:id` authenticated detail.
- `PATCH /saved-projects/:id` authenticated update.
- `DELETE /saved-projects/:id` authenticated delete.

## Version history
- `GET /project-versions?project_id=<id>`, `POST /project-versions`, `PATCH /project-versions/:projectId/current`, `DELETE /project-versions/:id`.
- `GET /feature-versions?project_id=<id>`, `POST /feature-versions`, `PATCH /feature-versions/:id`, `DELETE /feature-versions/:id`.

## AI
- `POST /ai/generate` accepts a JSON body containing `prompt` and an optional `response_json_schema` object.
- Authentication is optional for this endpoint. When a valid bearer token is supplied, the request is associated with that user; otherwise it is treated as an unauthenticated request.
- The backend uses configured OpenRouter and/or Groq credentials. Configure `OPENROUTER_API_KEY` and/or `GROQ_API_KEY` in the backend's private `.env` file. The provider key is never sent to the client.
- The default provider order is `openrouter,groq`. Unconfigured providers are skipped and retryable provider failures can fall through to the next provider.
- If no provider is configured, the endpoint returns HTTP 503 with a configuration error. If all configured providers are unavailable, it returns an availability error.
- Default models are `openrouter/free` and `openai/gpt-oss-20b`. Free-tier access and model availability are controlled by the providers and are not guaranteed.
- See [AI provider setup](AI_PROVIDERS.md) for environment variables, model selection, failover, and rate-limit notes.
