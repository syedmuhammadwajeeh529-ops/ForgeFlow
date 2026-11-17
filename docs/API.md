# API reference

All routes are prefixed with `/api`. Successful responses use `{ success, message, data }`; errors use `{ success: false, message, errors? }`.

## Health
- `GET /health` public health check. The server only starts listening after the MySQL connection succeeds.

## Authentication
- `POST /auth/register` body: name, email, password.
- `POST /auth/login` body: email, password.
- `GET /auth/me` authenticated current user.
- `POST /auth/logout` authenticated client-side token logout acknowledgement. The current JWT design is stateless, so the client must discard its token.

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
- `POST /ai/generate` body: prompt and optional response_json_schema. Requires `AI_API_KEY` on the backend. The API key is never sent to the client.
