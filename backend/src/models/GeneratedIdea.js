import pool from '../config/database.js';
import { generateId } from '../utils/generateId.js';

const selectColumns = `
  id, title, description, difficulty, category, tech_stack, tags, prompt,
  created_by_id, created_at AS created_date, updated_at AS updated_date
`;

class GeneratedIdea {
  async findAll({ createdById, category, difficulty, search, limit = 50, offset = 0 } = {}) {
    const conditions = [];
    const values = [];
    if (createdById) { conditions.push('created_by_id = ?'); values.push(createdById); }
    if (category) { conditions.push('category = ?'); values.push(category); }
    if (difficulty) { conditions.push('difficulty = ?'); values.push(difficulty); }
    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      values.push(`%${search}%`, `%${search}%`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
    const safeOffset = Math.max(0, Number(offset) || 0);
    const [rows] = await pool.execute(
      `SELECT ${selectColumns} FROM generated_ideas ${whereClause}
       ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      values
    );
    return rows;
  }

  async findById(id, createdById = null) {
    const conditions = ['id = ?'];
    const values = [id];
    if (createdById) { conditions.push('created_by_id = ?'); values.push(createdById); }
    const [rows] = await pool.execute(
      `SELECT ${selectColumns} FROM generated_ideas WHERE ${conditions.join(' AND ')} LIMIT 1`,
      values
    );
    return rows[0] || null;
  }

  async create({ title, description, difficulty = null, category, techStack = [], tags = [], prompt = null, createdById }) {
    const id = generateId();
    await pool.execute(
      `INSERT INTO generated_ideas
       (id, title, description, difficulty, category, tech_stack, tags, prompt, created_by_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, difficulty, category, JSON.stringify(techStack), JSON.stringify(tags), prompt, createdById]
    );
    return this.findById(id, createdById);
  }

  async createMany(ideas) {
    if (!Array.isArray(ideas) || ideas.length === 0) return [];
    const connection = await pool.getConnection();
    const ids = [];
    try {
      await connection.beginTransaction();
      for (const idea of ideas) {
        const id = generateId();
        ids.push(id);
        await connection.execute(
          `INSERT INTO generated_ideas
           (id, title, description, difficulty, category, tech_stack, tags, prompt, created_by_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, idea.title, idea.description, idea.difficulty ?? null, idea.category,
            JSON.stringify(idea.techStack ?? []), JSON.stringify(idea.tags ?? []),
            idea.prompt ?? null, idea.createdById
          ]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return Promise.all(ids.map((id, index) => this.findById(id, ideas[index].createdById)));
  }

  async delete(id, createdById = null) {
    const conditions = ['id = ?'];
    const values = [id];
    if (createdById) { conditions.push('created_by_id = ?'); values.push(createdById); }
    const [result] = await pool.execute(
      `DELETE FROM generated_ideas WHERE ${conditions.join(' AND ')}`,
      values
    );
    return result.affectedRows > 0;
  }
}

export default new GeneratedIdea();
