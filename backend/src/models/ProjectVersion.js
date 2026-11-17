
import pool from '../config/database.js';
import { generateId } from '../utils/generateId.js';

class ProjectVersion {
  async findAll(projectId, createdById) {
    const [rows] = await pool.execute(
      `SELECT
        id,
        project_id,
        label,
        code,
        language,
        notes,
        features,
        created_by_id,
        created_at AS created_date,
        updated_at AS updated_date
       FROM project_versions
       WHERE project_id = ? AND created_by_id = ?
       ORDER BY created_at DESC`,
      [projectId, createdById]
    );

    return rows;
  }

  async findById(id, createdById) {
    const [rows] = await pool.execute(
      `SELECT
        id,
        project_id,
        label,
        code,
        language,
        notes,
        features,
        created_by_id,
        created_at AS created_date,
        updated_at AS updated_date
       FROM project_versions
       WHERE id = ? AND created_by_id = ?
       LIMIT 1`,
      [id, createdById]
    );

    return rows[0] || null;
  }

  async create({
    projectId,
    label,
    code,
    language = null,
    notes = null,
    features = [],
    createdById
  }) {
    const id = generateId();

    await pool.execute(
      `INSERT INTO project_versions (
        id,
        project_id,
        label,
        code,
        language,
        notes,
        features,
        created_by_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        label,
        code,
        language,
        notes,
        JSON.stringify(features),
        createdById
      ]
    );

    return this.findById(id, createdById);
  }

  async delete(id, createdById) {
    const [result] = await pool.execute(
      `DELETE FROM project_versions
       WHERE id = ? AND created_by_id = ?`,
      [id, createdById]
    );

    return result.affectedRows > 0;
  }
}

export default new ProjectVersion();
