-- Add independent technology stacks to each saved version.
-- Run once against an existing ForgeFlow database.
ALTER TABLE feature_versions ADD COLUMN tech_stack JSON NULL AFTER notes;
ALTER TABLE project_versions ADD COLUMN tech_stack JSON NULL AFTER features;

-- Backfill existing history with the project's current stack as a safe starting point.
UPDATE feature_versions fv
JOIN saved_projects sp ON sp.id = fv.project_id
SET fv.tech_stack = sp.tech_stack
WHERE fv.tech_stack IS NULL;

UPDATE project_versions pv
JOIN saved_projects sp ON sp.id = pv.project_id
SET pv.tech_stack = sp.tech_stack
WHERE pv.tech_stack IS NULL;
