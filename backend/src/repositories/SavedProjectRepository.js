import pool from '../config/database.js';
import { generateId } from '../utils/generateId.js';

const selectColumns = `
  id, idea_id, title, description, difficulty, category, tech_stack, code,
  language, notes, current_version, status, created_by_id,
  created_at AS created_date, updated_at AS updated_date
`;

class SavedProject {
  async findAll({ createdById, status, category, search, limit = 50, offset = 0 }) {
    const conditions = ['created_by_id = ?'];
    const values = [createdById];
    if (status) { conditions.push('status = ?'); values.push(status); }
    if (category) { conditions.push('category = ?'); values.push(category); }
    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      values.push(`%${search}%`, `%${search}%`);
    }
    const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
    const safeOffset = Math.max(0, Number(offset) || 0);
    const [rows] = await pool.execute(
      `SELECT ${selectColumns} FROM saved_projects
       WHERE ${conditions.join(' AND ')}
       ORDER BY updated_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      values
    );
    return rows;
  }

  async findById(id, createdById) {
    const [rows] = await pool.execute(
      `SELECT ${selectColumns} FROM saved_projects
       WHERE id = ? AND created_by_id = ? LIMIT 1`,
      [id, createdById]
    );
    return rows[0] || null;
  }

  async create({
    ideaId = null,
    title,
    description,
    difficulty = null,
    category = null,
    techStack = [],
    code = null,
    language = 'javascript',
    notes = null,
    currentVersion = '1',
    status = 'saved',
    createdById
  }) {
    const id = generateId();
    await pool.execute(
      `INSERT INTO saved_projects
       (id, idea_id, title, description, difficulty, category, tech_stack, code, language, notes, current_version, status, created_by_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, ideaId, title, description, difficulty, category, JSON.stringify(techStack), code, language, notes, currentVersion, status, createdById]
    );
    return this.findById(id, createdById);
  }

  async update(id, createdById, data) {
    const allowedFields = {
      ideaId: 'idea_id',
      title: 'title',
      description: 'description',
      difficulty: 'difficulty',
      category: 'category',
      techStack: 'tech_stack',
      code: 'code',
      language: 'language',
      notes: 'notes',
      currentVersion: 'current_version',
      status: 'status'
    };
    const fields = [];
    const values = [];
    for (const [key, column] of Object.entries(allowedFields)) {
      if (Object.hasOwn(data, key)) {
        fields.push(`${column} = ?`);
        values.push(key === 'techStack' ? JSON.stringify(data[key]) : data[key]);
      }
    }
    if (fields.length === 0) return this.findById(id, createdById);
    values.push(id, createdById);
    await pool.execute(
      `UPDATE saved_projects SET ${fields.join(', ')} WHERE id = ? AND created_by_id = ?`,
      values
    );
    return this.findById(id, createdById);
  }

  async delete(id, createdById) {
    const [result] = await pool.execute(
      'DELETE FROM saved_projects WHERE id = ? AND created_by_id = ?',
      [id, createdById]
    );
    return result.affectedRows > 0;
  }
}

export default new SavedProject();
