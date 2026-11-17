# API reference

All routes are prefixed with `/api`. Successful responses use `{ success, message, data }`; errors use `{ success: false, message, errors? }`.

## Health
- `GET /health` public health check.

## Authentication
- `POST /auth/register` body: name, email, password.
- `POST /auth/login` body: email, password.
- `GET /auth/me` authenticated current user.
- `POST /auth/logout` authenticated client-side token logout acknowledgement.

Send authenticated requests with `Authorization: Bearer <token>`.

## Project ideas
- `GET /project-ideas` public list. Supports category, difficulty, search, page, limit.
- `GET /project-ideas/:id` public detail.
- `POST /project-ideas`, `PATCH /project-ideas/:id`, `DELETE /project-ideas/:id` admin only.

## Generated ideas
- `GET /generated-ideas` authenticated list of the current user's generated ideas.
- `GET /generated-ideas/:id` authenticated detail.
- `POST /generated-ideas` authenticated create.
- `DELETE /generated-ideas/:id` authenticated delete.

## Saved projects
- `GET /saved-projects` authenticated list.
- `POST /saved-projects` authenticated create.
- `GET /saved-projects/:id` authenticated detail.
- `PATCH /saved-projects/:id` authenticated update.
- `DELETE /saved-projects/:id` authenticated delete.

## Version history
- `GET /project-versions?project_id=<id>`, `POST /project-versions`, `DELETE /project-versions/:id`.
- `GET /feature-versions?project_id=<id>`, `POST /feature-versions`, `PATCH /feature-versions/:id`, `DELETE /feature-versions/:id`.

## AI
- `POST /ai/generate` body: prompt, optional response_json_schema and add_context_from_internet. Requires AI_API_KEY on the backend.
