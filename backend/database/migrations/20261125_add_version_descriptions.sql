-- Add an independent generated description to every saved version.
-- Back up the database first. Run this migration once.
ALTER TABLE feature_versions ADD COLUMN description TEXT NULL AFTER label;
ALTER TABLE project_versions ADD COLUMN description TEXT NULL AFTER label;

-- Existing history starts with the saved project's current description.
-- New versions will generate and store their own descriptions.
UPDATE feature_versions fv
JOIN saved_projects sp ON sp.id = fv.project_id
SET fv.description = sp.description
WHERE fv.description IS NULL;

UPDATE project_versions pv
JOIN saved_projects sp ON sp.id = pv.project_id
SET pv.description = sp.description
WHERE pv.description IS NULL;
