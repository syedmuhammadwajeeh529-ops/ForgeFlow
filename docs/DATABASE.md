# Database

ForgeFlow uses **MySQL 8.0+**, InnoDB, `utf8mb4`, and foreign-key constraints. The canonical fresh-install schema is `backend/database/schema.sql`; curated starter data is in `backend/database/seed.sql`.

## Tables

| Table | Purpose |
|---|---|
| `users` | Account identity, password hash, and role |
| `revoked_tokens` | SHA-256 JWT hashes and expiry timestamps for server-side logout |
| `project_ideas` | Public curated project catalogue |
| `generated_ideas` | User-owned generated ideas |
| `saved_projects` | User-owned project workspace and source code |
| `project_versions` | Code and project snapshots |
| `feature_versions` | Feature-plan history |

User-owned records reference `users.id` and are deleted when their owner is deleted. Version records reference `saved_projects.id` and cascade when the parent project is deleted. The optional `saved_projects.idea_id` is intentionally not a foreign key: imported Base44 records contain legacy idea identifiers that are not guaranteed to exist in the curated catalogue. Tech-stack and tag arrays use MySQL JSON columns; version feature lists are newline-separated text to match the editor data format.

## Fresh installation

Run these commands from the repository root against a MySQL 8 server:

```sh
mysql -u root -p < backend/database/schema.sql
mysql -u root -p forgeflow < backend/database/seed.sql
```

## Existing installation

Back up the database first, then apply the additive, repeatable index migration:

```sh
mysql -u root -p < backend/database/002_query_indexes.sql
```

The migration checks `information_schema` before creating each index, so it can be safely re-run. It does not drop tables or alter existing records.

## Configuration

Copy `backend/.env.example` to `backend/.env` and set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and a private `JWT_SECRET` of at least 32 characters. Never commit the real `.env` file.

## Backups

Back up the database before applying schema or migration changes. For example:

```sh
mysqldump -u root -p --single-transaction forgeflow > forgeflow-backup.sql
```
