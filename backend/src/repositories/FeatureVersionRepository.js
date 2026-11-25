import pool from '../config/database.js';
import { generateId } from '../utils/generateId.js';

const sortColumns = { created_date: 'created_at', updated_date: 'updated_at' };
const serializeFeatures = (features) => Array.isArray(features) ? features.join('\n') : String(features || '');
const serializeStack = (stack) => JSON.stringify(Array.isArray(stack) ? stack : []);
const normalizeRow = (row) => {
  if (!row) return null;
  let stack = row.tech_stack;
  if (typeof stack === 'string') { try { stack = JSON.parse(stack); } catch { stack = []; } }
  return { ...row, tech_stack: Array.isArray(stack) ? stack : [] };
};

class FeatureVersion {
  async findAll(projectId, createdById, { sort = '-created_date', limit = 50 } = {}) {
    const sortKey = String(sort).replace(/^-/, '');
    const column = sortColumns[sortKey] || sortColumns.created_date;
    const direction = String(sort).startsWith('-') ? 'DESC' : 'ASC';
    const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
    const [rows] = await pool.execute(
      `SELECT id, project_id, label, features, notes, tech_stack, created_by_id,
              created_at AS created_date, updated_at AS updated_date
       FROM feature_versions
       WHERE project_id = ? AND created_by_id = ?
       ORDER BY ${column} ${direction}, id ASC LIMIT ${safeLimit}`,
      [projectId, createdById]
    );
    return rows.map(normalizeRow);
  }

  async findById(id, createdById) {
    const [rows] = await pool.execute(
      `SELECT id, project_id, label, features, notes, tech_stack, created_by_id,
              created_at AS created_date, updated_at AS updated_date
       FROM feature_versions WHERE id = ? AND created_by_id = ? LIMIT 1`,
      [id, createdById]
    );
    return normalizeRow(rows[0]);
  }

  async create({ projectId, label, features = [], notes = null, techStack = [], createdById }) {
    const id = generateId();
    await pool.execute(
      `INSERT INTO feature_versions (id, project_id, label, features, notes, tech_stack, created_by_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, label, serializeFeatures(features), notes, serializeStack(techStack), createdById]
    );
    return this.findById(id, createdById);
  }

  async update(id, createdById, data) {
    const fields = [];
    const values = [];
    if (Object.hasOwn(data, 'label')) { fields.push('label = ?'); values.push(data.label); }
    if (Object.hasOwn(data, 'features')) { fields.push('features = ?'); values.push(serializeFeatures(data.features)); }
    if (Object.hasOwn(data, 'notes')) { fields.push('notes = ?'); values.push(data.notes); }
    if (Object.hasOwn(data, 'techStack')) { fields.push('tech_stack = ?'); values.push(serializeStack(data.techStack)); }
    if (fields.length === 0) return this.findById(id, createdById);
    values.push(id, createdById);
    await pool.execute(
      `UPDATE feature_versions SET ${fields.join(', ')} WHERE id = ? AND created_by_id = ?`,
      values
    );
    return this.findById(id, createdById);
  }

  async delete(id, createdById) {
    const [result] = await pool.execute(
      'DELETE FROM feature_versions WHERE id = ? AND created_by_id = ?',
      [id, createdById]
    );
    return result.affectedRows > 0;
  }
}

export default new FeatureVersion();
