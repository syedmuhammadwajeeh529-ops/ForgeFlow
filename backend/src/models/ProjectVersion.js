import pool from '../config/database.js';
import { generateId } from '../utils/generateId.js';

const sortColumns = { created_date: 'created_at', updated_date: 'updated_at' };

class ProjectVersion {
  async findAll(projectId, createdById, { sort = '-created_date', limit = 50 } = {}) {
    const sortKey = String(sort).replace(/^-/, '');
    const column = sortColumns[sortKey] || sortColumns.created_date;
    const direction = String(sort).startsWith('-') ? 'DESC' : 'ASC';
    const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
    const [rows] = await pool.execute(
      `SELECT id, project_id, label, code, language, notes, features, created_by_id,
              created_at AS created_date, updated_at AS updated_date
       FROM project_versions
       WHERE project_id = ? AND created_by_id = ?
       ORDER BY ${column} ${direction}, id ASC LIMIT ${safeLimit}`,
      [projectId, createdById]
    );
    return rows;
  }

  async findById(id, createdById) {
    const [rows] = await pool.execute(
      `SELECT id, project_id, label, code, language, notes, features, created_by_id,
              created_at AS created_date, updated_at AS updated_date
       FROM project_versions WHERE id = ? AND created_by_id = ? LIMIT 1`,
      [id, createdById]
    );
    return rows[0] || null;
  }

  async create({ projectId, label, code, language = null, notes = null, features = [], createdById }) {
    const id = generateId();
    await pool.execute(
      `INSERT INTO project_versions
       (id, project_id, label, code, language, notes, features, created_by_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, label, code, language, notes, Array.isArray(features) ? features.join('\n') : String(features || ''), createdById]
    );
    return this.findById(id, createdById);
  }

  async delete(id, createdById) {
    const [result] = await pool.execute(
      'DELETE FROM project_versions WHERE id = ? AND created_by_id = ?',
      [id, createdById]
    );
    return result.affectedRows > 0;
  }
}

export default new ProjectVersion();
