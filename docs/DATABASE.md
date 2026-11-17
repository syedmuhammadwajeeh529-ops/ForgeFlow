# Database

ForgeFlow targets MySQL 8+ and uses InnoDB, utf8mb4 and foreign keys. The canonical schema is `backend/database/schema.sql`; curated starter data is in `backend/database/seed.sql`.

Tables:
- `users`: account identity, password hash and role.
- `project_ideas`: public curated project catalogue.
- `generated_ideas`: per-user AI-generated ideas.
- `saved_projects`: per-user saved project workspace.
- `project_versions`: code and project snapshots.
- `feature_versions`: feature-plan history.

User-owned tables carry `created_by_id` and cascade when a user is deleted. Project/feature version rows cascade when their saved project is deleted. JSON arrays in the idea tables store tech stacks and tags; version feature lists are newline-separated text to match the original app's editor.

Back up the database before applying schema changes to an existing installation.
