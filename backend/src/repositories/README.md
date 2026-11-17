# Database repositories

This directory is the persistence layer for ForgeFlow's MySQL database.

## Responsibilities

- Repositories own SQL statements and database-pool access.
- Services own application workflows and business rules.
- Controllers translate HTTP requests into service calls and responses.
- Files in `models/` are compatibility facades that re-export their matching repository, preserving existing imports while keeping SQL out of the model layer.

## Repositories

- `UserRepository`: user lookup and account persistence.
- `ProjectIdeaRepository`: curated project-idea persistence.
- `GeneratedIdeaRepository`: user-generated idea persistence, including transactional bulk creation.
- `SavedProjectRepository`: saved-project persistence.
- `ProjectVersionRepository`: project snapshot persistence.
- `FeatureVersionRepository`: feature-history persistence.
- `RevokedTokenRepository`: hashed JWT revocation persistence.

Import repositories from this directory's `index.js` when a new module needs direct persistence access. Existing service imports from `models/` remain supported during this refactor.
