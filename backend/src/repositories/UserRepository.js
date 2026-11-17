
import pool from '../config/database.js';
import { generateId } from '../utils/generateId.js';

class User {
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
        id,
        name,
        email,
        role,
        created_at AS created_date,
        updated_at AS updated_date
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return rows[0] || null;
  }

  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT
        id,
        name,
        email,
        password_hash,
        role,
        created_at AS created_date,
        updated_at AS updated_date
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    return rows[0] || null;
  }

  async create({ name, email, passwordHash, role = 'user' }) {
    const id = generateId();

    await pool.execute(
      `INSERT INTO users (
        id,
        name,
        email,
        password_hash,
        role
      ) VALUES (?, ?, ?, ?, ?)`,
      [id, name, email, passwordHash, role]
    );

    return this.findById(id);
  }

  async update(id, { name, email }) {
    const [result] = await pool.execute(
      `UPDATE users
       SET name = ?, email = ?
       WHERE id = ?`,
      [name, email, id]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }
}

export default new User();
