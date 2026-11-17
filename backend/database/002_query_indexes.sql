-- ForgeFlow migration 002: composite indexes for common owner-scoped queries.
-- Safe to run repeatedly on MySQL 8.0+. Existing indexes are left untouched.
USE forgeflow;

DROP PROCEDURE IF EXISTS forgeflow_add_index_if_missing;
DELIMITER //
CREATE PROCEDURE forgeflow_add_index_if_missing(
    IN p_table_name VARCHAR(64),
    IN p_index_name VARCHAR(64),
    IN p_index_columns VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = p_table_name
          AND index_name = p_index_name
    ) THEN
        SET @forgeflow_index_sql = CONCAT(
            'CREATE INDEX `', p_index_name, '` ON `',
            p_table_name, '` ', p_index_columns
        );
        PREPARE forgeflow_index_stmt FROM @forgeflow_index_sql;
        EXECUTE forgeflow_index_stmt;
        DEALLOCATE PREPARE forgeflow_index_stmt;
    END IF;
END//
DELIMITER ;

CALL forgeflow_add_index_if_missing('project_ideas', 'idx_project_ideas_filters_created', '(category, difficulty, created_at)');
CALL forgeflow_add_index_if_missing('generated_ideas', 'idx_generated_ideas_owner_created', '(created_by_id, created_at)');
CALL forgeflow_add_index_if_missing('saved_projects', 'idx_saved_projects_owner_updated', '(created_by_id, updated_at)');
CALL forgeflow_add_index_if_missing('saved_projects', 'idx_saved_projects_owner_status', '(created_by_id, status)');
CALL forgeflow_add_index_if_missing('saved_projects', 'idx_saved_projects_owner_category', '(created_by_id, category)');
CALL forgeflow_add_index_if_missing('project_versions', 'idx_project_versions_project_owner_created', '(project_id, created_by_id, created_at)');
CALL forgeflow_add_index_if_missing('feature_versions', 'idx_feature_versions_project_owner_created', '(project_id, created_by_id, created_at)');

DROP PROCEDURE forgeflow_add_index_if_missing;
