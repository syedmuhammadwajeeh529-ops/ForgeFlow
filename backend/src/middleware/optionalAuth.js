
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { env } from '../config/env.js';

export async function optionalAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authorization.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    let decoded;

    try {
      decoded = jwt.verify(token, env.jwt.secret);
    } catch {
      req.user = null;
      return next();
    }

    if (!decoded.userId) {
      req.user = null;
      return next();
    }

    const [users] = await pool.execute(
      `SELECT id, name, email, role
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [decoded.userId]
    );

    req.user = users.length > 0 ? users[0] : null;

    next();
  } catch (error) {
    next(error);
  }
}
