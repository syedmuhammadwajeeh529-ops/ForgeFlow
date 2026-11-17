
import pool from '../config/database.js';
import { generateId } from '../utils/generateId.js';

class ProjectIdea {
  async findAll({ category, difficulty, search, limit = 50, offset = 0 } = {}) {
    const conditions = [];
    const values = [];

    if (category) {
      conditions.push('category = ?');
      values.push(category);
    }

    if (difficulty) {
      conditions.push('difficulty = ?');
      values.push(difficulty);
    }

    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      values.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
    const safeOffset = Math.max(0, Number(offset) || 0);

    const [rows] = await pool.execute(
      `SELECT
        id,
        title,
        description,
        difficulty,
        category,
        tech_stack,
        is_curated,
        tags,
        created_by_id,
        created_at AS created_date,
        updated_at AS updated_date
       FROM project_ideas
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      values
    );

    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
        id,
        title,
        description,
        difficulty,
        category,
        tech_stack,
        is_curated,
        tags,
        created_by_id,
        created_at AS created_date,
        updated_at AS updated_date
       FROM project_ideas
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return rows[0] || null;
  }

  async create({
    title,
    description,
    difficulty,
    category,
    techStack = [],
    isCurated = false,
    tags = [],
    createdById = null
  }) {
    const id = generateId();

    await pool.execute(
      `INSERT INTO project_ideas (
        id,
        title,
        description,
        difficulty,
        category,
        tech_stack,
        is_curated,
        tags,
        created_by_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        description,
        difficulty,
        category,
        JSON.stringify(techStack),
        isCurated,
        JSON.stringify(tags),
        createdById
      ]
    );

    return this.findById(id);
  }

  async update(id, data) {
    const fields = [];
    const values = [];

    const allowedFields = {
      title: 'title',
      description: 'description',
      difficulty: 'difficulty',
      category: 'category',
      techStack: 'tech_stack',
      isCurated: 'is_curated',
      tags: 'tags'
    };

    for (const [key, column] of Object.entries(allowedFields)) {
      if (Object.hasOwn(data, key)) {
        fields.push(`${column} = ?`);

        const value = ['techStack', 'tags'].includes(key)
          ? JSON.stringify(data[key])
          : data[key];

        values.push(value);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const [result] = await pool.execute(
      `UPDATE project_ideas
       SET ${fields.join(', ')}
       WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return this.findById(id);
    }

    return this.findById(id);
  }

  async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM project_ideas WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }
}

export default new ProjectIdea();
