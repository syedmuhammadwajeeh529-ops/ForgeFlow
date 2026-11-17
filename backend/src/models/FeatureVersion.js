
import pool from '../config/database.js';
import { generateId } from '../utils/generateId.js';

class FeatureVersion {
  async findAll(projectId, createdById) {
    const [rows] = await pool.execute(
      `SELECT
        id,
        project_id,
        label,
        features,
        notes,
        created_by_id,
        created_at AS created_date,
        updated_at AS updated_date
       FROM feature_versions
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
        features,
        notes,
        created_by_id,
        created_at AS created_date,
        updated_at AS updated_date
       FROM feature_versions
       WHERE id = ? AND created_by_id = ?
       LIMIT 1`,
      [id, createdById]
    );

    return rows[0] || null;
  }

  async create({
    projectId,
    label,
    features = [],
    notes = null,
    createdById
  }) {
    const id = generateId();

    await pool.execute(
      `INSERT INTO feature_versions (
        id,
        project_id,
        label,
        features,
        notes,
        created_by_id
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        label,
        Array.isArray(features) ? features.join('\n') : String(features || ''),
        notes,
        createdById
      ]
    );

    return this.findById(id, createdById);
  }

  async update(id, createdById, data) {
    const fields = [];
    const values = [];

    if (Object.hasOwn(data, 'label')) {
      fields.push('label = ?');
      values.push(data.label);
    }

    if (Object.hasOwn(data, 'features')) {
      fields.push('features = ?');
      values.push(Array.isArray(data.features) ? data.features.join('\n') : String(data.features || ''));
    }

    if (Object.hasOwn(data, 'notes')) {
      fields.push('notes = ?');
      values.push(data.notes);
    }

    if (fields.length === 0) {
      return this.findById(id, createdById);
    }

    values.push(id, createdById);

    await pool.execute(
      `UPDATE feature_versions
       SET ${fields.join(', ')}
       WHERE id = ? AND created_by_id = ?`,
      values
    );

    return this.findById(id, createdById);
  }

  async delete(id, createdById) {
    const [result] = await pool.execute(
      `DELETE FROM feature_versions
       WHERE id = ? AND created_by_id = ?`,
      [id, createdById]
    );

    return result.affectedRows > 0;
  }
}

export default new FeatureVersion();
